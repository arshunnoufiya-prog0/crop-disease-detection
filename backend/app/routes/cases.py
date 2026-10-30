import logging
from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from app.schemas import CaseCreateRequest, CaseResponse
from app.verification.case_manager import case_manager

router = APIRouter(tags=["Expert & KVK Verification"])
logger = logging.getLogger("hackmint.cases_route")

@router.post("/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_escalation_case(case_in: CaseCreateRequest):
    """
    Submits a case to the local prototype expert review queue when
    model uncertainty, conflicting symptoms, or unsupported crops arise.
    """
    try:
        new_case = case_manager.create_case(case_in)
        return new_case
    except Exception as e:
        logger.error(f"Error creating escalation case: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record case in local verification store."
        )

@router.get("/cases", response_model=List[CaseResponse])
async def list_cases(limit: int = Query(50, ge=1, le=100)):
    """
    Retrieves cases stored in the local prototype escalation queue.
    """
    try:
        return case_manager.list_cases(limit=limit)
    except Exception as e:
        logger.error(f"Error listing cases: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch case list from local verification store."
        )

@router.get("/cases/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str):
    """
    Retrieves details of a specific case by its ID.
    """
    case = case_manager.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case ID '{case_id}' was not found in the local verification queue."
        )
    return case

@router.get("/kvk-directory")
async def get_kvk_directory():
    """
    Returns verified Krishi Vigyan Kendra directory and official Indian Government helplines.
    """
    return case_manager.kvk_directory
