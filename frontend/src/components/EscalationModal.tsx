import React, { useState } from 'react';
import { X, PhoneCall, CheckCircle2, ShieldCheck, AlertCircle, Building, ExternalLink } from 'lucide-react';
import { Language, translations } from '../services/i18n';
import { OrchestrateResponse, CaseResponse, PredictResponse } from '../types/api';
import { submitEscalationCase } from '../services/api';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orchestration: OrchestrateResponse | null;
  predictResult: PredictResponse | null;
  farmerSymptoms: string;
  userCrop: string;
  userLocation: string;
  lang: Language;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  orchestration,
  predictResult,
  farmerSymptoms,
  userCrop,
  userLocation,
  lang,
}) => {
  const t = translations[lang];

  const [farmerName, setFarmerName] = useState('');
  const [location, setLocation] = useState(userLocation || '');
  const [customReason, setCustomReason] = useState(
    orchestration?.escalation_reason || 'Farmer requested agricultural specialist review.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [createdCase, setCreatedCase] = useState<CaseResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const topPred = predictResult?.top_prediction;
      const res = await submitEscalationCase({
        farmer_name: farmerName || 'Anonymous Farmer',
        location: location || 'Unspecified Location',
        crop: userCrop || topPred?.crop || 'Unknown Crop',
        reported_symptoms: farmerSymptoms || 'None described',
        image_quality_summary: predictResult?.image_quality?.message || 'N/A',
        top_prediction: topPred ? `${topPred.crop} - ${topPred.condition}` : 'None',
        confidence: topPred?.confidence,
        orchestrator_verdict: orchestration?.overall_verdict,
        escalation_reason: customReason,
        notes: `Quality blur score: ${predictResult?.image_quality?.blur_score || 'N/A'}`
      });
      setCreatedCase(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit case to local verification queue.');
    } finally {
      setSubmitting(false);
    }
  };

  const kvk = orchestration?.kvk_recommendation;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t.escalationModalTitle}</h3>
              <p className="text-xs text-slate-500">{t.escalationModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {createdCase ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">Case Logged Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your case has been recorded in the local expert review queue.
                </p>
                <div className="mt-3 inline-block px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 font-mono text-sm font-bold text-emerald-800">
                  {createdCase.case_id}
                </div>
              </div>

              {/* Verified Helpline Direct Action */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <PhoneCall className="w-4 h-4 text-emerald-700" />
                  Official Kisan Helpline Contact
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  Call the <strong>National Kisan Call Center at 1800-180-1551 (Toll-Free)</strong> to speak directly
                  with a government agricultural officer in your regional language.
                </p>
                <div className="pt-1 flex items-center justify-between text-xs">
                  <a
                    href="tel:18001801551"
                    className="font-bold text-emerald-800 underline flex items-center gap-1"
                  >
                    Dial 1800-180-1551 Now
                  </a>
                  <a
                    href="https://kvk.icar.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px]"
                  >
                    ICAR KVK Directory <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                {t.closeBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Verified KVK Recommendation Notice */}
              {kvk && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Verified Institution: {kvk.name}
                  </div>
                  <p className="text-[11px] text-blue-900/80">{kvk.contact_details}</p>
                  <p className="text-[11px] font-medium text-blue-950 mt-1">{kvk.action_note}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmerName}</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="E.g. Murugan S."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.locationLabel}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g. Kanchipuram, Tamil Nadu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.escalationReason}</label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 border border-slate-200 leading-relaxed">
                Prototype Notice: Submitting this form stores a case record in the local SQLite queue. No real personal details are transmitted to external servers.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  {submitting ? 'Submitting...' : t.submitCaseBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
