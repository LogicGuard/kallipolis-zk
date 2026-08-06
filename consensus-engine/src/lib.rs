// consensus-engine/src/lib.rs
//! # Kallipolis ZK Consensus Engine
//! 
//! High-throughput consensus engine that coordinates multi-model decision-making 
//! across LLMs (Gemini, GPT-4o) and local SLMs (Phi-3). 
//!
//! Features:
//! - Multi-model voting algorithms (Weighted & Simple Majority)
//! - Thread-safe lock-free caching (TTL-bound)
//! - Self-healing Circuit Breakers per provider
//! - Active retry policies with exponential backoff
//! - Detailed atomic metric collection and latency profiling

use std::future::Future;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, AtomicI64, Ordering};
use std::time::{Duration, Instant};
use tokio::sync::{Semaphore, RwLock};
use dashmap::DashMap;
use tracing::{info, warn, error};
use futures::future::BoxFuture;
use futures::FutureExt;

// ============================================================================
// 1. DATA STRUCTURES & VERDICTS
// ============================================================================

/// Transaction payload to be analyzed by the various intelligence nodes.
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub data: String,
    pub gas_price: u64,
    pub value: String,
}

/// The analysis decision returned by a single provider.
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub enum ProviderResult {
    Block { reason: String, confidence: u8 },
    Allow { reason: String, confidence: u8 },
    Flag { reason: String, confidence: u8 },
    Error { message: String },
}

/// The high-level consensus decision.
#[derive(Clone, Copy, Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub enum Decision {
    Block,
    Allow,
    Flag,
}

/// The final cryptographic/telemetry verdict compiled by the Consensus Engine.
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize, PartialEq)]
pub struct Verdict {
    pub decision: Decision,
    pub reason: String,
    pub confidence: u8,
    pub total_cost: f64,
    pub latency_ms: u64,
    pub cached: bool,
}

// ============================================================================
// 2. MODEL PROVIDER TRAIT
// ============================================================================

pub trait ModelProvider: Send + Sync {
    /// Dispatches the transaction payload to the model API (or mocked local stack)
    fn analyze(&self, tx: Transaction) -> BoxFuture<'static, ProviderResult>;
    /// Unique provider identifier (e.g. "Gemini", "GPT-4o", "Local-Phi3")
    fn name(&self) -> &'static str;
    /// Estimated cost of a single query (USD)
    fn cost_per_request(&self) -> f64;
    /// Current average latency based on static system metrics
    fn avg_latency_ms(&self) -> f64;
}

// ============================================================================
// 3. CIRCUIT BREAKER SYSTEM
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

pub struct CircuitBreaker {
    state: CircuitState,
    consecutive_failures: usize,
    last_state_change: Instant,
    cooldown_period: Duration,
}

impl Default for CircuitBreaker {
    fn default() -> Self {
        Self {
            state: CircuitState::Closed,
            consecutive_failures: 0,
            last_state_change: Instant::now(),
            cooldown_period: Duration::from_secs(30),
        }
    }
}

impl CircuitBreaker {
    pub fn can_request(&mut self) -> bool {
        match self.state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                if self.last_state_change.elapsed() >= self.cooldown_period {
                    info!("🔌 Circuit Breaker transitioning to HALF-OPEN. Retrying...");
                    self.state = CircuitState::HalfOpen;
                    true
                } else {
                    false
                }
            }
            CircuitState::HalfOpen => true,
        }
    }

    pub fn record_success(&mut self) {
        self.consecutive_failures = 0;
        if self.state != CircuitState::Closed {
            info!("🔌 Circuit Breaker fully HEALED & CLOSED.");
            self.state = CircuitState::Closed;
            self.last_state_change = Instant::now();
        }
    }

    pub fn record_failure(&mut self) {
        self.consecutive_failures += 1;
        if self.consecutive_failures >= 5 && self.state != CircuitState::Open {
            warn!("🚨 Circuit Breaker TRIPPED to OPEN due to 5 consecutive failures.");
            self.state = CircuitState::Open;
            self.last_state_change = Instant::now();
        }
    }
}

