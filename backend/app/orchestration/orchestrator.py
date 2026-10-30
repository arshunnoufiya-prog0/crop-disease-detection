import logging
from typing import List, Optional, Tuple, Dict, Any

from app.config import settings
from app.schemas import (
    PredictResponse,
    FarmerContext,
    ImageQualityResult,
    OrchestrateRequest,
    OrchestrateResponse,
    EvidenceSynthesis,
    KnowledgeSource,
    KVKContactInfo
)
from app.knowledge_base.retriever import retriever
from app.verification.case_manager import case_manager

logger = logging.getLogger("hackmint.orchestrator")

# Symptom keywords mapping for detecting alignment and conflicts
SYMPTOM_INDICATORS = {
    "early_blight": ["concentric", "rings", "target", "yellow halo", "lower leaves", "brown spots"],
    "late_blight": ["water soaked", "water-soaked", "white mold", "downy", "cottony", "rapid wilting", "blackening", "foul"],
    "powdery_mildew": ["white powder", "powdery", "white dust", "ashy", "talcum"],
    "rust": ["pustules", "powder", "cinnamon", "rusty", "orange dust", "rub off"],
    "bacterial_spot": ["angular", "scab", "scabby", "blister", "water-soaked dots"],
    "leaf_curl": ["curling", "cupped", "crinkled", "stunted", "whitefly"],
    "mosaic": ["mosaic", "mottling", "light and dark", "shoestring", "distorted"],
    "spider_mites": ["webbing", "webs", "stippling", "tiny dots", "bronze", "dusty"],
    "healthy": ["vigorous", "clean", "normal", "healthy", "no spots", "green"]
}

