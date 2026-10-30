import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  UserCheck,
  HelpCircle,
  Clock
} from 'lucide-react';
import { OrchestrateResponse } from '../types/api';
import { Language, translations } from '../services/i18n';

interface EvidenceOrchestrationCardProps {
  orchestration: OrchestrateResponse;
  lang: Language;
  onOpenEscalation: () => void;
}

export const EvidenceOrchestrationCard: React.FC<EvidenceOrchestrationCardProps> = ({
  orchestration,
  lang,
  onOpenEscalation,
}) => {
  const t = translations[lang];
  const synth = orchestration.evidence_synthesis;
  const kb = synth.retrieved_knowledge;

  const getConfidenceBadge = () => {
    switch (orchestration.confidence_grade) {
      case 'HIGH':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            HIGH CONFIDENCE
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            MODERATE CONFIDENCE
          </span>
        );
      case 'LOW':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            LOW CONFIDENCE
          </span>
        );
      case 'UNCERTAIN':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            HIGH UNCERTAINTY
          </span>
        );
    }
  };

  const getSymptomStatusBadge = () => {
    switch (synth.symptom_consistency) {
      case 'consistent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Consistent with Visuals
          </span>
        );
      case 'conflicting':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Conflicting Observations
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <HelpCircle className="w-3.5 h-3.5" /> Partially Corroborated
          </span>
        );
      case 'unspecified':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
            No Symptoms Provided
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs transition-all space-y-6">
      {/* Header & Verdict */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{t.evidenceTitle}</h3>
            <p className="text-xs text-slate-500">Multimodal Evidence Synthesis & Rule-based Verification</p>
          </div>
        </div>
        <div>{getConfidenceBadge()}</div>
      </div>

      {/* Primary Orchestration Verdict */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Verdict</span>
          <div>{getSymptomStatusBadge()}</div>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{orchestration.overall_verdict}</h3>
        <p className="text-sm text-slate-700 mt-2 leading-relaxed">{orchestration.farmer_explanation}</p>
      </div>

      {/* Supporting Evidence vs Uncertainties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supporting Evidence */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t.supportingEvidence}
          </h4>
          {synth.supporting_factors.length > 0 ? (
            <ul className="space-y-2 text-xs text-emerald-950">
              {synth.supporting_factors.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No strong corroborating visual or symptom evidence.</p>
          )}
        </div>

        {/* Uncertainties & Ambiguities */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {t.uncertaintyFactors}
          </h4>
          {synth.uncertainty_factors.length > 0 ? (
            <ul className="space-y-2 text-xs text-amber-950">
              {synth.uncertainty_factors.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 font-medium">No major pathological contradictions detected.</p>
          )}
        </div>
      </div>

      {/* Retrieved Verified Knowledge Base Document */}
      {kb ? (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              {t.verifiedReference}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              {kb.source_organization}
            </span>
          </div>

          <h4 className="font-bold text-slate-900 text-sm">{kb.document_title}</h4>
          {kb.scientific_name && (
            <p className="text-xs text-slate-500 italic font-serif">Pathogen: {kb.scientific_name}</p>
          )}

          <div className="mt-3 text-xs text-slate-700 space-y-2">
            <div>
              <strong className="text-slate-900">Distinguishing Diagnostic Features: </strong>
              <span>{kb.distinguishing_features}</span>
            </div>

            {kb.verified_symptoms && kb.verified_symptoms.length > 0 && (
              <div>
                <strong className="text-slate-900">Verified Pathological Symptoms:</strong>
                <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                  {kb.verified_symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {kb.source_url && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono text-[10px]">Verified: {kb.last_verified || '2025'}</span>
              <a
                href={kb.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
              >
                View Official Reference <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <p className="italic">
            Notice: No verified official ICAR document exists in the local database for this specific condition.
            In compliance with agricultural safety guidelines, no unverified chemical treatments will be suggested.
          </p>
        </div>
      )}

      {/* Cultural Management Practices (Non-chemical) */}
      {orchestration.cultural_guidance.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            {t.culturalGuidanceTitle}
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {orchestration.cultural_guidance.map((guide, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{guide}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Plan & Escalation Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        orchestration.expert_escalation_recommended
          ? 'bg-rose-50/70 border-rose-200'
          : 'bg-emerald-50/60 border-emerald-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {orchestration.expert_escalation_recommended ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <h4 className="font-bold text-sm text-slate-900">
              {orchestration.expert_escalation_recommended
                ? t.escalationNotice
                : 'Routine Preventive Monitoring Recommended'}
            </h4>
          </div>
          <p className="text-xs text-slate-600">
            {orchestration.escalation_reason ||
              'Symptoms and visuals align. Observe foliage over the next 48-72 hours.'}
          </p>
        </div>

        <button
          onClick={onOpenEscalation}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer ${
            orchestration.expert_escalation_recommended
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          {t.escalateToKvkBtn}
        </button>
      </div>

      {/* Permanent Medical/Agricultural Disclaimer */}
      <p className="text-[11px] text-slate-500 italic text-center border-t border-slate-100 pt-3">
        {orchestration.disclaimer}
      </p>
    </div>
  );
};
