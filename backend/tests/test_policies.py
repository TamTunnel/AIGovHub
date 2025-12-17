"""
Tests for policy engine and enforcement.
"""
import pytest
from app.models.policy import Policy, PolicyViolation, PolicyScope, PolicyConditionType
from app.schemas import ComplianceStatusUpdate


def test_policy_model_creation():
    """Test Policy model can be created with required fields."""
    policy = Policy(
        name="Test Policy",
        description="A test policy for enforcement",
        scope=PolicyScope.global_,
        condition_type=PolicyConditionType.require_evaluation_before_approval,
        is_active=True
    )
    assert policy.name == "Test Policy"
    assert policy.scope == PolicyScope.global_
    assert policy.condition_type == PolicyConditionType.require_evaluation_before_approval
    assert policy.is_active is True


def test_policy_violation_model_creation():
    """Test PolicyViolation model can be created."""
    violation = PolicyViolation(
        policy_id=1,
        model_id=1,
        user_id=1,
        action="change_compliance_status",
        details={"reason": "Test violation"}
    )
    assert violation.policy_id == 1
    assert violation.action == "change_compliance_status"
    assert violation.details["reason"] == "Test violation"


def test_policy_scope_enum():
    """Test PolicyScope enum values."""
    assert PolicyScope.global_.value == "global"
    assert PolicyScope.organization.value == "organization"
    assert PolicyScope.environment.value == "environment"


def test_policy_condition_type_enum():
    """Test PolicyConditionType enum values."""
    assert PolicyConditionType.require_evaluation_before_approval.value == "require_evaluation_before_approval"
    assert PolicyConditionType.block_high_risk_without_approval.value == "block_high_risk_without_approval"
    assert PolicyConditionType.require_review_for_high_risk.value == "require_review_for_high_risk"
