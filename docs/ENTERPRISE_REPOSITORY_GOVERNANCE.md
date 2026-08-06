# Kallipolis ZK Enterprise Repository Governance & Branching Architecture

Kallipolis ZK is architected as an institutional-grade, multi-language monorepo adhering to the highest standards of decentralized cryptographic verification, zero-knowledge proofs, and secure Polygon AggLayer interoperability.

---

## 📁 Monorepo Directory Taxonomy

```tree
kallipolis-enterprise/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD matrix pipelines
├── backend/
│   ├── zig-mempool-parser/ # Zero-allocation Zig EVM bytecode risk analyzer
│   ├── nim-rpc-relay/      # Asynchronous Nim MEV firewall & RPC relay
│   └── ocaml-formal-verifier/# OCaml symbolic execution & invariant checker
├── circuits/
│   ├── circom/             # Circom zk-SNARK circuits (KYC & Merkle proofs)
│   └── halo2/              # Halo2 Plonkish arithmetization modules
├── contracts/
│   ├── solidity/           # Solidity smart contracts & Yul assembly routers
│   └── huff/               # Gas-optimized Huff EVM bytecode primitives
├── crates/
│   ├── kallipolis-core-engine/ # Rust high-performance SP1 zkVM verifier
│   └── kallipolis-rpc-proxy/   # Tokio-based asynchronous RPC proxy & MEV shield
├── kernel/
│   ├── ebpf/               # C-based eBPF XDP network packet interceptor
│   └── assembly/           # Low-level RISC-V / ARM cryptographic kernels
├── node/
│   ├── agglayer-consensus/ # Go p2p state transition validator
│   └── p2p-sync/           # Distributed message propagation router
├── prover/
│   └── cairo-stark/        # Cairo 2.0 STARK state transition verifier
├── ml-kernel/              # Python anomaly detection & tensor inference engine
├── src/                    # React 18+ enterprise dashboard & simulation suites
├── docs/                   # Technical whitepapers and API specifications
└── server.ts               # Full-stack Express & Vite proxy server
```

---

## 🌿 Git Branching Strategy & Workflow

Kallipolis ZK enforces a strict **GitFlow + Trunk-Based Hybrid** branching topology to guarantee zero-downtime deployments and rigorous audit trails:

```
[ main ] <--- (Production Releases / Semantic Versioning tags v2.x.x)
   ▲
   │  (Pull Request & CI Matrix Pass)
[ staging ] <--- (Release Candidate Integration Testing)
   ▲
   ├─ feature/rust-sp1-zkvm
   ├─ feature/yul-bridge-optimization
   ├─ security/ebpf-xdp-filter
   └─ refactor/nim-rpc-relay
```

### Branch Classifications

1. **`main` (Production Branch)**
   - Protected branch requiring minimum 2 peer reviews from `CODEOWNERS`.
   - Requires 100% success on GitHub Actions CI matrix (`npm run build`, Rust cargo test, Foundry invariant test).
   - Automatically tagged with Semantic Versioning (e.g., `v2.4.0`).

2. **`staging` (Release Candidate Integration)**
   - Integration branch for pre-production verification and staging environment deployment.
   - All feature and bugfix branches must merge into `staging` prior to `main` promotion.

3. **Feature Branches (`feature/*`)**
   - Created for new protocol modules, zero-knowledge circuits, and specialized language backends (e.g., `feature/zig-mempool-parser`).
   - Must reference an open GitHub Issue and pass local linter checks.

4. **Security Hardening Branches (`security/*`)**
   - Dedicated isolated branches for zero-day patch deployment, Yul assembly vulnerability mitigation, and cryptographic audit remediation.

---

## 🛡️ Governance & Security Protocols

- **Code Ownership (`CODEOWNERS`)**: Automatically routes pull requests to specialized engineering leads based on file paths (`/contracts`, `/circuits`, `/crates`, `/kernel`, `/src`).
- **Automated CI/CD (`.github/workflows/ci.yml`)**: Continuous integration runs matrix testing across Node.js 18.x and 20.x, verifying full-stack TypeScript compilation, asset bundling, and esbuild server packaging.
- **Vulnerability Reporting (`SECURITY.md`)**: Secure channel for responsible disclosure with bug bounty incentives for critical findings in zkVM provers and bridge routers.
