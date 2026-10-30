import pytest
from app.orchestration.orchestrator import orchestrator
from app.schemas import (
    OrchestrateRequest,
    PredictResponse,
    PredictionItem,
    FarmerContext,
    ImageQualityResult
)

def build_mock_prediction(crop="Tomato", condition="Early Blight", confidence=0.88, is_healthy=False):
    item = PredictionItem(
        label=f"{crop} - {condition}",
        raw_label=f"{crop} with {condition}",
        crop=crop,
        condition=condition,
        is_healthy=is_healthy,
        confidence=confidence,
        confidence_percentage=round(confidence * 100, 1)
    )
    img_q = ImageQualityResult(
        is_acceptable=True,
        status="good",
        blur_score=150.0,
        blur_threshold=100.0,
        width=400,
        height=400,
        file_size_bytes=50000,
        mime_type="image/jpeg",
        message="Sharp",
        explanation="Sharp image"
    )
    return PredictResponse(
        status="success",
        image_quality=img_q,
        model_source="pretrained",
        is_mock=False,
        top_prediction=item,
        top_3=[item],
        supported_crops_in_model=["Tomato", "Potato"],
        caveat="Test caveat"
    )

def test_scenario1_clear_image_sufficient_evidence():
    pred = build_mock_prediction(crop="Tomato", condition="Early Blight", confidence=0.85)
    f_ctx = FarmerContext(
        selected_crop="Tomato",
        reported_symptoms="Dark spots with concentric target rings on bottom leaves with yellow halo."
    )
    req = OrchestrateRequest(prediction_result=pred, farmer_context=f_ctx)
    res = orchestrator.orchestrate(req)
    
    assert res.status == "assessment_ready"
    assert res.confidence_grade in ("HIGH", "MODERATE")
    assert res.evidence_synthesis.symptom_consistency == "consistent"
    assert res.evidence_synthesis.crop_match is True
    assert res.evidence_synthesis.retrieved_knowledge is not None
    assert "Early Blight" in res.overall_verdict

def test_scenario2_blurry_image_rejection():
    img_q = ImageQualityResult(
        is_acceptable=False,
        status="rejected",
        blur_score=35.0,
        blur_threshold=100.0,
        width=300,
        height=300,
        file_size_bytes=20000,
        mime_type="image/jpeg",
        message="Image is blurred",
        explanation="Blurry input"
    )
    req = OrchestrateRequest(image_quality=img_q, farmer_context=FarmerContext(selected_crop="Tomato"))
    res = orchestrator.orchestrate(req)
    
    assert res.status == "rejected_image"
    assert res.confidence_grade == "UNCERTAIN"
    assert res.expert_escalation_recommended is True
    assert "blurry" in res.farmer_explanation.lower() or "blur" in res.farmer_explanation.lower()

def test_scenario3_conflicting_evidence():
    pred = build_mock_prediction(crop="Tomato", condition="Early Blight", confidence=0.75)
    # Farmer reports powdery white coating, which contradicts Early Blight's concentric brown rings
    f_ctx = FarmerContext(
        selected_crop="Tomato",
        reported_symptoms="Thick white powdery coating over all the upper leaf surfaces like talcum powder."
    )
    req = OrchestrateRequest(prediction_result=pred, farmer_context=f_ctx)
    res = orchestrator.orchestrate(req)
    
    assert res.status == "uncertain_review_recommended"
    assert res.confidence_grade == "UNCERTAIN"
    assert res.evidence_synthesis.symptom_consistency == "conflicting"
    assert res.expert_escalation_recommended is True
    assert res.evidence_synthesis.conflict_details is not None

def test_scenario4_unsupported_crop_chili():
    f_ctx = FarmerContext(
        selected_crop="Chili",
        reported_symptoms="Leaves curling upward with black spots."
    )
    pred = build_mock_prediction(crop="Tomato", condition="Early Blight", confidence=0.80)
    req = OrchestrateRequest(prediction_result=pred, farmer_context=f_ctx)
    res = orchestrator.orchestrate(req)
    
    assert res.status == "unsupported_crop"
    assert res.confidence_grade == "UNCERTAIN"
    assert res.expert_escalation_recommended is True
    assert "Outside Verified Model Scope" in res.overall_verdict
    assert res.evidence_synthesis.crop_scope_status == "unsupported"

def test_scenario5_missing_symptoms_handled_safely():
    pred = build_mock_prediction(crop="Tomato", condition="Early Blight", confidence=0.82)
    f_ctx = FarmerContext(selected_crop="Tomato", reported_symptoms="")
    req = OrchestrateRequest(prediction_result=pred, farmer_context=f_ctx)
    res = orchestrator.orchestrate(req)
    
    assert res.status == "assessment_ready"
    assert res.evidence_synthesis.symptom_consistency == "unspecified"
