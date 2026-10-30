export interface ImageQualityResult {
  is_acceptable: boolean;
  status: 'good' | 'warning' | 'rejected';
  blur_score: number;
  blur_threshold: number;
  width: number;
  height: number;
  file_size_bytes: number;
  mime_type: string;
  message: string;
  explanation: string;
}

export interface PredictionItem {
  label: string;
  raw_label: string;
  crop: string;
  condition: string;
  is_healthy: boolean;
  confidence: number;
  confidence_percentage: number;
}

export interface PredictResponse {
  status: 'success' | 'rejected' | 'error';
  image_quality: ImageQualityResult;
  model_source: 'pretrained' | 'mock_fallback';
  is_mock: boolean;
  top_prediction: PredictionItem | null;
  top_3: PredictionItem[];
  supported_crops_in_model: string[];
  caveat: string;
}

export interface FarmerContext {
  selected_crop?: string;
  reported_symptoms?: string;
  location?: string;
  growth_stage?: string;
  farming_method?: string;
}

export interface KnowledgeSource {
  id: string;
  crop: string;
  disease: string;
  scientific_name?: string;
  source_organization: string;
  document_title: string;
  verified_symptoms: string[];
  distinguishing_features: string;
  favorable_conditions?: string;
  cultural_management: string[];
  cautious_notes: string;
  source_reference: string;
  source_url?: string;
  last_verified?: string;
}

export interface EvidenceSynthesis {
  crop_scope_status: 'supported' | 'unsupported' | 'unknown';
  crop_match: boolean;
  symptom_consistency: 'consistent' | 'conflicting' | 'partial' | 'unspecified';
  conflict_details?: string | null;
  supporting_factors: string[];
  uncertainty_factors: string[];
  retrieved_knowledge?: KnowledgeSource | null;
}

export interface KVKContactInfo {
  name: string;
  type: string;
  contact_details: string;
  verified: boolean;
  source_url?: string;
  action_note: string;
}

export interface OrchestrateResponse {
  status: 'assessment_ready' | 'uncertain_review_recommended' | 'rejected_image' | 'unsupported_crop';
  confidence_grade: 'HIGH' | 'MODERATE' | 'LOW' | 'UNCERTAIN';
  overall_verdict: string;
  primary_condition?: string | null;
  crop?: string | null;
  evidence_synthesis: EvidenceSynthesis;
  farmer_explanation: string;
  cultural_guidance: string[];
  action_items: string[];
  expert_escalation_recommended: boolean;
  escalation_reason?: string | null;
  kvk_recommendation?: KVKContactInfo | null;
  disclaimer: string;
}

export interface CaseCreateRequest {
  farmer_name?: string;
  location?: string;
  crop?: string;
  reported_symptoms?: string;
  image_quality_summary?: string;
  top_prediction?: string;
  confidence?: number;
  orchestrator_verdict?: string;
  escalation_reason: string;
  notes?: string;
}

export interface CaseResponse {
  case_id: string;
  created_at: string;
  status: string;
  farmer_name?: string;
  location?: string;
  crop?: string;
  reported_symptoms?: string;
  image_quality_summary?: string;
  top_prediction?: string;
  confidence?: number;
  orchestrator_verdict?: string;
  escalation_reason: string;
  notes?: string;
  is_live_expert: boolean;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_source: string;
  model_id: string;
  device: string;
  knowledge_base_entries: number;
  supported_crops_count: number;
  version: string;
}

export interface SupportedCropInfo {
  crop: string;
  conditions: string[];
  has_healthy_class: boolean;
}

export interface SupportedScopeResponse {
  total_supported_crops: number;
  total_classes: number;
  crops: SupportedCropInfo[];
  excluded_crops_notice: string;
  model_id: string;
}
