import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Eye, HelpCircle } from 'lucide-react';
import { ImageQualityResult } from '../types/api';
import { Language, translations } from '../services/i18n';

interface QualityGateCardProps {
  quality: ImageQualityResult;
  lang: Language;
}

export const QualityGateCard: React.FC<QualityGateCardProps> = ({ quality, lang }) => {
  const t = translations[lang];

  const getStatusBadge = () => {
    switch (quality.status) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.sharpnessGood}
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.sharpnessWarning}
          </span>
        );
      case 'rejected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            {t.sharpnessRejected}
          </span>
        );
    }
  };

  // Normalized gauge percentage (capping at 250 for progress bar)
  const maxScore = Math.max(quality.blur_threshold * 2.5, 250);
  const percent = Math.min(100, Math.max(5, (quality.blur_score / maxScore) * 100));
  const thresholdPercent = Math.min(100, (quality.blur_threshold / maxScore) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${quality.is_acceptable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{t.qualityTitle}</h3>
            <p className="text-xs text-slate-500">
              {quality.width}x{quality.height}px • {(quality.file_size_bytes / 1024).toFixed(0)} KB • {quality.mime_type}
            </p>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Blur Score Progress Meter */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
          <span>{t.blurScore}: <strong className="text-slate-900">{quality.blur_score}</strong></span>
          <span className="text-slate-500">{t.threshold}: {quality.blur_threshold}</span>
        </div>

        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              quality.status === 'good'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                : quality.status === 'warning'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-rose-500 to-red-600'
            }`}
            style={{ width: `${percent}%` }}
          />
          {/* Threshold Marker Pin */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
            style={{ left: `${thresholdPercent}%` }}
            title={`Threshold: ${quality.blur_threshold}`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>0 (Severe Blur)</span>
          <span className="font-semibold text-slate-600">Threshold ({quality.blur_threshold})</span>
          <span>{maxScore}+ (Ultra Sharp)</span>
        </div>
      </div>

      {/* Explanation text */}
      <div className={`mt-4 p-3.5 rounded-xl text-xs leading-relaxed ${
        quality.is_acceptable ? 'bg-emerald-50/60 text-emerald-950 border border-emerald-100' : 'bg-rose-50/80 text-rose-950 border border-rose-100'
      }`}>
        <p className="font-medium">{quality.explanation}</p>
      </div>
    </div>
  );
};
