# Contributing to Kallipolis ZK

Thank you for your interest in contributing to Kallipolis ZK—the institutional AI and zero-knowledge security infrastructure for the Polygon AggLayer!

## 🚀 How to Contribute

### 🐛 Reporting Issues
If you find a bug, please open an issue in the [issue tracker](https://github.com/kallipolis/kallipolis/issues), providing:
- A clear, concise title.
- A detailed description of the issue.
- Steps to reproduce, including environment details.
- Relevant logs or screenshots.

### 💡 Proposing Features
Have an idea for an enhancement? Open an issue tagged with `enhancement`. Discuss the technical implementation with the core team before starting development.

## 🛠️ Development Workflow

1. **Fork & Clone** the repository.
2. **Create a Feature Branch**: `git checkout -b feature/amazing-security-module`.
3. **Install Dependencies**: `npm install`.
4. **Run Development Server**: `npm run dev`.
5. **Verify Build**: `npm run build` to ensure clean TypeScript compilation and esbuild bundling.
6. **Submit Pull Request**: Open a detailed PR with benchmarks, test coverage, and architectural review notes.

## 📋 Code Standards

- **TypeScript**: Strict typing enforced (no implicit `any`).
- **Rust/Circuit Code**: Follow safety paradigms and ensure gas/memory optimization.
- **Architecture**: Adhere to the defined modular architecture across React and backend services.
- **Testing**: PRs require full test coverage, including benchmarks in `/__tests__/`.
