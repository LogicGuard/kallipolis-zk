// event-bus/src/types.rs
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EventType {
    // Firewall Events
    FirewallDecision,
    FirewallBlock,
    FirewallAllow,
    FirewallFlag,
    
    // Bridge Events
    BridgeVerification,
    BridgeAnomaly,
    
    // ZK Events
    ZKProofGenerated,
    ZKVerificationFailed,
    
    // Consensus Events
    ConsensusVote,
    ConsensusDecision,
    ConsensusError,
    
    // System Events
    SystemStartup,
    SystemShutdown,
    ActorCrashed,
    ActorRecovered,
    
    // User & Session Events
    UserLogin,
    UserLogout,
    SessionExpired,
    
    // Audit & Compliance
    AuditLogCreated,
    ComplianceViolation,
    PolicyUpdated,
    
    // Transaction Pipeline
    TransactionSent,
    TransactionMined,
    TransactionFailed,
    GasSpikeDetected,
    
    // Infrastructure & Security
    KeysRotated,
    ConfigUpdated,
    HealthCheckPassed,
    HealthCheckFailed,
    RateLimitTriggered,
    BackupCompleted,
    BackupFailed,
    RecoveryInitiated,
}

impl std::fmt::Display for EventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Event {
    pub id: Uuid,
    pub event_type: EventType,
    pub timestamp: DateTime<Utc>,
    pub source: String,           // e.g., "firewall_actor", "consensus_engine"
    pub correlation_id: Option<Uuid>,
    pub data: serde_json::Value,
    pub metadata: EventMetadata,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EventMetadata {
    pub version: u32,
    pub environment: String,
    pub user_id: Option<String>,
    pub tx_hash: Option<String>,
    pub latency_ms: Option<f64>,
    pub retry_count: Option<u32>,
}

impl Event {
    pub fn new(
        event_type: EventType,
        source: impl Into<String>,
        data: impl Serialize,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            event_type,
            timestamp: Utc::now(),
            source: source.into(),
            correlation_id: None,
            data: serde_json::to_value(data).unwrap_or(serde_json::json!({})),
            metadata: EventMetadata {
                version: 1,
                environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
                user_id: None,
                tx_hash: None,
                latency_ms: None,
                retry_count: None,
            },
        }
    }
}

// ============================================================
// Event Store Trait (Abstraction)
// ============================================================
#[async_trait::async_trait]
pub trait EventStore: Send + Sync {
    async fn append(&self, event: &Event) -> Result<(), anyhow::Error>;
    async fn append_batch(&self, events: &[Event]) -> Result<(), anyhow::Error>;
    async fn get_by_id(&self, id: Uuid) -> Result<Option<Event>, anyhow::Error>;
    async fn get_by_type(&self, event_type: EventType, limit: usize) -> Result<Vec<Event>, anyhow::Error>;
    async fn get_by_time_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<Event>, anyhow::Error>;
    async fn get_by_correlation(&self, correlation_id: Uuid) -> Result<Vec<Event>, anyhow::Error>;
    async fn replay_all(&self) -> Result<Vec<Event>, anyhow::Error>;
    async fn delete_old(&self, older_than: DateTime<Utc>) -> Result<u64, anyhow::Error>;
    async fn get_latest(&self, limit: usize) -> Result<Vec<Event>, anyhow::Error>;
    async fn count(&self, event_type: Option<EventType>) -> Result<u64, anyhow::Error>;
}
