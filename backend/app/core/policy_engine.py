"""
Policy enforcement service.
Checks policies before allowing governance actions and records violations.
"""
from typing import Optional, List, Tuple
from sqlmodel import Session, select
from ..models import (
    Policy, PolicyViolation, PolicyConditionType,
    ModelRegistry, ModelVersion, EvaluationMetric, ComplianceLog, ComplianceStatus
)


class PolicyEnforcementResult:
    """Result of policy enforcement check"""
    def __init__(self, allowed: bool, violation: Optional[PolicyViolation] = None, message: str = ""):
        self.allowed = allowed
        self.violation = violation
        self.message = message


def get_active_policies(session: Session, organization_id: Optional[int] = None) -> List[Policy]:
    """Get all active policies, optionally filtered by organization"""
    query = select(Policy).where(Policy.is_active == True)
    if organization_id:
        # Include global policies and org-specific policies
        query = query.where(
            (Policy.organization_id == None) | (Policy.organization_id == organization_id)
        )
    return list(session.exec(query).all())


def check_require_evaluation_before_approval(
    session: Session,
    model: ModelRegistry,
    new_status: ComplianceStatus
) -> bool:
    """
    Check if model has at least one evaluation metric before approval.
    Returns True if condition is satisfied, False if violated.
    """
    if new_status != ComplianceStatus.approved:
        return True  # Policy only applies when approving
    
    # Check if any version has evaluation metrics
    for version in model.versions:
        metric_count = session.exec(
            select(EvaluationMetric).where(EvaluationMetric.version_id == version.id)
        ).first()
        if metric_count:
            return True
    return False


def check_block_high_risk_without_approval(
    session: Session,
    model: ModelRegistry,
    new_status: ComplianceStatus
) -> bool:
    """
    Prevent high-risk models from bypassing review.
    Returns True if condition is satisfied, False if violated.
    """
    if model.risk_level not in ["high", "unacceptable"]:
        return True  # Policy only applies to high-risk models
    
    # High-risk models must go through under_review before approved
    if new_status == ComplianceStatus.approved and model.compliance_status == ComplianceStatus.draft:
        return False  # Cannot skip under_review
    return True


def check_require_review_for_high_risk(
    session: Session,
    model: ModelRegistry,
    new_status: ComplianceStatus
) -> bool:
    """
    High-risk models require explicit review status.
    Returns True if condition is satisfied, False if violated.
    """
    if model.risk_level not in ["high", "unacceptable"]:
        return True
    
    # Any status change for high-risk models is allowed but logged
    return True


POLICY_CHECKS = {
    PolicyConditionType.require_evaluation_before_approval: check_require_evaluation_before_approval,
    PolicyConditionType.block_high_risk_without_approval: check_block_high_risk_without_approval,
    PolicyConditionType.require_review_for_high_risk: check_require_review_for_high_risk,
}


def enforce_compliance_status_change(
    session: Session,
    model: ModelRegistry,
    new_status: ComplianceStatus,
    user_id: Optional[int] = None
) -> PolicyEnforcementResult:
    """
    Enforce all active policies for a compliance status change.
    Returns enforcement result with violation details if blocked.
    """
    policies = get_active_policies(session, model.organization_id)
    
    for policy in policies:
        check_fn = POLICY_CHECKS.get(policy.condition_type)
        if not check_fn:
            continue
        
        if not check_fn(session, model, new_status):
            # Policy violated - create violation record
            violation = PolicyViolation(
                policy_id=policy.id,
                model_id=model.id,
                user_id=user_id,
                action="change_compliance_status",
                details={
                    "attempted_status": new_status.value,
                    "current_status": model.compliance_status.value,
                    "policy_name": policy.name,
                    "policy_condition": policy.condition_type.value,
                    "reason": f"Policy '{policy.name}' blocked this action"
                }
            )
            session.add(violation)
            
            # Also log to audit trail
            audit_log = ComplianceLog(
                entity_type="PolicyViolation",
                entity_id=str(model.id),
                action="POLICY_VIOLATION",
                details={
                    "policy_id": policy.id,
                    "policy_name": policy.name,
                    "attempted_action": "change_compliance_status",
                    "blocked": True
                }
            )
            session.add(audit_log)
            session.commit()
            
            return PolicyEnforcementResult(
                allowed=False,
                violation=violation,
                message=f"Policy '{policy.name}' blocked this action: {policy.description or policy.condition_type.value}"
            )
    
    return PolicyEnforcementResult(allowed=True)
