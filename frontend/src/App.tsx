import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ShieldAlert,
  Layers,
  Building,
  PhoneCall,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AssessmentForm } from './components/AssessmentForm';
import { QualityGateCard } from './components/QualityGateCard';
import { PredictionsCard } from './components/PredictionsCard';
import { EvidenceOrchestrationCard } from './components/EvidenceOrchestrationCard';
import { EscalationModal } from './components/EscalationModal';
import { SupportedScopeModal } from './components/SupportedScopeModal';
import { CaseQueueView } from './components/CaseQueueView';
import { DemoScenariosPanel, DemoPreset } from './components/DemoScenariosPanel';
import { Language, translations } from './services/i18n';
import {
  PredictResponse,
  OrchestrateResponse,
  HealthResponse,
  SupportedScopeResponse,
  FarmerContext
} from './types/api';
import {
  checkBackendHealth,
  fetchSupportedScope,
  uploadAndPredict,
  runOrchestration
} from './services/api';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<'assessment' | 'scope' | 'cases' | 'scenarios'>('assessment');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [scope, setScope] = useState<SupportedScopeResponse | null>(null);

  // Form & Execution state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrateResponse | null>(null);

  // Modals & Presets
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [presetToLoad, setPresetToLoad] = useState<DemoPreset | null>(null);

  // Form persistence for escalation modal
  const [activeCrop, setActiveCrop] = useState('');
  const [activeSymptoms, setActiveSymptoms] = useState('');
  const [activeLocation, setActiveLocation] = useState('');

  const t = translations[lang];

  // Initial load: Health and Supported Scope
  useEffect(() => {
    checkBackendHealth()
      .then((data) => setHealth(data))
      .catch(() => {
        // Backend health fallback
        setHealth({
          status: 'offline',
          model_loaded: false,
          model_source: 'offline',
          model_id: 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification',
          device: 'cpu',
          knowledge_base_entries: 0,
          supported_crops_count: 14,
          version: '1.0.0',
        });
      });

    fetchSupportedScope()
      .then((data) => setScope(data))
      .catch(() => {});
  }, []);

  // Main Pipeline: Upload -> Quality Gate -> Classifier -> Orchestrator
  const handleAnalyze = async (
    file: File,
    crop: string,
    symptoms: string,
    location: string
  ) => {
    setLoading(true);
    setErrorMessage(null);
    setActiveCrop(crop);
    setActiveSymptoms(symptoms);
    setActiveLocation(location);

    try {
      // 1. Image Quality Gate & Pretrained Classifier
      const predRes = await uploadAndPredict(file);
      setPredictResult(predRes);

      // 2. Multimodal Evidence Orchestrator
      const farmerContext: FarmerContext = {
        selected_crop: crop || undefined,
        reported_symptoms: symptoms || undefined,
        location: location || undefined,
      };

      const orchRes = await runOrchestration(predRes, farmerContext, predRes.image_quality);
      setOrchestrationResult(orchRes);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during plant disease triage.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setPresetToLoad(preset);
    setCurrentTab('assessment');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Agricultural Safety Disclaimer Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-200" />
            <span className="font-medium">{t.disclaimerBanner}</span>
          </div>
          <button
            onClick={() => setScopeModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1 font-bold underline hover:text-amber-200 shrink-0 cursor-pointer"
          >
            {t.scopeGuide} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        health={health}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <strong className="block font-bold">Analysis Warning:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Plant Assessment (Primary Workflow) */}
        {currentTab === 'assessment' && (
          <div className="space-y-8">
            {/* Header Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" /> AI Crop Disease Assistance
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Inspect Plant Health with Multimodal Evidence
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Upload a plant leaf photograph, optionally describe visible symptoms, and let HACKMINT assess
                blur sharpness, run vision feature classification, and synthesize official ICAR/TNAU guidelines.
              </p>
            </div>

            {/* Assessment Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Input Form (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <AssessmentForm
                  onAnalyze={handleAnalyze}
                  loading={loading}
                  scope={scope}
                  lang={lang}
                  presetToLoad={presetToLoad}
                />
              </div>

              {/* Right Column: Results & Evidence Synthesis (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {predictResult && predictResult.image_quality ? (
                  <>
                    {/* Quality Gate Status Card */}
                    <QualityGateCard quality={predictResult.image_quality} lang={lang} />

                    {/* Pretrained Predictions Card (if image passed or previewed) */}
                    {predictResult.top_prediction && (
                      <PredictionsCard predictResult={predictResult} lang={lang} />
                    )}

                    {/* Orchestration Evidence & Cultural Guidance */}
                    {orchestrationResult && (
                      <EvidenceOrchestrationCard
                        orchestration={orchestrationResult}
                        lang={lang}
                        onOpenEscalation={() => setEscalationModalOpen(true)}
                      />
                    )}
                  </>
                ) : (
                  /* Empty State awaiting user interaction */
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                      <Sprout className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Awaiting Leaf Photograph</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                        Select a crop and upload an affected plant leaf or pick a 1-click test scenario preset
                        above to start the quality assessment.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">1. Laplacian Blur Check</span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">2. Pretrained MobileNetV2</span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">3. ICAR/TNAU Verification</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Supported Scope Guide */}
        {currentTab === 'scope' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-700" />
                {t.scopeGuide}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verified boundaries of the linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification model.
              </p>
            </div>

            {/* Out-of-Scope Strict Boundary Card */}
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-950 text-xs space-y-2">
              <h3 className="font-bold text-sm text-purple-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
                Explicit Model Exclusions
              </h3>
              <p className="leading-relaxed">
                In strict adherence to hackathon safety instructions, HACKMINT explicitly declares that <strong>Chili / Hot Pepper, Rice, Wheat, Cotton, and Sugarcane</strong> are outside the 14-crop model scope. The system will never fabricate predictions for these crops and instead triggers direct KVK escalation.
              </p>
            </div>

            {/* 14 Crops List */}
            {scope && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scope.crops.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <h4 className="font-bold text-slate-900 text-sm mb-2">{c.crop}</h4>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      {c.conditions.map((cond, cIdx) => (
                        <li key={cIdx}>{cond}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Case Queue View */}
        {currentTab === 'cases' && <CaseQueueView lang={lang} />}

        {/* Tab 4: Demo Scenarios Panel */}
        {currentTab === 'scenarios' && (
          <DemoScenariosPanel onSelectPreset={handleSelectPreset} lang={lang} />
        )}
      </main>

      {/* Modals */}
      <EscalationModal
        isOpen={escalationModalOpen}
        onClose={() => setEscalationModalOpen(false)}
        orchestration={orchestrationResult}
        predictResult={predictResult}
        farmerSymptoms={activeSymptoms}
        userCrop={activeCrop}
        userLocation={activeLocation}
        lang={lang}
      />

      <SupportedScopeModal
        isOpen={scopeModalOpen}
        onClose={() => setScopeModalOpen(false)}
        scope={scope}
        lang={lang}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">HACKMINT v1.0.0</span>
            <span>• Pretrained MobileNetV2 Plant Disease Assistance Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://kvk.icar.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 transition-colors flex items-center gap-1 font-medium"
            >
              ICAR KVK Directory <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-700">Kisan Call Center: 1800-180-1551</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
