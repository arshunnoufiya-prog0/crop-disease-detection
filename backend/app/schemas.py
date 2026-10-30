from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ImageQualityResult(BaseModel):
    is_acceptable: bool = Field(..., description="Whether the image passed all validation and blur checks")
    status: str = Field(..., description="'good', 'warning', or 'rejected'")
    blur_score: float = Field(..., description="OpenCV Variance of Laplacian blur measure")
    blur_threshold: float = Field(..., description="Configured blur threshold cutoff")
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")
    file_size_bytes: int = Field(..., description="Image file size in bytes")
    mime_type: str = Field(..., description="Detected image MIME type")
    message: str = Field(..., description="Concise assessment summary")
    explanation: str = Field(..., description="Detailed explanation of quality check and recommendation")

class PredictionItem(BaseModel):
    label: str = Field(..., description="Cleaned, human-readable plant and condition name")
    raw_label: str = Field(..., description="Original model class label")
    crop: str = Field(..., description="Extracted crop name")
    condition: str = Field(..., description="Extracted disease or healthy condition")
    is_healthy: bool = Field(..., description="True if condition is Healthy")
    confidence: float = Field(..., description="Model softmax score (0.0 to 1.0)")
    confidence_percentage: float = Field(..., description="Percentage format (0.0% to 100.0%)")

class PredictResponse(BaseModel):
    status: str = Field(..., description="'success', 'rejected', or 'error'")
    image_quality: ImageQualityResult
    model_source: str = Field(..., description="'pretrained' or 'mock_fallback'")
    is_mock: bool = Field(..., description="Flag explicitly declaring if mock prediction was used")
    top_prediction: Optional[PredictionItem] = None
    top_3: List[PredictionItem] = []
    supported_crops_in_model: List[str] = []
    caveat: str = Field(
        default="Model scores represent heuristic vision feature matches, not certified clinical plant pathology probabilities."
    )

class FarmerContext(BaseModel):
    selected_crop: Optional[str] = Field(None, description="Crop name chosen by the farmer, if known")
    reported_symptoms: Optional[str] = Field(None, description="Visible signs and symptoms in the farmer's words")
    location: Optional[str] = Field(None, description="District/State or agro-climatic region (optional)")
    growth_stage: Optional[str] = Field(None, description="Seedling, Vegetative, Flowering, or Fruiting")
    farming_method: Optional[str] = Field(None, description="Open field, polyhouse, or greenhouse")

class KnowledgeSource(BaseModel):
    id: str
    crop: str
    disease: str
    scientific_name: Optional[str] = None
    source_organization: str
    document_title: str
    verified_symptoms: List[str]
    distinguishing_features: str
    favorable_conditions: Optional[str] = None
    cultural_management: List[str]
    cautious_notes: str
    source_reference: str
    source_url: Optional[str] = None
    last_verified: Optional[str] = None

class EvidenceSynthesis(BaseModel):
    crop_scope_status: str = Field(..., description="'supported', 'unsupported', or 'unspecified'")
    crop_match: bool = Field(..., description="Whether user crop matches model prediction crop")
    symptom_consistency: str = Field(..., description="'consistent', 'conflicting', 'partial', or 'unspecified'")
    conflict_details: Optional[str] = None
    supporting_factors: List[str] = []
    uncertainty_factors: List[str] = []
    retrieved_knowledge: Optional[KnowledgeSource] = None

class OrchestrateRequest(BaseModel):
    prediction_result: Optional[PredictResponse] = None
    farmer_context: FarmerContext = Field(default_factory=FarmerContext)
    image_quality: Optional[ImageQualityResult] = None

class KVKContactInfo(BaseModel):
    name: str
    type: str
    contact_details: str
    verified: bool
    source_url: Optional[str] = None
    action_note: str

class OrchestrateResponse(BaseModel):
    status: str = Field(..., description="'assessment_ready', 'uncertain_review_recommended', 'rejected_image', or 'unsupported_crop'")
    confidence_grade: str = Field(..., description="'HIGH', 'MODERATE', 'LOW', or 'UNCERTAIN'")
    overall_verdict: str
    primary_condition: Optional[str] = None
    crop: Optional[str] = None
    evidence_synthesis: EvidenceSynthesis
    farmer_explanation: str
    cultural_guidance: List[str] = []
    action_items: List[str] = []
    expert_escalation_recommended: bool = False
    escalation_reason: Optional[str] = None
    kvk_recommendation: Optional[KVKContactInfo] = None
    disclaimer: str = (
        "Preliminary triage assistance only. Not a certified agricultural diagnostic. "
        "Do not apply scheduled chemicals without local KVK or agricultural extension confirmation."
    )

class CaseCreateRequest(BaseModel):
    farmer_name: Optional[str] = "Anonymous Farmer"
    location: Optional[str] = None
    crop: Optional[str] = None
    reported_symptoms: Optional[str] = None
    image_quality_summary: Optional[str] = None
    top_prediction: Optional[str] = None
    confidence: Optional[float] = None
    orchestrator_verdict: Optional[str] = None
    escalation_reason: str
    notes: Optional[str] = None

class CaseResponse(BaseModel):
    case_id: str
    created_at: str
    status: str
    farmer_name: Optional[str]
    location: Optional[str]
    crop: Optional[str]
    reported_symptoms: Optional[str]
    image_quality_summary: Optional[str]
    top_prediction: Optional[str]
    confidence: Optional[float]
    orchestrator_verdict: Optional[str]
    escalation_reason: str
    notes: Optional[str]
    is_live_expert: bool = False

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_source: str
    model_id: str
    device: str
    knowledge_base_entries: int
    supported_crops_count: int
    version: str

class SupportedCropInfo(BaseModel):
    crop: str
    conditions: List[str]
    has_healthy_class: bool

class SupportedScopeResponse(BaseModel):
    total_supported_crops: int
    total_classes: int
    crops: List[SupportedCropInfo]
    excluded_crops_notice: str
    model_id: str