// ============================================================================
// 4. METRICS & TELEMETRY
// ============================================================================

pub struct AtomicF64 {
    bits: AtomicU64,
}

impl Default for AtomicF64 {
    fn default() -> Self {
        Self { bits: AtomicU64::new(0f64.to_bits()) }
    }
}

impl AtomicF64 {
    pub fn new(val: f64) -> Self {
        Self { bits: AtomicU64::new(val.to_bits()) }
    }
    pub fn load(&self, order: Ordering) -> f64 {
        f64::from_bits(self.bits.load(order))
    }
    pub fn store(&self, val: f64, order: Ordering) {
        self.bits.store(val.to_bits(), order);
    }
    pub fn add(&self, val: f64, order: Ordering) -> f64 {
        let mut prev = self.load(order);
        loop {
            let next = prev + val;
            match self.bits.compare_exchange_weak(prev.to_bits(), next.to_bits(), order, order) {
                Ok(_) => return next,
                Err(actual) => prev = f64::from_bits(actual),
            }
        }
    }
}

#[derive(Default)]
pub struct ProviderStats {
    pub total_calls: AtomicU64,
    pub successful_calls: AtomicU64,
    pub failed_calls: AtomicU64,
    pub total_latency_ms: AtomicF64,
    pub last_error_timestamp: AtomicI64,
}

pub struct ConsensusMetrics {
    pub total_requests: AtomicU64,
    pub block_decisions: AtomicU64,
    pub allow_decisions: AtomicU64,
    pub flag_decisions: AtomicU64,
    pub error_decisions: AtomicU64,
    pub avg_latency_ms: AtomicF64,
    pub provider_stats: DashMap<String, ProviderStats>,
}

impl ConsensusMetrics {
    pub fn new() -> Self {
        Self {
            total_requests: AtomicU64::new(0),
            block_decisions: AtomicU64::new(0),
            allow_decisions: AtomicU64::new(0),
            flag_decisions: AtomicU64::new(0),
            error_decisions: AtomicU64::new(0),
            avg_latency_ms: AtomicF64::new(0.0),
            provider_stats: DashMap::new(),
        }
    }

    pub fn record_decision(&self, decision: Decision, latency_ms: f64) {
        self.total_requests.fetch_add(1, Ordering::SeqCst);
        match decision {
            Decision::Block => { self.block_decisions.fetch_add(1, Ordering::SeqCst); }
            Decision::Allow => { self.allow_decisions.fetch_add(1, Ordering::SeqCst); }
            Decision::Flag => { self.flag_decisions.fetch_add(1, Ordering::SeqCst); }
        }
        
        let total = self.total_requests.load(Ordering::SeqCst) as f64;
        self.avg_latency_ms.update(|avg| (avg * (total - 1.0) + latency_ms) / total, Ordering::SeqCst);
    }

    pub fn record_provider_result(&self, name: &str, success: bool, latency_ms: f64) {
        let stats = self.provider_stats.entry(name.to_string()).or_default();
        stats.total_calls.fetch_add(1, Ordering::SeqCst);
        stats.total_latency_ms.add(latency_ms, Ordering::SeqCst);
        if success {
            stats.successful_calls.fetch_add(1, Ordering::SeqCst);
        } else {
            stats.failed_calls.fetch_add(1, Ordering::SeqCst);
            stats.last_error_timestamp.store(Instant::now().elapsed().as_secs() as i64, Ordering::SeqCst);
        }
    }
}

// ============================================================================
// 5. CACHING LAYER (Thread-Safe with TTL checking)
// ============================================================================

struct CachedVerdict {
    verdict: Verdict,
    inserted_at: Instant,
}

pub struct ConsensusCache {
    entries: DashMap<String, CachedVerdict>,
    ttl: Duration,
}

impl ConsensusCache {
    pub fn new(ttl_secs: u64) -> Self {
        Self {
            entries: DashMap::new(),
            ttl: Duration::from_secs(ttl_secs),
        }
    }

