"""
Pydantic schemas for API request/response validation.
Separates API contracts from database models.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """EU AI Act risk classification levels"""
    unclassified = "unclassified"
    minimal = "minimal"
    limited = "limited"
    high = "high"
    unacceptable = "unacceptable"


class ComplianceStatus(str, Enum):
    """Compliance lifecycle status"""
    draft = "draft"
    under_review = "under_review"
    approved = "approved"
    retired = "retired"


# --- Model Registry Schemas ---
class ModelCreate(BaseModel):
    """Schema for creating a new model"""
    name: str = Field(..., min_length=1, max_length=255, description="Unique model name")
    description: Optional[str] = Field(None, max_length=2000)
    owner: str = Field(..., min_length=1, max_length=255, description="Team or individual owner")
    # Optional risk profile during creation
    risk_level: Optional[RiskLevel] = RiskLevel.unclassified
    domain: Optional[str] = Field(None, max_length=100)
    potential_harm: Optional[str] = Field(None, max_length=2000)
    intended_purpose: Optional[str] = Field(None, max_length=2000)


class ModelRead(BaseModel):
    """Schema for reading model data"""
    id: int
    name: str
    description: Optional[str]
    owner: str
    created_at: datetime
    risk_level: RiskLevel
    domain: Optional[str]
    potential_harm: Optional[str]
    compliance_status: ComplianceStatus
    intended_purpose: Optional[str]
    data_sources: Optional[str]
    oversight_plan: Optional[str]

    class Config:
        from_attributes = True


class ModelUpdate(BaseModel):
    """Schema for updating a model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    owner: Optional[str] = Field(None, min_length=1, max_length=255)


class RiskProfileUpdate(BaseModel):
    """Schema for updating model risk profile"""
    risk_level: Optional[RiskLevel] = None
    domain: Optional[str] = Field(None, max_length=100)
    potential_harm: Optional[str] = Field(None, max_length=2000)
    intended_purpose: Optional[str] = Field(None, max_length=2000)
    data_sources: Optional[str] = Field(None, max_length=2000)
    oversight_plan: Optional[str] = Field(None, max_length=2000)


class ComplianceStatusUpdate(BaseModel):
    """Schema for updating compliance status"""
    status: ComplianceStatus
    reason: Optional[str] = Field(None, max_length=500, description="Reason for status change")


# --- Model Version Schemas ---
class VersionCreate(BaseModel):
    """Schema for creating a new version"""
    model_id: int
    version_tag: str = Field(..., min_length=1, max_length=50)
    s3_path: Optional[str] = Field(None, max_length=500)


class VersionRead(BaseModel):
    """Schema for reading version data"""
    id: int
    model_id: int
    version_tag: str
    s3_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Evaluation Metric Schemas ---
class MetricCreate(BaseModel):
    """Schema for adding a metric"""
    version_id: int
    metric_name: str = Field(..., min_length=1, max_length=100)
    value: float


class MetricRead(BaseModel):
    """Schema for reading metric data"""
    id: int
    version_id: int
    metric_name: str
    value: float
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Compliance Log Schema ---
class AuditLogRead(BaseModel):
    """Read-only schema for audit logs"""
    id: int
    entity_type: str
    entity_id: str
    action: str
    details: Optional[dict]
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Health Check Schema ---
class HealthStatus(BaseModel):
    """API health check response"""
    status: str
    database: str
    version: str


# --- Dashboard Schemas ---
class RiskLevelCount(BaseModel):
    """Count of models by risk level"""
    risk_level: str
    count: int


class ComplianceStatusCount(BaseModel):
    """Count of models by compliance status"""
    status: str
    count: int


class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_models: int
    total_versions: int
    by_risk_level: List[RiskLevelCount]
    by_compliance_status: List[ComplianceStatusCount]

