"""
Basic tests for the AI Governance Hub API.
"""
import pytest
from fastapi.testclient import TestClient


def test_placeholder():
    """Placeholder test - ensures pytest runs successfully."""
    assert True


def test_health_endpoint_structure():
    """Test that health endpoint schema is correctly defined."""
    from app.schemas import HealthStatus
    
    health = HealthStatus(status="ok", database="healthy", version="0.1.0")
    assert health.status == "ok"
    assert health.database == "healthy"
    assert health.version == "0.1.0"


def test_model_create_schema():
    """Test ModelCreate schema validation."""
    from app.schemas import ModelCreate
    
    model = ModelCreate(name="Test Model", owner="Test Team", description="A test model")
    assert model.name == "Test Model"
    assert model.owner == "Test Team"


def test_version_create_schema():
    """Test VersionCreate schema validation."""
    from app.schemas import VersionCreate
    
    version = VersionCreate(model_id=1, version_tag="v1.0.0", s3_path="s3://bucket/model")
    assert version.model_id == 1
    assert version.version_tag == "v1.0.0"
