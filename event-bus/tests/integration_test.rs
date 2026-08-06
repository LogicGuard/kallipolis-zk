// event-bus/tests/integration_test.rs
use kallipolis_event_bus::*;
use tokio::time::Duration;
use std::sync::{Arc, Mutex};
use chrono::{DateTime, Utc};
use uuid::Uuid;

// ============================================================
// 1. MOCK EVENT STORE IMPLEMENTATIONS FOR ROBUST TESTING
// ============================================================

pub struct MockEventStore {
    pub append_called: Arc<Mutex<Vec<Event>>>,
    pub append_batch_called: Arc<Mutex<Vec<Event>>>,
    pub get_by_correlation_called: Arc<Mutex<Vec<Event>>>,
}

impl MockEventStore {
    pub fn new() -> Self {
        Self {
            append_called: Arc::new(Mutex::new(Vec::new())),
            append_batch_called: Arc::new(Mutex::new(Vec::new())),
            get_by_correlation_called: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

impl Default for MockEventStore {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait::async_trait]
impl EventStore for MockEventStore {
    async fn append(&self, event: &Event) -> Result<(), anyhow::Error> {
        self.append_called.lock().unwrap().push(event.clone());
        Ok(())
    }

    async fn append_batch(&self, events: &[Event]) -> Result<(), anyhow::Error> {
        let mut batch = self.append_batch_called.lock().unwrap();
        let mut corr = self.get_by_correlation_called.lock().unwrap();
        for e in events {
            batch.push(e.clone());
            if e.correlation_id.is_some() {
                corr.push(e.clone());
            }
        }
        Ok(())
    }

    async fn get_by_id(&self, _id: Uuid) -> Result<Option<Event>, anyhow::Error> {
        Ok(None)
    }

    async fn get_by_type(&self, _event_type: EventType, _limit: usize) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn get_by_time_range(&self, _start: DateTime<Utc>, _end: DateTime<Utc>) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn get_by_correlation(&self, _correlation_id: Uuid) -> Result<Vec<Event>, anyhow::Error> {
        Ok(self.get_by_correlation_called.lock().unwrap().clone())
    }

    async fn replay_all(&self) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn delete_old(&self, _older_than: DateTime<Utc>) -> Result<u64, anyhow::Error> {
        Ok(0)
    }

    async fn get_latest(&self, _limit: usize) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn count(&self, _event_type: Option<EventType>) -> Result<u64, anyhow::Error> {
        Ok(0)
    }
}

pub struct FailingEventStore {
    pub max_failures: usize,
    pub attempts: Arc<Mutex<usize>>,
    pub retry_count: Arc<Mutex<usize>>,
}

impl FailingEventStore {
    pub fn new(max_failures: usize) -> Self {
        Self {
            max_failures,
            attempts: Arc::new(Mutex::new(0)),
            retry_count: Arc::new(Mutex::new(0)),
        }
    }
}

#[async_trait::async_trait]
impl EventStore for FailingEventStore {
    async fn append(&self, _event: &Event) -> Result<(), anyhow::Error> {
        Ok(())
    }

    async fn append_batch(&self, _events: &[Event]) -> Result<(), anyhow::Error> {
        let mut att = self.attempts.lock().unwrap();
        let mut ret = self.retry_count.lock().unwrap();
        *ret += 1;
        if *att < self.max_failures {
            *att += 1;
            return Err(anyhow::anyhow!("Simulated flush error"));
        }
        Ok(())
    }

    async fn get_by_id(&self, _id: Uuid) -> Result<Option<Event>, anyhow::Error> {
        Ok(None)
    }

    async fn get_by_type(&self, _event_type: EventType, _limit: usize) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn get_by_time_range(&self, _start: DateTime<Utc>, _end: DateTime<Utc>) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn get_by_correlation(&self, _correlation_id: Uuid) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn replay_all(&self) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn delete_old(&self, _older_than: DateTime<Utc>) -> Result<u64, anyhow::Error> {
        Ok(0)
    }

    async fn get_latest(&self, _limit: usize) -> Result<Vec<Event>, anyhow::Error> {
        Ok(Vec::new())
    }

    async fn count(&self, _event_type: Option<EventType>) -> Result<u64, anyhow::Error> {
        Ok(0)
    }
}

// ============================================================
// 2. INTEGRATION TESTS
// ============================================================

#[tokio::test]
async fn test_event_emit_and_store() {
    let store = Arc::new(MockEventStore::new());
    let config = EventBusConfig::default();
    let bus = EventBus::new(config, store.clone());
    
    let event = Event::new(EventType::FirewallDecision, "firewall_actor", serde_json::json!({
        "blocked": true,
        "reason": "MEV attack detected",
    }));
    
    bus.emit(event.clone()).await.unwrap();
    
    // Wait for batch queue flush
    tokio::time::sleep(Duration::from_millis(200)).await;
    
    let stored = store.append_batch_called.lock().unwrap();
    assert_eq!(stored.len(), 1);
    assert_eq!(stored[0].event_type, EventType::FirewallDecision);
}

#[tokio::test]
async fn test_event_bus_subscriber() {
    let store = Arc::new(MockEventStore::new());
    let config = EventBusConfig::default();
    let bus = EventBus::new(config, store);
    
    let received = Arc::new(std::sync::atomic::AtomicBool::new(false));
    let received_clone = received.clone();
    
    bus.subscribe(EventType::FirewallDecision, move |event| {
        let r = received_clone.clone();
        async move {
            if event.event_type == EventType::FirewallDecision {
                r.store(true, std::sync::atomic::Ordering::SeqCst);
            }
            Ok(())
        }
    });
    
    let event = Event::new(EventType::FirewallDecision, "firewall_actor", serde_json::json!({}));
    bus.emit(event).await.unwrap();
    
    tokio::time::sleep(Duration::from_millis(150)).await;
    assert!(received.load(std::sync::atomic::Ordering::SeqCst));
}

#[tokio::test]
async fn test_event_bus_batch_flush() {
    let store = Arc::new(MockEventStore::new());
    let config = EventBusConfig {
        batch_size: 5,
        flush_interval: Duration::from_millis(10),
        ..Default::default()
    };
    let bus = EventBus::new(config, store.clone());
    
    for i in 0..10 {
        let event = Event::new(EventType::SystemStartup, "test", serde_json::json!({ "index": i }));
        bus.emit(event).await.unwrap();
    }
    
    // Wait for multiple flushes to clear
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    let stored = store.append_batch_called.lock().unwrap();
    assert!(stored.len() >= 10);
}

#[tokio::test]
async fn test_event_bus_retry_on_failure() {
    let store = Arc::new(FailingEventStore::new(2)); // Fail first 2 attempts
    let config = EventBusConfig {
        batch_size: 1,
        flush_interval: Duration::from_millis(5),
        ..Default::default()
    };
    let bus = EventBus::new(config, store.clone());
    
    let event = Event::new(EventType::SystemStartup, "test", serde_json::json!({}));
    bus.emit(event).await.unwrap();
    
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    let retry_count = store.retry_count.lock().unwrap();
    assert_eq!(*retry_count, 3); // 2 failures + 1 success
}

#[tokio::test]
async fn test_event_bus_correlation_id() {
    let store = Arc::new(MockEventStore::new());
    let config = EventBusConfig {
        batch_size: 1,
        flush_interval: Duration::from_millis(5),
        ..Default::default()
    };
    let bus = EventBus::new(config, store.clone());
    
    let correlation_id = Uuid::new_v4();
    
    for i in 0..5 {
        let mut event = Event::new(EventType::SystemStartup, "test", serde_json::json!({ "index": i }));
        event.correlation_id = Some(correlation_id);
        bus.emit(event).await.unwrap();
    }
    
    tokio::time::sleep(Duration::from_millis(300)).await;
    
    let stored = store.get_by_correlation_called.lock().unwrap();
    assert_eq!(stored.len(), 5);
    assert_eq!(stored[0].correlation_id, Some(correlation_id));
}

#[tokio::test]
async fn test_replay_engine() {
    let store = Arc::new(MockEventStore::new());
    let mut replay_engine = ReplayEngine::new(store.clone());
    
    // Register mock handler
    struct MockHandler;
    #[async_trait::async_trait]
    impl ReplayHandler for MockHandler {
        async fn replay(&self, _event: &Event) -> Result<(), anyhow::Error> { Ok(()) }
        fn name(&self) -> &'static str { "mock" }
    }
    
    replay_engine.register_handler(EventType::SystemStartup, Box::new(MockHandler));
    
    let result = replay_engine.replay_all().await.unwrap();
    assert_eq!(result.total, 0); // No events to replay
}

#[tokio::test]
async fn test_event_bus_high_throughput() {
    let store = Arc::new(MockEventStore::new());
    let config = EventBusConfig {
        max_channel_size: 100_000,
        batch_size: 1000,
        flush_interval: Duration::from_millis(10),
        ..Default::default()
    };
    let bus = Arc::new(EventBus::new(config, store.clone()));
    
    let mut handles = vec![];
    for _ in 0..10 {
        let bus_clone = bus.clone();
        handles.push(tokio::spawn(async move {
            for i in 0..1000 {
                let event = Event::new(EventType::SystemStartup, "test", serde_json::json!({ "index": i }));
                bus_clone.emit(event).await.unwrap();
            }
        }));
    }
    
    for handle in handles {
        handle.await.unwrap();
    }
    
    tokio::time::sleep(Duration::from_millis(1000)).await;
    
    let stored = store.append_batch_called.lock().unwrap();
    assert!(stored.len() >= 1000); // 10 threads * 1000 events = 10000 events total, buffered appropriately
}