    pub fn get(&self, hash: &str) -> Option<Verdict> {
        if let Some(entry) = self.entries.get(hash) {
            if entry.inserted_at.elapsed() < self.ttl {
                let mut v = entry.verdict.clone();
                v.cached = true;
                return Some(v);
            }
        }
        None
    }

    pub fn insert(&self, hash: String, verdict: Verdict) {
        self.entries.insert(hash, CachedVerdict {
            verdict,
            inserted_at: Instant::now(),
        });
    }

    pub fn clear(&self) {
        self.entries.clear();
    }
}

// ============================================================================
// 6. THREE MAIN REAL MODEL PROVIDER CLIENTS (MOCKED OUTSIDE DEV)
// ============================================================================

#[derive(Clone)]
pub struct GeminiProvider {
    pub name: &'static str,
    pub api_key: String,
    pub cost: f64,
    pub latency: f64,
}

impl ModelProvider for GeminiProvider {
    fn name(&self) -> &'static str { self.name }
    fn cost_per_request(&self) -> f64 { self.cost }
    fn avg_latency_ms(&self) -> f64 { self.latency }

    fn analyze(&self, tx: Transaction) -> BoxFuture<'static, ProviderResult> {
        let name = self.name;
        async move {
            // Emulate real network delay
            tokio::time::sleep(Duration::from_millis(30)).await;

            if tx.data.contains("malicious") || tx.hash.contains("0xbad") {
                ProviderResult::Block {
                    reason: format!("{} detected reentrancy signature", name),
                    confidence: 98,
                }
            } else if tx.data.contains("warn") {
                ProviderResult::Flag {
                    reason: format!("{} flags ambiguous sandwiching parameters", name),
                    confidence: 70,
                }
            } else if tx.data.contains("simulate_error") {
                ProviderResult::Error {
                    message: "Gemini client failed to parse response".to_string()
                }
            } else {
                ProviderResult::Allow {
                    reason: format!("{} validation succeeded", name),
                    confidence: 99,
                }
            }
        }.boxed()
    }
}

#[derive(Clone)]
pub struct OpenAIProvider {
    pub name: &'static str,
    pub api_key: String,
    pub cost: f64,
    pub latency: f64,
}

impl ModelProvider for OpenAIProvider {
    fn name(&self) -> &'static str { self.name }
    fn cost_per_request(&self) -> f64 { self.cost }
    fn avg_latency_ms(&self) -> f64 { self.latency }

    fn analyze(&self, tx: Transaction) -> BoxFuture<'static, ProviderResult> {
        let name = self.name;
        async move {
            tokio::time::sleep(Duration::from_millis(25)).await;

            if tx.data.contains("malicious") || tx.hash.contains("0xbad") {
                ProviderResult::Block {
                    reason: format!("{} blocks bad signature", name),
                    confidence: 95,
                }
            } else if tx.data.contains("warn") {
                ProviderResult::Flag {
                    reason: format!("{} suspicious transaction pattern", name),
                    confidence: 80,
                }
            } else if tx.data.contains("simulate_error") {
                ProviderResult::Error {
                    message: "OpenAI rate limit exceeded".to_string()
                }
            } else {
                ProviderResult::Allow {
                    reason: format!("{} checks OK", name),
                    confidence: 97,
                }
            }
        }.boxed()
    }
}

#[derive(Clone)]
pub struct LocalProvider {
    pub name: &'static str,
    pub ollama_url: String,
    pub cost: f64,
    pub latency: f64,
}

impl ModelProvider for LocalProvider {
    fn name(&self) -> &'static str { self.name }
    fn cost_per_request(&self) -> f64 { self.cost }
    fn avg_latency_ms(&self) -> f64 { self.latency }

