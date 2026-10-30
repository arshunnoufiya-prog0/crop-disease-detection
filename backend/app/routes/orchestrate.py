import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas import OrchestrateRequest, OrchestrateResponse
from app.orchestration.orchestrator import orchestrator

router = APIRouter(tags=["AI Evidence Orchestration"])
logger = logging.getLogger("hackmint.orchestrate_route")

@router.post("/orchestrate", response_model=OrchestrateResponse)
async def orchestrate_evidence(request: OrchestrateRequest):
    """
    Accepts image-analysis evidence, farmer-provided symptoms, and context.
    Evaluates evidence sufficiency, detects conflicts and ambiguity, queries verified
    agricultural knowledge bases, and provides structured recommendations and escalation guidance.
    """
    try:
        response = orchestrator.orchestrate(request)
        return response
    except Exception as e:
        logger.error(f"Error during evidence orchestration: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Orchestration engine encountered an error: {str(e)}"
        )
