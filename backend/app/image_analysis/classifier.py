import logging
from typing import List, Tuple, Optional, Dict
from PIL import Image
import torch
from torchvision import transforms

from app.config import settings
from app.schemas import PredictionItem

logger = logging.getLogger("hackmint.classifier")

# 38 Ground-truth classes from linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification config.json
MODEL_CLASSES_38: Dict[int, str] = {
    0: "Apple Scab",
    1: "Apple with Black Rot",
    2: "Cedar Apple Rust",
    3: "Healthy Apple",
    4: "Healthy Blueberry Plant",
    5: "Cherry with Powdery Mildew",
    6: "Healthy Cherry Plant",
    7: "Corn (Maize) with Cercospora and Gray Leaf Spot",
    8: "Corn (Maize) with Common Rust",
    9: "Corn (Maize) with Northern Leaf Blight",
    10: "Healthy Corn (Maize) Plant",
    11: "Grape with Black Rot",
    12: "Grape with Esca (Black Measles)",
    13: "Grape with Isariopsis Leaf Spot",
    14: "Healthy Grape Plant",
    15: "Orange with Citrus Greening",
    16: "Peach with Bacterial Spot",
    17: "Healthy Peach Plant",
    18: "Bell Pepper with Bacterial Spot",
    19: "Healthy Bell Pepper Plant",
    20: "Potato with Early Blight",
    21: "Potato with Late Blight",
    22: "Healthy Potato Plant",
    23: "Healthy Raspberry Plant",
    24: "Healthy Soybean Plant",
    25: "Squash with Powdery Mildew",
    26: "Strawberry with Leaf Scorch",
    27: "Healthy Strawberry Plant",
    28: "Tomato with Bacterial Spot",
    29: "Tomato with Early Blight",
    30: "Tomato with Late Blight",
    31: "Tomato with Leaf Mold",
    32: "Tomato with Septoria Leaf Spot",
    33: "Tomato with Spider Mites or Two-spotted Spider Mite",
    34: "Tomato with Target Spot",
    35: "Tomato Yellow Leaf Curl Virus",
    36: "Tomato Mosaic Virus",
    37: "Healthy Tomato Plant"
}

def parse_class_label(raw_label: str) -> Tuple[str, str, bool]:
    """
    Parses raw MobileNetV2 label into:
    (Crop Name, Condition / Disease Name, is_healthy boolean)
    """
    is_healthy = "healthy" in raw_label.lower()
    
    # Exact mappings for clean decomposition
    if "Apple" in raw_label:
        crop = "Apple"
        if raw_label == "Apple Scab":
            condition = "Apple Scab"
        elif "Black Rot" in raw_label:
            condition = "Black Rot"
        elif "Cedar Apple Rust" in raw_label:
            condition = "Cedar Apple Rust"
        else:
            condition = "Healthy Apple"
    elif "Blueberry" in raw_label:
        crop = "Blueberry"
        condition = "Healthy Blueberry"
    elif "Cherry" in raw_label:
        crop = "Cherry"
        condition = "Powdery Mildew" if not is_healthy else "Healthy Cherry"
    elif "Corn" in raw_label or "Maize" in raw_label:
        crop = "Corn (Maize)"
        if "Cercospora" in raw_label:
            condition = "Cercospora / Gray Leaf Spot"
        elif "Common Rust" in raw_label:
            condition = "Common Rust"
        elif "Northern Leaf Blight" in raw_label:
            condition = "Northern Leaf Blight"
        else:
            condition = "Healthy Corn"
    elif "Grape" in raw_label:
        crop = "Grape"
        if "Black Rot" in raw_label:
            condition = "Black Rot"
        elif "Esca" in raw_label:
            condition = "Esca (Black Measles)"
        elif "Isariopsis" in raw_label:
            condition = "Isariopsis Leaf Spot"
        else:
            condition = "Healthy Grape"
    elif "Orange" in raw_label:
        crop = "Orange (Citrus)"
        condition = "Citrus Greening (Huanglongbing)"
    elif "Peach" in raw_label:
        crop = "Peach"
        condition = "Bacterial Spot" if not is_healthy else "Healthy Peach"
    elif "Bell Pepper" in raw_label:
        crop = "Bell Pepper"
        condition = "Bacterial Spot" if not is_healthy else "Healthy Bell Pepper"
    elif "Potato" in raw_label:
        crop = "Potato"
        if "Early Blight" in raw_label:
            condition = "Early Blight"
        elif "Late Blight" in raw_label:
            condition = "Late Blight"
        else:
            condition = "Healthy Potato"
    elif "Raspberry" in raw_label:
        crop = "Raspberry"
        condition = "Healthy Raspberry"
    elif "Soybean" in raw_label:
        crop = "Soybean"
        condition = "Healthy Soybean"
    elif "Squash" in raw_label:
        crop = "Squash"
        condition = "Powdery Mildew"
    elif "Strawberry" in raw_label:
        crop = "Strawberry"
        condition = "Leaf Scorch" if not is_healthy else "Healthy Strawberry"
    elif "Tomato" in raw_label:
        crop = "Tomato"
        if "Bacterial Spot" in raw_label:
            condition = "Bacterial Spot"
        elif "Early Blight" in raw_label:
            condition = "Early Blight"
        elif "Late Blight" in raw_label:
            condition = "Late Blight"
        elif "Leaf Mold" in raw_label:
            condition = "Leaf Mold"
        elif "Septoria" in raw_label:
            condition = "Septoria Leaf Spot"
        elif "Spider Mites" in raw_label:
            condition = "Two-spotted Spider Mite Damage"
        elif "Target Spot" in raw_label:
            condition = "Target Spot"
        elif "Yellow Leaf Curl" in raw_label:
            condition = "Tomato Yellow Leaf Curl Virus"
        elif "Mosaic Virus" in raw_label:
            condition = "Tomato Mosaic Virus"
        else:
            condition = "Healthy Tomato"
    else:
        crop = "Unknown Crop"
        condition = raw_label

    return crop, condition, is_healthy