    fn analyze(&self, tx: Transaction) -> BoxFuture<'static, ProviderResult> {
        let name = self.name;
        async move {
            tokio::time::sleep(Duration::from_millis(15)).await;

            if tx.data.contains("malicious") || tx.hash.contains("0xbad") {
                ProviderResult::Block {
                    reason: format!("{} detected dangerous heuristics", name),
                    confidence: 85,
                }
            } else if tx.data.contains("warn") {
                ProviderResult::Flag {
                    reason: format!("{} warning parameters", name),
                    confidence: 60,
                }
            } else if tx.data.contains("simulate_error") {
                ProviderResult::Error {
                    message: "Ollama offline".to_string()
                }
            } else {
                ProviderResult::Allow {
                    reason: format!("{} verification clear", name),
                    confidence: 90,
                }
            }
        }.boxed()
    }
}

// ============================================================================
// 7. CONSENSUS ENGINE IMPLEMENTATION
// ============================================================================

pub struct ConsensusEngine {
    providers: Vec<Box<dyn ModelProvider>>,
    semaphore: Arc<Semaphore>,
    timeout: Duration,
    metrics: Arc<ConsensusMetrics>,
    cache: Arc<ConsensusCache>,
    circuit_breakers: DashMap<String, Arc<RwLock<CircuitBreaker>>>,
}

impl ConsensusEngine {
    /// Instantiates a new consensus engine with default cloud/local provider nodes.
    pub fn new(providers: Vec<Box<dyn ModelProvider>>) -> Self {
        let circuit_breakers = DashMap::new();
        for p in &providers {
            circuit_breakers.insert(p.name().to_string(), Arc::new(RwLock::new(CircuitBreaker::default())));
        }

        Self {
            providers,
            semaphore: Arc::new(Semaphore::new(100)),
            timeout: Duration::from_millis(200),
            metrics: Arc::new(ConsensusMetrics::new()),
            cache: Arc::new(ConsensusCache::new(60)),
            circuit_breakers,
        }
    }

    /// Evaluates a blockchain payload, coordinating multi-model outputs, weights, caching and fallbacks.
    pub async fn get_verdict(&self, tx: Transaction) -> Verdict {
        let start_time = Instant::now();

        // 1. Try Cache
        if let Some(cached_verdict) = self.cache.get(&tx.hash) {
            info!("Consensus cache hit for transaction: {}", tx.hash);
            return cached_verdict;
        }

        // 2. Parallel Model Requests
        let results = self.parallel_execute(tx.clone()).await;

        // 3. Apply Multi-Model Consensus Voting (Fallback to Weighted or Simple Majority)
        let verdict = self.weighted_vote(&results, start_time.elapsed().as_millis() as u64);

        // 4. Record Metrics and Cache Verdict if appropriate
        self.metrics.record_decision(verdict.decision, start_time.elapsed().as_secs_f64() * 1000.0);
        self.cache.insert(tx.hash, verdict.clone());

        verdict
    }

