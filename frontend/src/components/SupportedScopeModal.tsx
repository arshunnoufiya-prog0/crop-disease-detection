import React from 'react';
import { X, Layers, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SupportedScopeResponse } from '../types/api';
import { Language, translations } from '../services/i18n';

interface SupportedScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: SupportedScopeResponse | null;
  lang: Language;
}

export const SupportedScopeModal: React.FC<SupportedScopeModalProps> = ({
  isOpen,
  onClose,
  scope,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t.scopeGuide}</h3>
              <p className="text-xs text-slate-500">
                14 Certified Crops & 38 Pathological Conditions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Important Exclusions Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Strict Model Boundaries Notice
            </div>
            <p className="leading-relaxed">
              <strong>Notice:</strong> Chili / Hot Pepper, Rice, Wheat, Cotton, and Sugarcane are <strong>NOT</strong> supported
              by this vision model. When an unsupported crop is selected, HACKMINT refuses to fabricate guesses and directly routes
              the farmer to the nearest verified Krishi Vigyan Kendra (KVK).
            </p>
          </div>

          {/* Supported Crops List */}
          {scope ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Model: <code className="text-slate-700">{scope.model_id}</code></span>
                <span>Total Classes: <strong>{scope.total_classes}</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scope.crops.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {c.crop}
                      </h4>
                      {c.has_healthy_class && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Healthy + Disease
                        </span>
                      )}
                    </div>
                    <ul className="text-xs text-slate-600 space-y-0.5 pl-5 list-disc">
                      {c.conditions.map((cond, cIdx) => (
                        <li key={cIdx}>{cond}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Loading model scope...</p>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
