# AI Model Governance & Compliance Hub

## What Is This?

This is a **centralized platform** for managing your organization's AI models—think of it as a "registry" that tracks every AI system you deploy, its versions, performance metrics, and a complete audit trail. It helps you answer questions like:

- *"What AI models are we running in production?"*
- *"Who owns this model? When was it last updated?"*
- *"Can we prove compliance for regulatory audits (e.g., EU AI Act)?"*

---

## Why Does It Matter?

| Business Need | How This Platform Helps |
|---------------|-------------------------|
| **Regulatory Compliance** | Maintains an immutable audit log of all model changes for EU AI Act, GDPR, and other frameworks. |
| **Risk Management** | Tracks evaluation metrics (accuracy, bias scores) to flag underperforming models. |
| **Operational Visibility** | Provides a single source of truth for all deployed AI systems across teams. |
| **Accountability** | Records who registered or updated each model and when. |

---

## Key Features

1. **Model Registry** — Register and catalog all AI models with name, owner, and description.
2. **Version Tracking** — Keep a history of every model version (v1.0, v2.1, etc.) and where it's stored (e.g., S3).
3. **Evaluation Metrics** — Store accuracy, F1 score, bias metrics, and more for each version.
4. **Compliance Audit Logs** — Automatically logs every action (create, update) with timestamps.
5. **Simple Dashboard** — Clean web interface to view models, versions, and metrics.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      USERS / TEAMS                      │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
│   • Model List Dashboard                                │
│   • Register New Model Form                             │
│   • Version & Metrics Viewer                            │
└─────────────────────────────────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                     │
│   • /api/v1/models — CRUD for model registry            │
│   • /api/v1/versions — Version management               │
│   • /api/v1/metrics — Evaluation data storage           │
│   • /api/v1/audit-logs — Compliance history             │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                 │
│   • ModelRegistry table                                 │
│   • ModelVersion table                                  │
│   • EvaluationMetric table                              │
│   • ComplianceLog table (audit trail)                   │
└─────────────────────────────────────────────────────────┘
```

---

## For Technical Teams: How to Run

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ installed

### Step 1: Start Backend & Database
```bash
docker-compose up --build
```
- API available at: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web UI available at: http://localhost:5173

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React, TypeScript, Mantine | User interface |
| Backend | Python 3.11, FastAPI | REST API |
| Database | PostgreSQL 15 | Data persistence |
| Infrastructure | Docker Compose | Local development |

---

## License

This project is licensed under the **Apache License 2.0** — an enterprise-friendly open-source license that permits commercial use, modification, and distribution.
