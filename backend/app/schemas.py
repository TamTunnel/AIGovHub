"""
Pydantic schemas for API request/response validation.
Separates API contracts from database models.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- Model Registry Schemas ---
class ModelCreate(BaseModel):
    """Schema for creating a new model"""
    name: str = Field(..., min_length=1, max_length=255, description="Unique model name")
    description: Optional[str] = Field(None, max_length=2000)
    owner: str = Field(..., min_length=1, max_length=255, description="Team or individual owner")


class ModelRead(BaseModel):
    """Schema for reading model data"""
    id: int
    name: str
    description: Optional[str]
    owner: str
    created_at: datetime

    class Config:
        from_attributes = True


class ModelUpdate(BaseModel):
    """Schema for updating a model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    owner: Optional[str] = Field(None, min_length=1, max_length=255)


# --- Model Version Schemas ---
class VersionCreate(BaseModel):
    """Schema for creating a new version"""
    model_id: int
    version_tag: str = Field(..., min_length=1, max_length=50, pattern=r'^v?\d+\.\d+(\.\d+)?$')
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
