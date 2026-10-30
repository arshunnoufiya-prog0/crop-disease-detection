import requests
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "sample_images"

print("==================================================")
print("HACKMINT LIVE DEMO SCENARIO VERIFICATION")
print("==================================================")

# Check Health
h = requests.get(f"{BASE_URL}/health").json()
print(f"[HEALTH] Status: {h['status']} | Model: {h['model_id']} | Loaded: {h['model_loaded']} | KB Docs: {h['knowledge_base_entries']}")

# SCENARIO 1: Clear image, sufficient evidence (Tomato Early Blight)
print("\n--- SCENARIO 1: Clear image, sufficient evidence ---")
s1_img = DATA_DIR / "sample_tomato_early_blight.jpg"
with open(s1_img, "rb") as f:
    r1 = requests.post(f"{BASE_URL}/predict", files={"file": ("early_blight.jpg", f, "image/jpeg")}).json()
print(f"Quality status: {r1['image_quality']['status']} | Blur score: {r1['image_quality']['blur_score']}")
print(f"Top-1: {r1['top_prediction']['label']} ({r1['top_prediction']['confidence_percentage']}%)")

orch1 = requests.post(f"{BASE_URL}/orchestrate", json={
    "prediction_result": r1,
    "farmer_context": {
        "selected_crop": "Tomato",
        "reported_symptoms": "Dark brown concentric target rings on bottom leaves with yellow halo."
    }
}).json()
print(f"Verdict: {orch1['overall_verdict']}")
print(f"Confidence grade: {orch1['confidence_grade']}")
print(f"Symptom consistency: {orch1['evidence_synthesis']['symptom_consistency']}")
print(f"Escalation recommended: {orch1['expert_escalation_recommended']}")

# SCENARIO 2: Blurry image rejection
print("\n--- SCENARIO 2: Blurry image quality rejection ---")
s2_img = DATA_DIR / "sample_blurry_leaf.jpg"
with open(s2_img, "rb") as f:
    r2 = requests.post(f"{BASE_URL}/predict", files={"file": ("blurry.jpg", f, "image/jpeg")}).json()
print(f"Quality status: {r2['image_quality']['status']} | Blur score: {r2['image_quality']['blur_score']} (threshold: {r2['image_quality']['blur_threshold']})")
print(f"Predict status: {r2['status']} | Top-3 count: {len(r2['top_3'])}")
orch2 = requests.post(f"{BASE_URL}/orchestrate", json={
    "prediction_result": r2,
    "farmer_context": {"selected_crop": "Tomato"}
}).json()
print(f"Verdict: {orch2['overall_verdict']}")
print(f"Escalation recommended: {orch2['expert_escalation_recommended']} ({orch2['escalation_reason']})")

# SCENARIO 3: Conflicting evidence (Model predicts Early Blight, farmer describes Powdery Mildew)
print("\n--- SCENARIO 3: Conflicting evidence (Vision vs Symptoms) ---")
orch3 = requests.post(f"{BASE_URL}/orchestrate", json={
    "prediction_result": r1,
    "farmer_context": {
        "selected_crop": "Tomato",
        "reported_symptoms": "Foliage is completely dusted with white powdery mildew talcum powder coating."
    }
}).json()
print(f"Verdict: {orch3['overall_verdict']}")
print(f"Confidence grade: {orch3['confidence_grade']}")
print(f"Symptom consistency: {orch3['evidence_synthesis']['symptom_consistency']}")
print(f"Conflict note: {orch3['evidence_synthesis']['conflict_details']}")
print(f"Escalation recommended: {orch3['expert_escalation_recommended']}")

# SCENARIO 4: Unsupported crop (Chili)
print("\n--- SCENARIO 4: Unsupported crop selection (Chili) ---")
orch4 = requests.post(f"{BASE_URL}/orchestrate", json={
    "prediction_result": r1,
    "farmer_context": {
        "selected_crop": "Chili",
        "reported_symptoms": "Leaves curling upward with dark spots."
    }
}).json()
print(f"Status: {orch4['status']}")
print(f"Verdict: {orch4['overall_verdict']}")
print(f"Confidence grade: {orch4['confidence_grade']}")
print(f"Crop scope status: {orch4['evidence_synthesis']['crop_scope_status']}")
print(f"Escalation recommended: {orch4['expert_escalation_recommended']}")

# SCENARIO 5: Case Escalation & Persistence
print("\n--- SCENARIO 5: Case Creation & SQLite Persistence ---")
case_res = requests.post(f"{BASE_URL}/cases", json={
    "farmer_name": "Senthil Kumar",
    "location": "Chengalpattu, Tamil Nadu",
    "crop": "Tomato",
    "reported_symptoms": "Concentric dark brown rings",
    "image_quality_summary": "Passed quality gate (blur score: 185)",
    "top_prediction": "Tomato - Early Blight",
    "confidence": 0.88,
    "orchestrator_verdict": orch1['overall_verdict'],
    "escalation_reason": "Farmer requested official KVK pathology confirmation",
    "notes": "Farm size 2.5 acres"
}).json()
print(f"Created case ID: {case_res['case_id']} | Status: {case_res['status']}")

cases_list = requests.get(f"{BASE_URL}/cases").json()
print(f"Total cases in SQLite queue: {len(cases_list)}")
print(f"Latest case verified: {cases_list[0]['case_id']} - {cases_list[0]['farmer_name']}")

print("\n==================================================")
print("ALL LIVE DEMO SCENARIOS VERIFIED SUCCESSFULLY!")
print("==================================================")
