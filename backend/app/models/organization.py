"""
Organization and Environment models for multi-tenancy support.
"""
from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class Environment(str, Enum):
    """Deployment environment for models"""
    dev = "dev"
    test = "test"
    staging = "staging"
    prod = "prod"


class Organization(SQLModel, table=True):
    """
    Organization entity for multi-tenant scoping.
    Models, policies, and users belong to organizations.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
