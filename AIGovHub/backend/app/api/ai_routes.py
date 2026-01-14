"""
AI-powered governance API routes

Provides endpoints for Gemini-based governance assistance.
All endpoints are optional and gracefully degrade if AI is disabled.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.ai_governance import (
    assess_model_risk,
    check_policy_compliance,
    suggest_description_improvements,
    is_ai_enabled,
    get_ai_config
)
from app.core.database import get_session
from sqlmodel import Session, select
from app.models import Policy
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI Governance"])


# Request/Response Models
class RiskAssessmentRequest(BaseModel):
    model_name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    owner: str = Field(..., min_length=1, max_length=200)


class RiskAssessmentResponse(BaseModel):
    suggested_risk: str
    reasoning: str
    eu_criteria: List[str]
    recommendations: List[str]
    ai_generated: bool = True


class ComplianceCheckRequest(BaseModel):
    model_name: str
    description: Optional[str] = ""
    risk_level: str = "unclassified"
    compliance_status: str = "draft"


class ComplianceCheckResponse(BaseModel):
    compliant: bool
    concerns: List[str]
    required_actions: List[str]
    recommendations: List[str]
    ai_generated: bool = True


class DescriptionImprovementRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=2000)


class DescriptionImprovementResponse(BaseModel):
    quality_score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    compliance_gaps: List[str]
    ai_generated: bool = True


class AIConfigResponse(BaseModel):
    enabled: bool
    model: Optional[str]
    cache_ttl: int
    cache_size: int


# Endpoints

@router.get("/ai/config", response_model=AIConfigResponse)
async def get_config():
    """Get current AI configuration (diagnostics)"""
    config = get_ai_config()
    return AIConfigResponse(**config)


@router.post("/ai/assess-risk", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    AI-powered risk assessment for model registration.
    
    Analyzes model details and suggests EU AI Act risk classification.
    Returns 503 if AI features are disabled.
    """
    if not is_ai_enabled():
        raise HTTPException(
            status_code=503,
            detail="AI features are not enabled. Set ENABLE_AI_FEATURES=true and provide GEMINI_API_KEY."
        )
    
    try:
        result = await assess_model_risk(
            model_name=request.model_name,
            description=request.description,
            owner=request.owner
        )
        
        if result is None:
            raise HTTPException(
                status_code=500,
                detail="AI risk assessment failed. Please try again or set risk manually."
            )
        
        return RiskAssessmentResponse(**result)
        
    except Exception as e:
        logger.error(f"Risk assessment error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI assessment failed: {str(e)}"
        )


@router.post("/ai/check-compliance", response_model=ComplianceCheckResponse)
async def check_compliance(
    request: ComplianceCheckRequest,
    session: Session = Depends(get_session)
):
    """
    AI-powered policy compliance check.
    
    Reviews model against active policies and identifies concerns.
    Returns 503 if AI features are disabled.
    """
    if not is_ai_enabled():
        raise HTTPException(
            status_code=503,
            detail="AI features are not enabled."
        )
    
    try:
        # Fetch active policies
        statement = select(Policy).where(Policy.is_active == True)
        policies = session.exec(statement).all()
        
        if not policies:
            return ComplianceCheckResponse(
                compliant=True,
                concerns=[],
                required_actions=[],
                recommendations=["No active policies to check against"],
                ai_generated=False
            )
        
        # Convert policies to dict
        policies_dict = [
            {
                "name": p.name,
                "description": p.description,
                "scope": p.scope,
                "is_active": p.is_active
            }
            for p in policies
        ]
        
        model_data = {
            "name": request.model_name,
            "description": request.description,
            "risk_level": request.risk_level,
            "compliance_status": request.compliance_status
        }
        
        result = await check_policy_compliance(model_data, policies_dict)
        
        if result is None:
            raise HTTPException(
                status_code=500,
                detail="AI compliance check failed. Please review policies manually."
            )
        
        return ComplianceCheckResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Compliance check error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Compliance check failed: {str(e)}"
        )


@router.post("/ai/improve-description", response_model=DescriptionImprovementResponse)
async def improve_description(request: DescriptionImprovementRequest):
    """
    AI-powered description quality analysis.
    
    Suggests improvements for governance documentation quality.
    Returns 503 if AI features are disabled.
    """
    if not is_ai_enabled():
        raise HTTPException(
            status_code=503,
            detail="AI features are not enabled."
        )
    
    try:
        result = await suggest_description_improvements(request.description)
        
        if result is None:
            raise HTTPException(
                status_code=500,
                detail="AI description analysis failed."
            )
        
        return DescriptionImprovementResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Description improvement error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Description analysis failed: {str(e)}"
        )
