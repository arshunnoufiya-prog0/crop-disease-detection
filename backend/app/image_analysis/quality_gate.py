import io
import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError
from typing import Tuple

from app.config import settings
from app.schemas import ImageQualityResult

def compute_blur_score(cv_image: np.ndarray) -> float:
    """
    Computes the variance of the Laplacian of the image.
    High values generally correlate with sharp edges, whereas low values indicate blurriness.
    This is an initial quality heuristic and should not be treated as an absolute universal measure.
    """
    if len(cv_image.shape) == 3:
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    else:
        gray = cv_image
    
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance = float(laplacian.var())
    return round(variance, 2)

def assess_image_quality(
    file_bytes: bytes,
    filename: str = "upload.jpg",
    content_type: str = "image/jpeg",
    blur_threshold: float = None
) -> Tuple[ImageQualityResult, Image.Image]:
    """
    Validates file format, size, decodability, dimensions, and performs Laplacian blur analysis.
    Returns:
        (ImageQualityResult, PIL.Image object)
    Raises:
        ValueError for invalid/corrupted files
    """
    threshold = blur_threshold if blur_threshold is not None else settings.BLUR_THRESHOLD
    file_size = len(file_bytes)
    
    # 1. Size validation
    if file_size == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")
    
    if file_size > settings.MAX_IMAGE_SIZE_BYTES:
        max_mb = settings.MAX_IMAGE_SIZE_BYTES / (1024 * 1024)
        raise ValueError(
            f"Image file size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed limit of {max_mb:.0f} MB."
        )
    
    # 2. Extension / format validation
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext and ext not in settings.ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file extension '.{ext}'. Supported extensions are: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}."
        )
    
    # 3. Pillow Image decoding & verification
    try:
        pil_image = Image.open(io.BytesIO(file_bytes))
        pil_image.verify()  # Verifies file integrity
        # Re-open because verify() closes the file pointer
        pil_image = Image.open(io.BytesIO(file_bytes))
        # Ensure RGB conversion
        if pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")
    except (UnidentifiedImageError, OSError) as e:
        raise ValueError(f"Corrupted or invalid image file: {str(e)}")
    
    width, height = pil_image.size
    
    # 4. Dimension checks
    if width < settings.MIN_IMAGE_DIMENSION or height < settings.MIN_IMAGE_DIMENSION:
        result = ImageQualityResult(
            is_acceptable=False,
            status="rejected",
            blur_score=0.0,
            blur_threshold=threshold,
            width=width,
            height=height,
            file_size_bytes=file_size,
            mime_type=content_type,
            message="Image resolution is too low.",
            explanation=(
                f"Image dimensions ({width}x{height}px) are below the recommended minimum "
                f"({settings.MIN_IMAGE_DIMENSION}x{settings.MIN_IMAGE_DIMENSION}px). "
                "Foliage details and leaf lesions cannot be accurately analyzed. "
                "Please capture a higher-resolution photograph closer to the leaf."
            )
        )
        return result, pil_image

    # 5. OpenCV conversion and Laplacian blur analysis
    np_arr = np.frombuffer(file_bytes, np.uint8)
    cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if cv_img is None:
        # Fallback decode from PIL numpy array
        cv_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
    blur_score = compute_blur_score(cv_img)
    
    # 6. Evaluation against threshold
    if blur_score < threshold:
        result = ImageQualityResult(
            is_acceptable=False,
            status="rejected",
            blur_score=blur_score,
            blur_threshold=threshold,
            width=width,
            height=height,
            file_size_bytes=file_size,
            mime_type=content_type,
            message="Image is significantly blurred.",
            explanation=(
                f"The image blur score is {blur_score}, which is below the quality threshold of {threshold}. "
                "Blurry inputs obscure critical pathological features like lesion rings, spores, and leaf margins. "
                "Please hold the camera steady, tap the screen to focus on the affected leaf, and re-upload."
            )
        )
    elif blur_score < threshold * 1.3:
        # Borderline quality
        result = ImageQualityResult(
            is_acceptable=True,
            status="warning",
            blur_score=blur_score,
            blur_threshold=threshold,
            width=width,
            height=height,
            file_size_bytes=file_size,
            mime_type=content_type,
            message="Borderline sharpness; minor motion blur detected.",
            explanation=(
                f"Image blur score ({blur_score}) is acceptable but close to threshold ({threshold}). "
                "Predictions may carry higher uncertainty. Inspect visual results with caution."
            )
        )
    else:
        # Good quality
        result = ImageQualityResult(
            is_acceptable=True,
            status="good",
            blur_score=blur_score,
            blur_threshold=threshold,
            width=width,
            height=height,
            file_size_bytes=file_size,
            mime_type=content_type,
            message="Image sharpness is good.",
            explanation=(
                f"Image sharpness score ({blur_score}) exceeds threshold ({threshold}). "
                "Fine details and lesion boundaries are sufficiently sharp for feature extraction."
            )
        )
        
    return result, pil_image
