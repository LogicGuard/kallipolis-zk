# Security Policy - Kallipolis ZK Enterprise Security (v3.0.0)

Kallipolis ZK Enterprise takes the security of our Zero-Knowledge circuit architectures, polyglot microkernels, and cross-chain sentinel firewalls extremely seriously. We are committed to protecting the integrity of the Polygon AggLayer and high-throughput EVM ecosystems.

---

## 1. Supported Versions

We actively patch and maintain the following versions of the Kallipolis ZK platform:

| Version | Branch | Status | Security Support Level |
| :--- | :--- | :---: | :--- |
| **v3.0.x** | `main` / `v3-release` | :white_check_mark: Active | Complete patches, zero-day mitigation, audit sync |
| **v2.x.x** | `v2-lts` | :white_check_mark: Active | Critical security patches only (ends Dec 2026) |
| **v1.x.x** | `v1-legacy` | :x: End of Life | None |

---

## 2. Vulnerability Reporting Process

If you discover a security vulnerability within our Rust SP1 zkVM verifiers, Halo2/Circom circuits, JIT compilers, or Solidity smart contracts, please follow our responsible disclosure guidelines:

### A. Reporting Steps
1. **Private Disclosure**: Do **NOT** disclose the vulnerability publicly, open public issues, or share it on social channels until our core security response team has verified, patched, and deployed the fix.
2. **Submission Method**: 
   - Send an encrypted email to **security@kallipolis.ai.studio** containing a comprehensive report.
   - Alternatively, submit a private advisory through the GitHub Repository Security tab.
3. **Required Information**:
   - High-level vulnerability summary and target module (e.g., `circuits/halo2/src/compliance_circuit.rs`).
   - Detailed, step-by-step instructions to reproduce the issue.
   - A functional Proof of Concept (PoC) script, transaction payload, or mathematical parameter set causing the exploit.
   - Potential impact analysis (e.g., double-spend, firewall bypass, proof forging, DOS).

---

## 3. Vulnerability Response & SLA

Our dedicated Security Response Team operates on a strict Service Level Agreement (SLA) to address reported threats:

| Milestone | Target SLA | Action Item |
| :--- | :--- | :--- |
| **Acknowledgement** | `< 12 Hours` | Immediate confirmation receipt and assignment to a security engineer. |
| **Triage & Reproduction** | `< 36 Hours` | Mathematical and code verification of the vulnerability. |
| **Patch & Verification** | `< 5 Days` | Implementation, testing, and formal verification of the security patch. |
| **Disclosure & Credits** | Coordinated | Coordinated release with credit attributed to the researcher (if desired). |

---

## 4. Institutional Bug Bounty Program

We run an institutional bug bounty program to incentivize whitehat research in high-stakes zero-knowledge circuits and consensus-level middleware. Rewards are scaled based on impact:

- **Critical ($100,000+ USD)**: 
  - Zero-knowledge proof forging or public input manipulation in Halo2 or Circom circuits.
  - Funds draining or double-spending exploits on AggLayer LxLy bridge contracts.
- **High ($25,000 - $75,000 USD)**:
  - Consensus or network synchronization bypass on Go P2P validator systems.
  - Complete evasion of the low-latency Mempool Firewall leading to massive malicious reentrancy exploits.
- **Medium ($5,000 - $15,000 USD)**:
  - Cache poisoning of the Trie-based LRU firewall engine.
  - Resource exhaustion or memory leaks in Zig/C++/Rust microkernels.