    /// Executes all accessible provider models in parallel while checking circuit breakers and enforcing bounds.
    pub async fn parallel_execute(&self, tx: Transaction) -> Vec<ProviderResult> {
        let mut futures = Vec::new();

        for provider in &self.providers {
            let provider_name = provider.name();
            let cb_arc = self.circuit_breakers.get(provider_name).unwrap().clone();
            let semaphore = self.semaphore.clone();
            let tx_clone = tx.clone();
            let metrics = self.metrics.clone();
            let timeout_duration = self.timeout;

            let handle = tokio::spawn(async move {
                // Check Circuit Breaker
                {
                    let mut cb = cb_arc.write().await;
                    if !cb.can_request() {
                        warn!("🔌 Circuit Breaker OPEN for provider: {}. Skipping analysis.", provider_name);
                        return ProviderResult::Error { message: "Circuit breaker is open".to_string() };
                    }
                }

                // Acquire semaphore permit to protect network pools
                let _permit = match semaphore.acquire().await {
                    Ok(p) => p,
                    Err(_) => return ProviderResult::Error { message: "Failed to acquire concurrency permit".to_string() },
                };

                let start = Instant::now();
                
                // Invoke provider analyze with retry exponential backoff mechanism
                let mut last_error = String::new();
                let mut backoff = Duration::from_millis(10);

                for attempt in 1..=3 {
                    let future_run = provider.analyze(tx_clone.clone());
                    match tokio::time::timeout(timeout_duration, future_run).await {
                        Ok(result) => {
                            let latency = start.elapsed().as_secs_f64() * 1000.0;
                            match result {
                                ProviderResult::Error { message } => {
                                    last_error = message;
                                }
                                other => {
                                    // Success
                                    cb_arc.write().await.record_success();
                                    metrics.record_provider_result(provider_name, true, latency);
                                    return other;
                                }
                            }
                        }
                        Err(_) => {
                            last_error = "Timeout occurred".to_string();
                        }
                    }

                    if attempt < 3 {
                        tokio::time::sleep(backoff).await;
                        backoff *= 2;
                    }
                }

                // If code reached here, retry exhausted or consecutive errors triggered circuit trip.
                cb_arc.write().await.record_failure();
                metrics.record_provider_result(provider_name, false, start.elapsed().as_secs_f64() * 1000.0);
                ProviderResult::Error { message: last_error }
            });

            futures.push(handle);
        }

        let mut results = Vec::new();
        for f in futures {
            match f.await {
                Ok(res) => results.push(res),
                Err(e) => results.push(ProviderResult::Error { message: e.to_string() }),
            }
        }
        results
    }

    /// Evaluates a verdict using an elegant weighted vote based on individual provider confidence scores.
    pub fn weighted_vote(&self, results: &[ProviderResult], latency_ms: u64) -> Verdict {
        let mut block_weight = 0.0;
        let mut allow_weight = 0.0;
        let mut flag_weight = 0.0;

        let mut block_reasons = Vec::new();
        let mut allow_reasons = Vec::new();
        let mut flag_reasons = Vec::new();

        let mut index = 0;
        let mut total_cost = 0.0;

        for res in results {
            if index < self.providers.len() {
                total_cost += self.providers[index].cost_per_request();
            }
            index += 1;

            match res {
                ProviderResult::Block { reason, confidence } => {
                    block_weight += *confidence as f64 * 1.5; // Multi-model multiplier
                    block_reasons.push(reason.clone());
                }
                ProviderResult::Allow { reason, confidence } => {
                    allow_weight += *confidence as f64;
                    allow_reasons.push(reason.clone());
                }
                ProviderResult::Flag { reason, confidence } => {
                    flag_weight += *confidence as f64 * 1.2;
                    flag_reasons.push(reason.clone());
                }
                ProviderResult::Error { .. } => {}
            }
        }

        // Apply simple fallback if all providers returned errors
        if block_reasons.is_empty() && allow_reasons.is_empty() && flag_reasons.is_empty() {
            return Verdict {
                decision: Decision::Flag,
                reason: "ALL_MODEL_PROVIDERS_UNAVAILABLE".to_string(),
                confidence: 100,
                total_cost,
                latency_ms,
                cached: false,
            };
        }

        if block_weight > allow_weight && block_weight > flag_weight {
            let avg_confidence = (block_weight / (block_reasons.len() as f64 * 1.5)).min(100.0) as u8;
            Verdict {
                decision: Decision::Block,
                reason: block_reasons.join(" | "),
                confidence: avg_confidence,
                total_cost,
                latency_ms,
                cached: false,
            }
        } else if allow_weight > block_weight && allow_weight > flag_weight {
            let avg_confidence = (allow_weight / (allow_reasons.len() as f64)).min(100.0) as u8;
            Verdict {
                decision: Decision::Allow,
                reason: allow_reasons.join(" | "),
                confidence: avg_confidence,
                total_cost,
                latency_ms,
                cached: false,
            }
        } else {
            let avg_confidence = (flag_weight / (flag_reasons.len() as f64 * 1.2)).min(100.0) as u8;
            Verdict {
                decision: Decision::Flag,
                reason: flag_reasons.join(" | "),
                confidence: avg_confidence,
                total_cost,
                latency_ms,
                cached: false,
            }
        }
    }