def analyze_symptom_consistency(
    condition_name: str,
    farmer_symptoms: Optional[str]
) -> Tuple[str, Optional[str], List[str], List[str]]:
    """
    Compares farmer symptoms with predicted pathology.
    Returns:
        (consistency_status: 'consistent' | 'conflicting' | 'partial' | 'unspecified',
         conflict_explanation,
         supporting_factors,
         uncertainty_factors)
    """
    if not farmer_symptoms or not farmer_symptoms.strip():
        return "unspecified", None, [], ["No farmer symptom observations were provided to corroborate vision features."]

    symptoms_text = farmer_symptoms.lower()
    cond_lower = condition_name.lower()
    
    supporting = []
    uncertainties = []
    conflict_note = None
    
    # Check key condition profiles
    if "early blight" in cond_lower:
        matched = [w for w in SYMPTOM_INDICATORS["early_blight"] if w in symptoms_text]
        conflicts = [w for w in (SYMPTOM_INDICATORS["powdery_mildew"] + SYMPTOM_INDICATORS["leaf_curl"] + SYMPTOM_INDICATORS["late_blight"]) if w in symptoms_text]
        if matched:
            supporting.append(f"Farmer reported '{', '.join(matched)}', which aligns with diagnostic concentric target rings of Early Blight.")
        if conflicts:
            conflict_note = f"Farmer observed '{', '.join(conflicts)}', which is typically characteristic of powdery mildew, leaf curl, or late blight rather than standard Early Blight."
            uncertainties.append(f"Diagnostic contradiction: Symptoms indicate '{', '.join(conflicts)}' while image features scored highest for Early Blight.")
            return "conflicting", conflict_note, supporting, uncertainties
        if matched:
            return "consistent", None, supporting, uncertainties

    elif "late blight" in cond_lower:
        matched = [w for w in SYMPTOM_INDICATORS["late_blight"] if w in symptoms_text]
        conflicts = [w for w in (SYMPTOM_INDICATORS["powdery_mildew"] + SYMPTOM_INDICATORS["leaf_curl"] + ["concentric rings", "target spot"]) if w in symptoms_text]
        if matched:
            supporting.append(f"Farmer reported '{', '.join(matched)}', strongly consistent with rapid water-soaked lesions or downy sporulation of Late Blight.")
        if conflicts:
            conflict_note = f"Farmer described '{', '.join(conflicts)}', whereas Late Blight characteristically manifests as rapid water-soaked necrosis."
            uncertainties.append(f"Diagnostic contradiction: Symptoms indicate '{', '.join(conflicts)}' while image features scored highest for Late Blight.")
            return "conflicting", conflict_note, supporting, uncertainties
        if matched:
            return "consistent", None, supporting, uncertainties

    elif "powdery mildew" in cond_lower:
        matched = [w for w in SYMPTOM_INDICATORS["powdery_mildew"] if w in symptoms_text]
        conflicts = [w for w in (SYMPTOM_INDICATORS["early_blight"] + SYMPTOM_INDICATORS["late_blight"]) if w in symptoms_text]
        if matched:
            supporting.append(f"Farmer reported powdery white coating ('{', '.join(matched)}'), which matches powdery mildew.")
        if conflicts:
            conflict_note = f"Farmer observed necrotic spots ('{', '.join(conflicts)}'), while the model predicted powdery mildew."
            uncertainties.append(conflict_note)
            return "conflicting", conflict_note, supporting, uncertainties
        if matched:
            return "consistent", None, supporting, uncertainties

    elif "curl" in cond_lower or "virus" in cond_lower:
        matched = [w for w in (SYMPTOM_INDICATORS["leaf_curl"] + SYMPTOM_INDICATORS["mosaic"]) if w in symptoms_text]
        conflicts = [w for w in (SYMPTOM_INDICATORS["powdery_mildew"] + ["concentric", "rings", "scab"]) if w in symptoms_text]
        if matched:
            supporting.append(f"Farmer noted curling, cupping, or mosaic patterns ('{', '.join(matched)}'), consistent with viral infection.")
        if conflicts:
            conflict_note = f"Farmer noted lesions or fungal powdery signs ('{', '.join(conflicts)}') while the vision model scored viral etiology."
            uncertainties.append(conflict_note)
            return "conflicting", conflict_note, supporting, uncertainties
        if matched:
            return "consistent", None, supporting, uncertainties

    elif "healthy" in cond_lower:
        disease_words = ["spots", "rot", "blight", "yellowing", "holes", "wilting", "insects", "dying", "brown"]
        found_disease = [w for w in disease_words if w in symptoms_text]
        if found_disease:
            conflict_note = f"Model classified foliage as Healthy, yet farmer reported evident distress signs: '{', '.join(found_disease)}'."
            uncertainties.append(conflict_note)
            return "conflicting", conflict_note, [], uncertainties
        else:
            supporting.append("Farmer notes align with healthy, non-symptomatic foliage.")
            return "consistent", None, supporting, uncertainties

    # General fallback
    return "partial", None, [f"Farmer provided descriptive notes: '{farmer_symptoms[:60]}...'"], ["Symptom terms require formal field pathological verification."]

