import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Language, translations } from '../services/i18n';
import { SupportedScopeResponse } from '../types/api';
import { DEMO_PRESETS, DemoPreset } from './DemoScenariosPanel';

interface AssessmentFormProps {
  onAnalyze: (file: File, crop: string, symptoms: string, location: string) => Promise<void>;
  loading: boolean;
  scope: SupportedScopeResponse | null;
  lang: Language;
  presetToLoad?: DemoPreset | null;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onAnalyze,
  loading,
  scope,
  lang,
  presetToLoad,
}) => {
  const t = translations[lang];

  const [selectedCrop, setSelectedCrop] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech API for voice symptoms input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      setVoiceSupported(true);
    } else {
      setVoiceSupported(false);
    }
  }, [lang]);

  // Load preset when passed from Demo Scenarios panel
  useEffect(() => {
    if (presetToLoad) {
      setSelectedCrop(presetToLoad.crop);
      setSymptoms(presetToLoad.symptoms);
      setLocation(presetToLoad.location);

      // Convert SVG/data URI to File object for real backend processing
      fetch(presetToLoad.sampleImageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `${presetToLoad.id}.jpg`, { type: 'image/jpeg' });
          setImageFile(file);
          setImagePreview(presetToLoad.sampleImageUrl);
        })
        .catch(() => {
          setImagePreview(presetToLoad.sampleImageUrl);
        });
    }
  }, [presetToLoad]);

  const toggleVoiceRecording = () => {
    if (!voiceSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setSelectedCrop('');
    setSymptoms('');
    setLocation('');
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;
    onAnalyze(imageFile, selectedCrop, symptoms, location);
  };

  // Determine if selected crop is supported
  const supportedCropNames = scope?.crops.map((c) => c.crop.toLowerCase()) || [];
  const isSelectedCropSupported =
    selectedCrop === ''
      ? null
      : supportedCropNames.some(
          (sc) => sc.includes(selectedCrop.toLowerCase()) || selectedCrop.toLowerCase().includes(sc)
        );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs transition-all space-y-6">
      {/* 1-Click Quick Demo Presets Bar */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {t.quickScenarios}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">1-Click Test Presets for Judges</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedCrop(p.crop);
                setSymptoms(p.symptoms);
                setLocation(p.location);
                fetch(p.sampleImageUrl)
                  .then((res) => res.blob())
                  .then((blob) => {
                    const file = new File([blob], `${p.id}.jpg`, { type: 'image/jpeg' });
                    setImageFile(file);
                    setImagePreview(p.sampleImageUrl);
                  });
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-all font-medium flex items-center gap-1 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              S{p.scenarioNumber}: {p.crop} ({p.tag})
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Leaf Image Upload / Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            {t.photoUploadTitle} <span className="text-rose-500">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/bmp"
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-slate-900 group aspect-video sm:aspect-21/9 max-h-64 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Plant Leaf Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t.changePhoto}
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 text-sm">{t.photoDropText}</p>
              <p className="text-xs text-slate-500 mt-1">{t.photoUploadSubtitle}</p>
            </div>
          )}
        </div>

        {/* Crop Selection with In-Scope / Out-of-Scope Badge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t.cropSelectLabel}
            </label>
            {selectedCrop && (
              <div>
                {isSelectedCropSupported ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {t.supportedBadge}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {t.unsupportedBadge}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden appearance-none cursor-pointer"
            >
              <option value="">{t.cropPlaceholder}</option>
              {scope?.crops.map((c) => (
                <option key={c.crop} value={c.crop}>
                  {c.crop} (Verified in Model)
                </option>
              ))}
              <option disabled className="text-slate-400">
                ────────── Common Out-of-Scope Crops ──────────
              </option>
              <option value="Chili">Chili / Hot Pepper (Outside Model Scope)</option>
              <option value="Rice">Rice / Paddy (Outside Model Scope)</option>
              <option value="Cotton">Cotton (Outside Model Scope)</option>
              <option value="Wheat">Wheat (Outside Model Scope)</option>
              <option value="Sugarcane">Sugarcane (Outside Model Scope)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
          {selectedCrop.toLowerCase() === 'chili' && (
            <p className="text-[11px] text-purple-700 mt-1 font-medium">
              Note: The pretrained MobileNetV2 model does not have classes for Chili. Selecting Chili will demonstrate HACKMINT's boundary guardrail.
            </p>
          )}
        </div>

        {/* Farmer Symptoms Input with Voice Recognition Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t.symptomsLabel}
            </label>
            {/* Voice Dictation Trigger */}
            {voiceSupported ? (
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-voice-recording shadow-md shadow-rose-600/30'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? t.stopSpeaking : t.startSpeaking}
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 italic">{t.voiceNotSupported}</span>
            )}
          </div>

          {isRecording && (
            <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>{t.listening}</span>
            </div>
          )}

          <textarea
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t.symptomsPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Location (District / Region) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            {t.locationLabel}
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.locationPlaceholder}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Submit & Reset Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {t.resetButton}
          </button>

          <button
            type="submit"
            disabled={!imageFile || loading}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.analyzingButton}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.analyzeButton}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
