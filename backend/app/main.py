import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.image_analysis.classifier import classifier
from app.knowledge_base.retriever import retriever
from app.verification.case_manager import case_manager
from app.routes import health, predict, orchestrate, cases, info

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("hackmint.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for startup and shutdown.
    Loads the pretrained model on startup for responsive API calls.
    """
    logger.info("Starting HACKMINT Agricultural AI Assistance Engine...")
    logger.info(f"Loaded {retriever.get_total_count()} verified agricultural reference documents.")
    
    # Preload the MobileNetV2 model
    loaded = classifier.load_model()
    if loaded:
        logger.info(f"Pretrained model {settings.MODEL_ID} ready for inference.")
    else:
        logger.warning(f"Pretrained model could not be loaded: {classifier.load_error}. Running with marked mock fallback.")

    yield

    logger.info("Shutting down HACKMINT service.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Vite frontend development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(orchestrate.router)
app.include_router(cases.router)
app.include_router(info.router)

@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": "/health",
        "status": "operational"
    }
