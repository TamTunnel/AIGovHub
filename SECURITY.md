# Security Policy

## 🛡️ Reporting a Vulnerability

**Do not open a GitHub Issue for security vulnerabilities.**

If you discover a security vulnerability in AI Governance Hub, please verify it is reproducible and send a report to:

**security@example.com** (Replace with actual security email if available, otherwise suggest private vulnerability reporting via GitHub)

*   We will acknowledge your report within 48 hours.
*   We will provide a timeline for a fix.
*   Please do not disclose the vulnerability publicly until a fix is released.

## 🔒 Supported Versions

| Version | Supported |
| :--- | :--- |
| 0.4.x | ✅ Yes |
| 0.3.x | ❌ No |
| < 0.3 | ❌ No |

## 🔐 Deployment Security

For production deployments in government or enterprise:
1.  **Always** deploy behind a TLS-terminating reverse proxy (Nginx).
2.  **Enable** the RBAC policies suitable for your organization.
3.  **Rotate** `SECRET_KEY` and Database Credentials regularly.
4.  **Isolate** the database network from the public internet.

See [Deployment & Security](https://github.com/TamTunnel/AI-Governance-Hub/wiki/Deployment_and_Security) in the Wiki for air-gapped architecture.
