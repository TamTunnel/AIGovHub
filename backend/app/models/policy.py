"""
Policy Engine models for governance rule enforcement.
Defines Policy and PolicyViolation entities.
"""
from typing import Optional
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column


class PolicyScope(str, Enum):
    """Scope of policy application"""
    global_ = "global"  # Applies to all models
    organization = "organization"  # Applies within an organization
    environment = "environment"  # Applies to specific environment


class PolicyConditionType(str, Enum):
    """Types of policy conditions that can be enforced"""
    require_evaluation_before_approval = "require_evaluation_before_approval"
    block_high_risk_without_approval = "block_high_risk_without_approval"
    require_review_for_high_risk = "require_review_for_high_risk"


class Policy(SQLModel, table=True):
    """
    Governance policy definition.
    Policies define rules that are enforced during model lifecycle operations.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    scope: PolicyScope = Field(default=PolicyScope.global_)
    condition_type: PolicyConditionType
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    # Optional organization scope (for organization-scoped policies)
    organization_id: Optional[int] = None
    
    violations: list["PolicyViolation"] = Relationship(back_populates="policy")


class PolicyViolation(SQLModel, table=True):
    """
    Record of a policy violation attempt.
    Created when an action is blocked due to policy enforcement.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    policy_id: int = Field(foreign_key="policy.id")
    model_id: Optional[int] = Field(default=None, foreign_key="modelregistry.id")
    model_version_id: Optional[int] = Field(default=None, foreign_key="modelversion.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    action: str  # e.g., "approve_model", "change_status", "deploy_model"
    details: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    policy: Policy = Relationship(back_populates="violations")