    /// Backwards compatible simple majority vote logic (2 out of 3 match wins)
    pub fn majority_vote(&self, results: &[ProviderResult]) -> Verdict {
        let mut blocks = 0;
        let mut allows = 0;
        let mut flags = 0;

        let mut block_reasons = Vec::new();
        let mut allow_reasons = Vec::new();
        let mut flag_reasons = Vec::new();

        for r in results {
            match r {
                ProviderResult::Block { reason, .. } => {
                    blocks += 1;
                    block_reasons.push(reason.clone());
                }
                ProviderResult::Allow { reason, .. } => {
                    allows += 1;
                    allow_reasons.push(reason.clone());
                }
                ProviderResult::Flag { reason, .. } => {
                    flags += 1;
                    flag_reasons.push(reason.clone());
                }
                ProviderResult::Error { .. } => {}
            }
        }

        let total_cost: f64 = self.providers.iter().map(|p| p.cost_per_request()).sum();

        if blocks >= 2 {
            Verdict {
                decision: Decision::Block,
                reason: block_reasons.join(", "),
                confidence: 90,
                total_cost,
                latency_ms: 50,
                cached: false,
            }
        } else if allows >= 2 {
            Verdict {
                decision: Decision::Allow,
                reason: allow_reasons.join(", "),
                confidence: 90,
                total_cost,
                latency_ms: 50,
                cached: false,
            }
        } else if flags >= 1 {
            Verdict {
                decision: Decision::Flag,
                reason: flag_reasons.join(", "),
                confidence: 70,
                total_cost,
                latency_ms: 50,
                cached: false,
            }
        } else {
            Verdict {
                decision: Decision::Flag,
                reason: "UNDECIDED_DUE_TO_ERRORS".to_string(),
                confidence: 50,
                total_cost,
                latency_ms: 50,
                cached: false,
            }
        }
    }
}

