# AI Model Governance & Compliance Hub

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI/CD](https://github.com/TamTunnel/AI-Governance-Hub/actions/workflows/ci.yml/badge.svg)](https://github.com/TamTunnel/AI-Governance-Hub/actions)

## What Is This?

A **centralized platform** for managing your organization's AI models—a registry that tracks every AI system, its versions, performance metrics, risk profiles, and a complete audit trail for EU AI Act compliance.

---

## Who Is This For?

| Role | Value |
|------|-------|
| **ML Engineers** | Register models, track versions, store evaluation metrics automatically via CI/CD |
| **Compliance Officers** | View audit trails, approve compliance status, generate PDF reports for regulators |
| **CTOs/Engineering Leaders** | Dashboard overview of model risk levels and compliance status across the organization |
| **Auditors** | Read-only access to model registry, versions, metrics, and audit logs |

---

## Usage Scenarios

### Scenario 1: New Model Deployment
1. ML team trains a new fraud detection model
2. CI/CD pipeline automatically registers the model and pushes evaluation metrics
3. Model starts in `draft` status with `high` risk level (finance domain)
4. Compliance team reviews via `/dashboard`, updates to `under_review`
5. After approval, status changes to `approved` with full audit trail

### Scenario 2: EU AI Act Audit
1. Regulator requests documentation for high-risk AI systems
2. Compliance officer filters models by `risk_level=high`
3. Downloads PDF compliance report for each model
4. Report includes: intended purpose, data sources, evaluation metrics, oversight plan

### Scenario 3: Model Retirement
1. Old recommendation model needs to be retired
2. Admin changes compliance status to `retired` with reason
3. Audit log captures the change for future reference
4. Model remains in registry for historical records

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Model Registry** | Register AI models with name, owner, description |
| **Risk Profiles** | Classify models by EU AI Act risk levels (minimal, limited, high, unacceptable) |
| **Compliance Lifecycle** | Track status: draft → under_review → approved → retired |
| **Version Tracking** | Track model versions and artifact locations (S3) |
| **Evaluation Metrics** | Store accuracy, F1, bias scores per version |
| **Audit Logging** | Automatic immutable trail for all changes |
| **Compliance Dashboard** | Visual overview of models by risk level and status |
| **PDF Reports** | Generate EU AI Act style compliance documentation |
| **Role-Based Access** | admin, model_owner, auditor roles |
| **OAuth2 Auth** | JWT authentication |
| **CI/CD Integration** | GitHub Actions workflow examples |

---

## Roles & Permissions (RBAC)

| Role | Permissions |
|------|-------------|
| `admin` | Full access - create, modify, delete models and users |
| `model_owner` | Create/modify models, change compliance status |
| `auditor` | Read-only - view models, audit logs, download reports |

---

## EU AI Act Feature Mapping

| EU AI Act Requirement | Platform Feature |
|----------------------|------------------|
| Risk Classification | `risk_level` field (minimal, limited, high, unacceptable) |
| Intended Purpose Documentation | `intended_purpose` field |
| Data Sources Transparency | `data_sources` field |
| Performance Metrics | Evaluation metrics per version |
| Human Oversight Plan | `oversight_plan` field |
| Change Audit Trail | Automatic compliance logs |
| Lifecycle Management | `compliance_status` (draft → approved → retired) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│   • Model Registry List     • Compliance Dashboard          │
│   • Risk Level Badges       • Status Filters                │
└─────────────────────────────────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                      │
│   /api/v1/models              → Model registry CRUD         │
│   /api/v1/models/{id}/risk-profile → Update risk profile    │
│   /api/v1/models/{id}/compliance-status → Change status     │
│   /api/v1/dashboard/stats     → Dashboard statistics        │
│   /api/v1/versions            → Version management          │
│   /api/v1/metrics             → Evaluation metrics          │
│   /api/v1/audit-logs          → Compliance history          │
│   /api/v1/reports/{id}/compliance-report → PDF download     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                    │
│   Tables: modelregistry, modelversion, evaluationmetric,    │
│           compliancelog, user                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend development)

### Run with Docker
```bash
git clone https://github.com/TamTunnel/AI-Governance-Hub.git
cd AI-Governance-Hub
cp .env.example .env
docker compose up --build
```

**URLs:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Dashboard | http://localhost:3000/dashboard |
| API Docs | http://localhost:8000/docs |

---

## CI Integration

### Example: Register model after training

```bash
# Register a new model
curl -X POST "http://localhost:8000/api/v1/models/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "fraud-detector-v2",
    "owner": "ML Team",
    "risk_level": "high",
    "domain": "finance",
    "intended_purpose": "Detect fraudulent transactions"
  }'

# Create a version
curl -X POST "http://localhost:8000/api/v1/versions/" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": 1,
    "version_tag": "v1.0.0",
    "s3_path": "s3://models/fraud-detector/v1.0.0"
  }'

# Push evaluation metric
curl -X POST "http://localhost:8000/api/v1/metrics/" \
  -H "Content-Type: application/json" \
  -d '{
    "version_id": 1,
    "metric_name": "accuracy",
    "value": 0.95
  }'

# Update compliance status
curl -X PATCH "http://localhost:8000/api/v1/models/1/compliance-status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "under_review",
    "reason": "Ready for compliance review"
  }'
```

See [`examples/ci-integration.yml`](examples/ci-integration.yml) for a complete GitHub Actions workflow.

---

## Roadmap

### Planned Features

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 High | **Policy Engine** | Define and enforce compliance rules automatically |
| 🔴 High | **Model Lineage** | Track data and model dependencies |
| 🟡 Medium | **Notifications** | Webhooks and email alerts for status changes |
| 🟡 Medium | **MLflow Integration** | Import models directly from MLflow |
| 🟢 Future | **Kubernetes Operator** | Auto-register models deployed to K8s |
| 🟢 Future | **LLM Governance** | Prompt tracking and response auditing |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Mantine UI |
| Backend | Python 3.11, FastAPI, SQLModel, Pydantic |
| Database | PostgreSQL 15 |
| Auth | OAuth2, JWT, bcrypt, RBAC |
| Reports | ReportLab (PDF) |
| Infrastructure | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |

---

## License

Licensed under **Apache License 2.0** — enterprise-friendly, permits commercial use.

See [LICENSE](LICENSE) for details.
