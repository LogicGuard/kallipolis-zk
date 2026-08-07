# Contributing to Kallipolis ZK

Thank you for your interest in contributing to Kallipolis ZK—the institutional AI and zero-knowledge security infrastructure for the Polygon AggLayer!

---

## 📋 1. Commit Message Standard (Conventional Commits v1.0.0)

All commit messages in Kallipolis ZK **MUST** adhere to the [Conventional Commits specification](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Allowed Types:
- **`feat`**: A new user-facing feature or API endpoint.
- **`fix`**: A bug fix in frontend, gateway, circuits, or actor modules.
- **`docs`**: Documentation changes only (`README.md`, `ARCHITECTURE.md`, inline docs).
- **`perf`**: Performance optimizations (e.g. latency reductions, zero-copy deserialization).
- **`test`**: Adding or updating unit tests, E2E Web3 tests, or benchmark suites.
- **`ci`**: Workflow modifications (`.github/workflows/ci.yml`).
- **`refactor`**: Code changes that neither fix bugs nor add features.
- **`chore`**: Maintenance tasks, dependency bumps, tooling configuration.

### Examples:
- `feat(gateway): implement JWT authentication for audit endpoint`
- `fix(frontend): add optional chaining to prevent undefined wallet properties`
- `perf(mempool): implement zero-alloc buffer parsing in Zig`
- `feat(circuit)!: breaking schema change in Halo2 recursion bridge`

---

## 🔄 2. Change Management & Development Workflow

### Step-by-Step Flow:
1. **Fork & Branch**: Create a descriptive topic branch from `main`:
   ```bash
   git checkout -b feat/agglayer-bridge-attestation
   ```
2. **Local Validation**: Ensure all strict type checks and lint rules pass before opening a PR:
   ```bash
   npm run lint
   npm test
   ```
3. **Pull Request Protocol**:
   - Title must follow Conventional Commits formatting.
   - Fill out the complete Pull Request template (`.github/pull_request_template.md`).
   - Link any associated GitHub Issues (e.g., `Fixes #142`).

### 🛡️ Code Review & Branch Protection Rules:
- **Review Requirement**: Minimum of **2 core team approvals** required for merge.
- **CI Gateways**: All CI checks (`lint`, `vitest`, `formal-verification`, `cargo-audit`, `npm-audit`) MUST pass.
- **Branch Strategy**: Direct commits to `main` are strictly blocked. All merges use Squash & Merge to maintain a clean, linear git history.

---

## 🛠️ 3. Module Code Owners

Refer to [CODEOWNERS](CODEOWNERS) for designated reviewers per subsystem:
- `/gateway/`: Gateway Engineering & Security
- `/circuits/` & `/prover/`: ZK Cryptography Leads
- `/components/` & `/src/`: Frontend Leads

---

## ⚖️ 4. Code of Conduct & Security
- Review our [Code of Conduct](/CODE_OF_CONDUCT.md).
- To report security vulnerabilities, see our [SECURITY.md](/SECURITY.md) and Immunefi Bug Bounty policies.

