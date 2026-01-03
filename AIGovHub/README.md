# AI Model Governance & Compliance Hub

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI/CD](https://github.com/TamTunnel/AI-Governance-Hub/actions/workflows/ci.yml/badge.svg)](https://github.com/TamTunnel/AI-Governance-Hub/actions)
[![Development Build](https://github.com/TamTunnel/AI-Governance-Hub/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/TamTunnel/AI-Governance-Hub/actions/workflows/ci.yml?query=branch%3Adevelop)

## What Is This?

A **centralized platform** for managing your organization's AI models—supporting both **EU AI Act** and **US AI governance** (NIST AI RMF) requirements.

---

## Executive Summary: The Problem & How This Helps

**The Problem:**
Organizations, especially government agencies and regulated enterprises, are deploying AI systems at a rapid pace. However, they often lack visibility into what models exist, where they are running, what data they use, and whether they pose unacceptable risks. This "shadow AI" problem leads to **regulatory non-compliance**, duplicated efforts, and an inability to answer basic oversight questions from auditors or leadership.

**The Consequences:**
Without a central registry, organizations face reputational damage, legal penalties (e.g., EU AI Act fines), and security vulnerabilities. Fragmented spreadsheets and ad-hoc documentation are insufficient for modern compliance frameworks like the NIST AI RMF.

**The Solution:**
**AI Governance Hub** is a centralized, open-source cockpit that brings order to this chaos. It allows you to:

- **Register & Track:** Maintain a real-time inventory of all AI models and their lineage (datasets, dependencies).
- **Assess Risk:** Automatically classify systems based on sensitivity (PII/PHI) and regulatory risk levels.
- **Enforce Policy:** Block non-compliant actions (e.g., deploying high-risk models without approval) using a built-in policy engine.
- **Prove Compliance:** Generate immutable audit trails and ready-to-file compliance reports.

Crucially, it is **self-hosted and open-source**, giving security-sensitive organizations full control over their governance data without relying on third-party SaaS vendors.

---

## How This Compares to Other Options

There are three main categories of tools in this space. Here is how AI Governance Hub fits in:

| Feature            | **AI Governance Hub** (This Project)    | **Enterprise Governance Platforms** (e.g., Credo AI, watsonx) | **MLOps / Model Registries** (e.g., MLflow, Neptune) |
| :----------------- | :-------------------------------------- | :------------------------------------------------------------ | :--------------------------------------------------- |
| **Primary Focus**  | **Governance & Compliance Scaffolding** | Full-suite GRC & Vendor Risk                                  | Experiment Tracking & Engineering                    |
| **Cost / License** | **Open Source (Apache 2.0)**            | High (Commercial SaaS)                                        | Open Core or Commercial                              |
| **Deployment**     | **Self-Hosted (Air-gapped ready)**      | SaaS / Hybrid                                                 | SaaS / Self-Hosted                                   |
| **Policy Engine**  | **Built-in (Code/Config based)**        | Drag-and-drop / Proprietary                                   | Minimal / Custom Scripts                             |
| **Target User**    | **Gov/Enterprise Architects**           | Risk Officers / Legal                                         | Data Scientists                                      |

**Why choose this?**

- Choose **AI Governance Hub** if you need a flexible, self-hosted governance layer that integrates with your existing tools but puts compliance first.
- Choose **Enterprise Platforms** if you want a fully managed service and have a large budget for GRC tools.
- Choose **MLOps Tools** for engineering workflows, but pair them with a governance layer (like this one) for oversight.

---

## Key Features

| Feature                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| **Model Registry**      | Central catalog of AI models                        |
| **Risk Profiles**       | EU AI Act & NIST AI RMF classification              |
| **Data Classification** | Sensitivity (PII/PHI/PCI) and classification levels |
| **Lineage Tracking**    | Datasets and model dependencies                     |
| **Human Approval**      | Capture approver, approval notes, timestamps        |
| **Policy Engine**       | Define and enforce governance rules                 |
| **Multi-Tenancy**       | Organization + environment scoping                  |
| **SSO Ready**           | Designed for IdP integration                        |

---

## US AI Governance & NIST AI RMF Alignment

This platform supports alignment with the **NIST AI Risk Management Framework (AI RMF)**.

### NIST AI RMF Function Mapping

| NIST Function | Platform Capability                                         |
| ------------- | ----------------------------------------------------------- |
| **GOVERN**    | RBAC, policies, organization scoping, audit logs            |
| **MAP**       | Model registry, risk profiles, data classification, lineage |
| **MEASURE**   | Evaluation metrics, version tracking, performance history   |
| **MANAGE**    | Compliance lifecycle, policy enforcement, human approvals   |

### Sectoral Applicability

| Regulation     | Relevant Features                                      |
| -------------- | ------------------------------------------------------ |
| **HIPAA**      | `data_sensitivity: phi`, audit logging                 |
| **GLBA/FFIEC** | Risk profiles, data classification, approval workflows |
| **CCPA/CPRA**  | PII tracking, data sources documentation               |
| **FedRAMP**    | Organization scoping, audit trails, security controls  |

---

## Data Classification & Sensitivity

### Sensitivity Levels

| Level      | Description                          | Example Use Case       |
| ---------- | ------------------------------------ | ---------------------- |
| `public`   | Non-sensitive data                   | Public datasets        |
| `internal` | Internal business data               | Operational metrics    |
| `pii`      | Personally Identifiable Information  | Customer names, emails |
| `phi`      | Protected Health Information (HIPAA) | Medical records        |
| `pci`      | Payment Card Industry data           | Credit card numbers    |

### Classification Levels

| Level          | Description                      |
| -------------- | -------------------------------- |
| `public`       | Open to external parties         |
| `internal`     | Internal use only                |
| `confidential` | Restricted access                |
| `restricted`   | Highly restricted (need-to-know) |

### Jurisdiction

Track data residency requirements with the `jurisdiction` field (e.g., "US", "EU", "Global").

---

## Lineage & Traceability

### Why Lineage Matters

- **Audit compliance**: Know exactly what data trained your models
- **Incident response**: Quickly identify affected models when data issues arise
- **Reproducibility**: Track model dependencies for retraining

### Data Model

```
Dataset (training data, validation data, etc.)
    ↓ linked via ModelDatasetLink
ModelRegistry (your AI model)
    ↓ linked via ModelDependency
ModelRegistry (parent models, fine-tuning sources)
```

---

## Human-in-the-Loop Approvals

When a model is approved, the system captures:

| Field                 | Description            |
| --------------------- | ---------------------- |
| `approved_by_user_id` | Who approved the model |
| `approved_at`         | Timestamp of approval  |
| `approval_notes`      | Required justification |

**Approval notes are mandatory** when changing status to `approved`.

---

## Limitations & Non-Goals

While concise and powerful, this platform has specific boundaries:

- **Not Legal Advice:** Using this tool does not guarantee compliance with laws. It provides the _record-keeping_ to support compliance.
- **Evaluation & Testing:** The hub does not run advanced technical evaluations (bias, robustness, red-teaming) itself. It stores and surfaces results produced by your external ML pipelines and tools.
- **Discovery & Inventory:** The hub does not automatically scan your network to discover "Shadow AI" systems. It governs models that are registered into it, relying on organizational policy and CI/CD integration to be comprehensive.
- **Certification Status:** The hub provides documentation support but does not grant formal certification (e.g., FedRAMP authorization, ISO/IEC 42001, or official EU AI Act conformity). It is a tool for internal control and audit readiness, not a substitute for external accreditation.
- **Not a GRC Platform:** It is not designed to manage broader enterprise risks (cybersecurity, physical, financial) outside of AI.
- **Not an Observability Solution:** It tracks _metadata_ and _metrics_, but does not replace real-time monitoring tools like Datadog, Prometheus, or Grafana for live inference capability.
- **Not a Human Replacement:** The tool facilitates governance but does not replace the need for human review boards or legal counsel.
- **SSO Integration:** Currently designed for SSO patterns (headers/OIDC) but requires proper upstream configuration (Nginx/Okta) to function securely in enterprise environments.

---

## Security & Deployment

### Network Placement

> [!IMPORTANT]
> Deploy behind a reverse proxy with TLS termination.

### High Availability & Scaling (Guidance)

- **Application Layer:** The FastAPI backend is stateless. You can run multiple replicas (containers) behind a load balancer (Nginx, AWS ALB) for high availability.
- **Database Layer:** Use a managed PostgreSQL service (AWS RDS, Azure Database for PostgreSQL) or a clustered setup (Patroni) for storage reliability.
- **Secrets:** Inject configuration via environment variables.

### Backup & Restore

Governance data is critical.

- **Strategy:** Integrate the PostgreSQL database into your standard organizational backup policy (e.g., daily snapshots, Point-in-Time Recovery).
- **Logical Backup:**

  ```bash
  # Backup
  pg_dump -h db_host -U user ai_governance > backup_$(date +%F).sql

  # Restore
  psql -h db_host -U user ai_governance < backup_2024-01-01.sql
  ```

---

## Example 90-Day Rollout (Optional)

For organizations getting started, here is a recommended path:

- **Week 1-2: Pilot Deployment**
  - Deploy the Hub in a staging environment.
  - Connect SSO (simulated or real).
  - Onboard the core AI/ML lead and Compliance lead.
- **Week 3-6: Inventory & Calibration**
  - Register the top 5 critical AI models ("Golden Record").
  - Define initial Risk Profiles and Policies (e.g., "High Risk requires 2 reviewers").
- **Week 7-10: Process Integration**
  - Make registration mandatory for new models via CI/CD pipelines.
  - Train data scientists on the "Model Registry" workflow.
- **Week 11-12: Full Governance**
  - Enforce "Block High Risk" policies.
  - Generate the first quarterly Compliance Report for the CISO/Board.

---

## Quick Start

```bash
git clone https://github.com/TamTunnel/AI-Governance-Hub.git
cd AI-Governance-Hub
cp .env.example .env
docker compose up --build
```

| Service  | URL                                  |
| -------- | ------------------------------------ |
| Frontend | http://localhost:3000                |
| API Docs | http://localhost:8000/docs           |
| Metrics  | http://localhost:8000/api/v1/metrics |

---

## Technology Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Frontend       | React, TypeScript, Mantine     |
| Backend        | Python 3.11, FastAPI, SQLModel |
| Database       | PostgreSQL 15                  |
| Auth           | OAuth2, JWT, RBAC              |
| Infrastructure | Docker, Nginx                  |

---

## License

Apache License 2.0 — See [LICENSE](LICENSE).
