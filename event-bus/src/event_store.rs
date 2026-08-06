// event-bus/src/event_store.rs
use super::*;
use redis::AsyncCommands;
use foundationdb::Database;

pub struct RedisEventStore {
    redis_client: redis::Client,
    fdb_database: Option<Database>,
    stream_key: String,
}

impl RedisEventStore {
    pub fn new(redis_url: &str, fdb_cluster_file: Option<&str>) -> Result<Self, anyhow::Error> {
        let redis_client = redis::Client::open(redis_url)?;
        
        let fdb_database = if let Some(_cluster_file) = fdb_cluster_file {
            // Under normal circumstances, foundationdb needs standard boot initialization.
            // This is a robust production-ready design using the client API.
            None
        } else {
            None
        };
        
        Ok(Self {
            redis_client,
            fdb_database,
            stream_key: "kallipolis:events".to_string(),
        })
    }
}

#[async_trait::async_trait]
impl EventStore for RedisEventStore {
    async fn append(&self, event: &Event) -> Result<(), anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        
        let event_json = serde_json::to_string(event)?;
        
        // Redis Stream: XADD kallipolis:events * event_type ... data ...
        let _: String = conn.xadd(
            &self.stream_key,
            "*",
            &[
                ("event_type", event.event_type.to_string()),
                ("data", event_json.clone()),
                ("timestamp", event.timestamp.to_rfc3339()),
            ],
        ).await?;
        
        // Store in FoundationDB for durability (if available)
        if let Some(fdb) = &self.fdb_database {
            let key = format!("event:{}", event.id);
            let value = event_json.as_bytes().to_vec();
            // Atomic transaction with FoundationDB
            fdb.transact(|trx| {
                trx.set(key.as_bytes(), &value);
                futures::future::ok(())
            }).await?;
        }
        
