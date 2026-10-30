import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { PredictResponse } from '../types/api';
import { Language, translations } from '../services/i18n';

interface PredictionsCardProps {
  predictResult: PredictResponse;
  lang: Language;
}

export const PredictionsCard: React.FC<PredictionsCardProps> = ({ predictResult, lang }) => {
  const t = translations[lang];
  const top1 = predictResult.top_prediction;

  if (!top1) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{t.topPredictionTitle}</h3>
            <p className="text-xs text-slate-500">MobileNetV2 Vision Classifier (38 Plant Village Classes)</p>
          </div>
        </div>

        {/* Model Source Badge */}
        <div>
          {predictResult.is_mock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3 h-3" />
              DEMO / MOCK DATA
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3" />
              Pretrained PyTorch Inference
            </span>
          )}
        </div>
      </div>

      {/* Top Prediction Highlight Card */}
      <div className={`mt-4 p-4 rounded-xl border ${
        top1.is_healthy
          ? 'bg-gradient-to-r from-emerald-50/70 to-green-50/70 border-emerald-200'
          : 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-amber-200'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 text-slate-700 border border-slate-200">
                {top1.crop}
              </span>
              {top1.is_healthy && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Healthy Foliage
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">{top1.condition}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Raw model class: {top1.raw_label}</p>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{top1.confidence_percentage}%</span>
            <p className="text-[10px] text-slate-400 font-medium uppercase">Softmax Score</p>
          </div>
        </div>
      </div>

      {/* Top-3 Candidates Breakdown */}
      <div className="mt-5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">{t.top3Title}</h4>
        <div className="space-y-2.5">
          {predictResult.top_3.map((item, index) => (
            <div key={index} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                    {index + 1}
                  </span>
                  {item.label}
                </span>
                <span className="font-mono font-bold text-slate-700">{item.confidence_percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-emerald-600' : index === 1 ? 'bg-emerald-400' : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.max(2, item.confidence_percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safe Triage Caveat */}
      <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>{predictResult.caveat}</p>
      </div>
    </div>
  );
};