class PlantDiseaseClassifier:
    def __init__(self):
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.is_loaded = False
        self.load_error: Optional[str] = None
        
        # Preprocessor configuration according to model's preprocessor_config.json:
        # shortest edge resize=256, center crop=224, mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(settings.IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])

    def load_model(self) -> bool:
        """
        Attempts to load the actual pretrained model.
        Returns True if successful, False otherwise.
        """
        if settings.FORCE_MOCK_MODEL:
            logger.info("FORCE_MOCK_MODEL is set; running in simulated mock mode.")
            self.is_loaded = False
            self.load_error = "Mock mode forced via environment variable HACKMINT_FORCE_MOCK."
            return False

        try:
            from transformers import AutoModelForImageClassification
            logger.info(f"Loading pretrained model: {settings.MODEL_ID} on {self.device}")
            self.model = AutoModelForImageClassification.from_pretrained(settings.MODEL_ID)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            self.load_error = None
            logger.info("Pretrained plant disease model loaded successfully.")
            return True
        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)
            logger.error(f"Failed to load pretrained model: {e}")
            return False

    def predict(self, pil_image: Image.Image, top_k: int = 3) -> Tuple[List[PredictionItem], str, bool]:
        """
        Runs image classification.
        Returns:
            (top_k PredictionItem list, model_source: 'pretrained' | 'mock_fallback', is_mock: bool)
        """
        if not self.is_loaded and not settings.FORCE_MOCK_MODEL:
            # Try lazy load once if not loaded yet
            self.load_model()

        if self.is_loaded and self.model is not None:
            return self._predict_pretrained(pil_image, top_k=top_k)
        else:
            return self._predict_mock(pil_image, top_k=top_k)

    def _predict_pretrained(self, pil_image: Image.Image, top_k: int = 3) -> Tuple[List[PredictionItem], str, bool]:
        """
        Real inference using MobileNetV2 PyTorch weights.
        """
        tensor = self.transform(pil_image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.model(tensor)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)[0]
            top_probs, top_indices = torch.topk(probs, min(top_k, len(probs)))
            
        predictions = []
        for prob_tensor, idx_tensor in zip(top_probs, top_indices):
            idx = idx_tensor.item()
            conf = float(prob_tensor.item())
            raw_label = self.model.config.id2label.get(str(idx), self.model.config.id2label.get(idx, MODEL_CLASSES_38.get(idx, f"Class_{idx}")))
            crop, condition, is_healthy = parse_class_label(raw_label)
            
            clean_label = f"{crop} - {condition}" if condition != crop else crop
            predictions.append(
                PredictionItem(
                    label=clean_label,
                    raw_label=raw_label,
                    crop=crop,
                    condition=condition,
                    is_healthy=is_healthy,
                    confidence=round(conf, 4),
                    confidence_percentage=round(conf * 100.0, 1)
                )
            )
            
        return predictions, "pretrained", False

    def _predict_mock(self, pil_image: Image.Image, top_k: int = 3) -> Tuple[List[PredictionItem], str, bool]:
        """
        Explicitly marked simulated fallback when model cannot be loaded.
        Clearly flagged as is_mock=True, never faked as real inference.
        """
        logger.warning("Executing mock inference fallback. Output is synthetic DEMO DATA.")
        # Baseline plausible demo distribution for Tomato Early Blight scenario
        mock_data = [
            (29, "Tomato with Early Blight", 0.78),
            (30, "Tomato with Late Blight", 0.14),
            (37, "Healthy Tomato Plant", 0.04)
        ]
        predictions = []
        for idx, raw_label, conf in mock_data[:top_k]:
            crop, condition, is_healthy = parse_class_label(raw_label)
            clean_label = f"{crop} - {condition}"
            predictions.append(
                PredictionItem(
                    label=clean_label,
                    raw_label=raw_label,
                    crop=crop,
                    condition=condition,
                    is_healthy=is_healthy,
                    confidence=conf,
                    confidence_percentage=round(conf * 100.0, 1)
                )
            )
        return predictions, "mock_fallback", True

# Global singleton classifier instance
classifier = PlantDiseaseClassifier()