// ============================================================================
// 8. COMPREHENSIVE TESTING SUITE (>200 lines)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn mock_engine_setup() -> ConsensusEngine {
        let gemini = Box::new(GeminiProvider {
            name: "Gemini",
            api_key: "dummy_key".to_string(),
            cost: 0.0005,
            latency: 20.0,
        });
        let openai = Box::new(OpenAIProvider {
            name: "GPT-4o",
            api_key: "dummy_key".to_string(),
            cost: 0.002,
            latency: 30.0,
        });
        let local = Box::new(LocalProvider {
            name: "Local-Phi3",
            ollama_url: "http://localhost:11434".to_string(),
            cost: 0.0,
            latency: 10.0,
        });

        ConsensusEngine::new(vec![gemini, openai, local])
    }

    #[tokio::test]
    async fn test_consensus_majority_block() {
        let engine = mock_engine_setup();
        let tx = Transaction {
            hash: "0xbad_hash_transaction".to_string(),
            from: "0x111".to_string(),
            to: "0x222".to_string(),
            data: "malicious_exploit_reentrancy_pattern_loaded".to_string(),
            gas_price: 35,
            value: "10000".to_string(),
        };

        let verdict = engine.get_verdict(tx).await;
        assert_eq!(verdict.decision, Decision::Block);
        assert!(verdict.confidence >= 80);
    }

    #[tokio::test]
    async fn test_consensus_majority_allow() {
        let engine = mock_engine_setup();
        let tx = Transaction {
            hash: "0xsafe_tx_hash".to_string(),
            from: "0x333".to_string(),
            to: "0x444".to_string(),
            data: "0x0000000_safe_bytes".to_string(),
            gas_price: 20,
            value: "0".to_string(),
        };

        let verdict = engine.get_verdict(tx).await;
        assert_eq!(verdict.decision, Decision::Allow);
        assert!(verdict.confidence >= 90);
    }

    #[tokio::test]
    async fn test_consensus_majority_flag() {
        let engine = mock_engine_setup();
        let tx = Transaction {
            hash: "0xwarn_tx_hash".to_string(),
            from: "0x555".to_string(),
            to: "0x666".to_string(),
            data: "warn_about_slippage_mismatch".to_string(),
            gas_price: 50,
            value: "100".to_string(),
        };

        let verdict = engine.get_verdict(tx).await;
        assert_eq!(verdict.decision, Decision::Flag);
    }

    #[tokio::test]
    async fn test_consensus_cache() {
        let engine = mock_engine_setup();
        let tx = Transaction {
            hash: "0xunique_cache_test_hash".to_string(),
            from: "0x12".to_string(),
            to: "0x34".to_string(),
            data: "cache_me_if_you_can".to_string(),
            gas_price: 15,
            value: "1000".to_string(),
        };

        // First call populates cache
        let v1 = engine.get_verdict(tx.clone()).await;
        assert!(!v1.cached);

        // Second call should fetch directly from cache
        let v2 = engine.get_verdict(tx).await;
        assert!(v2.cached);
        assert_eq!(v1.decision, v2.decision);
    }

    #[tokio::test]
    async fn test_circuit_breaker_tripping_and_heal() {
        let mut cb = CircuitBreaker::default();
        assert!(cb.can_request());

        // Trigger 5 failures
        for _ in 0..5 {
            cb.record_failure();
        }

        assert!(!cb.can_request(), "Circuit Breaker should be TRIPPED/OPEN after 5 failures!");

        // Manual state hack for half-open simulation to test heal
        cb.state = CircuitState::HalfOpen;
        cb.record_success();
        assert!(cb.can_request());
        assert_eq!(cb.state, CircuitState::Closed);
    }

    #[tokio::test]
    async fn test_fallback_strategy_all_error() {
        let gemini = Box::new(GeminiProvider {
            name: "Gemini",
            api_key: "dummy".to_string(),
            cost: 0.1,
            latency: 10.0,
        });
        
        let engine = ConsensusEngine::new(vec![gemini]);
        
        // Transaction containing "simulate_error" triggers mocked error state in providers
        let tx = Transaction {
            hash: "0xerr_hash".to_string(),
            from: "0x1".to_string(),
            to: "0x2".to_string(),
            data: "simulate_error".to_string(),
            gas_price: 10,
            value: "0".to_string(),
        };

        let verdict = engine.get_verdict(tx).await;
        assert_eq!(verdict.decision, Decision::Flag);
        assert_eq!(verdict.reason, "ALL_MODEL_PROVIDERS_UNAVAILABLE");
    }

    #[tokio::test]
    async fn test_consensus_weighted_vote_math() {
        let engine = mock_engine_setup();
        
        // We simulate outputs directly for voting testing
        let results = vec![
            ProviderResult::Block { reason: "Gemini blocks".to_string(), confidence: 90 },
            ProviderResult::Allow { reason: "GPT-4o allows".to_string(), confidence: 80 },
            ProviderResult::Allow { reason: "Local-Phi3 allows".to_string(), confidence: 70 },
        ];

        let verdict = engine.weighted_vote(&results, 24);
        
        // Gemini Block weight = 90 * 1.5 = 135
        // Total Allow weight = 80 + 70 = 150
        // Total Allow (150) > Block (135) -> Decision::Allow
        assert_eq!(verdict.decision, Decision::Allow);
    }

    #[tokio::test]
    async fn test_concurrent_load_safety() {
        let engine = Arc::new(mock_engine_setup());
        let mut tasks = Vec::new();

        for i in 0..20 {
            let engine_clone = engine.clone();
            let task = tokio::spawn(async move {
                let tx = Transaction {
                    hash: format!("0xconcurrent_tx_{}", i),
                    from: "0xfrom".to_string(),
                    to: "0xto".to_string(),
                    data: "safe_data".to_string(),
                    gas_price: 10,
                    value: "1".to_string(),
                };
                let verdict = engine_clone.get_verdict(tx).await;
                assert_eq!(verdict.decision, Decision::Allow);
            });
            tasks.push(task);
        }

        for t in tasks {
            t.await.unwrap();
        }
    }
}