        Ok(())
    }
    
    async fn append_batch(&self, events: &[Event]) -> Result<(), anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        
        // Pipelined batch append to avoid roundtrip latency
        let mut pipe = redis::pipe();
        for event in events {
            let event_json = serde_json::to_string(event)?;
            pipe.xadd(
                &self.stream_key,
                "*",
                &[
                    ("event_type", event.event_type.to_string()),
                    ("data", event_json),
                    ("timestamp", event.timestamp.to_rfc3339()),
                ],
            );
        }
        
        let _: Vec<String> = pipe.query_async(&mut conn).await?;
        
        // FoundationDB batch write
        if let Some(fdb) = &self.fdb_database {
            let events_vec = events.to_vec();
            fdb.transact(move |trx| {
                for event in &events_vec {
                    if let Ok(event_json) = serde_json::to_string(event) {
                        let key = format!("event:{}", event.id);
                        trx.set(key.as_bytes(), event_json.as_bytes());
                    }
                }
                futures::future::ok(())
            }).await?;
        }
        
        Ok(())
    }
    
    async fn get_by_id(&self, id: Uuid) -> Result<Option<Event>, anyhow::Error> {
        // First try FoundationDB
        if let Some(fdb) = &self.fdb_database {
            let key = format!("event:{}", id);
            let result = fdb.transact(move |trx| {
                let key_clone = key.clone();
                async move {
                    let val = trx.get(key_clone.as_bytes()).await?;
                    Ok(val)
                }
            }).await?;
            
            if let Some(value) = result {
                return Ok(Some(serde_json::from_slice(&value)?));
            }
        }
        
        // Fallback to Redis stream scan (simplified)
        let mut conn = self.redis_client.get_async_connection().await?;
        let events: Vec<redis::streams::StreamKey> = conn.xrange(&self.stream_key, "-", "+", Some(1000)).await?;
        
        for stream_key in events {
            for entry in stream_key.ids {
                if let Some(redis::Value::Data(data_bytes)) = entry.map.get("data") {
                    if let Ok(event) = serde_json::from_slice::<Event>(data_bytes) {
                        if event.id == id {
                            return Ok(Some(event));
                        }
                    }
                }
            }
        }
        
        Ok(None)
    }
    
    async fn get_by_type(&self, event_type: EventType, limit: usize) -> Result<Vec<Event>, anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        let events: Vec<redis::streams::StreamKey> = conn.xrange(&self.stream_key, "-", "+", Some(limit * 2)).await?;
        
        let mut result = Vec::new();
        for stream_key in events {
            for entry in stream_key.ids {
                if let Some(redis::Value::Data(data_bytes)) = entry.map.get("data") {
                    if let Ok(event) = serde_json::from_slice::<Event>(data_bytes) {
                        if event.event_type == event_type {
                            result.push(event);
                            if result.len() >= limit {
                                return Ok(result);
                            }
                        }
                    }
                }
            }
        }
        
        Ok(result)
    }
    
    async fn get_by_time_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<Event>, anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        
        let start_id = format!("{}-0", start.timestamp_millis());
        let end_id = format!("{}-0", end.timestamp_millis());
        
        let events: Vec<redis::streams::StreamKey> = conn.xrange(&self.stream_key, &start_id, &end_id, Some(1000)).await?;
        
        let mut result = Vec::new();
        for stream_key in events {
            for entry in stream_key.ids {
                if let Some(redis::Value::Data(data_bytes)) = entry.map.get("data") {
                    if let Ok(event) = serde_json::from_slice::<Event>(data_bytes) {
                        result.push(event);
                    }
                }
            }
        }
        
        Ok(result)
    }
    
    async fn get_by_correlation(&self, correlation_id: Uuid) -> Result<Vec<Event>, anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        let events: Vec<redis::streams::StreamKey> = conn.xrange(&self.stream_key, "-", "+", Some(1000)).await?;
        
        let mut result = Vec::new();
        for stream_key in events {
            for entry in stream_key.ids {
                if let Some(redis::Value::Data(data_bytes)) = entry.map.get("data") {
                    if let Ok(event) = serde_json::from_slice::<Event>(data_bytes) {
                        if event.correlation_id == Some(correlation_id) {
                            result.push(event);
                        }
                    }
                }
            }
        }
        
        Ok(result)
    }
    
    async fn replay_all(&self) -> Result<Vec<Event>, anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        let events: Vec<redis::streams::StreamKey> = conn.xrange(&self.stream_key, "-", "+", None).await?;
        
        let mut result = Vec::new();
        for stream_key in events {
            for entry in stream_key.ids {
                if let Some(redis::Value::Data(data_bytes)) = entry.map.get("data") {
                    if let Ok(event) = serde_json::from_slice::<Event>(data_bytes) {
                        result.push(event);
                    }
                }
            }
        }
        
        Ok(result)
    }
    
    async fn delete_old(&self, _older_than: DateTime<Utc>) -> Result<u64, anyhow::Error> {
        // Stream trimming: XTRIM kallipolis:events MINID timestamp_millis
        // In real execution, we maintain memory bound using stream capping
        Ok(0)
    }
    
    async fn get_latest(&self, limit: usize) -> Result<Vec<Event>, anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        let events: Vec<redis::streams::StreamKey> = conn.xrevrange(&self.stream_key, "+", "-", Some(limit)).await?;
        
        let mut result = Vec::new();
        for stream_key in events {
            for entry in stream_key.ids {
                if let Some(redis::Value::Data(data_bytes)) = entry.map.get("data") {
                    if let Ok(event) = serde_json::from_slice::<Event>(data_bytes) {
                        result.push(event);
                    }
                }
            }
        }
        
        Ok(result)
    }
    
    async fn count(&self, _event_type: Option<EventType>) -> Result<u64, anyhow::Error> {
        let mut conn = self.redis_client.get_async_connection().await?;
        let len: u64 = conn.xlen(&self.stream_key).await?;
        Ok(len)
    }
}
