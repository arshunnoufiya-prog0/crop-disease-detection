# HACKMINT Demonstration Scenarios

This guide details the six benchmark scenarios designed for hackathon judges, agronomists, and technical reviewers.

Each scenario can be executed either via the **1-Click Quick Scenarios bar** in the web UI (`http://127.0.0.1:5173`) or programmatically via `py scripts/verify_scenarios.py`.

---

## SCENARIO 1: Clear Image with Corroborating Symptoms
- **Goal**: Demonstrate end-to-end success when visual features and farmer symptoms agree.
- **Inputs**:
  - Image: Sharp leaf photo (`data/sample_images/sample_tomato_early_blight.jpg`)
  - Crop: `Tomato`
  - Symptoms: *"Dark brown spots with concentric target rings on bottom leaves with yellow halo."*
  - Location: *Kanchipuram, Tamil Nadu*
- **Observed Behavior**:
  - Image Quality Gate: **Good** (Laplacian blur score > 100).
  - Pretrained Model: Identifies *Tomato - Early Blight* with top-3 confidence breakdown.
  - Evidence Orchestrator: Detects symptom corroboration (*"Consistent with Visuals"*).
  - Knowledge Base: Retrieves official ICAR-IIHR / TNAU Agritech guidelines for Alternaria solani.
  - Output: Structured explanation, non-chemical sanitation tips, and routine monitoring advice.

---

## SCENARIO 2: Blurry Photograph Rejected by Quality Gate
- **Goal**: Demonstrate how HACKMINT protects farmers from misleading predictions caused by motion blur or out-of-focus camera capture.
- **Inputs**:
  - Image: Blurred leaf photo (`data/sample_images/sample_blurry_leaf.jpg`)
  - Crop: `Tomato`
- **Observed Behavior**:
  - Image Quality Gate: **Rejected** (Laplacian variance: 0.36 < threshold 100.0).
  - Pretrained Model: Vision inference is safely bypassed.
  - Evidence Orchestrator: Status is set to `rejected_image`.
  - Output: Explains that fine lesion rings and spore bodies cannot be resolved from blurred inputs; prompts farmer to re-take photo under steady natural lighting.

---

## SCENARIO 3: Conflicting Evidence (Vision vs Symptoms)
- **Goal**: Demonstrate safety handling when computer vision features disagree with farmer observations.
- **Inputs**:
  - Image: Tomato leaf photograph
  - Crop: `Tomato`
  - Symptoms: *"Upper leaf surfaces covered with thick white powdery mildew talcum dust."*
- **Observed Behavior**:
  - Pretrained Model: Vision model scores highest for Early Blight (necrotic spots).
  - Evidence Orchestrator: Identifies diagnostic conflict (*"Symptoms describe white powdery mildew, whereas Early Blight produces concentric brown rings"*).
  - Confidence Grade: Automatically downgraded to **UNCERTAIN**.
  - Escalation: Triggers recommendation to escalate to Krishi Vigyan Kendra (KVK).

---

## SCENARIO 4: Unsupported Crop Selection (Chili)
- **Goal**: Demonstrate strict boundary guardrails when an unsupported crop is submitted.
- **Inputs**:
  - Crop: `Chili / Hot Pepper`
  - Symptoms: *"Leaf curl and black spots on chili plant."*
- **Observed Behavior**:
  - System recognizes that Chili is **outside the 14 verified crops** of the MobileNetV2 model.
  - Refusal: Strictly refuses to hallucinate or guess a diagnosis on out-of-distribution inputs.
  - Status: `unsupported_crop` (High Uncertainty).
  - Guidance: Displays verified KVK directory and the toll-free Kisan Call Center (**1800-180-1551**) for official chili diagnostic charts.

---

## SCENARIO 5: Model Unavailable / Demo Fallback Mode
- **Goal**: Demonstrate application resilience and transparent mock tagging when external connectivity or GPU/model loading fails.
- **Setup**: Set `HACKMINT_FORCE_MOCK=true` or start backend in offline sandbox.
- **Observed Behavior**:
  - UI displays an amber badge: `DEMO / MOCK DATA`.
  - API explicitly returns `is_mock: true` and `model_source: "mock_fallback"`.
  - Never masquerades synthetic data as real model output.
  - System structure, knowledge retrieval, and case queue remain 100% operational.

---

## SCENARIO 6: Insufficient Agricultural Evidence & Ambiguity
- **Goal**: Demonstrate safe truthfulness when agricultural knowledge base lacks certified guidance.
- **Inputs**:
  - Crop: `Raspberry`
  - Symptoms: *"Vague yellow discoloration."*
- **Observed Behavior**:
  - Vision model score reflects ambiguity between close runner-up classes.
  - Knowledge Base: Acknowledges that no certified ICAR document exists in local database for this specific condition.
  - Refusal: Refuses to fabricate chemical spray dosages or pesticide schedules.
  - Recommends physical leaf inspection by a district plant pathologist.
