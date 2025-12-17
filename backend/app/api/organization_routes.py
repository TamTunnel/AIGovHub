"""
Organization API routes.
CRUD operations for organizations.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from ..core.database import get_session
from ..models import Organization


router = APIRouter(prefix="/organizations", tags=["Organizations"])


# --- Schemas ---
class OrganizationCreate(BaseModel):
    """Schema for creating an organization"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)


class OrganizationRead(BaseModel):
    """Schema for reading an organization"""
    id: int
    name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    is_active: Optional[bool] = None


# --- Organization CRUD ---
@router.post("/", response_model=OrganizationRead)
def create_organization(payload: OrganizationCreate, session: Session = Depends(get_session)):
    """Create a new organization (admin only)"""
    existing = session.exec(select(Organization).where(Organization.name == payload.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization with this name already exists")
    
    org = Organization(**payload.model_dump())
    session.add(org)
    session.commit()
    session.refresh(org)
    return org


@router.get("/", response_model=List[OrganizationRead])
def list_organizations(session: Session = Depends(get_session)):
    """List all organizations"""
    return session.exec(select(Organization).order_by(Organization.name)).all()


@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(org_id: int, session: Session = Depends(get_session)):
    """Get a specific organization by ID"""
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.patch("/{org_id}", response_model=OrganizationRead)
def update_organization(
    org_id: int,
    payload: OrganizationUpdate,
    session: Session = Depends(get_session)
):
    """Update an organization (admin only)"""
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)
    
    session.add(org)
    session.commit()
    session.refresh(org)
    return org
