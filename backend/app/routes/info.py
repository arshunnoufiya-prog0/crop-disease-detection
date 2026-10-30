from fastapi import APIRouter
from typing import Dict, List
from collections import defaultdict

from app.config import settings
from app.schemas import SupportedScopeResponse, SupportedCropInfo
from app.image_analysis.classifier import MODEL_CLASSES_38, parse_class_label

router = APIRouter(tags=["Model Scope & Capabilities"])

@router.get("/supported-crops", response_model=SupportedScopeResponse)
async def get_supported_scope():
    """
    Returns the exact verified crops and diseases supported by the pretrained model.
    Helps the UI and farmers avoid unsupported crops (such as chili, rice, or cotton).
    """
    crop_conditions: Dict[str, List[str]] = defaultdict(list)
    crop_healthy: Dict[str, bool] = defaultdict(bool)

    for idx, raw_label in MODEL_CLASSES_38.items():
        crop, condition, is_healthy = parse_class_label(raw_label)
        if condition not in crop_conditions[crop]:
            crop_conditions[crop].append(condition)
        if is_healthy:
            crop_healthy[crop] = True

    crops_list = [
        SupportedCropInfo(
            crop=crop_name,
            conditions=conditions,
            has_healthy_class=crop_healthy[crop_name]
        )
        for crop_name, conditions in sorted(crop_conditions.items())
    ]

    return SupportedScopeResponse(
        total_supported_crops=len(crops_list),
        total_classes=len(MODEL_CLASSES_38),
        crops=crops_list,
        excluded_crops_notice=settings.EXCLUDED_CROPS_NOTE,
        model_id=settings.MODEL_ID
    )
