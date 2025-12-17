"""
Observability metrics endpoint.
Provides Prometheus-compatible metrics for monitoring.
"""
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from sqlmodel import Session, select, func
from ..core.database import engine
from ..models import ModelRegistry, ModelVersion, Policy, PolicyViolation, ComplianceLog

router = APIRouter(tags=["Observability"])


@router.get("/metrics", response_class=PlainTextResponse)
def prometheus_metrics():
    """
    Prometheus-compatible metrics endpoint.
    Exposes key governance metrics for monitoring dashboards.
    """
    metrics = []
    
    with Session(engine) as session:
        # Model counts
        total_models = session.exec(select(func.count(ModelRegistry.id))).one()
        total_versions = session.exec(select(func.count(ModelVersion.id))).one()
        total_policies = session.exec(select(func.count(Policy.id))).one()
        active_policies = session.exec(
            select(func.count(Policy.id)).where(Policy.is_active == True)
        ).one()
        total_violations = session.exec(select(func.count(PolicyViolation.id))).one()
        total_audit_logs = session.exec(select(func.count(ComplianceLog.id))).one()
        
        # Count by risk level
        for risk in ['unclassified', 'minimal', 'limited', 'high', 'unacceptable']:
            count = session.exec(
                select(func.count(ModelRegistry.id)).where(ModelRegistry.risk_level == risk)
            ).one()
            metrics.append(f'ai_governance_models_by_risk{{risk_level="{risk}"}} {count}')
        
        # Count by compliance status
        for status in ['draft', 'under_review', 'approved', 'retired']:
            count = session.exec(
                select(func.count(ModelRegistry.id)).where(ModelRegistry.compliance_status == status)
            ).one()
            metrics.append(f'ai_governance_models_by_status{{status="{status}"}} {count}')
    
    # Build metrics output
    metrics = [
        "# HELP ai_governance_models_total Total number of registered AI models",
        "# TYPE ai_governance_models_total gauge",
        f"ai_governance_models_total {total_models}",
        "",
        "# HELP ai_governance_versions_total Total number of model versions",
        "# TYPE ai_governance_versions_total gauge",
        f"ai_governance_versions_total {total_versions}",
        "",
        "# HELP ai_governance_policies_total Total number of policies",
        "# TYPE ai_governance_policies_total gauge",
        f"ai_governance_policies_total {total_policies}",
        "",
        "# HELP ai_governance_policies_active Number of active policies",
        "# TYPE ai_governance_policies_active gauge",
        f"ai_governance_policies_active {active_policies}",
        "",
        "# HELP ai_governance_violations_total Total policy violations",
        "# TYPE ai_governance_violations_total counter",
        f"ai_governance_violations_total {total_violations}",
        "",
        "# HELP ai_governance_audit_logs_total Total audit log entries",
        "# TYPE ai_governance_audit_logs_total counter",
        f"ai_governance_audit_logs_total {total_audit_logs}",
        "",
    ] + metrics
    
    return "\n".join(metrics)
