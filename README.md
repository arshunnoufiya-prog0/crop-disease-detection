# HACKMINT - AI Plant Disease Assistance & Verification System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.4%2B-EE4C2C.svg)](https://pytorch.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-21%20Passed-brightgreen.svg)]()

> **Hackathon Prototype Notice**: HACKMINT is an agricultural decision-support tool, not a certified clinical pathology diagnosis. Predictions are probabilistic heuristics based on vision feature matching. HACKMINT strictly enforces boundary safety: it never invents chemical dosages or citations, rejects blurry images, flags symptom conflicts, and escalates uncertain cases to verified agricultural experts and Krishi Vigyan Kendras (KVK).

---

## 🌾 Project Overview

Farmers frequently face crop damage due to misdiagnosed diseases or delayed agricultural advice. Existing generic vision models often hallucinate confident predictions on out-of-focus photos or unsupported crops, risking crop loss from inappropriate chemical spraying.

**HACKMINT** solves this problem by combining:
1. **Automated Image Quality Gate**: Uses OpenCV Variance of Laplacian to reject blurry, low-resolution images before running inference.
2. **Pretrained MobileNetV2 Vision Classifier**: Inspects leaf features across 38 validated plant condition classes.
3. **Multimodal Evidence Orchestrator**: Cross-checks vision predictions with farmer-reported symptoms (text or speech), flags diagnostic contradictions, and bounds uncertainty.
4. **Verified Agricultural Knowledge Base**: Retrieves non-chemical cultural management guidelines directly from official **ICAR** (IIHR, CPRI, IIMR) and **TNAU Agritech** documents.
5. **Expert & KVK Verification Workflow**: Escalates ambiguous or unsupported cases to local SQLite review queues and provides direct access to the **Kisan Call Center (1800-180-1551)** and official ICAR KVK portals.
6. **Bilingual & Voice Accessibility**: Supports both **English** and **Tamil (தமிழ்)** with browser Web Speech API voice dictation.

---

## 🏛 Architecture & Scope

```
Farmer Inputs (Photo + Crop + Symptoms [Voice/Text])
                      │
                      ▼
       [OpenCV Image Quality Gate]
    (Blur Score < 100? ──► Rejection & Retake Advice)
                      │ (Sharp)
                      ▼
     [MobileNetV2 Vision Classifier]
            (38 Plant Classes)
                      │ Top-3 Scores
                      ▼
     [AI Multimodal Evidence Orchestrator]
       ├── Symptom Corroboration / Conflict Detection
       ├── Crop Boundary Check (e.g. Chili Refusal)
       └── Ambiguity Evaluation (Margin < 0.15)
                      │
                      ▼
    [Verified ICAR / TNAU Knowledge Base]
                      │
                      ▼
    [Structured Farmer Verdict & Action Plan]
       └── Optional Escalation to KVK / Kisan Helpline
```

### 🌿 Model Scope: 14 Supported Crops
Trained on the Hugging Face model `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification` with 38 exact classes:
- **Apple**: Scab, Black Rot, Cedar Apple Rust, Healthy
- **Blueberry**: Healthy
- **Cherry**: Powdery Mildew, Healthy
- **Corn (Maize)**: Cercospora/Gray Leaf Spot, Common Rust, Northern Leaf Blight, Healthy
- **Grape**: Black Rot, Esca (Black Measles), Isariopsis Leaf Spot, Healthy
- **Orange (Citrus)**: Citrus Greening (Huanglongbing)
- **Peach**: Bacterial Spot, Healthy
- **Bell Pepper**: Bacterial Spot, Healthy *(Note: Sweet Bell Pepper only)*
- **Potato**: Early Blight, Late Blight, Healthy
- **Raspberry**: Healthy
- **Soybean**: Healthy
- **Squash**: Powdery Mildew
- **Strawberry**: Leaf Scorch, Healthy
- **Tomato**: Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy

⚠️ **Out-of-Scope Crops**: **Chili / Hot Pepper, Rice, Wheat, Cotton, and Sugarcane** are outside the 14-crop model scope. HACKMINT strictly refuses to guess on these crops and directs the farmer to the nearest KVK.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14 on Windows)
- Node.js 18+ and npm

### 1. Clone & Setup Backend
```powershell
# Navigate to backend
cd backend

# Install dependencies
py -m pip install -r requirements.txt

# Start FastAPI server
py -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend will be available at:
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/health`

### 2. Setup & Start Frontend
```powershell
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be available at: `http://127.0.0.1:5173`

---

## 🧪 Running Automated Tests

Run backend test suite covering Quality Gate, Classifier, Knowledge Retrieval, Orchestrator, and API routes:
```powershell
py -m pytest
```
*Result: 21 passed in 11.78s*

