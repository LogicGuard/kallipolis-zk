// event-bus/src/lib.rs
mod types;
mod event_store;
mod replay;

pub use types::*;
pub use event_store::RedisEventStore;
pub use replay::{ReplayEngine, ReplayHandler, ReplayResult};

use tokio::sync::mpsc;
use std::sync::Arc;
use dashmap::DashMap;
use std::time::Duration;
use uuid::Uuid;

// ============================================================
// 1. Event Bus Configuration
// ============================================================
#[derive(Clone, Debug)]
pub struct EventBusConfig {
    pub max_channel_size: usize,
    pub batch_size: usize,
    pub flush_interval: Duration,
    pub enable_persistence: bool,
    pub enable_replay: bool,
}

impl Default for EventBusConfig {
    fn default() -> Self {
        Self {
            max_channel_size: 10_000,
            batch_size: 100,
            flush_interval: Duration::from_millis(100),
            enable_persistence: true,
            enable_replay: true,
        }
    }
}

// ============================================================
// 2. Event Bus Core
// ============================================================
pub struct EventBus {
    config: EventBusConfig,
    store: Arc<dyn EventStore>,
    sender: mpsc::Sender<Event>,
    subscribers: DashMap<EventType, Vec<Arc<dyn EventSubscriber>>>,
    metrics: Arc<EventBusMetrics>,
    batch_buffer: Arc<DashMap<Uuid, Event>>,
}

impl EventBus {
    pub fn new(config: EventBusConfig, store: Arc<dyn EventStore>) -> Self {
        let (tx, rx) = mpsc::channel(config.max_channel_size);
        let metrics = Arc::new(EventBusMetrics::new());
        let batch_buffer = Arc::new(DashMap::new());
        let subscribers = DashMap::new();
        
        let bus = Self {
            config: config.clone(),
            store: store.clone(),
            sender: tx,
            subscribers,
            metrics: metrics.clone(),
            batch_buffer: batch_buffer.clone(),
        };
        
        // Spawn background processor with rx
        Self::start_processor(rx, store, config, metrics, batch_buffer);
        
        bus
    }
    
    // ============================================================
    // 3. Producer Interface
    // ============================================================
    pub async fn emit(&self, event: Event) -> Result<(), anyhow::Error> {
        // Increment metrics
        self.metrics.total_events.inc();
        
        // Send to channel (non-blocking try_send)
        if let Err(e) = self.sender.try_send(event.clone()) {
            self.metrics.dropped_events.inc();
            tracing::error!("Failed to send event to channel: {}", e);
            return Err(anyhow::anyhow!("Event bus channel full"));
        }
        
        // Notify subscribers asynchronously
        if let Some(subscribers) = self.subscribers.get(&event.event_type) {
            for subscriber in subscribers.value() {
                let event_clone = event.clone();
                let subscriber_clone = Arc::clone(subscriber);
                tokio::spawn(async move {
                    if let Err(e) = subscriber_clone.handle(event_clone).await {
                        tracing::error!("Subscriber error: {}", e);
                    }
                });
            }
        }
        
        Ok(())
    }
    
    // ============================================================
    // 4. Subscriber Interface
    // ============================================================
    pub fn subscribe<F, Fut>(&self, event_type: EventType, callback: F)
    where
        F: Fn(Event) -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<(), anyhow::Error>> + Send,
    {
        let subscriber = Arc::new(ClosureSubscriber { callback });
        self.subscribers.entry(event_type).or_default().push(subscriber);
    }
    
    // ============================================================
    // 5. Backend Processor (Runs in background)
    // ============================================================
    fn start_processor(
        mut receiver: mpsc::Receiver<Event>,
        store: Arc<dyn EventStore>,
        config: EventBusConfig,
        metrics: Arc<EventBusMetrics>,
        batch_buffer: Arc<DashMap<Uuid, Event>>,
    ) {
        tokio::spawn(async move {
            let mut batch = Vec::with_capacity(config.batch_size);
            let mut flush_timer = tokio::time::interval(config.flush_interval);
            
            loop {
                tokio::select! {
                    // Receive event from channel
                    res = receiver.recv() => {
                        match res {
                            Some(event) => {
                                batch.push(event);
                                
                                // If batch is full, flush immediately
                                if batch.len() >= config.batch_size {
                                    if let Err(e) = Self::flush_batch(&batch, &store, &metrics, &batch_buffer).await {
                                        tracing::error!("Failed to flush batch: {}", e);
                                    }
                                    batch.clear();
                                }
                            }
                            None => {
                                // Channel closed, flush remaining and exit
                                if !batch.is_empty() {
                                    let _ = Self::flush_batch(&batch, &store, &metrics, &batch_buffer).await;
                                }
                                break;
                            }
                        }
                    }
                    // Periodic flush
                    _ = flush_timer.tick() => {
                        if !batch.is_empty() {
                            if let Err(e) = Self::flush_batch(&batch, &store, &metrics, &batch_buffer).await {
                                tracing::error!("Failed to flush batch (timer): {}", e);
                            }
                            batch.clear();
                        }
                    }
                }
            }
        });
    }
    
