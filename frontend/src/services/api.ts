import {
  HealthResponse,
  SupportedScopeResponse,
  PredictResponse,
  OrchestrateResponse,
  FarmerContext,
  ImageQualityResult,
  CaseCreateRequest,
  CaseResponse
} from '../types/api';

const API_BASE = '/api';

export async function checkBackendHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchSupportedScope(): Promise<SupportedScopeResponse> {
  const res = await fetch(`${API_BASE}/supported-crops`);
  if (!res.ok) {
    throw new Error(`Failed to load supported crop scope`);
  }
  return res.json();
}

export async function uploadAndPredict(
  file: File,
  blurThreshold?: number
): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (blurThreshold !== undefined) {
    formData.append('blur_threshold', blurThreshold.toString());
  }

  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction failed with status ${res.status}`);
  }

  return res.json();
}

export async function runOrchestration(
  predictionResult: PredictResponse | null,
  farmerContext: FarmerContext,
  imageQuality?: ImageQualityResult
): Promise<OrchestrateResponse> {
  const res = await fetch(`${API_BASE}/orchestrate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prediction_result: predictionResult,
      farmer_context: farmerContext,
      image_quality: imageQuality,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Orchestration failed with status ${res.status}`);
  }

  return res.json();
}

export async function submitEscalationCase(
  caseData: CaseCreateRequest
): Promise<CaseResponse> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(caseData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create case with status ${res.status}`);
  }

  return res.json();
}

export async function fetchCasesList(limit: number = 20): Promise<CaseResponse[]> {
  const res = await fetch(`${API_BASE}/cases?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to load cases queue`);
  }
  return res.json();
}

export async function fetchKvkDirectory(): Promise<any> {
  const res = await fetch(`${API_BASE}/kvk-directory`);
  if (!res.ok) {
    throw new Error(`Failed to load KVK directory`);
  }
  return res.json();
}
