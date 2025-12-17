"""
Tests for organization and multi-tenancy features.
"""
import pytest
from app.models.organization import Organization, Environment


def test_organization_model_creation():
    """Test Organization model can be created."""
    org = Organization(
        name="Test Org",
        description="A test organization",
        is_active=True
    )
    assert org.name == "Test Org"
    assert org.description == "A test organization"
    assert org.is_active is True


def test_environment_enum():
    """Test Environment enum values."""
    assert Environment.dev.value == "dev"
    assert Environment.test.value == "test"
    assert Environment.staging.value == "staging"
    assert Environment.prod.value == "prod"


def test_organization_default_values():
    """Test Organization model default values."""
    org = Organization(name="Minimal Org")
    assert org.name == "Minimal Org"
    assert org.description is None
    assert org.is_active is True