class AIOrchestrator:
    def orchestrate(self, request: OrchestrateRequest) -> OrchestrateResponse:
        """
        Coordinates vision evidence, quality gate metrics, farmer symptoms,
        and verified agricultural references into a structured, safe triage.
        """
        pred = request.prediction_result
        f_context = request.farmer_context
        img_q = request.image_quality or (pred.image_quality if pred else None)
        
        # 1. Check for Missing Image or Rejected Image Quality
        if img_q is not None and not img_q.is_acceptable:
            escalation_reason = (
                f"Image failed the quality gate (Variance of Laplacian blur score: {img_q.blur_score} "
                f"vs threshold: {img_q.blur_threshold}). {img_q.message}"
            )
            kvk_info = case_manager.get_verified_kvk_recommendation(f_context.location)
            return OrchestrateResponse(
                status="rejected_image",
                confidence_grade="UNCERTAIN",
                overall_verdict="Image Unusable for Reliable Automated Triage",
                primary_condition=None,
                crop=f_context.selected_crop,
                evidence_synthesis=EvidenceSynthesis(
                    crop_scope_status="unknown",
                    crop_match=False,
                    symptom_consistency="unspecified",
                    conflict_details=None,
                    supporting_factors=[],
                    uncertainty_factors=[
                        f"Image sharpness score is {img_q.blur_score}, below minimum required threshold {img_q.blur_threshold}.",
                        "Blurry photographs prevent reliable edge detection and pathological feature separation."
                    ],
                    retrieved_knowledge=None
                ),
                farmer_explanation=(
                    "The uploaded photograph is too blurry or low-resolution for the computer vision model to inspect "
                    "leaf veins, lesion concentric rings, or fungal fruiting structures. To protect against misleading "
                    "predictions, the system has safely rejected this photograph."
                ),
                cultural_guidance=[
                    "Please re-take the photograph under good indirect natural sunlight.",
                    "Ensure the camera is held 15 to 30 cm away from the affected leaf and tap the screen to lock focus.",
                    "Include both the border of the lesion and some surrounding healthy green leaf tissue for contrast."
                ],
                action_items=[
                    "Capture a sharp, well-lit close-up photograph of an affected leaf.",
                    "Alternatively, take a live leaf sample in a sealed plastic bag to your nearest Krishi Vigyan Kendra (KVK)."
                ],
                expert_escalation_recommended=True,
                escalation_reason=escalation_reason,
                kvk_recommendation=kvk_info
            )

        # 2. Check for Unsupported Crop Selection (e.g. Chili)
        user_crop = f_context.selected_crop.strip() if f_context.selected_crop else None
        if user_crop:
            is_supported_crop = any(
                user_crop.lower() in sc.lower() or sc.lower() in user_crop.lower()
                for sc in settings.SUPPORTED_CROPS
            )
            # Explicit guard against Chili / Hot Pepper
            if "chili" in user_crop.lower() or "chilli" in user_crop.lower() or not is_supported_crop:
                kvk_info = case_manager.get_verified_kvk_recommendation(f_context.location)
                return OrchestrateResponse(
                    status="unsupported_crop",
                    confidence_grade="UNCERTAIN",
                    overall_verdict=f"Crop '{user_crop}' is Outside Verified Model Scope",
                    primary_condition=None,
                    crop=user_crop,
                    evidence_synthesis=EvidenceSynthesis(
                        crop_scope_status="unsupported",
                        crop_match=False,
                        symptom_consistency="unspecified",
                        conflict_details=(
                            f"The pretrained vision model was trained on 14 specific crops and does not include "
                            f"a validated classifier class for '{user_crop}'. We strictly refuse to fabricate a diagnosis."
                        ),
                        supporting_factors=[],
                        uncertainty_factors=[
                            f"'{user_crop}' is not present in the model's 38 verified classes.",
                            "Running inference on unsupported crops causes severe out-of-distribution hallucination."
                        ],
                        retrieved_knowledge=None
                    ),
                    farmer_explanation=(
                        f"HACKMINT's vision classifier currently supports 14 specific crops (such as Tomato, Potato, Bell Pepper, "
                        f"Corn, Apple, Grape, etc.). The crop you selected, '{user_crop}', is outside this certified scope. "
                        f"In accordance with responsible AI safety principles, the system will not guess or invent a prediction."
                    ),
                    cultural_guidance=[
                        f"Consult your district Agricultural Officer or KVK specialist for official '{user_crop}' diagnostic charts.",
                        "Inspect for common sap-sucking pests (thrips, aphids, mites) or wilting under leaf canopies."
                    ],
                    action_items=[
                        f"Submit an expert consultation request to your local Krishi Vigyan Kendra for {user_crop}.",
                        "Call the National Kisan Call Center at 1800-180-1551 (toll-free) to speak directly with an agronomist."
                    ],
                    expert_escalation_recommended=True,
                    escalation_reason=f"Selected crop '{user_crop}' is not within the 14-crop vision model scope.",
                    kvk_recommendation=kvk_info
                )

        # 3. Analyze Image Predictions (if provided)
        if not pred or not pred.top_prediction:
            # No vision evidence
            kvk_info = case_manager.get_verified_kvk_recommendation(f_context.location)
            return OrchestrateResponse(
                status="uncertain_review_recommended",
                confidence_grade="UNCERTAIN",
                overall_verdict="No Visual Evidence Available",
                primary_condition=None,
                crop=user_crop,
                evidence_synthesis=EvidenceSynthesis(
                    crop_scope_status="unknown",
                    crop_match=False,
                    symptom_consistency="unspecified",
                    supporting_factors=[],
                    uncertainty_factors=["No leaf photograph or prediction scores were submitted."],
                    retrieved_knowledge=None
                ),
                farmer_explanation="Please upload a plant photograph so the system can extract visual evidence.",
                cultural_guidance=[],
                action_items=["Upload a plant leaf photograph."],
                expert_escalation_recommended=False,
                kvk_recommendation=kvk_info
            )

        top1 = pred.top_prediction
        top_crop = top1.crop
        top_condition = top1.condition
        top_conf = top1.confidence
        
        # Check crop agreement between user context and top prediction
        crop_match = True
        crop_scope_status = "supported"
        if user_crop:
            if user_crop.lower() not in top_crop.lower() and top_crop.lower() not in user_crop.lower():
                crop_match = False

        # Symptom consistency evaluation
        symptom_status, conflict_note, supporting_syms, uncertain_syms = analyze_symptom_consistency(
            top_condition, f_context.reported_symptoms
        )

        # Retrieve verified agricultural knowledge base entry
        kb_entry = retriever.retrieve(
            crop=top_crop,
            disease_or_condition=top_condition,
            symptoms_query=f_context.reported_symptoms
        )

        # Build evidence lists
        supporting_factors: List[str] = []
        uncertainty_factors: List[str] = []

        if pred.is_mock:
            uncertainty_factors.append("SYSTEM NOTICE: Classifier ran in DEMO / MOCK mode. Scores are synthetic illustration only.")
        else:
            supporting_factors.append(f"Vision model identified visual features of {top1.label} with raw softmax score of {top1.confidence_percentage}%.")

        if crop_match and user_crop:
            supporting_factors.append(f"Farmer-selected crop '{user_crop}' agrees with vision model detection ('{top_crop}').")
        elif not crop_match and user_crop:
            uncertainty_factors.append(
                f"Crop discrepancy: Farmer indicated '{user_crop}', but vision model detected features matching '{top_crop}'."
            )

        supporting_factors.extend(supporting_syms)
        uncertainty_factors.extend(uncertain_syms)

        # Check model confidence thresholds & ambiguity margin
        is_low_confidence = top_conf < settings.CONFIDENCE_MODERATE_THRESHOLD
        is_moderate_confidence = (top_conf >= settings.CONFIDENCE_MODERATE_THRESHOLD) and (top_conf < settings.CONFIDENCE_HIGH_THRESHOLD)
        
        # Check entropy / ambiguity between top 1 and top 2
        is_ambiguous = False
        if len(pred.top_3) >= 2:
            top2 = pred.top_3[1]
            diff = top1.confidence - top2.confidence
            if diff < settings.AMBIGUITY_MARGIN:
                is_ambiguous = True
                uncertainty_factors.append(
                    f"Model ambiguity: Top candidate ({top1.label}: {top1.confidence_percentage}%) is close to runner-up "
                    f"({top2.label}: {top2.confidence_percentage}%). Visual patterns are not distinctly separated."
                )

        if is_low_confidence:
            uncertainty_factors.append(
                f"Model score ({top1.confidence_percentage}%) is below the reliable threshold ({settings.CONFIDENCE_MODERATE_THRESHOLD * 100}%)."
            )

        # Knowledge base status
        if kb_entry is None:
            uncertainty_factors.append(
                f"The local verified knowledge base has no official document matching '{top_crop} - {top_condition}'. "
                "No unverified pesticide or chemical guidance will be fabricated."
            )

        # Determine overall confidence grade & escalation requirement
        escalation_recommended = False
        escalation_reasons_list = []

        if not crop_match and user_crop:
            escalation_recommended = True
            escalation_reasons_list.append(f"Crop selection ({user_crop}) differs from vision output ({top_crop})")

        if symptom_status == "conflicting":
            escalation_recommended = True
            escalation_reasons_list.append(f"Farmer symptoms conflict with vision prediction: {conflict_note}")

        if is_low_confidence:
            escalation_recommended = True
            escalation_reasons_list.append(f"Low vision confidence score ({top1.confidence_percentage}%)")

        if is_ambiguous:
            escalation_recommended = True
            escalation_reasons_list.append(f"Visual ambiguity between top two model predictions")

        if kb_entry is None and not top1.is_healthy:
            escalation_recommended = True
            escalation_reasons_list.append("Lack of verified official agricultural documentation for this condition")

        # Assign confidence grade
        if escalation_recommended or is_low_confidence:
            confidence_grade = "UNCERTAIN" if (is_low_confidence or symptom_status == "conflicting") else "LOW"
            status = "uncertain_review_recommended"
        elif is_moderate_confidence:
            confidence_grade = "MODERATE"
            status = "assessment_ready"
        else:
            confidence_grade = "HIGH"
            status = "assessment_ready"

        # Construct syntheses and recommendations
        verdict = f"Preliminary Indication: {top1.label} ({confidence_grade} Confidence)"
        if top1.is_healthy:
            verdict = f"Healthy Foliage Indicated: {top1.label} ({confidence_grade} Confidence)"

        # Farmer explanation (plain language, cautious, no guaranteed diagnosis claims)
        explanation_parts = []
        if top1.is_healthy:
            explanation_parts.append(
                f"Based on visual pattern analysis, the leaf exhibits normal pigmentation and intact structure consistent "
                f"with a healthy {top_crop} plant."
            )
        else:
            explanation_parts.append(
                f"Visual patterns in the image match key pathological indicators of {top_condition} on {top_crop} "
                f"with a model feature match of {top1.confidence_percentage}%."
            )

        if symptom_status == "consistent" and supporting_syms:
            explanation_parts.append("Your observed symptoms provide valuable corroborating evidence.")
        elif symptom_status == "conflicting":
            explanation_parts.append(
                "Notice: Your described symptoms appear significantly different from what this disease typically looks like. "
                "Because image features and reported symptoms do not match, the diagnosis remains highly uncertain."
            )

        if kb_entry:
            explanation_parts.append(f"Verified agricultural references from {kb_entry.source_organization} were retrieved.")

        farmer_explanation = " ".join(explanation_parts)

        # Cultural guidance (never chemical dosages, strictly official non-chemical cultural practices)
        cultural_guidance = []
        if kb_entry:
            cultural_guidance.extend(kb_entry.cultural_management)
        else:
            cultural_guidance.append("Isolate suspected diseased plants to prevent potential spread to neighboring rows.")
            cultural_guidance.append("Keep foliage dry by watering at the base rather than using overhead sprinklers.")
            cultural_guidance.append("Disinfect pruning tools and shears between plants.")

        # Action items
        action_items = []
        if escalation_recommended:
            action_items.append("Submit this case to the Krishi Vigyan Kendra (KVK) verification queue.")
            action_items.append("Contact the National Kisan Call Center at 1800-180-1551 for free telephonic advice from an agronomist.")
        else:
            action_items.append("Monitor neighboring plants daily for any emerging lesions or discoloration.")
            action_items.append("Follow the cultural management practices listed above to minimize favorable disease conditions.")

        kvk_info = case_manager.get_verified_kvk_recommendation(f_context.location)
        escalation_reason = "; ".join(escalation_reasons_list) if escalation_reasons_list else None

        return OrchestrateResponse(
            status=status,
            confidence_grade=confidence_grade,
            overall_verdict=verdict,
            primary_condition=top1.label,
            crop=top_crop,
            evidence_synthesis=EvidenceSynthesis(
                crop_scope_status=crop_scope_status,
                crop_match=crop_match,
                symptom_consistency=symptom_status,
                conflict_details=conflict_note,
                supporting_factors=supporting_factors,
                uncertainty_factors=uncertainty_factors,
                retrieved_knowledge=kb_entry
            ),
            farmer_explanation=farmer_explanation,
            cultural_guidance=cultural_guidance,
            action_items=action_items,
            expert_escalation_recommended=escalation_recommended,
            escalation_reason=escalation_reason,
            kvk_recommendation=kvk_info
        )

# Global singleton orchestrator
orchestrator = AIOrchestrator()