Validate frontend TypeScript and production bundle:
```powershell
cd frontend
npm run build
```
*Result: 1944 modules transformed, 0 errors, production build complete.*

Run live demo scenarios verification:
```powershell
py scripts/verify_scenarios.py
```

---

## 📋 Demonstration Scenarios (Judges' Guide)

The web UI includes a **1-Click Quick Scenarios Bar** allowing judges to test key behaviors in one click:

| Scenario | Input Profile | Expected Safety Guardrail |
|---|---|---|
| **S1: Clear Image & Corroborating Symptoms** | Tomato leaf with concentric rings + farmer reports target rings | Quality Gate passes (blur > 100). Model identifies Early Blight. Symptoms corroborated. Verified ICAR/TNAU guidelines displayed. |
| **S2: Blurry Image Quality Rejection** | Heavily blurred leaf photograph (blur score 0.36) | Quality Gate rejects image (blur < 100). Model inference bypassed to prevent hallucination. System requests steady natural sunlight retake. |
| **S3: Conflicting Evidence** | Image scores Early Blight, but farmer notes white powdery talcum dust | Orchestrator detects diagnostic conflict. Confidence grade set to **UNCERTAIN**. Flags contradiction and advises expert review. |
| **S4: Unsupported Crop (Chili)** | Farmer selects Chili (outside 14-crop scope) | System refuses to guess. Displays strict scope boundary notice and connects farmer to KVK directory. |
| **S5: Healthy Crop Verification** | Clean green foliage, no lesions | Model identifies Healthy class. Orchestrator confirms non-symptomatic state and provides preventive monitoring advice. |
| **S6: Insufficient Evidence & Ambiguity** | Borderline scores or unindexed conditions | System refuses to invent pesticide dosages or chemical recipes; guides farmer to physical KVK clinic. |

---

## 📁 Repository Structure

```
HACKMINT/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint & lifespan
│   │   ├── config.py                   # Configurable blur threshold, model IDs, crops
│   │   ├── schemas.py                  # Pydantic request/response schemas
│   │   ├── image_analysis/
│   │   │   ├── classifier.py           # Pretrained MobileNetV2 (38 classes) & mock fallback
│   │   │   └── quality_gate.py         # OpenCV Laplacian blur assessment & validation
│   │   ├── knowledge_base/
│   │   │   └── retriever.py            # Local ICAR / TNAU agricultural retriever
│   │   ├── orchestration/
│   │   │   └── orchestrator.py         # AI evidence synthesis, conflict & uncertainty rules
│   │   ├── verification/
│   │   │   └── case_manager.py         # SQLite persistence & verified KVK directory
│   │   └── routes/
│   │       ├── health.py               # GET /health
│   │       ├── predict.py              # POST /predict
│   │       ├── orchestrate.py          # POST /orchestrate
│   │       ├── cases.py                # POST/GET /cases, GET /kvk-directory
│   │       └── info.py                 # GET /supported-crops
│   ├── tests/
│   │   ├── test_quality_gate.py        # 5 blur & image validation tests
│   │   ├── test_classifier.py          # 3 label & inference tests
│   │   ├── test_knowledge_base.py      # 3 retrieval & truthfulness tests
│   │   ├── test_orchestrator.py        # 5 scenario & conflict tests
│   │   └── test_api.py                 # 5 end-to-end endpoint tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Brand, tabs, health indicator, language toggle
│   │   │   ├── AssessmentForm.tsx      # Upload, voice recognition, crop selector, presets
│   │   │   ├── QualityGateCard.tsx     # Laplacian blur gauge & resolution metrics
│   │   │   ├── PredictionsCard.tsx     # Top-1 badge, Top-3 score bars, caveat
│   │   │   ├── EvidenceOrchestrationCard.tsx # Synthesis, KB citations, KVK trigger
│   │   │   ├── EscalationModal.tsx     # Structured case logging (HM-XXXX) & helpline
│   │   │   ├── SupportedScopeModal.tsx # 14 crops & explicit exclusions modal
│   │   │   ├── CaseQueueView.tsx       # SQLite case queue list
│   │   │   └── DemoScenariosPanel.tsx  # Documented benchmark scenarios
│   │   ├── services/
│   │   │   ├── api.ts                  # REST API client
│   │   │   └── i18n.ts                 # English & Tamil translations
│   │   ├── types/
│   │   │   └── api.ts                  # TypeScript interfaces
│   │   ├── App.tsx                     # Main layout & pipeline orchestration
│   │   └── index.css                   # Tailwind CSS v4 styling & animations
│   ├── package.json
│   └── vite.config.ts
├── data/
│   ├── knowledge_base/
│   │   └── diseases.json               # Verified ICAR/TNAU disease monographs
│   ├── kvk_directory.json              # Verified KVK directory & Kisan Call Center
│   └── sample_images/                  # Demo sample leaves (sharp, blurry, healthy)
├── docs/
│   ├── architecture.md                 # System architecture & pipeline details
│   └── demo_scenarios.md               # Scenario walkthroughs for judges
├── scripts/
│   ├── generate_sample_assets.py       # Sample leaf generator
│   └── verify_scenarios.py             # Automated scenario test runner
├── pytest.ini
├── .env.example
└── README.md
```

