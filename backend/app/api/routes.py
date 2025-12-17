from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, text
from typing import List
from ..core.database import get_session, engine
from ..models import ModelRegistry, ModelVersion, EvaluationMetric, ComplianceLog
from ..schemas import (
    ModelCreate, ModelRead, ModelUpdate,
    VersionCreate, VersionRead,
    MetricCreate, MetricRead,
    AuditLogRead, HealthStatus
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
        version="0.1.0"
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
def read_models(session: Session = Depends(get_session)):
    """List all registered models"""
    return session.exec(select(ModelRegistry)).all()


@router.get("/models/{model_id}", response_model=ModelRead, tags=["Models"])
def read_model(model_id: int, session: Session = Depends(get_session)):
    """Get a specific model by ID"""
    model = session.get(ModelRegistry, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
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

