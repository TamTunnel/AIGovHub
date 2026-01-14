"""
AI Governance Service using Google Gemini

Provides intelligent governance assistance including:
- Automated risk assessment
- Policy compliance checking
- Documentation quality suggestions
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Check if AI features are enabled
AI_ENABLED = os.getenv("ENABLE_AI_FEATURES", "false").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")  # Latest Flash model by default

# Simple in-memory cache (in production, use Redis)
_cache: Dict[str, tuple[Any, datetime]] = {}
CACHE_TTL_SECONDS = int(os.getenv("AI_CACHE_TTL_SECONDS", "3600"))

# Only import if AI is enabled and key is available
if AI_ENABLED and GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info(f"AI features enabled with model: {GEMINI_MODEL}")
    except ImportError:
        logger.warning("google-generativeai not installed. AI features disabled.")
        AI_ENABLED = False
else:
    logger.info("AI features disabled (ENABLE_AI_FEATURES=false or no API key)")


def _get_cached(key: str) -> Optional[Any]:
    """Get cached result if not expired"""
    if key in _cache:
        result, expiry = _cache[key]
        if datetime.now() < expiry:
            return result
        else:
            del _cache[key]
    return None


def _set_cache(key: str, value: Any) -> None:
    """Cache result with TTL"""
    _cache[key] = (value, datetime.now() + timedelta(seconds=CACHE_TTL_SECONDS))


async def assess_model_risk(
    model_name: str,
    description: str,
    owner: str
) -> Optional[Dict[str, Any]]:
    """
    Analyze model details and suggest appropriate EU AI Act risk classification.
    
    Returns None if AI is disabled or fails, allowing graceful degradation.
    """
    if not AI_ENABLED:
        return None
    
    # Create cache key
    cache_key = f"risk:{model_name}:{description[:50]}"
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        prompt = f"""Analyze this AI model and suggest an EU AI Act risk classification.

Model Name: {model_name}
Description: {description}
Owner: {owner}

EU AI Act Risk Levels:
- unacceptable: Prohibited systems (social scoring, subliminal manipulation, real-time biometric surveillance)
- high: Critical infrastructure, law enforcement, employment/education decisions, essential services
- limited: Chatbots, emotion recognition, biometric categorization (transparency required)
- minimal: Spam filters, recommendation systems, content moderation

Analyze based on:
1. Domain and use case
2. Decision-making authority
3. Potential impact on individuals
4. Safety-critical nature

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
  "suggested_risk": "high|limited|minimal|unacceptable",
  "reasoning": "Brief explanation why this classification applies",
  "eu_criteria": ["Relevant EU AI Act articles or considerations"],
  "recommendations": ["Specific actions to take for compliance"]
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3,  # Lower temperature for consistent results
                max_output_tokens=500,
            )
        )
        
        # Parse JSON from response
        text = response.text.strip()
        # Remove markdown code blocks if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        
        # Validate result structure
        required_keys = ["suggested_risk", "reasoning", "eu_criteria", "recommendations"]
        if not all(k in result for k in required_keys):
            logger.error(f"Invalid AI response structure: {result}")
            return None
        
        # Validate risk level
        valid_risks = ["high", "limited", "minimal", "unacceptable"]
        if result["suggested_risk"] not in valid_risks:
            logger.error(f"Invalid risk level: {result['suggested_risk']}")
            return None
        
        # Cache and return
        _set_cache(cache_key, result)
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        return None
    except Exception as e:
        logger.error(f"AI risk assessment failed: {e}")
        return None


async def check_policy_compliance(
    model_data: Dict[str, Any],
    policies: list[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Review model against active policies and identify potential compliance issues.
    
    Returns None if AI is disabled or fails.
    """
    if not AI_ENABLED or not policies:
        return None
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Summarize policies for prompt
        policy_summary = "\n".join([
            f"- {p['name']}: {p.get('description', 'No description')} (Scope: {p['scope']}, Active: {p['is_active']})"
            for p in policies
        ])
        
        prompt = f"""Review this AI model against governance policies and identify compliance concerns.

Model Details:
- Name: {model_data.get('name')}
- Description: {model_data.get('description', 'Not provided')}
- Risk Level: {model_data.get('risk_level', 'Unclassified')}
- Status: {model_data.get('compliance_status', 'Draft')}

Active Governance Policies:
{policy_summary}

Analyze:
1. Does this model violate any active policies?
2. What compliance actions are required?
3. What safeguards should be implemented?

Return ONLY valid JSON (no markdown):
{{
  "compliant": true|false,
  "concerns": ["List of specific concerns or violations"],
  "required_actions": ["Actions required for compliance"],
  "recommendations": ["Suggested safeguards or improvements"]
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                max_output_tokens=600,
            )
        )
        
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        
        # Validate structure
        required_keys = ["compliant", "concerns", "required_actions", "recommendations"]
        if not all(k in result for k in required_keys):
            logger.error(f"Invalid compliance check response: {result}")
            return None
        
        return result
        
    except Exception as e:
        logger.error(f"AI compliance check failed: {e}")
        return None


async def suggest_description_improvements(
    description: str
) -> Optional[Dict[str, Any]]:
    """
    Analyze model description and suggest improvements for governance quality.
    
    Returns None if AI is disabled or fails.
    """
    if not AI_ENABLED or not description:
        return None
    
    cache_key = f"desc:{description[:100]}"
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        prompt = f"""Analyze this AI model description for governance documentation quality.

Description: {description}

Evaluate:
1. Completeness (use case, domain, capabilities)
2. Clarity and specificity
3. Compliance-relevant information
4. Missing critical details

Rate quality 1-10 and suggest improvements.

Return ONLY valid JSON (no markdown):
{{
  "quality_score": 1-10,
  "strengths": ["What's good about this description"],
  "weaknesses": ["What's missing or unclear"],
  "suggestions": ["Specific improvements to make"],
  "compliance_gaps": ["Governance information that should be added"]
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.4,
                max_output_tokens=500,
            )
        )
        
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        
        # Validate and cache
        if "quality_score" in result and "suggestions" in result:
            _set_cache(cache_key, result)
            return result
        
        return None
        
    except Exception as e:
        logger.error(f"AI description analysis failed: {e}")
        return None


def is_ai_enabled() -> bool:
    """Check if AI features are available"""
    return AI_ENABLED and GEMINI_API_KEY is not None


def get_ai_config() -> Dict[str, Any]:
    """Get current AI configuration (for diagnostics)"""
    return {
        "enabled": is_ai_enabled(),
        "model": GEMINI_MODEL if is_ai_enabled() else None,
        "cache_ttl": CACHE_TTL_SECONDS,
        "cache_size": len(_cache)
    }
