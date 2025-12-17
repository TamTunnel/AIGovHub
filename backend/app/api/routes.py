from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, text, func
from typing import List, Optional
from ..core.database import get_session, engine
from ..models import ModelRegistry, ModelVersion, EvaluationMetric, ComplianceLog, RiskLevel, ComplianceStatus
from ..schemas import (
    ModelCreate, ModelRead, ModelUpdate,
    VersionCreate, VersionRead,
    MetricCreate, MetricRead,
    AuditLogRead, HealthStatus,
    RiskProfileUpdate, ComplianceStatusUpdate,
    DashboardStats, RiskLevelCount, ComplianceStatusCount
)

router = APIRouter()


# --- Health Check ---
@router.get("/health", response_model=HealthStatus, tags=["System"])
def health_check():
    """Check API and database health"""
    db_status = "healthy"
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"
    
    return HealthStatus(
        status="ok" if db_status == "healthy" else "degraded",
        database=db_status,
        version="0.2.0"
    )


# --- Dashboard ---
@router.get("/dashboard/stats", response_model=DashboardStats, tags=["Dashboard"])
def get_dashboard_stats(session: Session = Depends(get_session)):
    """Get dashboard statistics for compliance overview"""
    total_models = session.exec(select(func.count(ModelRegistry.id))).one()
    total_versions = session.exec(select(func.count(ModelVersion.id))).one()
    
    # Count by risk level
    by_risk = []
    for level in RiskLevel:
        count = session.exec(
            select(func.count(ModelRegistry.id)).where(ModelRegistry.risk_level == level)
        ).one()
        by_risk.append(RiskLevelCount(risk_level=level.value, count=count))
    
    # Count by compliance status
    by_status = []
    for status in ComplianceStatus:
        count = session.exec(
            select(func.count(ModelRegistry.id)).where(ModelRegistry.compliance_status == status)
        ).one()
        by_status.append(ComplianceStatusCount(status=status.value, count=count))
    
    return DashboardStats(
        total_models=total_models,
        total_versions=total_versions,
        by_risk_level=by_risk,
        by_compliance_status=by_status
    )


# --- Model Registry ---
@router.post("/models/", response_model=ModelRead, tags=["Models"])
def create_model(payload: ModelCreate, session: Session = Depends(get_session)):
    """Register a new AI model"""
    model = ModelRegistry(**payload.model_dump())
    session.add(model)
    session.commit()
    session.refresh(model)
    # Log audit
    log = ComplianceLog(
        entity_type="ModelRegistry",
        entity_id=str(model.id),
        action="CREATE",
        details={"name": model.name}
    )
    session.add(log)
    session.commit()
    return model


@router.get("/models/", response_model=List[ModelRead], tags=["Models"])
def read_models(
    session: Session = Depends(get_session),
    risk_level: Optional[RiskLevel] = Query(None, description="Filter by risk level"),
    compliance_status: Optional[ComplianceStatus] = Query(None, description="Filter by compliance status")
):
    """List all registered models with optional filters"""
    query = select(ModelRegistry)
    if risk_level:
        query = query.where(ModelRegistry.risk_level == risk_level)
    if compliance_status:
        query = query.where(ModelRegistry.compliance_status == compliance_status)
    return session.exec(query).all()


@router.get("/models/{model_id}", response_model=ModelRead, tags=["Models"])
def read_model(model_id: int, session: Session = Depends(get_session)):
    """Get a specific model by ID"""
    model = session.get(ModelRegistry, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


# --- Risk Profile ---
@router.patch("/models/{model_id}/risk-profile", response_model=ModelRead, tags=["Models"])
def update_risk_profile(
    model_id: int,
    payload: RiskProfileUpdate,
    session: Session = Depends(get_session)
):
    """Update model risk profile (risk level, domain, potential harm, etc.)"""
    model = session.get(ModelRegistry, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(model, key, value)
    
    session.add(model)
    session.commit()
    session.refresh(model)
    
    # Log audit
    log = ComplianceLog(
        entity_type="ModelRegistry",
        entity_id=str(model.id),
        action="UPDATE_RISK_PROFILE",
        details=update_data
    )
    session.add(log)
    session.commit()
    return model


# --- Compliance Status ---
@router.patch("/models/{model_id}/compliance-status", response_model=ModelRead, tags=["Models"])
def update_compliance_status(
    model_id: int,
    payload: ComplianceStatusUpdate,
    session: Session = Depends(get_session)
):
    """Update model compliance status (draft → under_review → approved → retired)
    
    Policy enforcement is applied before status changes. If a policy is violated,
    the action is blocked and a PolicyViolation record is created.
    """
    from ..core.policy_engine import enforce_compliance_status_change
    
    model = session.get(ModelRegistry, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Enforce policies before allowing status change
    enforcement_result = enforce_compliance_status_change(
        session=session,
        model=model,
        new_status=payload.status,
        user_id=None  # Could be populated from auth context
    )
    
    if not enforcement_result.allowed:
        raise HTTPException(
            status_code=403,
            detail=f"Policy violation: {enforcement_result.message}"
        )
    
    old_status = model.compliance_status
    model.compliance_status = payload.status
    
    session.add(model)
    session.commit()
    session.refresh(model)
    
    # Log audit for compliance status change
    log = ComplianceLog(
        entity_type="ModelRegistry",
        entity_id=str(model.id),
        action="COMPLIANCE_STATUS_CHANGE",
        details={
            "from": old_status.value,
            "to": payload.status.value,
            "reason": payload.reason
        }
    )
    session.add(log)
    session.commit()
    return model


# --- Model Versions ---
@router.post("/versions/", response_model=VersionRead, tags=["Versions"])
def create_version(payload: VersionCreate, session: Session = Depends(get_session)):
    """Add a new version to a model"""
    version = ModelVersion(**payload.model_dump())
    session.add(version)
    session.commit()
    session.refresh(version)
    log = ComplianceLog(
        entity_type="ModelVersion",
        entity_id=str(version.id),
        action="CREATE",
        details={"tag": version.version_tag}
    )
    session.add(log)
    session.commit()
    return version


@router.get("/models/{model_id}/versions/", response_model=List[VersionRead], tags=["Versions"])
def read_versions(model_id: int, session: Session = Depends(get_session)):
    """List all versions for a model"""
    return session.exec(select(ModelVersion).where(ModelVersion.model_id == model_id)).all()


# --- Metrics ---
@router.post("/metrics/", response_model=MetricRead, tags=["Metrics"])
def add_metric(payload: MetricCreate, session: Session = Depends(get_session)):
    """Add an evaluation metric to a version"""
    metric = EvaluationMetric(**payload.model_dump())
    session.add(metric)
    session.commit()
    session.refresh(metric)
    return metric


# --- Audit Logs ---
@router.get("/audit-logs/", response_model=List[AuditLogRead], tags=["Compliance"])
def read_audit_logs(session: Session = Depends(get_session)):
    """Get all compliance audit logs"""
    return session.exec(select(ComplianceLog).order_by(ComplianceLog.timestamp.desc())).all()


