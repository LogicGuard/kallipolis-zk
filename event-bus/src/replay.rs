// event-bus/src/replay.rs
use super::*;
use std::collections::HashMap;
use std::sync::Arc;

pub struct ReplayEngine {
    store: Arc<dyn EventStore>,
    handlers: HashMap<EventType, Box<dyn ReplayHandler>>,
}

#[async_trait::async_trait]
pub trait ReplayHandler: Send + Sync {
    async fn replay(&self, event: &Event) -> Result<(), anyhow::Error>;
    fn name(&self) -> &'static str;
}

impl ReplayEngine {
    pub fn new(store: Arc<dyn EventStore>) -> Self {
        Self {
            store,
            handlers: HashMap::new(),
        }
    }
    
    pub fn register_handler(&mut self, event_type: EventType, handler: Box<dyn ReplayHandler>) {
        self.handlers.insert(event_type, handler);
    }
    
    pub async fn replay_all(&self) -> Result<ReplayResult, anyhow::Error> {
        let events = self.store.replay_all().await?;
        tracing::info!("Replaying {} events", events.len());
        
        let mut result = ReplayResult {
            total: events.len(),
            successful: 0,
            failed: 0,
            errors: Vec::new(),
        };
        
        for event in events {
            if let Some(handler) = self.handlers.get(&event.event_type) {
                match handler.replay(&event).await {
                    Ok(_) => result.successful += 1,
                    Err(e) => {
                        result.failed += 1;
                        result.errors.push(format!("Event {}: {}", event.id, e));
                    }
                }
            } else {
                result.failed += 1;
                result.errors.push(format!("Event {}: No handler found", event.id));
            }
        }
        
        tracing::info!("Replay completed: {} successful, {} failed", result.successful, result.failed);
        Ok(result)
    }
    
    pub async fn replay_by_correlation(&self, correlation_id: Uuid) -> Result<ReplayResult, anyhow::Error> {
        let events = self.store.get_by_correlation(correlation_id).await?;
        // Replay in chronological order
        let mut sorted_events = events;
        sorted_events.sort_by_key(|e| e.timestamp);
        
        let mut result = ReplayResult {
            total: sorted_events.len(),
            successful: 0,
            failed: 0,
            errors: Vec::new(),
        };
        
        for event in sorted_events {
            if let Some(handler) = self.handlers.get(&event.event_type) {
                match handler.replay(&event).await {
                    Ok(_) => result.successful += 1,
                    Err(e) => {
                        result.failed += 1;
                        result.errors.push(format!("Event {}: {}", event.id, e));
                    }
                }
            } else {
                result.failed += 1;
                result.errors.push(format!("Event {}: No handler found", event.id));
            }
        }
        
        Ok(result)
    }
}

#[derive(Debug, Clone)]
pub struct ReplayResult {
    pub total: usize,
    pub successful: usize,
    pub failed: usize,
    pub errors: Vec<String>,
}
