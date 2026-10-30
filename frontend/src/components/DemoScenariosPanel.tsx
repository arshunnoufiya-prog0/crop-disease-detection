import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Layers,
  HelpCircle,
  FileCheck,
  Play
} from 'lucide-react';
import { Language, translations } from '../services/i18n';

export interface DemoPreset {
  id: string;
  name: string;
  scenarioNumber: number;
  tag: string;
  tagColor: string;
  crop: string;
  symptoms: string;
  location: string;
  sampleImageUrl: string;
  expectedBehavior: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'scenario_1',
    name: 'Scenario 1: Clear Image & Corroborating Symptoms',
    scenarioNumber: 1,
    tag: 'High Confidence',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    crop: 'Tomato',
    symptoms: 'Dark brown spots with concentric target rings on lower leaves, surrounded by yellow chlorotic halo.',
    location: 'Kanchipuram, Tamil Nadu',
    sampleImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2322782d"/><path d="M150 20 L50 280 M150 20 L250 280 M150 20 L150 280" stroke="%23175c22" stroke-width="3"/><circle cx="150" cy="150" r="50" fill="%23b9af2d"/><circle cx="150" cy="150" r="40" fill="%23462612"/><circle cx="150" cy="150" r="28" fill="%236e411e"/><circle cx="150" cy="150" r="16" fill="%23321c0c"/><circle cx="150" cy="150" r="6" fill="%231e0f08"/></svg>',
    expectedBehavior: 'Passes quality gate (sharpness > 100). Model identifies Early Blight. Symptoms corroborate. Verified ICAR/TNAU guidelines retrieved.'
  },
  {
    id: 'scenario_2',
    name: 'Scenario 2: Blurry Photograph Rejected by Quality Gate',
    scenarioNumber: 2,
    tag: 'Rejected Image',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-200',
    crop: 'Tomato',
    symptoms: 'Some blurry brown spots on leaves.',
    location: 'Pune, Maharashtra',
    sampleImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><defs><filter id="b"><feGaussianBlur stdDeviation="15"/></filter></defs><rect width="300" height="300" fill="%233f8245" filter="url(%23b)"/><circle cx="150" cy="150" r="60" fill="%235f492a" filter="url(%23b)"/></svg>',
    expectedBehavior: 'OpenCV Variance of Laplacian detects blur. System safely rejects image, explains blur, and requests a clearer photo instead of guessing.'
  },
  {
    id: 'scenario_3',
    name: 'Scenario 3: Conflicting Evidence (Vision vs Symptoms)',
    scenarioNumber: 3,
    tag: 'Contradiction Flagged',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    crop: 'Tomato',
    symptoms: 'Upper leaf surfaces covered with thick white powdery mildew talcum dust (contradicts necrotic early blight).',
    location: 'Shimla, Himachal Pradesh',
    sampleImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2322782d"/><circle cx="150" cy="150" r="45" fill="%23462612"/><circle cx="150" cy="150" r="25" fill="%236e411e"/></svg>',
    expectedBehavior: 'Vision scores Early Blight, but farmer notes powdery coating. Orchestrator detects diagnostic conflict, downgrades confidence to UNCERTAIN, and recommends KVK escalation.'
  },
  {
    id: 'scenario_4',
    name: 'Scenario 4: Unsupported Crop Selection (Chili)',
    scenarioNumber: 4,
    tag: 'Strict Boundary Guard',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
    crop: 'Chili',
    symptoms: 'Leaf curl and dark spots on chili plants.',
    location: 'Guntur, Andhra Pradesh',
    sampleImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23388e3c"/><path d="M150 50 C200 120 180 220 150 270 C120 220 100 120 150 50" fill="%23d32f2f"/></svg>',
    expectedBehavior: 'Chili is NOT in the model 14-crop scope. HACKMINT refuses to hallucinate, explains scope limitation, and provides official KVK contacts.'
  },
  {
    id: 'scenario_5',
    name: 'Scenario 5: Healthy Crop Verification',
    scenarioNumber: 5,
    tag: 'Healthy Class',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    crop: 'Tomato',
    symptoms: 'Vigorous clean green leaves, no spots or pests observed.',
    location: 'Tumakuru, Karnataka',
    sampleImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%232e7d32"/><path d="M150 30 L40 270 M150 30 L260 270" stroke="%231b5e20" stroke-width="3"/></svg>',
    expectedBehavior: 'Model recognizes healthy foliage patterns. Orchestrator confirms non-symptomatic status and suggests routine preventive field scouting.'
  },
  {
    id: 'scenario_6',
    name: 'Scenario 6: Insufficient Agricultural Evidence & Ambiguity',
    scenarioNumber: 6,
    tag: 'Truthful Fallback',
    tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
    crop: 'Raspberry',
    symptoms: 'Leaves showing undefined yellowing without typical fungal patterns.',
    location: 'Ooty, Tamil Nadu',
    sampleImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23558b2f"/><circle cx="150" cy="150" r="30" fill="%23c0ca33"/></svg>',
    expectedBehavior: 'When model scores are borderline or KB lacks specific advisory, system refuses to invent chemical doses and advises in-person plant pathology review.'
  }
];

interface DemoScenariosPanelProps {
  onSelectPreset: (preset: DemoPreset) => void;
  lang: Language;
}

export const DemoScenariosPanel: React.FC<DemoScenariosPanelProps> = ({ onSelectPreset, lang }) => {
  const t = translations[lang];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-700" />
          {t.demoScenarios}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Pre-configured benchmark scenarios demonstrating how HACKMINT handles clear images, blur rejections,
          symptom contradictions, out-of-scope crops, and safe truthfulness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 font-mono">SCENARIO {preset.scenarioNumber}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.tagColor}`}>
                  {preset.tag}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{preset.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 italic">"{preset.symptoms}"</p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="text-[11px] text-slate-500">
                <strong className="text-slate-700">Expected Guardrail: </strong>
                <span>{preset.expectedBehavior}</span>
              </div>
              <button
                onClick={() => onSelectPreset(preset)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Load Scenario into Assessment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
