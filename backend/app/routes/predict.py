import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional

from app.config import settings
from app.schemas import PredictResponse
from app.image_analysis.quality_gate import assess_image_quality
from app.image_analysis.classifier import classifier

router = APIRouter(tags=["Image Analysis"])
logger = logging.getLogger("hackmint.predict_route")

@router.post("/predict", response_model=PredictResponse)
async def predict_image(
    file: UploadFile = File(..., description="Plant photograph file (JPEG, PNG, WEBP)"),
    blur_threshold: Optional[float] = Form(None, description="Optional custom blur threshold override")
):
    """
    Accepts plant image upload, runs file validation, quality checks (variance of Laplacian blur),
    and feeds acceptable images into the pretrained plant disease classifier.
    """
    # 1. Read file bytes
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    # 2. Quality assessment & image decoding
    try:
        quality_result, pil_image = assess_image_quality(
            file_bytes=content,
            filename=file.filename or "upload.jpg",
            content_type=file.content_type or "image/jpeg",
            blur_threshold=blur_threshold
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Unexpected image processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error during image decoding and quality assessment."
        )

    # 3. Quality Gate check
    if not quality_result.is_acceptable:
        return PredictResponse(
            status="rejected",
            image_quality=quality_result,
            model_source="pretrained" if classifier.is_loaded else "mock_fallback",
            is_mock=False,
            top_prediction=None,
            top_3=[],
            supported_crops_in_model=settings.SUPPORTED_CROPS,
            caveat="Image rejected at the quality gate. Blurry or sub-resolution images cannot produce dependable predictions."
        )

    # 4. Run Pretrained Classifier
    try:
        top_predictions, model_source, is_mock = classifier.predict(pil_image, top_k=3)
        top_pred = top_predictions[0] if top_predictions else None
        
        return PredictResponse(
            status="success",
            image_quality=quality_result,
            model_source=model_source,
            is_mock=is_mock,
            top_prediction=top_pred,
            top_3=top_predictions,
            supported_crops_in_model=settings.SUPPORTED_CROPS,
            caveat="Model scores are preliminary pattern-matching heuristics, not certified pathology probabilities."
        )
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed on the uploaded image: {str(e)}"
        )
