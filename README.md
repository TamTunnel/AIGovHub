# AI Model Governance & Compliance Hub

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI/CD](https://github.com/TamTunnel/AI-Governance-Hub/actions/workflows/ci.yml/badge.svg)](https://github.com/TamTunnel/AI-Governance-Hub/actions)

## What Is This?

A **centralized platform** for managing your organization's AI models—a registry that tracks every AI system, its versions, performance metrics, risk profiles, and a complete audit trail for EU AI Act compliance.

**v0.3** adds: **Policy Engine** with enforcement, **Multi-tenancy** with org/environment scoping, and **Prometheus-compatible metrics** for enterprise observability.

---

## Who Is This For?

| Role | Value |
|------|-------|
| **ML Engineers** | Register models, track versions, store evaluation metrics via CI/CD |
| **Compliance Officers** | Define policies, approve models, generate PDF reports |
| **CTOs/CISOs** | Dashboard overview, policy enforcement, observability metrics |
| **Auditors** | Read-only access to models, audit logs, policy violations |

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Model Registry** | Register AI models with name, owner, risk profile |
| **Risk Profiles** | EU AI Act levels (minimal, limited, high, unacceptable) |
| **Compliance Lifecycle** | Status: draft → under_review → approved → retired |
| **Policy Engine** | Define and enforce governance rules automatically |
| **Policy Violations** | Track blocked actions with full audit trail |
| **Multi-Tenancy** | Organization + environment (dev/test/prod) scoping |
| **Prometheus Metrics** | `/api/v1/metrics` endpoint for observability |
| **PDF Reports** | EU AI Act style compliance documentation |
| **RBAC** | admin, model_owner, auditor roles |

---

## Policy Engine

### Supported Policy Types

| Policy | Description |
|--------|-------------|
| `require_evaluation_before_approval` | Models must have evaluation metrics before approval |
| `block_high_risk_without_approval` | High-risk models cannot skip `under_review` status |
| `require_review_for_high_risk` | High-risk models require explicit review |

### How It Works

1. **Define a policy** via API or UI (`/policies`)
2. **Policy engine evaluates** on compliance status changes
3. **Violations are blocked** with clear error messages
4. **PolicyViolation record** created with full details
5. **Audit log entry** captures the blocked action

### Example: Create a Policy

```bash
curl -X POST "http://localhost:8000/api/v1/policies/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Require Evaluation Before Approval",
    "description": "Models must have metrics before being approved",
    "scope": "global",
    "condition_type": "require_evaluation_before_approval",
    "is_active": true
  }'
```

---

## Organizations & Environments

### Conceptual Model

```
Organization (e.g., "Agency A", "Department B")
  └── Environment (dev, test, staging, prod)
       └── Models (scoped by org + env)
```

### How to Use

- **Models** include `organization_id` and `environment` fields
- **API queries** can be filtered by organization/environment
- **Users** belong to organizations (planned: multi-org access)

### Enterprise Mapping

| Enterprise Concept | Platform Feature |
|-------------------|------------------|
| Department/Agency | Organization |
| SDLC Stage | Environment (dev/test/prod) |
| Data Classification | Risk Level |

---

## Observability

### Prometheus Metrics

Access metrics at: `GET /api/v1/metrics`

```prometheus
# HELP ai_governance_models_total Total number of registered AI models
ai_governance_models_total 42

# HELP ai_governance_violations_total Total policy violations
ai_governance_violations_total 3

# Models by risk level
ai_governance_models_by_risk{risk_level="high"} 5
ai_governance_models_by_risk{risk_level="minimal"} 20
```

### Grafana Integration

1. Add Prometheus data source pointing to your Prometheus server
2. Create dashboard with key metrics:
   - Model counts by risk level
   - Policy violations over time
   - Compliance status distribution

---

## Security & Deployment Considerations

### Network Placement

> [!IMPORTANT]
> This application should be deployed **behind a reverse proxy** (Nginx, Envoy, API Gateway) and not directly exposed to the internet.

**Recommended topology:**
```
Internet → Load Balancer → Nginx/Envoy (TLS) → AI Governance Hub → PostgreSQL
```

### TLS/HTTPS

- Configure TLS termination at the reverse proxy
- Use Let's Encrypt or organizational certificates
- Enforce HTTPS redirects

### Secrets Management

| Secret | Source |
|--------|--------|
| `DATABASE_URL` | Environment variable |
| `SECRET_KEY` | Environment variable (min 32 chars) |
| `POSTGRES_PASSWORD` | Environment variable or secrets manager |

> [!CAUTION]
> Never commit secrets to version control. Use `.env` files for local development only.

### Rate Limiting

Rate limiting should be configured at the reverse proxy level:

```nginx
# Example Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
location /api/ {
    limit_req zone=api burst=20 nodelay;
}
```

### Logging & SIEM Integration

- All governance actions are logged to `ComplianceLog` table
- Logs include: entity, action, user, timestamp, details (JSON)
- Export logs to SIEM via database replication or API polling

---

## Backup & Data Export

### PostgreSQL Backup

```bash
# Full backup
pg_dump -h localhost -U postgres ai_governance > backup.sql

# Restore
psql -h localhost -U postgres ai_governance < backup.sql
```

### API Export

- `GET /api/v1/models/` - Export all models
- `GET /api/v1/audit-logs/` - Export audit trail
- `GET /api/v1/policies/violations/` - Export policy violations

---

## Quick Start

```bash
git clone https://github.com/TamTunnel/AI-Governance-Hub.git
cd AI-Governance-Hub
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Dashboard | http://localhost:3000/dashboard |
| Policies | http://localhost:3000/policies |
| API Docs | http://localhost:8000/docs |
| Metrics | http://localhost:8000/api/v1/metrics |

---

## Roadmap

| Status | Feature |
|--------|---------|
| ✅ Done | Policy Engine with enforcement |
| ✅ Done | Organization + environment scoping |
| ✅ Done | Prometheus metrics endpoint |
| 🔜 Planned | SSO/SAML integration |
| 🔜 Planned | Webhooks for status changes |
| 🔜 Planned | MLflow integration |
| 🔜 Planned | Kubernetes operator |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Mantine UI |
| Backend | Python 3.11, FastAPI, SQLModel, Pydantic |
| Database | PostgreSQL 15 |
| Auth | OAuth2, JWT, bcrypt, RBAC |
| Observability | Prometheus-compatible metrics |
| Infrastructure | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |

---

## License

Licensed under **Apache License 2.0** — enterprise-friendly, permits commercial use.

See [LICENSE](LICENSE) for details.