---

## 🛡️ Truthfulness & Responsible AI Guardrails

| Risk | Conventional Naive App | HACKMINT Guardrail |
|---|---|---|
| **Blurry photo input** | Hallucinates high confidence on blurred pixel blobs | OpenCV Laplacian variance checks sharpness; rejects photos < threshold 100.0 |
| **Unsupported crop (Chili)** | Forces prediction into nearest random class | Scope guard refuses inference and connects farmer to KVK agronomists |
| **Conflicting symptoms** | Ignores farmer observations entirely | Orchestrator compares lesion descriptions, detects conflicts, flags UNCERTAIN |
| **Pesticide recommendations** | Fabricates arbitrary chemical doses and schedules | Refuses to generate chemical recipes; provides strictly non-chemical cultural practices |
| **Expert contacts** | Generates fake phone numbers or addresses | Displays verified official Kisan Call Center (1800-180-1551) and official ICAR KVK portal |
| **Network failure** | App crashes or disguises mock as real | Explicit `is_mock: true` flag and visible DEMO DATA banner |

---

## 📊 Features Verified vs Unverified

### ✅ Fully Implemented and Verified
- [x] Pretrained PyTorch MobileNetV2 inference (`linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`).
- [x] All 38 classes accurately mapped across 14 supported crops.
- [x] OpenCV Laplacian blur calculation and configurable thresholding.
- [x] File validation (MIME, size, corrupted headers, dimensions).
- [x] Top-3 prediction extraction with calibrated probability bars.
- [x] Multimodal evidence orchestration with symptom conflict detection.
- [x] Verified ICAR/TNAU knowledge base retrieval.
- [x] SQLite-backed escalation queue with unique case IDs (`HM-XXXX`).
- [x] Verified KVK contacts and Kisan Call Center (1800-180-1551) integration.
- [x] Bilingual English & Tamil (தமிழ்) localization.
- [x] Web Speech API voice symptom dictation with transcript confirmation.
- [x] 1-Click Demo Scenarios panel for hackathon judges.
- [x] 21/21 Pytest tests passed.
- [x] Frontend production bundle built cleanly with Vite.

### ⚠️ Prototype Scope & Unverified Capabilities
- Real-time automated cellular telephone dispatch to live KVK scientists (represented as local SQLite review queue; farmers are prompted to dial the toll-free Kisan Call Center).
- External LLM API key optional enhancement (application operates 100% locally with rule-based evidence synthesis).
- Physical laboratory spectroscopic validation (model scores are heuristic image matches, not molecular assays).

---

## 🎤 2-Minute Presentation Pitch Script for Judges

> *"Respected judges, meet HACKMINT: an AI crop disease assistance system built on a fundamental principle — **do no harm to the farmer's field**.*
>
> *Most plant disease apps suffer from a dangerous flaw: if a farmer uploads a blurry photo or a crop outside the model's training, the app still hallucinates a confident diagnosis and recommends chemical sprays that can destroy the crop.*
>
> *HACKMINT changes that. Our pipeline first runs an **OpenCV Quality Gate** to assess leaf sharpness. If an image is blurred, like in Scenario 2, we refuse to guess and guide the farmer on how to retake a clear photo.*
>
> *When an acceptable photo is uploaded, our pretrained **MobileNetV2 classifier** extracts top-3 predictions. But we don't stop there. Our **Multimodal Evidence Orchestrator** listens to the farmer's symptoms in English or Tamil — even via voice dictation. If the farmer describes white powdery mildew while the vision model scores dark target spots, HACKMINT catches the contradiction, flags high uncertainty, and escalates the case to the nearest **Krishi Vigyan Kendra (KVK)**.*
>
> *We never invent chemical recipes. Instead, we retrieve verified cultural practices from **ICAR** and **TNAU**, and provide direct access to the national **Kisan Call Center at 1800-180-1551**.*
>
> *HACKMINT is lightweight, runs locally without paid API keys, and puts agricultural truthfulness and farmer safety first. Thank you!"*
