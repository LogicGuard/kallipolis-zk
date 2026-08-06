# Changelog

All notable changes to PolyGuard will be documented in this file.

## [2.4.0] - 2026-07-31

### Added
- **Git Polyglot Codebase View (`KernelRepositoryView.tsx`)**: Expanded kernel language repository index to 16+ specialized languages including Rust (SP1 zkVM), Go (Consensus), Solidity + Yul, Huff, C (eBPF XDP), Circom, Halo2 Plonkish, C++20 KZG, Cairo STARKs, Move, Python EVM Vectorizer, Zig Mempool Parser, Nim RPC Relay, OCaml Formal Verifier, and C++20 LLVM JIT.
- **Enterprise GitHub Metadata**: Added `.github/workflows/ci.yml`, `SECURITY.md`, `CODEOWNERS`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
- **AggLayer LxLy Multi-Chain Bridge Router**: Upgraded Yul inline assembly Keccak256 proof verification for sub-millisecond gas footprint.

### Optimized
- Enhanced React dashboard performance with memoized simulation hooks and zero-latency WebSocket stream handlers.
- Refined Tailwind CSS typography and sophisticated neutral dark theme.
