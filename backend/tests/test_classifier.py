import pytest
from PIL import Image

from app.image_analysis.classifier import (
    MODEL_CLASSES_38,
    parse_class_label,
    classifier
)
from app.config import settings

def test_all_38_labels_parse_cleanly():
    assert len(MODEL_CLASSES_38) == 38
    for idx, raw_label in MODEL_CLASSES_38.items():
        crop, condition, is_healthy = parse_class_label(raw_label)
        assert crop != "", f"Crop should not be empty for {raw_label}"
        assert condition != "", f"Condition should not be empty for {raw_label}"
        if "healthy" in raw_label.lower():
            assert is_healthy is True
        else:
            assert is_healthy is False

def test_chili_is_not_in_supported_scope():
    """Confirms Chili is NOT in the 38 classes (Bell Pepper is)."""
    crops = {parse_class_label(lbl)[0].lower() for lbl in MODEL_CLASSES_38.values()}
    assert "chili" not in crops
    assert "chilli" not in crops
    assert "bell pepper" in crops

def test_classifier_top3_output():
    # Create a synthetic green leaf image for inference
    test_img = Image.new("RGB", (250, 250), color=(50, 150, 60))
    top3, model_source, is_mock = classifier.predict(test_img, top_k=3)
    
    assert len(top3) == 3
    assert model_source in ("pretrained", "mock_fallback")
    
    # Check top predictions order by confidence descending
    assert top3[0].confidence >= top3[1].confidence >= top3[2].confidence
    for item in top3:
        assert item.confidence >= 0.0
        assert item.confidence <= 1.0
        assert item.confidence_percentage >= 0.0
        assert item.crop in settings.SUPPORTED_CROPS
