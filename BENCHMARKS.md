# Performance Benchmarks

Kallipolis ZK is engineered for high-throughput and low-latency transaction filtering.

## Benchmark Results (Summary)

| Component | Metric | Performance |
| :--- | :--- | :--- |
| **Mempool Parser (Zig)** | Throughput | ~50k tx/s |
| **Prover Engine (Rust/Halo2)**| Proof Generation Time | < 500ms (on target HW) |
| **Actor System Latency** | P99 Latency | < 5ms |

## Running Benchmarks
To run the full benchmark suite:

```bash
make test-benchmarks
```
