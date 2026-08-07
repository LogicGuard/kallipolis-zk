# Contributing to Kallipolis ZK

Thank you for your interest in contributing to Kallipolis ZK—the institutional AI and zero-knowledge security infrastructure for the Polygon AggLayer!

## 🚀 How to Contribute

### 🐛 Reporting Issues
If you find a bug, please open an issue in the [issue tracker](https://github.com/kallipolis/kallipolis/issues), providing:
- A clear, concise title.
- A detailed description of the issue.
- Steps to reproduce, including environment details.
- Relevant logs or screenshots (use our `bug_report` template).

### 💡 Proposing Features
Have an idea for an enhancement? Open an issue tagged with `enhancement`. Discuss the technical implementation with the core team before starting development.

## 🛠️ Development Workflow

1. **Fork & Clone** the repository.
2. **Create a Feature Branch**: `git checkout -b feature/your-feature-name`.
3. **Development**: Use `make build` for local compilation.
4. **Testing**: Run `make test` and `make test-benchmarks` before committing.
5. **Pull Request**: Open a detailed PR against `main`. It will trigger automated CI/CD checks (Formal Verification, Linting, Builds).

## 📋 Code Standards

- **TypeScript**: Strict typing enforced (no implicit `any`).
- **Rust/Circuit Code**: Follow safety paradigms and ensure memory optimization.
- **Formal Verification**: Changes to ZK circuits MUST undergo formal verification (see `wiki/security-audit.md`).
- **Testing**: PRs require full test coverage, including benchmarks in `/__tests__/`.

## ⚖️ Code of Conduct
Please adhere to our [Code of Conduct](/CODE_OF_CONDUCT.md).
