from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column


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


class ModelRegistry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    owner: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Risk Profile fields
    risk_level: RiskLevel = Field(default=RiskLevel.unclassified)
    domain: Optional[str] = None  # e.g., "healthcare", "finance", "hr"
    potential_harm: Optional[str] = None  # Description of potential harms
    
    # Compliance lifecycle
    compliance_status: ComplianceStatus = Field(default=ComplianceStatus.draft)
    
    # EU AI Act specific fields
    intended_purpose: Optional[str] = None
    data_sources: Optional[str] = None
    oversight_plan: Optional[str] = None
    
    versions: List["ModelVersion"] = Relationship(back_populates="model")


class ModelVersion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    model_id: int = Field(foreign_key="modelregistry.id")
    version_tag: str
    s3_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model: ModelRegistry = Relationship(back_populates="versions")
    metrics: List["EvaluationMetric"] = Relationship(back_populates="version")


class EvaluationMetric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: int = Field(foreign_key="modelversion.id")
    metric_name: str
    value: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    version: ModelVersion = Relationship(back_populates="metrics")


class ComplianceLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    entity_type: str 
    entity_id: str
    action: str
    details: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    timestamp: datetime = Field(default_factory=datetime.utcnow)

