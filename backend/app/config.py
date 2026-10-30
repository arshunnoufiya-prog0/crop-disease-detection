import os
from pathlib import Path
from typing import List, Set

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
KNOWLEDGE_BASE_PATH = DATA_DIR / "knowledge_base" / "diseases.json"
KVK_DIRECTORY_PATH = DATA_DIR / "kvk_directory.json"
DB_PATH = BASE_DIR / "hackmint.db"

class Settings:
    PROJECT_NAME: str = "HACKMINT - AI Plant Disease Assistance"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-powered crop disease assistance with quality gate, pretrained vision classifier, and evidence orchestration."
    
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    KNOWLEDGE_BASE_PATH: Path = KNOWLEDGE_BASE_PATH
    KVK_DIRECTORY_PATH: Path = KVK_DIRECTORY_PATH
    DB_PATH: Path = DB_PATH
    
    # Pretrained model configuration
    MODEL_ID: str = os.getenv("HACKMINT_MODEL_ID", "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification")
    IMAGE_SIZE: int = 224
    
    # Image Quality Gate parameters
    BLUR_THRESHOLD: float = float(os.getenv("HACKMINT_BLUR_THRESHOLD", "100.0"))
    MIN_IMAGE_DIMENSION: int = 150
    MAX_IMAGE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: Set[str] = {"jpg", "jpeg", "png", "webp", "bmp"}
    ALLOWED_MIME_TYPES: Set[str] = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp"
    }
    
    # Orchestrator uncertainty and confidence thresholds
    # Prototype thresholds: configured for hackathon evaluation
    CONFIDENCE_HIGH_THRESHOLD: float = 0.70
    CONFIDENCE_MODERATE_THRESHOLD: float = 0.40
    AMBIGUITY_MARGIN: float = 0.15  # if top1 - top2 < 0.15, consider ambiguous
    
    # Model scope: 14 crops supported by linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification
    SUPPORTED_CROPS: List[str] = [
        "Apple",
        "Blueberry",
        "Cherry",
        "Corn (Maize)",
        "Grape",
        "Orange (Citrus)",
        "Peach",
        "Bell Pepper",  # Note: specifically sweet bell pepper, NOT chili
        "Potato",
        "Raspberry",
        "Soybean",
        "Squash",
        "Strawberry",
        "Tomato"
    ]
    
    EXCLUDED_CROPS_NOTE: str = (
        "Chili / Hot Pepper, Rice, Wheat, Cotton, and Sugarcane are outside the "
        "current 14-crop model scope. Escalation to KVK / agricultural extension is recommended."
    )
    
    # Environment toggle for demo / offline fallback
    FORCE_MOCK_MODEL: bool = os.getenv("HACKMINT_FORCE_MOCK", "false").lower() in ("true", "1", "yes")

settings = Settings()
