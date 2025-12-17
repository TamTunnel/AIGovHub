# Contributing to AI Governance Hub

Thank you for your interest in contributing to AI Governance Hub! This project is open-source and we welcome contributions from the community.

## 🤝 Core Principles
*   **Safety First:** All code must respect the sensitive nature of governance data. No heavy external dependencies without review.
*   **Compliance Alignment:** Features should map to specific frameworks (NIST, EU AI Act) where possible.
*   **Documentation:** Every PR must update the relevant docs. This tool lives and dies by its ability to explain *why* it matters.

## 🛠️ Development Setup
1.  Clone the repo: `git clone https://github.com/TamTunnel/AI-Governance-Hub.git`
2.  Install dependencies: `cd backend && poetry install`
3.  Run the stack: `docker compose up --build`
4.  Run tests: `cd backend && pytest`

## 📝 Pull Request Process
1.  Create a feature branch: `git checkout -b feature/amazing-feature`
2.  Commit your changes: `git commit -m 'feat: Add amazing feature'`
3.  Push to the branch: `git push origin feature/amazing-feature`
4.  Open a Pull Request.

## 🧪 Testing
*   Backend: `pytest` (ensure 100% pass rate)
*   Frontend: `npm run test`
*   Linting: `ruff check .`

## 📜 License
By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](../LICENSE).
