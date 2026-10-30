import io
import pytest
import numpy as np
from PIL import Image

from app.image_analysis.quality_gate import assess_image_quality, compute_blur_score

def create_test_image(width=300, height=300, blur=False) -> bytes:
    """Helper creating a test image with high-contrast sharp edges or blurred noise."""
    if blur:
        # Uniform solid color generates near-zero Laplacian variance (blur score 0.0)
        img = Image.new("RGB", (width, height), color=(128, 128, 128))
    else:
        # High contrast checkerboard with sharp edges generates high Laplacian variance
        arr = np.zeros((height, width, 3), dtype=np.uint8)
        arr[::20, :] = 255
        arr[:, ::20] = 255
        img = Image.fromarray(arr)
        
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

def test_sharp_image_passes_quality_gate():
    sharp_bytes = create_test_image(blur=False)
    result, pil_img = assess_image_quality(sharp_bytes, filename="leaf.jpg", blur_threshold=100.0)
    
    assert result.is_acceptable is True
    assert result.status == "good"
    assert result.blur_score > 100.0
    assert result.width == 300
    assert result.height == 300

def test_blurry_image_rejected_by_quality_gate():
    blurry_bytes = create_test_image(blur=True)
    result, pil_img = assess_image_quality(blurry_bytes, filename="blurry.jpg", blur_threshold=100.0)
    
    assert result.is_acceptable is False
    assert result.status == "rejected"
    assert result.blur_score < 100.0
    assert "blurred" in result.message.lower()
    assert "quality threshold" in result.explanation.lower()

def test_undersized_image_rejected():
    small_bytes = create_test_image(width=100, height=100, blur=False)
    result, pil_img = assess_image_quality(small_bytes, filename="tiny.jpg")
    
    assert result.is_acceptable is False
    assert result.status == "rejected"
    assert "dimensions" in result.explanation.lower()

def test_corrupt_file_raises_value_error():
    corrupt_bytes = b"not a real image header"
    with pytest.raises(ValueError, match="Corrupted or invalid image"):
        assess_image_quality(corrupt_bytes, filename="bad.jpg")

def test_unsupported_file_extension_raises_error():
    sharp_bytes = create_test_image()
    with pytest.raises(ValueError, match="Unsupported file extension"):
        assess_image_quality(sharp_bytes, filename="document.pdf")
