"""
Policy API routes.
CRUD operations for governance policies and policy violations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from ..core.database import get_session
from ..models import Policy, PolicyViolation, PolicyScope, PolicyConditionType


router = APIRouter(prefix="/policies", tags=["Policies"])


# --- Schemas ---
class PolicyCreate(BaseModel):
    """Schema for creating a policy"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    scope: PolicyScope = PolicyScope.global_
    condition_type: PolicyConditionType
    is_active: bool = True
    organization_id: Optional[int] = None


class PolicyRead(BaseModel):
    """Schema for reading a policy"""
    id: int
    name: str
    description: Optional[str]
    scope: PolicyScope
    condition_type: PolicyConditionType
    is_active: bool
    organization_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PolicyUpdate(BaseModel):
    """Schema for updating a policy"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    is_active: Optional[bool] = None


class PolicyViolationRead(BaseModel):
    """Schema for reading a policy violation"""
    id: int
    policy_id: int
    model_id: Optional[int]
    model_version_id: Optional[int]
    user_id: Optional[int]
    action: str
    details: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Policy CRUD ---
@router.post("/", response_model=PolicyRead)
def create_policy(payload: PolicyCreate, session: Session = Depends(get_session)):
    """Create a new governance policy (admin only)"""
    # Check for duplicate name
    existing = session.exec(select(Policy).where(Policy.name == payload.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Policy with this name already exists")
    
    policy = Policy(**payload.model_dump())
    session.add(policy)
    session.commit()
    session.refresh(policy)
    return policy


@router.get("/", response_model=List[PolicyRead])
def list_policies(
    session: Session = Depends(get_session),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    scope: Optional[PolicyScope] = Query(None, description="Filter by scope")
):
    """List all policies with optional filters"""
    query = select(Policy)
    if is_active is not None:
        query = query.where(Policy.is_active == is_active)
    if scope:
        query = query.where(Policy.scope == scope)
    return session.exec(query.order_by(Policy.created_at.desc())).all()


@router.get("/{policy_id}", response_model=PolicyRead)
def get_policy(policy_id: int, session: Session = Depends(get_session)):
    """Get a specific policy by ID"""
    policy = session.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.patch("/{policy_id}", response_model=PolicyRead)
def update_policy(
    policy_id: int,
    payload: PolicyUpdate,
    session: Session = Depends(get_session)
):
    """Update a policy (admin only)"""
    policy = session.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(policy, key, value)
    policy.updated_at = datetime.utcnow()
    
    session.add(policy)
    session.commit()
    session.refresh(policy)
    return policy


@router.delete("/{policy_id}")
def delete_policy(policy_id: int, session: Session = Depends(get_session)):
    """Delete a policy (admin only) - soft delete by deactivating"""
    policy = session.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    policy.is_active = False
    policy.updated_at = datetime.utcnow()
    session.add(policy)
    session.commit()
    return {"message": "Policy deactivated"}


# --- Policy Violations ---
@router.get("/violations/", response_model=List[PolicyViolationRead])
def list_policy_violations(
    session: Session = Depends(get_session),
    model_id: Optional[int] = Query(None, description="Filter by model"),
    policy_id: Optional[int] = Query(None, description="Filter by policy"),
    limit: int = Query(100, le=500)
):
    """List policy violations with optional filters"""
    query = select(PolicyViolation)
    if model_id:
        query = query.where(PolicyViolation.model_id == model_id)
    if policy_id:
        query = query.where(PolicyViolation.policy_id == policy_id)
    return session.exec(
        query.order_by(PolicyViolation.created_at.desc()).limit(limit)
    ).all()
