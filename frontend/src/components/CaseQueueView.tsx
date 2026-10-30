import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, Building, ShieldAlert, PhoneCall, AlertCircle } from 'lucide-react';
import { CaseResponse } from '../types/api';
import { fetchCasesList } from '../services/api';
import { Language, translations } from '../services/i18n';

interface CaseQueueViewProps {
  lang: Language;
}

export const CaseQueueView: React.FC<CaseQueueViewProps> = ({ lang }) => {
  const t = translations[lang];
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCasesList(50);
      setCases(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cases list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-700" />
            {t.caseQueue}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Local prototype escalation queue for uncertain triage, blurry uploads, and out-of-scope crops.
          </p>
        </div>
        <button
          onClick={loadCases}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Helpline Banner */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div>
          <strong>Verified National Advisory Contact:</strong> Kisan Call Center toll-free helpline operates 06:00 AM - 10:00 PM all 7 days.
        </div>
        <a
          href="tel:18001801551"
          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          1800-180-1551
        </a>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No escalation cases recorded yet.</p>
          <p className="text-slate-400 mt-1">
            When an uncertain prediction or blurry image occurs during assessment, it can be escalated here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.case_id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-slate-900 text-white">
                    {c.case_id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{c.farmer_name || 'Anonymous'}</span>
                  {c.location && (
                    <span className="text-xs text-slate-500">• {c.location}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {c.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Crop & Prediction</span>
                  <strong className="text-slate-900">{c.crop || 'Unknown'}</strong>
                  <p className="text-slate-500 text-[11px]">{c.top_prediction || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported Symptoms</span>
                  <p className="text-slate-700 italic line-clamp-2">"{c.reported_symptoms || 'None'}"</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Reason for Review</span>
                  <p className="text-rose-700 font-medium line-clamp-2">{c.escalation_reason}</p>
                </div>
              </div>

              {c.orchestrator_verdict && (
                <div className="p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                  <span className="font-semibold text-slate-800">Orchestrator Note: </span>
                  {c.orchestrator_verdict}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
