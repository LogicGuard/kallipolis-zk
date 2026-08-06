# Security Audit & Formal Verification

Security is paramount at Kallipolis ZK, achieved through a defense-in-depth approach.

## Technical Security Pillars:
- **Formal Verification (OCaml)**: Critical ZK circuits are mathematically proven against specifications using `Coq` or specialized OCaml-based verification engines to guarantee functional correctness and sound security properties.
- **Circuit Integrity**: Halo2 circuits are reviewed for common vulnerabilities (e.g., soundess bugs, constraint under-specification).
- **Mempool Firewalling**: Pattern matching logic is audited to prevent bypasses of transaction filtration rules.
- **Bug Bounty**: Please refer to [SECURITY.md](/SECURITY.md) in the root directory for vulnerability disclosure policy.

## Security Lifecycle
1. **Threat Modeling**: Periodic assessment of attack vectors against the Mempool Firewall.
2. **Automated Verification**: Integration of CI/CD formal verification steps for circuit code changes.
3. **External Audits**: Collaborative auditing with third-party security firms specialized in ZK-Rollups and Rust-based blockchain infrastructure.
