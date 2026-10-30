# HACKMINT System Architecture

## 1. High-Level Overview
HACKMINT is an AI-powered agricultural triage and plant disease assistance system designed for farmers, agronomists, and Krishi Vigyan Kendra (KVK) extension specialists.

It operates on a strict **Safety-First & Truthfulness Principle**:
- Never claims an automated prediction is a guaranteed or clinical diagnosis.
- Never hallucinates pesticide dosages, chemical schedules, or synthetic expert contacts.
- Safely rejects unusable, out-of-focus, or blurry photographs before running heavy vision models.
- Explicitly declares model boundaries (e.g. Chili is outside the 14-crop scope).
- Escalates ambiguous or conflicting cases to verified official institutions (KVK / Kisan Call Center: 1800-180-1551).

---

## 2. Component Pipeline Architecture

```
                                Farmer Inputs
                [Plant Leaf Photo]  [Crop Selection]  [Visible Symptoms (Text / Voice)]
                           │                  │                    │
                           ▼                  │                    │
          ┌────────────────────────────────┐  │                    │
          │    Image Quality Gate (OpenCV) │  │                    │
          │  - File Size & Format Check    │  │                    │
          │  - Dimension Check (>=150px)   │  │                    │
          │  - Laplacian Blur Variance     │  │                    │
          └────────────────┬───────────────┘  │                    │
                           │                  │                    │
                 [Sharpness >= 100?]          │                    │
                /                  \          │                    │
            NO /                    \ YES     │                    │
              ▼                      ▼        │                    │
      ┌───────────────┐     ┌───────────────────────┐              │
      │ Rejection &   │     │ Pretrained Classifier │              │
      │ Retake Advice │     │ MobileNetV2 (38 Cls)  │              │
      └───────┬───────┘     └───────────┬───────────┘              │
              │                         │                          │
              │                   Top-3 Predictions                │
              │                   & Confidence Scores              │
              │                         │                          │
              └──────────────┬──────────┘                          │
                             ▼                                     │
          ┌────────────────────────────────────────────────────────┴───┐
          │                    AI Evidence Orchestrator                │
          │  - Evaluates Model Confidence & Ambiguity Margin           │
          │  - Cross-references Selected Crop vs Predicted Crop       │
          │  - Compares Visual Lesion Patterns vs Farmer Symptoms      │
          │  - Flags Diagnostic Contradictions                         │
          │  - Enforces 14-Crop Scope Boundaries (e.g. Chili Guard)    │
          └──────────────────────────┬─────────────────────────────────┘
                                     │
                     Retrieves Verified Knowledge
                                     │
                                     ▼
          ┌────────────────────────────────────────────────────────────┐
          │             Trusted Agricultural Knowledge Base            │
          │  - ICAR (IIHR, CPRI, IIMR, CITH, NRCG)                     │
          │  - Tamil Nadu Agricultural University (TNAU) Agritech      │
          │  - Non-chemical Cultural Management & Sanitation           │
          └──────────────────────────┬─────────────────────────────────┘
                                     │
                                     ▼
          ┌────────────────────────────────────────────────────────────┐
          │                Structured Farmer Response & Triage         │
          │  - Preliminary Indication & Confidence Grade               │
          │  - Plain-Language Farmer Explanation                       │
          │  - Supporting Factors vs Uncertainties                     │
          │  - Cultural Field Management (Strictly Non-chemical)       │
          │  - Verified KVK Contact / Kisan Call Center (1800-180-1551)│
          │  - SQLite Expert Case Queue Persistence (HM-XXXX)          │
          └────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules

### A. Image Quality Gate (`backend/app/image_analysis/quality_gate.py`)
- **Blur Assessment**: Computes `cv2.Laplacian(gray, cv2.CV_64F).var()`.
- **Configurable Cutoff**: Default threshold 100.0 (customizable via `BLUR_THRESHOLD`).
- **Validation**:
  - Image MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/bmp`
  - Max file size: 10 MB
  - Minimum dimensions: 150x150 px
  - Corrupt byte detection via Pillow `verify()`.

### B. Pretrained Vision Classifier (`backend/app/image_analysis/classifier.py`)
- **Pretrained Weights**: `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification` from Hugging Face Hub.
- **Classes**: Exactly 38 verified ground-truth classes from PlantVillage.
- **Preprocessing**: Center-cropped to 224x224, normalized with mean `[0.5, 0.5, 0.5]` and std `[0.5, 0.5, 0.5]` according to `preprocessor_config.json`.
- **Mock Fallback**: If offline or download is disabled via `HACKMINT_FORCE_MOCK`, system executes a clearly marked `is_mock: true` fallback without ever faking mock data as genuine model inference.

### C. Multimodal Evidence Orchestrator (`backend/app/orchestration/orchestrator.py`)
- Synthesizes image evidence, farmer symptoms, crop selection, and agricultural literature.
- **Symptom Consistency Matrix**:
  - Compares user symptom descriptions with visual pathology signatures (e.g., Early Blight target concentric rings vs Late Blight water-soaked lesions vs Powdery Mildew talcum coating).
  - Flags conflicts when symptoms contradict vision output.
- **Ambiguity Margin**: If top candidate and runner-up have a probability difference `< 0.15`, classifies prediction as ambiguous and flags for expert review.
- **Supported Scope Guard**: Prevents out-of-distribution inference on unsupported crops (such as Chili, Rice, Wheat, Cotton, Sugarcane) and issues direct KVK escalation guidance.

### D. Agricultural Knowledge Base (`backend/app/knowledge_base/retriever.py`)
- Indexes verified documents curated from ICAR-IIHR, ICAR-CPRI, ICAR-IIMR, and TNAU Agritech Portal.
- Strict refusal to invent chemical dosages, brand names, or unverified pesticide mixtures.
- Supplies official cultural, preventive, and sanitation practices.

### E. Verification & Local Case Queue (`backend/app/verification/case_manager.py`)
- SQLite-backed escalation store (`hackmint.db`).
- Generates structured case IDs (e.g. `HM-B18A7F2D`).
- Displays verified regional KVK locations (Tamil Nadu, Maharashtra, Karnataka, Himachal Pradesh) and the official Indian Government Kisan Call Center toll-free helpline (**1800-180-1551**).

---

## 4. Frontend Design System
- Built with React 19, TypeScript, and Vite.
- Styled with modern Tailwind CSS v4 featuring an agriculture-focused palette (emerald/green accents, clean slate cards, and legible typography).
- Responsive on mobile, tablet, and desktop.
- Dual-language support: English and Tamil (தமிழ்).
- Optional voice symptoms input powered by browser Web Speech API with real-time text transcription and farmer confirmation before submission.
