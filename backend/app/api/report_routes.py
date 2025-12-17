"""
Compliance report endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from ..core.database import get_session
from ..core.reports import generate_compliance_report
from ..models import ModelRegistry, ModelVersion, EvaluationMetric, ComplianceLog

router = APIRouter(prefix="/reports", tags=["Compliance Reports"])


@router.get("/models/{model_id}/compliance-report")
def download_compliance_report(model_id: int, session: Session = Depends(get_session)):
    """
    Generate and download a PDF compliance report for a model.
    Includes model info, versions, metrics, and audit trail.
    """
    # Fetch model
    model = session.get(ModelRegistry, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Fetch versions
    versions = session.exec(
        select(ModelVersion).where(ModelVersion.model_id == model_id)
    ).all()
    
    # Fetch metrics for all versions
    version_ids = [v.id for v in versions]
    metrics = []
    if version_ids:
        metrics = session.exec(
            select(EvaluationMetric).where(EvaluationMetric.version_id.in_(version_ids))
        ).all()
    
    # Fetch audit logs for this model
    logs = session.exec(
        select(ComplianceLog)
        .where(ComplianceLog.entity_type == "ModelRegistry")
        .where(ComplianceLog.entity_id == str(model_id))
        .order_by(ComplianceLog.timestamp.desc())
    ).all()
    
    # Generate PDF
    pdf_buffer = generate_compliance_report(model, versions, metrics, logs)
    
    filename = f"compliance_report_{model.name.replace(' ', '_')}_{model_id}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
