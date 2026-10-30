import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
import numpy as np

from app.main import app

client = TestClient(app)

def create_raw_jpeg(blur=False, width=250, height=250):
    if blur:
        img = Image.new("RGB", (width, height), color=(100, 100, 100))
    else:
        arr = np.zeros((height, width, 3), dtype=np.uint8)
        arr[::15, :] = 255
        arr[:, ::15] = 255
        img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert data["supported_crops_count"] == 14

def test_supported_crops_endpoint():
    response = client.get("/supported-crops")
    assert response.status_code == 200
    data = response.json()
    assert data["total_supported_crops"] == 14
    assert data["total_classes"] == 38
    crops = [c["crop"] for c in data["crops"]]
    assert "Tomato" in crops
    assert "Potato" in crops
    assert "Bell Pepper" in crops
    assert "Chili" not in crops

def test_predict_endpoint_with_sharp_image():
    jpeg_bytes = create_raw_jpeg(blur=False)
    files = {"file": ("sharp_leaf.jpg", jpeg_bytes, "image/jpeg")}
    response = client.post("/predict", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["image_quality"]["is_acceptable"] is True
    assert len(data["top_3"]) == 3
    assert data["top_prediction"] is not None

def test_predict_endpoint_with_blurry_image():
    jpeg_bytes = create_raw_jpeg(blur=True)
    files = {"file": ("blurry_leaf.jpg", jpeg_bytes, "image/jpeg")}
    data = {"blur_threshold": "100.0"}
    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "rejected"
    assert res_data["image_quality"]["is_acceptable"] is False
    assert len(res_data["top_3"]) == 0

def test_cases_create_and_list():
    case_payload = {
        "farmer_name": "Ramu Farmer",
        "location": "Kanchipuram, Tamil Nadu",
        "crop": "Tomato",
        "reported_symptoms": "Brown concentric spots on lower leaves",
        "image_quality_summary": "Passed quality check (blur score: 180)",
        "top_prediction": "Tomato - Early Blight",
        "confidence": 0.82,
        "orchestrator_verdict": "Early Blight suspected",
        "escalation_reason": "Farmer requested formal KVK confirmation",
        "notes": "Field area 1.5 acres"
    }
    create_res = client.post("/cases", json=case_payload)
    assert create_res.status_code == 201
    created_case = create_res.json()
    assert "case_id" in created_case
    assert created_case["case_id"].startswith("HM-")
    assert created_case["status"] == "Pending Review"
    
    # List cases
    list_res = client.get("/cases")
    assert list_res.status_code == 200
    cases_list = list_res.json()
    assert len(cases_list) >= 1
    assert any(c["case_id"] == created_case["case_id"] for c in cases_list)
