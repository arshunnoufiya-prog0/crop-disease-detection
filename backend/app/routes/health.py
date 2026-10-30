from fastapi import APIRouter
from app.config import settings
from app.schemas import HealthResponse
from app.image_analysis.classifier import classifier
from app.knowledge_base.retriever import retriever

router = APIRouter(tags=["Health & Status"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint reporting model status, knowledge base count,
    and server availability.
    """
    model_source = "pretrained" if classifier.is_loaded else ("mock_fallback" if settings.FORCE_MOCK_MODEL else "unloaded")
    return HealthResponse(
        status="healthy",
        model_loaded=classifier.is_loaded,
        model_source=model_source,
        model_id=settings.MODEL_ID,
        device=str(classifier.device),
        knowledge_base_entries=retriever.get_total_count(),
        supported_crops_count=len(settings.SUPPORTED_CROPS),
        version=settings.VERSION
    )
