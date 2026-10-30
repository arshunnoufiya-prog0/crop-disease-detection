export type Language = 'en' | 'ta';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  disclaimerBanner: string;
  startAssessment: string;
  scopeGuide: string;
  caseQueue: string;
  demoScenarios: string;
  cropSelectLabel: string;
  cropPlaceholder: string;
  supportedBadge: string;
  unsupportedBadge: string;
  photoUploadTitle: string;
  photoUploadSubtitle: string;
  photoDropText: string;
  changePhoto: string;
  voiceInputLabel: string;
  startSpeaking: string;
  stopSpeaking: string;
  listening: string;
  voiceNotSupported: string;
  symptomsLabel: string;
  symptomsPlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  analyzeButton: string;
  analyzingButton: string;
  resetButton: string;
  quickScenarios: string;
  qualityTitle: string;
  blurScore: string;
  threshold: string;
  sharpnessGood: string;
  sharpnessWarning: string;
  sharpnessRejected: string;
  topPredictionTitle: string;
  top3Title: string;
  evidenceTitle: string;
  symptomsConsistency: string;
  supportingEvidence: string;
  uncertaintyFactors: string;
  verifiedReference: string;
  culturalGuidanceTitle: string;
  actionItemsTitle: string;
  escalationNotice: string;
  escalateToKvkBtn: string;
  escalationModalTitle: string;
  escalationModalSubtitle: string;
  farmerName: string;
  escalationReason: string;
  submitCaseBtn: string;
  caseCreatedSuccess: string;
  closeBtn: string;
  nationalHelpline: string;
  kvkPortal: string;
  tollFreeCall: string;
  demoDataNotice: string;
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    appName: "HACKMINT",
    tagline: "AI Crop Disease Assistance & Agricultural Verification System",
    disclaimerBanner: "Preliminary agricultural assistance prototype. Not a certified laboratory diagnosis. Never apply scheduled chemical treatments without local KVK or Agronomist confirmation.",
    startAssessment: "Plant Assessment",
    scopeGuide: "Supported Crops & Scope",
    caseQueue: "Expert Review Queue",
    demoScenarios: "Demo Scenarios",
    cropSelectLabel: "Crop Selection (Optional if known)",
    cropPlaceholder: "Select or type crop name...",
    supportedBadge: "Verified Model Scope",
    unsupportedBadge: "Outside Model Scope",
    photoUploadTitle: "Upload Leaf Photograph",
    photoUploadSubtitle: "PNG, JPG, or WEBP up to 10MB",
    photoDropText: "Click or drag leaf photo here to analyze",
    changePhoto: "Change Leaf Photo",
    voiceInputLabel: "Voice Symptom Input (Speech-to-Text)",
    startSpeaking: "Record Symptoms (Voice)",
    stopSpeaking: "Stop Recording",
    listening: "Listening... Speak symptoms clearly in English or Tamil",
    voiceNotSupported: "Web Speech API is unavailable in this browser. Please use text input below.",
    symptomsLabel: "Observed Symptoms in Your Own Words",
    symptomsPlaceholder: "E.g., Dark concentric spots on bottom leaves with yellow margins, leaves drying up...",
    locationLabel: "Location (District / State - Optional)",
    locationPlaceholder: "E.g., Kanchipuram, Tamil Nadu",
    analyzeButton: "Run AI Quality Gate & Assessment",
    analyzingButton: "Analyzing Image & Orchestrating Evidence...",
    resetButton: "Reset Form",
    quickScenarios: "1-Click Demo Scenarios (Judge Presets)",
    qualityTitle: "Image Quality Gate (OpenCV Laplacian Analysis)",
    blurScore: "Laplacian Blur Score",
    threshold: "Configured Cutoff",
    sharpnessGood: "Acceptable Sharpness",
    sharpnessWarning: "Borderline Sharpness",
    sharpnessRejected: "Rejected: Blurry / Sub-resolution",
    topPredictionTitle: "Primary Vision Model Indication",
    top3Title: "Top-3 Machine Learning Candidates",
    evidenceTitle: "AI Evidence Orchestration & Verification",
    symptomsConsistency: "Symptom Corroboration",
    supportingEvidence: "Supporting Factors",
    uncertaintyFactors: "Ambiguities & Uncertainties",
    verifiedReference: "Official Verified ICAR / TNAU Reference",
    culturalGuidanceTitle: "Cultural Field Management (Non-chemical)",
    actionItemsTitle: "Recommended Action Plan",
    escalationNotice: "Agricultural Expert / KVK Escalation Recommended",
    escalateToKvkBtn: "Submit Case for Expert Review",
    escalationModalTitle: "KVK / Expert Verification Escalation",
    escalationModalSubtitle: "Log this preliminary finding into the local expert triage queue.",
    farmerName: "Farmer Name (Optional)",
    escalationReason: "Primary Reason for Escalation",
    submitCaseBtn: "Confirm & Generate Escalation Case",
    caseCreatedSuccess: "Case logged successfully! Case ID:",
    closeBtn: "Close",
    nationalHelpline: "Kisan Call Center (Toll-Free): 1800-180-1551",
    kvkPortal: "Official ICAR KVK Portal: kvk.icar.gov.in",
    tollFreeCall: "Call Helpline (1800-180-1551)",
    demoDataNotice: "NOTICE: Model running in marked DEMO / MOCK mode."
  },
  ta: {
    appName: "ஹாக்மின்ட் (HACKMINT)",
    tagline: "பயிர் நோய் AI உதவி மற்றும் வேளாண்மை சரிபார்ப்பு அமைப்பு",
    disclaimerBanner: "இது ஒரு மாதிரி முன்மாதிரி அமைப்பு மட்டுமே; சான்றளிக்கப்பட்ட ஆய்வக நோய் கண்டறிதல் அல்ல. வேளாண் அறிவியல் மையம் (KVK) அல்லது வேளாண் அலுவலரின் ஆலோசனை இன்றி பூச்சிக்கொல்லிகளைப் பயன்படுத்த வேண்டாம்.",
    startAssessment: "பயிர் பரிசோதனை",
    scopeGuide: "ஆதரிக்கப்படும் பயிர்கள்",
    caseQueue: "நிபுணர் மறுஆய்வு வரிசை",
    demoScenarios: "மாதிரி சோதனைகள்",
    cropSelectLabel: "பயிரைத் தேர்ந்தெடுக்கவும் (தெரிந்தால்)",
    cropPlaceholder: "பயிரின் பெயரைத் தேர்ந்தெடுக்கவும்...",
    supportedBadge: "ஆதரிக்கப்படும் பயிர்",
    unsupportedBadge: "மாதிரி எல்லைக்கு அப்பால்",
    photoUploadTitle: "இலை புகைப்படத்தைப் பதிவேற்றவும்",
    photoUploadSubtitle: "PNG, JPG அல்லது WEBP (அதிகபட்சம் 10MB)",
    photoDropText: "இலை புகைப்படத்தை இங்கே பதிவேற்றவும் அல்லது இழுக்கவும்",
    changePhoto: "புகைப்படத்தை மாற்றவும்",
    voiceInputLabel: "குரல் மூலம் அறிகுறிகளைப் பதிவுசெய்க (பேச்சு மொழிபெயர்ப்பு)",
    startSpeaking: "குரல் மூலம் பேசுங்கள்",
    stopSpeaking: "பதிவை நிறுத்துக",
    listening: "கேட்கிறது... அறிகுறிகளை தெளிவாகப் பேசுங்கள்...",
    voiceNotSupported: "உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. கீழே தட்டச்சு செய்யவும்.",
    symptomsLabel: "நீங்கள் கண்ட அறிகுறிகள் (உங்கள் சொந்த வார்த்தைகளில்)",
    symptomsPlaceholder: "எ.கா: கீழ் இலைகளில் வட்டமான பழுப்பு நிற புள்ளிகள், மஞ்சள் விளிம்பு...",
    locationLabel: "இடம் (மாவட்டம் / மாநிலம் - விருப்பம்)",
    locationPlaceholder: "எ.கா: காஞ்சிபுரம், தமிழ்நாடு",
    analyzeButton: "படத் தரம் & நோய் பரிசோதிக்கவும்",
    analyzingButton: "படம் ஆராயப்பட்டு வருகிறது...",
    resetButton: "படிவத்தை மீட்டமை",
    quickScenarios: "விரைவு மாதிரி சோதனைகள் (1-Click Presets)",
    qualityTitle: "படத் தர மதிப்பீடு (Laplacian Blur Score)",
    blurScore: "படத் தெளிவு மதிப்பெண்",
    threshold: "வரம்பு வரம்பு",
    sharpnessGood: "நல்ல தெளிவு",
    sharpnessWarning: "சுமாரான தெளிவு",
    sharpnessRejected: "மங்கலான படம்: நிராகரிக்கப்பட்டது",
    topPredictionTitle: "முதன்மை கணிப்பு",
    top3Title: "முதல் 3 கணிப்புகள் (Top-3 Scores)",
    evidenceTitle: "சான்று ஒருங்கிணைப்பு மற்றும் சரிபார்ப்பு",
    symptomsConsistency: "அறிகுறி பொருத்தம்",
    supportingEvidence: "ஆதரவளிக்கும் காரணிகள்",
    uncertaintyFactors: "சந்தேகங்கள் மற்றும் முரண்பாடுகள்",
    verifiedReference: "அங்கீகரிக்கப்பட்ட ICAR / TNAU குறிப்பு",
    culturalGuidanceTitle: "பயிர் மேலாண்மை வழிகாட்டுதல் (இரசாயனமற்றது)",
    actionItemsTitle: "பரிந்துரைக்கப்படும் நடவடிக்கைகள்",
    escalationNotice: "வேளாண் விஞ்ஞானி / KVK மறுஆய்வு பரிந்துரைக்கப்படுகிறது",
    escalateToKvkBtn: "நிபுணர் பார்வைக்கு சமர்ப்பிக்கவும்",
    escalationModalTitle: "KVK / நிபுணர் சரிபார்ப்பு கோரிக்கை",
    escalationModalSubtitle: "இந்த பரிசோதனை அறிக்கையை வேளாண்மை வரிசையில் பதிவு செய்யவும்.",
    farmerName: "விவசாயி பெயர் (விருப்பம்)",
    escalationReason: "முக்கிய காரணம்",
    submitCaseBtn: "கோரிக்கையை உறுதிப்படுத்துக",
    caseCreatedSuccess: "வழக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது! எண்:",
    closeBtn: "மூடு",
    nationalHelpline: "கிசான் உதவி எண் (கட்டணமில்லா): 1800-180-1551",
    kvkPortal: "அரசு ICAR KVK தளம்: kvk.icar.gov.in",
    tollFreeCall: "உதவி எண்ணை அழைக்கவும் (1800-180-1551)",
    demoDataNotice: "குறிப்பு: AI மாதிரி டெமோ முறையில் இயங்குகிறது."
  }
};
