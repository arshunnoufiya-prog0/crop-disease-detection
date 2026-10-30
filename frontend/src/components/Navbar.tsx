import React from 'react';
import { Sprout, ShieldAlert, Globe, Server, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { Language, translations } from '../services/i18n';
import { HealthResponse } from '../types/api';

interface NavbarProps {
  currentTab: 'assessment' | 'scope' | 'cases' | 'scenarios';
  setCurrentTab: (tab: 'assessment' | 'scope' | 'cases' | 'scenarios') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  health: HealthResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  health,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('assessment')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">HACKMINT</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Agri-AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI Plant Pathology & Expert Verification</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('assessment')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'assessment'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.startAssessment}
            </button>
            <button
              onClick={() => setCurrentTab('scope')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'scope'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t.scopeGuide}
            </button>
            <button
              onClick={() => setCurrentTab('cases')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'cases'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.caseQueue}
            </button>
            <button
              onClick={() => setCurrentTab('scenarios')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'scenarios'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.demoScenarios}
            </button>
          </nav>

          {/* Right Action: Language & System Status */}
          <div className="flex items-center gap-3">
            {/* Backend Health Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200">
              {health?.model_loaded ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-700">MobileNetV2: Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-amber-800">Model: Loading/Demo</span>
                </>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'en' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'ta' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