    // ============================================================
    // 6. Batch Flush with Retry
    // ============================================================
    async fn flush_batch(
        batch: &[Event],
        store: &Arc<dyn EventStore>,
        metrics: &Arc<EventBusMetrics>,
        batch_buffer: &Arc<DashMap<Uuid, Event>>,
    ) -> Result<(), anyhow::Error> {
        let start = std::time::Instant::now();
        let mut retry_count = 0;
        let max_retries = 3;
        let mut backoff = Duration::from_millis(10);
        
        while retry_count < max_retries {
            match store.append_batch(batch).await {
                Ok(_) => {
                    metrics.batches_flushed.inc();
                    metrics.batch_size.observe(batch.len() as f64);
                    metrics.flush_latency.observe(start.elapsed().as_secs_f64());
                    
                    // Add to buffer for replay
                    for event in batch {
                        batch_buffer.insert(event.id, event.clone());
                    }
                    
                    return Ok(());
                }
                Err(e) => {
                    retry_count += 1;
                    metrics.flush_errors.inc();
                    tracing::error!("Flush attempt {} failed: {}", retry_count, e);
                    
                    if retry_count < max_retries {
                        tokio::time::sleep(backoff).await;
                        backoff *= 2; // Exponential backoff
                    }
                }
            }
        }
        
        Err(anyhow::anyhow!("Failed to flush batch after {} attempts", max_retries))
    }
}

// ============================================================
// 7. EventBus Metrics
// ============================================================
pub struct EventBusMetrics {
    total_events: prometheus::Counter,
    dropped_events: prometheus::Counter,
    batches_flushed: prometheus::Counter,
    flush_errors: prometheus::Counter,
    batch_size: prometheus::Histogram,
    flush_latency: prometheus::Histogram,
}

impl EventBusMetrics {
    pub fn new() -> Self {
        Self {
            total_events: prometheus::register_counter!(
                "kallipolis_events_total",
                "Total number of events emitted"
            ).unwrap_or_else(|_| prometheus::Counter::new("kallipolis_events_total", "help").unwrap()),
            dropped_events: prometheus::register_counter!(
                "kallipolis_events_dropped",
                "Total number of events dropped"
            ).unwrap_or_else(|_| prometheus::Counter::new("kallipolis_events_dropped", "help").unwrap()),
            batches_flushed: prometheus::register_counter!(
                "kallipolis_events_batches_flushed",
                "Total number of batches flushed"
            ).unwrap_or_else(|_| prometheus::Counter::new("kallipolis_events_batches_flushed", "help").unwrap()),
            flush_errors: prometheus::register_counter!(
                "kallipolis_events_flush_errors",
                "Total number of flush errors"
            ).unwrap_or_else(|_| prometheus::Counter::new("kallipolis_events_flush_errors", "help").unwrap()),
            batch_size: prometheus::register_histogram!(
                "kallipolis_events_batch_size",
                "Batch size distribution"
            ).unwrap_or_else(|_| prometheus::Histogram::new(prometheus::HistogramOpts::new("kallipolis_events_batch_size", "help")).unwrap()),
            flush_latency: prometheus::register_histogram!(
                "kallipolis_events_flush_latency_seconds",
                "Flush latency distribution"
            ).unwrap_or_else(|_| prometheus::Histogram::new(prometheus::HistogramOpts::new("kallipolis_events_flush_latency_seconds", "help")).unwrap()),
        }
    }
}

impl Default for EventBusMetrics {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================
// 8. Event Subscriber Trait
// ============================================================
#[async_trait::async_trait]
pub trait EventSubscriber: Send + Sync {
    async fn handle(&self, event: Event) -> Result<(), anyhow::Error>;
}

struct ClosureSubscriber<F> {
    callback: F,
}

#[async_trait::async_trait]
impl<F, Fut> EventSubscriber for ClosureSubscriber<F>
where
    F: Fn(Event) -> Fut + Send + Sync + 'static,
    Fut: std::future::Future<Output = Result<(), anyhow::Error>> + Send,
{
    async fn handle(&self, event: Event) -> Result<(), anyhow::Error> {
        (self.callback)(event).await
    }
}
