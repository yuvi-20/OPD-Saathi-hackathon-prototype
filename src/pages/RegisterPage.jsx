import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StepProgress from '../components/StepProgress';
import SymptomCard from '../components/SymptomCard';
import { DEPARTMENTS } from '../data/departments';
import {
  Mic,
  MicOff,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  HelpCircle,
  CheckCircle,
  Siren,
  User,
  HeartPulse,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { speakText } from '../utils/tts';

export default function RegisterPage() {
  const {
    t,
    language,
    registerPatient,
    assistedMode,
    setAssistedMode,
    autoReadAloud,
    setEmergencyModalOpen
  } = useApp();

  const navigate = useNavigate();

  // Wizard Step (1 to 5)
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "female",
    phone: "",
    departmentId: "general_medicine"
  });

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micError, setMicError] = useState(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [listeningStep, setListeningStep] = useState(2);
  const [voiceLang, setVoiceLang] = useState(language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN');
  const recognitionRef = useRef(null);
  const latestTranscriptRef = useRef("");
  const micErrorPersistentRef = useRef(false);

  // Helper to parse age from speech
  const parseSpokenAge = (text) => {
    const numMatch = text.match(/\d+/);
    if (numMatch) return parseInt(numMatch[0], 10);
    const words = {
      'साठ': 60, 'बासठ': 62, 'पैंसठ': 65, 'सत्तर': 70, 'पचास': 50,
      'चालीस': 40, 'तीस': 30, 'बीस': 20, 'sixty': 60, 'fifty': 50, 'forty': 40
    };
    for (const [w, n] of Object.entries(words)) {
      if (text.includes(w)) return n;
    }
    return null;
  };

  // Helper to match department from spoken complaints
  const matchSpokenDepartment = (text) => {
    const lower = text.toLowerCase();
    if (/बुखार|खांसी|खासी|fever|cough|cold|sugar|bp|कमजोरी|दर्द|पेट दर्द/i.test(lower)) {
      return 'general_medicine';
    }
    if (/बच्चा|शिशु|बाल|baby|child|kids|टीका/i.test(lower)) {
      return 'pediatrics';
    }
    if (/महिला|गर्भवती|प्रसव|pregnancy|delivery|pregnant/i.test(lower)) {
      return 'obstetrics_gynecology';
    }
    if (/हड्डी|जोड़|कमर|घुटना|bone|joint|fracture|ortho/i.test(lower)) {
      return 'orthopedics';
    }
    if (/कान|नाक|गला|ear|nose|throat|ent/i.test(lower)) {
      return 'ent';
    }
    if (/आंख|चश्मा|धुंधला|eye|vision|cataract/i.test(lower)) {
      return 'ophthalmology';
    }
    if (/त्वचा|खुजली|दाने|skin|rash|allergy/i.test(lower)) {
      return 'dermatology';
    }
    return null;
  };

  // Apply recognized speech text to the respective step
  const applyVoiceTranscript = (rawText, targetStep) => {
    if (!rawText || !rawText.trim()) return;

    // Step 2: Patient Name (Captures ONLY what the patient speaks!)
    if (targetStep === 2) {
      const nameClean = rawText
        .replace(/^(मेरा नाम है|मेरा नाम|my name is|my name|naam hai|naam|peyar|en peyar)\s*/i, '')
        .replace(/[.,!?]/g, '')
        .trim();
      const finalName = nameClean || rawText.trim();
      setFormData(prev => ({ ...prev, name: finalName }));
    }

    // Step 3: Age & Gender
    if (targetStep === 3) {
      const ageFound = parseSpokenAge(rawText);
      let genderFound = null;
      if (/महिला|स्त्री|female|girl|woman|लड़की|औरत/i.test(rawText)) genderFound = 'female';
      if (/पुरुष|आदमी|male|boy|man|लड़का/i.test(rawText)) genderFound = 'male';

      setFormData(prev => ({
        ...prev,
        ...(ageFound ? { age: String(ageFound) } : {}),
        ...(genderFound ? { gender: genderFound } : {})
      }));
    }

    // Step 5: Department & Symptoms
    if (targetStep === 5) {
      const matchedDept = matchSpokenDepartment(rawText);
      if (matchedDept) {
        setFormData(prev => ({ ...prev, departmentId: matchedDept }));
      }
    }
  };

  // Start voice capture using native Web Speech API
  const startVoiceCapture = (targetStep = step, customLang = null) => {
    setListeningStep(targetStep);
    setMicError(null);
    setLiveTranscript("");
    latestTranscriptRef.current = "";
    setVoiceModalOpen(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("SPEECH_NOT_SUPPORTED");
      setIsListening(false);
      speakText(
        language === 'hi'
          ? "इस ब्राउज़र में आवाज पहचान समर्थित नहीं है। आप सीधे नाम लिख सकते हैं या सहायता टोकन ले सकते हैं।"
          : "Speech recognition not supported in this browser. You can enter name or get an assisted token.",
        language
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      const langToUse = customLang || voiceLang || (language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN');
      recognition.lang = langToUse;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event) => {
        let spoken = "";
        for (let i = 0; i < event.results.length; i++) {
          spoken += event.results[i][0].transcript + " ";
        }
        spoken = spoken.trim();
        if (spoken) {
          setLiveTranscript(spoken);
          latestTranscriptRef.current = spoken;
          // Apply live to form immediately so patient sees their exact spoken words!
          applyVoiceTranscript(spoken, targetStep);
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicError("PERMISSION_DENIED");
          micErrorPersistentRef.current = true;
          speakText(
            language === 'hi'
              ? "ब्राउज़र में माइक की अनुमति बंद है। कृपया एड्रेस बार में लॉक आइकन से अनुमति दें, या नीचे नाम दर्ज करें।"
              : "Microphone permission is blocked in browser address bar.",
            language
          );
        } else if (e.error === 'audio-capture') {
          setMicError("DEVICE_NOT_FOUND");
          micErrorPersistentRef.current = true;
          speakText(
            language === 'hi'
              ? "माइक्रोफोन डिवाइस नहीं मिला। आप यहाँ नाम दर्ज कर सकते हैं या सहायता टोकन ले सकते हैं।"
              : "Microphone hardware device not found.",
            language
          );
        } else if (e.error === 'network') {
          setMicError("NETWORK_ERROR");
          micErrorPersistentRef.current = true;
          speakText(
            language === 'hi'
              ? "इंटरनेट स्पीच सर्विस ऑफलाइन है। कृपया नीचे अपना नाम दर्ज करें।"
              : "Speech network service offline.",
            language
          );
        } else if (e.error === 'no-speech') {
          // Don't kill session on brief silence, keep listening
        } else {
          setMicError("GENERIC_ERROR");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (latestTranscriptRef.current) {
          applyVoiceTranscript(latestTranscriptRef.current, targetStep);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Voice capture start error:", e);
      setMicError("START_FAILED");
      setIsListening(false);
    }
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    if (latestTranscriptRef.current) {
      applyVoiceTranscript(latestTranscriptRef.current, listeningStep);
    }
  };

  // Explicitly prompt the browser for microphone permissions
  const requestMicPermission = async () => {
    setMicError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicError(null);
        startVoiceCapture(listeningStep);
        return;
      }
    } catch (err) {
      console.warn("Direct mic request error:", err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError("DEVICE_NOT_FOUND");
        micErrorPersistentRef.current = true;
        speakText(
          language === 'hi'
            ? "कंप्यूटर या मोबाइल में माइक्रोफोन हार्डवेयर नहीं मिला। कोई समस्या नहीं, आप सहायता टोकन ले सकते हैं।"
            : "No microphone hardware detected.",
          language
        );
        return;
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError("PERMISSION_DENIED");
        micErrorPersistentRef.current = true;
        speakText(
          language === 'hi'
            ? "ब्राउज़र एड्रेस बार में 🔒 लॉक आइकन पर क्लिक करके माइक्रोफोन Allow करें।"
            : "Microphone is blocked. Please allow it in the browser address bar.",
          language
        );
        return;
      }
    }

    // Fallback: try recognition once
    startVoiceCapture(listeningStep);
  };

  // Conversational Automated Speech: In Assisted Mode, read prompt aloud, then immediately open mic
  React.useEffect(() => {
    if (assistedMode || autoReadAloud) {
      let promptText = "";
      if (step === 1) {
        promptText = language === 'hi'
          ? "नमस्ते। मैं ओपीडी साथी हूँ। मैं आपकी रजिस्ट्रेशन में मदद करूँगा। क्या मरीज को कोई गंभीर आपातकालीन लक्षण तो नहीं हैं?"
          : language === 'ta'
          ? "வணக்கம். நான் ஓபிடி சாதி. உங்கள் பதிவில் நான் உதவுவேன்."
          : "Namaste. I am OPD Saathi. I will help you with registration.";
      } else if (step === 2) {
        promptText = language === 'hi'
          ? "मरीज का पूरा नाम क्या है? कृपया नाम बोलें या लिखें।"
          : language === 'ta'
          ? "நோயாளியின் பெயர் என்ன? பேசுங்கள் அல்லது எழுதவும்."
          : "What is the patient's name? Please speak or enter now.";
      } else if (step === 3) {
        promptText = language === 'hi'
          ? "मरीज की उम्र बताएं, जैसे 62 साल।"
          : language === 'ta'
          ? "நோயாளியின் வயதை கூறவும்."
          : "Please speak patient's age in years.";
      } else if (step === 4) {
        promptText = `${t.register.step4Title}. ${t.register.phoneSkip}`;
      } else if (step === 5) {
        promptText = language === 'hi'
          ? "आप किस डॉक्टर या डिपार्टमेंट के लिए आए हैं? जैसे बुखार, खांसी, या हड्डी में दर्द? बोलकर बताएं।"
          : language === 'ta'
          ? "நீங்கள் எந்த மருத்துவர் அல்லது துறைக்கு வந்துள்ளீர்கள்? பேசுங்கள்."
          : "Which doctor or department have you come for? Like fever, cough, or joint pain? Speak now.";
      }

      if (promptText) {
        // Speak prompt, and when speech ends, automatically trigger voice listening if mic hardware is available!
        speakText(promptText, language, () => {
          if (assistedMode && (step === 2 || step === 3 || step === 5) && !micErrorPersistentRef.current) {
            setTimeout(() => {
              startVoiceCapture(step);
            }, 300);
          }
        });
      }
    }

    return () => {
      stopVoiceCapture();
    };
  }, [step, assistedMode, autoReadAloud, language, t]);

  // Voice speech-to-text handler for manual click
  const handleMicClick = () => {
    micErrorPersistentRef.current = false;
    if (isListening) {
      stopVoiceCapture();
    } else {
      startVoiceCapture(step);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      // Step 5: Final Submission
      const patient = registerPatient({
        name: formData.name.trim() || "Patient",
        age: parseInt(formData.age, 10) || 45,
        gender: formData.gender,
        phone: formData.phone.trim(),
        departmentId: formData.departmentId
      });

      // Voice prompt: "Aapka token G-127 hai."
      const tokenVoice = language === 'hi'
        ? `आपका टोकन ${patient.token} है।`
        : `Your token is ${patient.token}.`;
      speakText(tokenVoice, language);

      navigate('/opd-slip');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      navigate('/');
    }
  };

  const handleReadStep = (text) => {
    speakText(text, language);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 space-y-4">
      {/* Top Navigation Bar with Back Icon */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-extrabold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>
            {step === 1
              ? (language === 'hi' ? 'होम पेज (Home)' : language === 'ta' ? 'முகப்பு (Home)' : 'Home')
              : (t.buttons.back || 'Back')}
          </span>
        </button>

        <span className="text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Step {step} of 5
        </span>
      </div>

      {/* Step Progress Bar */}
      <StepProgress currentStep={step} totalSteps={5} />

      {/* Live Voice Listening Animation Banner */}
      {isListening && (
        <div className="mb-6 p-4 rounded-3xl bg-red-600 text-white shadow-xl border-4 border-yellow-300 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce">
              <Mic className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>
                  {language === 'hi' ? '🎙️ आपकी आवाज सुन रहे हैं... कृपया बोलें' : language === 'ta' ? '🎙️ உங்கள் குரலை கேட்கிறது... பேசுங்கள்' : '🎙️ Listening to you... Please speak now'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-yellow-200 font-bold mt-0.5">
                {liveTranscript ? `"${liveTranscript}"` : (language === 'hi' ? 'बोलिए, अपने आप लिखा जाएगा...' : 'Speak your answer, it will be typed automatically...')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={stopVoiceCapture}
            className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black"
          >
            Stop
          </button>
        </div>
      )}

      {/* Returning Patient Shortcut Banner for Step 1 */}
      {step === 1 && (
        <div className="mb-6 p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👵</span>
            <div>
              <h4 className="font-extrabold text-teal-950 text-sm sm:text-base">
                {language === 'hi' ? 'क्या आप पहले कभी अस्पताल आ चुके हैं?' : 'Visited this hospital before?'}
              </h4>
              <p className="text-xs text-teal-800 font-medium">
                {language === 'hi'
                  ? 'पुराने मरीज हैं तो पूरा फॉर्म न भरें। 1-टच में दोबारा पर्चा व रिकॉर्ड पाएं।'
                  : 'Returning patients do not need to fill this form again. Repeat visit in 1-tap.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/returning-patient')}
            className="self-start sm:self-center bg-teal-600 hover:bg-teal-700 text-white font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 flex-shrink-0"
          >
            <span>{language === 'hi' ? 'पुराने मरीज लॉगिन' : 'Returning Patient'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Assisted Mode Switch Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between gap-3 shadow-sm">
        <div>
          <h4 className="font-bold text-amber-950 text-sm sm:text-base">
            🤝 {t.register.assistedSwitch}
          </h4>
          <p className="text-xs sm:text-sm text-amber-800">
            {t.register.assistedSwitchHint}
          </p>
        </div>
        <button
          onClick={() => setAssistedMode(!assistedMode)}
          className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex-shrink-0 ${
            assistedMode
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-amber-900 border border-amber-400 hover:bg-amber-100'
          }`}
          aria-pressed={assistedMode}
        >
          {assistedMode ? "ON (सक्रिय)" : "OFF"}
        </button>
      </div>

      {/* STEP 1: Urgent Triage Checklist */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                CRITICAL CHECK
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
                {t.register.step1Title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                {t.register.step1Subtitle}
              </p>
            </div>
            <button
              onClick={() => handleReadStep(`${t.register.step1Title}. ${t.emergency.anyOfThese}`)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700"
              aria-label="Read step"
            >
              <Volume2 className="w-6 h-6 text-sky-600" />
            </button>
          </div>

          {/* Caregiver Guide on Step 1 */}
          {assistedMode && (
            <div className="bg-amber-100 border-2 border-amber-400 p-4 rounded-2xl flex items-start gap-3 text-amber-950 font-bold text-sm sm:text-base">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="font-extrabold uppercase text-xs tracking-wider text-amber-900">
                  {language === 'hi' ? 'सहायक निर्देश (Caregiver Tip):' : language === 'ta' ? 'உதவியாளர் குறிப்பு:' : 'Caregiver Guidance Tip:'}
                </div>
                <div>
                  {language === 'hi'
                    ? 'मरीज को देखें। यदि सीने में दर्द, बेहोशी या भारी खून बह रहा है तो तुरंत लाल आपातकाल बटन दबाएं।'
                    : language === 'ta'
                    ? 'நோயாளியை கவனிக்கவும். நெஞ்சு வலி அல்லது அதிக ரத்தப்போக்கு இருந்தால் உடனடியாக அவசர சிகிச்சை பொத்தானை அழுத்தவும்.'
                    : 'Observe patient. If they have severe chest pain or bleeding, tap Emergency immediately. Do not wait for a token.'}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Warning Signs Box */}
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="font-extrabold text-red-950 text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{t.emergency.warningTitle}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-red-900">
              {t.emergency.signs.map((sign, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-red-200">
                  <span className="text-red-600 font-bold">⚠️</span>
                  <span>{sign}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setEmergencyModalOpen(true)}
                className="flex-1 min-h-[56px] bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-md animate-urgent"
              >
                <Siren className="w-5 h-5 text-yellow-300" />
                <span>Yes, Go to Emergency (No Token)</span>
              </button>
            </div>
          </div>

          {/* Confirm No Emergency Button & Back to Home Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto min-h-[56px] px-5 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors active:scale-95 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
              <span>{language === 'hi' ? 'होम (Home)' : language === 'ta' ? 'முகப்பு (Home)' : 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 w-full min-h-[60px] bg-sky-600 hover:bg-sky-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <CheckCircle className="w-6 h-6 text-white" />
              <span>{t.register.noEmergencyConfirm}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Patient Name */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                PATIENT INFO
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
                {t.register.step2Title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                {t.register.step2Subtitle}
              </p>
            </div>
            <button
              onClick={() => handleReadStep(`${t.register.step2Title}. ${t.register.step2Subtitle}`)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700"
              aria-label="Read step"
            >
              <Volume2 className="w-6 h-6 text-sky-600" />
            </button>
          </div>

          {/* Caregiver Guide on Step 4 */}
          {assistedMode && (
            <div className="bg-amber-100 border-2 border-amber-400 p-4 rounded-2xl flex items-start gap-3 text-amber-950 font-bold text-sm sm:text-base">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="font-extrabold uppercase text-xs tracking-wider text-amber-900">
                  {language === 'hi' ? 'सहायक निर्देश (Caregiver Tip):' : language === 'ta' ? 'உதவியாளர் குறிப்பு:' : 'Caregiver Guidance Tip:'}
                </div>
                <div>
                  {language === 'hi'
                    ? 'मरीज या अपना मोबाइल नंबर दर्ज करें ताकि टोकन का एसएमएस आ सके। यदि फोन नहीं है तो सीधे आगे बढ़ें।'
                    : language === 'ta'
                    ? 'டோக்கன் குறுஞ்செய்தி பெற மொபைல் எண்ணை உள்ளிடவும். போன் இல்லையென்றால் அடுத்த படிக்கு செல்லலாம்.'
                    : 'Enter patient or helper mobile number for SMS alerts. If no phone, tap Next to skip.'}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.register.namePlaceholder}
                className="w-full min-h-[64px] text-lg sm:text-2xl font-bold px-5 pr-20 rounded-2xl border-2 border-slate-300 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 outline-none text-slate-900"
                autoFocus
              />

              {/* Big Microphone button inside input */}
              <button
                type="button"
                onClick={handleMicClick}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                }`}
                title="Speak Patient Name"
                aria-label="Speak Patient Name"
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>

            {/* If patient or attendant typed/spoke their real name: Audio Confirmation Bar */}
            {formData.name.trim().length > 0 && (
              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                  <span className="text-xl flex-shrink-0">🔊</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-emerald-800 block">
                      {language === 'hi' ? 'पुष्टि के लिए नाम सुनें:' : 'Hear Name Confirmation:'}
                    </span>
                    <span className="font-black text-sm sm:text-base text-emerald-950 truncate block">
                      "{formData.name}"
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const spokenNamePrompt = language === 'hi'
                        ? `मरीज का नाम दर्ज हुआ: ${formData.name}। पुष्टि करने के लिए हरा बटन दबाएं।`
                        : language === 'ta'
                        ? `நோயாளி பெயர்: ${formData.name}. உறுதிப்படுத்தவும்.`
                        : `Patient name recorded: ${formData.name}.`;
                      speakText(spokenNamePrompt, language);
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'hi' ? 'बोलकर सुनें' : 'Read Aloud'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1 shadow-sm active:scale-95"
                  >
                    <span>✓ {language === 'hi' ? 'नाम सही है' : 'Confirm'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dedicated High-Visibility Voice Input Bar */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`w-full min-h-[58px] rounded-2xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 ${
                isListening
                  ? 'bg-red-600 text-white border-red-700 animate-pulse'
                  : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white border-sky-400'
              }`}
            >
              <Mic className="w-5 h-5 text-white" />
              <span>
                {language === 'hi'
                  ? '🎙️ बोलकर नाम बताएं (माइक चालू करें)'
                  : language === 'ta'
                  ? '🎙️ பேச தொடங்குங்கள் (குரல் பதிவு)'
                  : '🎙️ Tap to Speak Patient Name (Voice Assistant)'}
              </span>
            </button>

            {/* Illiterate Patient / No-Mic Fast-Track Assisted Option */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🤝</span>
                <div>
                  <h4 className="font-black text-amber-950 text-sm">
                    {language === 'hi'
                      ? 'यदि माइक या कीबोर्ड काम नहीं कर रहा?'
                      : language === 'ta'
                      ? 'மைக் வேலை செய்யவில்லையா?'
                      : 'Microphone not working or illiterate patient?'}
                  </h4>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    {language === 'hi'
                      ? 'बिना नाम लिखे सीधे सहायता टोकन लें। अस्पताल काउंटर 1 पर आपका नाम पंजीकृत किया जाएगा।'
                      : 'Get a Fast-Track Assisted Token. Hospital Desk 1 will register your name in person.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const assistedName = language === 'hi'
                    ? 'ओपीडी मरीज (सहायता काउंटर 1)'
                    : language === 'ta'
                    ? 'ஓபிடி நோயாளி'
                    : 'OPD Patient (Desk 1 Assistance)';
                  setFormData(prev => ({ ...prev, name: assistedName }));
                  const speakMsg = language === 'hi'
                    ? 'आपका सहायता टोकन तैयार किया जा रहा है। काउंटर नंबर 1 पर आपका नाम लिखा जाएगा।'
                    : 'Assisted token prepared. Desk 1 will register your details.';
                  speakText(speakMsg, language);
                  setTimeout(() => {
                    handleNext();
                  }, 600);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
              >
                <span>🤝 {language === 'hi' ? 'सहायता टोकन बनाएं (1-टच)' : 'Get Assisted Token'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Helpful Speech Instructions for Speaking Name */}
            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
              <span className="text-2xl flex-shrink-0">🎙️</span>
              <div className="space-y-1 text-xs sm:text-sm">
                <h4 className="font-black text-sky-950">
                  {language === 'hi'
                    ? 'बोलकर अपना नाम दर्ज करें (Voice Input)'
                    : language === 'ta'
                    ? 'குரல் மூலம் உங்கள் பெயரை பேசுங்கள்'
                    : 'Speak Your Own Name (Voice Input)'}
                </h4>
                <p className="text-sky-900 font-medium leading-relaxed">
                  {language === 'hi'
                    ? 'माइक बटन दबाएं और अपना नाम साफ बोलें। मरीज का बोला गया नाम अपने आप लिख जाएगा। किसी भी कीबोर्ड की आवश्यकता नहीं है।'
                    : language === 'ta'
                    ? 'மைக் பொத்தானை அழுத்தி உங்கள் பெயரை தெளிவாகக் கூறுங்கள். உங்கள் குரல் தானாகவே பெயராக பதிவு செய்யப்படும்.'
                    : 'Tap the mic button and speak your name clearly. Your spoken words will be typed automatically into the box.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Age & Gender */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                PATIENT INFO
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
                {t.register.step3Title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                {t.register.step3Subtitle}
              </p>
            </div>
            <button
              onClick={() => handleReadStep(`${t.register.step3Title}. ${t.register.step3Subtitle}`)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700"
              aria-label="Read step"
            >
              <Volume2 className="w-6 h-6 text-sky-600" />
            </button>
          </div>

          {/* Caregiver Guide on Step 3 */}
          {assistedMode && (
            <div className="bg-amber-100 border-2 border-amber-400 p-4 rounded-2xl flex items-start gap-3 text-amber-950 font-bold text-sm sm:text-base">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="font-extrabold uppercase text-xs tracking-wider text-amber-900">
                  {language === 'hi' ? 'सहायक निर्देश (Caregiver Tip):' : language === 'ta' ? 'உதவியாளர் குறிப்பு:' : 'Caregiver Guidance Tip:'}
                </div>
                <div>
                  {language === 'hi'
                    ? 'मरीज की उम्र दर्ज करें और नीचे दिए गए बड़े बटनों से लिंग चुनें।'
                    : language === 'ta'
                    ? 'நோயாளியின் வயதை உள்ளிட்டு கீழே உள்ள பெரிய பொத்தான்களில் பாலினத்தை தேர்ந்தெடுக்கவும்.'
                    : 'Enter the patient age and select their gender using the large touch cards.'}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Age input with Voice Button */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">
                {t.register.ageLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder={t.register.agePlaceholder}
                  className="w-full min-h-[64px] text-xl sm:text-3xl font-black px-5 pr-20 rounded-2xl border-2 border-slate-300 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 outline-none text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => startVoiceCapture(3)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                  }`}
                  title="Speak Age aloud"
                  aria-label="Speak Age aloud"
                >
                  <Mic className="w-6 h-6" />
                </button>
              </div>

              {/* 1-Touch Quick Age Selection for Illiterate / Non-Typing Patients */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  {language === 'hi' ? '1-टच में उम्र चुनें (Touch Age Category):' : '1-Touch Age Range Selection:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '🧒 बच्चे (0-14)', val: '8', tip: '8 साल' },
                    { label: '🧑 युवा (15-30)', val: '24', tip: '24 साल' },
                    { label: '👨 प्रौढ़ (31-59)', val: '45', tip: '45 साल' },
                    { label: '👵 वरिष्ठ (60+)', val: '65', tip: '65 साल' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, age: item.val }));
                        speakText(`उम्र: ${item.tip}`, language);
                      }}
                      className={`py-2 px-2.5 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center justify-center ${
                        formData.age === item.val
                          ? 'bg-sky-100 border-sky-600 text-sky-950 ring-2 ring-sky-300 font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Gender selection */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">
                {t.register.genderLabel}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'female', label: t.register.female, icon: '👩' },
                  { id: 'male', label: t.register.male, icon: '👨' },
                  { id: 'other', label: t.register.other, icon: '🧑' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g.id })}
                    className={`min-h-[64px] p-3 rounded-2xl border-2 font-bold text-sm sm:text-base flex flex-col items-center justify-center gap-1 transition-all ${
                      formData.gender === g.id
                        ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-md ring-2 ring-sky-400'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Mobile Number (Optional) */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                SMS ALERTS
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
                {t.register.step4Title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                {t.register.step4Subtitle}
              </p>
            </div>
            <button
              onClick={() => handleReadStep(`${t.register.step4Title}. ${t.register.step4Subtitle}`)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700"
              aria-label="Read step"
            >
              <Volume2 className="w-6 h-6 text-sky-600" />
            </button>
          </div>

          {/* Caregiver Guide on Step 4 */}
          {assistedMode && (
            <div className="bg-amber-100 border-2 border-amber-400 p-4 rounded-2xl flex items-start gap-3 text-amber-950 font-bold text-sm sm:text-base">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="font-extrabold uppercase text-xs tracking-wider text-amber-900">
                  {language === 'hi' ? 'सहायक निर्देश (Caregiver Tip):' : language === 'ta' ? 'உதவியாளர் குறிப்பு:' : 'Caregiver Guidance Tip:'}
                </div>
                <div>
                  {language === 'hi'
                    ? 'मरीज या अपना मोबाइल नंबर दर्ज करें ताकि टोकन का एसएमएस आ सके। यदि फोन नहीं है तो सीधे आगे बढ़ें।'
                    : language === 'ta'
                    ? 'டோக்கன் குறுஞ்செய்தி பெற மொபைல் எண்ணை உள்ளிடவும். போன் இல்லையென்றால் அடுத்த படிக்கு செல்லலாம்.'
                    : 'Enter patient or helper mobile number for SMS alerts. If no phone, tap Next to skip.'}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                +91
              </span>
              <input
                type="tel"
                maxLength="10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder={t.register.phonePlaceholder}
                className="w-full min-h-[64px] text-lg sm:text-2xl font-bold pl-16 pr-4 rounded-2xl border-2 border-slate-300 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 outline-none text-slate-900"
              />
            </div>

            {/* Informational Callout: Optional Phone & Patient ID for Future Logins */}
            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
              <span className="text-2xl flex-shrink-0">🆔</span>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="font-extrabold text-sky-950 flex items-center gap-1.5">
                  <span>
                    {language === 'hi'
                      ? 'फोन नंबर वैकल्पिक है • भविष्य में लॉगिन के लिए पेशेंट आईडी (Patient ID)'
                      : language === 'ta'
                      ? 'மொபைல் எண் விருப்பத்திற்குரியது • எதிர்கால நுழைவுக்கு நோயாளி ஐடி'
                      : 'Phone Number is Optional • Future Login via Patient ID'}
                  </span>
                </div>
                <p className="text-sky-900 font-medium leading-relaxed">
                  {language === 'hi'
                    ? 'यदि फोन नंबर नहीं है तो आप इसे छोड़ सकते हैं (Skip)। रजिस्ट्रेशन पूरा होते ही आपको एक परमानेंट Patient ID (जैसे OPD-10245) मिलेगी। अगली बार जब भी आप अस्पताल आएंगे, आप सीधे अपनी Patient ID से बिना फॉर्म भरे 1-टच में लॉगिन कर सकेंगे!'
                    : language === 'ta'
                    ? 'போன் எண் இல்லாவிட்டாலும் நேரடியாக அடுத்த படிக்கு செல்லலாம். பதிவின் முடிவில் உங்களுக்கு ஒரு நிலையான Patient ID (எ.கா: OPD-10245) வழங்கப்படும். அடுத்த முறை மருத்துவமனை வரும்போது இந்த ஐடி மூலம் எளிதாக 1-டச்சில் உள்நுழையலாம்!'
                    : 'Entering a phone number is completely optional for SMS alerts. Upon registration, you will receive a permanent Patient ID (e.g. OPD-10245) on your slip. For any future visits, you can log in instantly at any kiosk using your Patient ID without filling forms again!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Doctor / Problem Selection (Picture Cards) */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                DEPARTMENT SELECTION
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
                {t.register.step5Title}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                {t.register.step5Subtitle}
              </p>
            </div>
            <button
              onClick={() => handleReadStep(`${t.register.step5Title}. ${t.register.step5Subtitle}`)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700"
              aria-label="Read step"
            >
              <Volume2 className="w-6 h-6 text-sky-600" />
            </button>
          </div>

          {/* Caregiver Guide on Step 5 */}
          {assistedMode && (
            <div className="bg-amber-100 border-2 border-amber-400 p-4 rounded-2xl flex items-start gap-3 text-amber-950 font-bold text-sm sm:text-base">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="font-extrabold uppercase text-xs tracking-wider text-amber-900">
                  {language === 'hi' ? 'सहायक निर्देश (Caregiver Tip):' : language === 'ta' ? 'உதவியாளர் குறிப்பு:' : 'Caregiver Guidance Tip:'}
                </div>
                <div>
                  {language === 'hi'
                    ? 'मरीज को चित्र कार्ड दिखाएं। किसी भी कार्ड की आवाज सुनने के लिए "सुनें" दबाएं। समझ न आए तो नीचे सहायता केंद्र (Help Desk) चुनें।'
                    : language === 'ta'
                    ? 'நோயாளியிடம் பட அட்டைகளைக் காட்டவும். குரல் கேட்க "கேட்க" பொத்தானை அழுத்தவும். தெரியாவிட்டால் கீழே உள்ள உதவி மையத்தை தேர்ந்தெடுக்கவும்.'
                    : 'Show picture cards to the patient. Tap "Listen" on any card to hear symptoms aloud. If unsure, tap "Help Desk" below.'}
                </div>
              </div>
            </div>
          )}

          {/* Voice Symptom Picker Button */}
          <button
            type="button"
            onClick={() => startVoiceCapture(5)}
            className={`w-full min-h-[56px] rounded-2xl border-2 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md ${
              isListening
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 border-amber-300'
            }`}
          >
            <Mic className="w-5 h-5 text-slate-950" />
            <span>
              {language === 'hi'
                ? '🎙️ बोलकर बीमारी बताएं (जैसे: बुखार, खांसी, या हड्डी में दर्द)'
                : language === 'ta'
                ? '🎙️ உடல்நலக் கோளாறை பேசுங்கள் (காய்ச்சல், இருமல், எலும்பு வலி)'
                : '🎙️ Speak your symptom (e.g., fever, cough, joint pain)'}
            </span>
          </button>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DEPARTMENTS.map((dept) => (
              <SymptomCard
                key={dept.id}
                department={dept}
                isSelected={formData.departmentId === dept.id}
                onSelect={() => setFormData({ ...formData, departmentId: dept.id })}
              />
            ))}
          </div>

          {/* Not Sure? Ask Help Desk Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/find-place?to=ground_help_desk')}
              className="w-full p-4 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-sm sm:text-base flex items-center justify-between gap-2 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-left">
                <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <div>{t.register.notSureHelpDesk}</div>
                  <div className="text-xs text-amber-800 font-normal">{t.register.helpDeskGuide}</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-700 flex-shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons (Back & Next) - Height >= 56px */}
      {step > 1 && (
        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[56px] px-6 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-base flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.buttons.back}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[56px] px-8 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-sky-200 transition-transform active:scale-[0.98]"
          >
            <span>{step === 5 ? t.buttons.submit : t.buttons.next}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* FULL VOICE LISTENING & ACCESSIBILITY MODAL */}
      {voiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border-3 border-sky-500 shadow-2xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => {
                stopVoiceCapture();
                setVoiceModalOpen(false);
              }}
              className="absolute right-4 top-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition-transform active:scale-95"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Voice Status Header */}
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                🎙️ {language === 'hi' ? 'आवाज सहायक (Voice Assistant)' : language === 'ta' ? 'குரல் உதவி' : 'Voice Assistant'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {listeningStep === 2
                  ? (language === 'hi' ? 'मरीज का नाम बोलें' : language === 'ta' ? 'நோயாளியின் பெயரை பேசுங்கள்' : "Speak Patient's Name")
                  : listeningStep === 3
                  ? (language === 'hi' ? 'मरीज की उम्र बोलें (जैसे: 62 वर्ष)' : "Speak Patient's Age")
                  : (language === 'hi' ? 'अपनी बीमारी या डॉक्टर बताएं' : "Speak Your Symptoms")}
              </h3>
            </div>

            {/* Language Selection for Speech Recognition */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-[11px] font-black text-slate-500 uppercase">
                {language === 'hi' ? 'बोलने की भाषा:' : 'Speech Language:'}
              </span>
              {[
                { code: 'hi-IN', label: 'हिंदी' },
                { code: 'en-IN', label: 'English' },
                { code: 'ta-IN', label: 'தமிழ்' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setVoiceLang(lang.code);
                    startVoiceCapture(listeningStep, lang.code);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    voiceLang === lang.code
                      ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Animated Microphone or Error Display */}
            {!micError ? (
              <div className="space-y-4">
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-red-500/30 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-xl shadow-red-200">
                    <Mic className="w-10 h-10 animate-bounce" />
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 min-h-[72px] flex items-center justify-center">
                  {liveTranscript ? (
                    <span className="text-xl sm:text-2xl font-black text-sky-900 break-words">
                      "{liveTranscript}"
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-500 animate-pulse">
                      {language === 'hi'
                        ? 'बोलिए, हम सुन रहे हैं...'
                        : language === 'ta'
                        ? 'பேசுங்கள், கேட்கிறது...'
                        : 'Listening... Please speak your name clearly'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    stopVoiceCapture();
                    setVoiceModalOpen(false);
                  }}
                  className="w-full min-h-[50px] bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
                >
                  {language === 'hi' ? '✓ हो गया (Confirm & Continue)' : '✓ Confirm & Continue'}
                </button>
              </div>
            ) : (
              /* Accessible Fail-Safe Voice Fallback: Empathetic, Illiterate-Friendly, Zero-Dead-End */
              <div className="space-y-4 text-left bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {micError === 'PERMISSION_DENIED' ? '🔒' : micError === 'DEVICE_NOT_FOUND' ? '🎙️' : '⚠️'}
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-black text-amber-950 text-sm sm:text-base">
                      {micError === 'PERMISSION_DENIED'
                        ? (language === 'hi' ? 'माइक्रोफोन की अनुमति बंद है (Microphone Blocked)' : 'Microphone Access Blocked')
                        : micError === 'DEVICE_NOT_FOUND'
                        ? (language === 'hi' ? 'माइक्रोफोन हार्डवेयर नहीं मिला (No Mic Found)' : 'No Microphone Device Detected')
                        : micError === 'NETWORK_ERROR'
                        ? (language === 'hi' ? 'गूगल स्पीच नेटवर्क ऑफलाइन (Speech Offline)' : 'Speech Network Offline')
                        : (language === 'hi' ? 'माइक कनेक्ट नहीं हो सका (Mic Unavailable)' : 'Microphone Unavailable')}
                    </h4>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      {micError === 'PERMISSION_DENIED' ? (
                        language === 'hi'
                          ? 'ब्राउज़र एड्रेस बार में 🔒 या 🎛️ (Site Settings) आइकन पर क्लिक करके Microphone को "Allow" (अनुमति दें) करें।'
                          : 'Microphone is blocked. Click the lock 🔒 or site settings icon in the top browser address bar and set Microphone to "Allow".'
                      ) : micError === 'DEVICE_NOT_FOUND' ? (
                        language === 'hi'
                          ? 'आपके कंप्यूटर/लैपटॉप में माइक कनेक्टेड नहीं है। कोई समस्या नहीं! आप नीचे मरीज का नाम लिखवा सकते हैं या 1-टच में सहायता टोकन ले सकते हैं।'
                          : 'No microphone was detected on your device. You can enter the patient name below or get an assisted token.'
                      ) : (
                        language === 'hi'
                          ? 'स्पीच सेवा उपलब्ध नहीं है। आप नीचे सीधे नाम दर्ज कर सकते हैं या 1-टच सहायता टोकन ले सकते हैं।'
                          : 'Speech recognition is offline. You can enter your name below or get an assisted token.'
                      )}
                    </p>
                  </div>
                </div>

                {/* Direct Patient Name Input with Instant Audio Readback */}
                {listeningStep === 2 && (
                  <div className="pt-3 border-t-2 border-amber-200/80 space-y-2.5">
                    <label className="text-xs font-black text-amber-950 uppercase tracking-wide block">
                      {language === 'hi' ? '✍️ अपना वास्तविक नाम यहाँ दर्ज करें:' : '✍️ Enter Patient Name Directly:'}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={language === 'hi' ? 'मरीज का नाम दर्ज करें' : 'Enter patient name'}
                      className="w-full p-3 rounded-xl border-2 border-amber-400 bg-white font-black text-base text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                      autoFocus
                    />

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {/* Hear Spoken Name */}
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.name.trim()) {
                            const spokenFeedback = language === 'hi'
                              ? `मरीज का नाम: ${formData.name}। पुष्टि के लिए सेव बटन दबाएं।`
                              : `Patient name: ${formData.name}. Tap save to confirm.`;
                            speakText(spokenFeedback, language);
                          } else {
                            speakText(language === 'hi' ? 'कृपया पहले नाम दर्ज करें।' : 'Please enter a name first.', language);
                          }
                        }}
                        className="flex-1 py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-amber-300"
                      >
                        <Volume2 className="w-4 h-4 text-amber-800" />
                        <span>{language === 'hi' ? '🔊 नाम बोलकर सुनें' : '🔊 Read Aloud'}</span>
                      </button>

                      {/* Save Name & Advance */}
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.name.trim()) {
                            speakText(language === 'hi' ? `नाम दर्ज किया गया: ${formData.name}` : `Name recorded: ${formData.name}`, language);
                            setVoiceModalOpen(false);
                            handleNext();
                          } else {
                            speakText(language === 'hi' ? 'कृपया नाम दर्ज करें या सहायता टोकन चुनें।' : 'Please enter a name or choose assisted token.', language);
                          }
                        }}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>{language === 'hi' ? '✓ नाम सहेजें व आगे बढ़ें' : '✓ Save & Continue'}</span>
                      </button>
                    </div>

                    {/* Fast-Track 1-Touch Assisted Token for Illiterate Patients */}
                    <div className="pt-2 border-t border-amber-200">
                      <button
                        type="button"
                        onClick={() => {
                          const assistedName = language === 'hi'
                            ? 'ओपीडी मरीज (सहायता काउंटर 1)'
                            : language === 'ta'
                            ? 'ஓபிடி நோயாளி'
                            : 'OPD Patient (Desk 1 Assistance)';
                          setFormData(prev => ({ ...prev, name: assistedName }));
                          const speakMsg = language === 'hi'
                            ? 'आपका सहायता टोकन तैयार किया जा रहा है। काउंटर नंबर 1 पर आपका नाम लिखा जाएगा।'
                            : 'Assisted token prepared. Desk 1 will register your details.';
                          speakText(speakMsg, language);
                          setVoiceModalOpen(false);
                          setTimeout(() => {
                            handleNext();
                          }, 500);
                        }}
                        className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <span>🤝 {language === 'hi' ? 'निरक्षर मरीज: 1-टच सहायता टोकन बनाएं' : 'Illiterate Patient: Get Assisted Token'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional Action Buttons: Retry Permission or Close */}
                <div className="space-y-2 pt-2 border-t border-amber-200">
                  {micError === 'PERMISSION_DENIED' && (
                    <button
                      type="button"
                      onClick={requestMicPermission}
                      className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-md text-center transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Mic className="w-4 h-4 text-white" />
                      <span>{language === 'hi' ? '🔓 माइक की अनुमति दोबारा मांगें' : '🔓 Request Microphone Permission Again'}</span>
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceModalOpen(false);
                        startVoiceCapture(listeningStep);
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center active:scale-98 transition-colors"
                    >
                      🔄 {language === 'hi' ? 'दोबारा कोशिश करें' : 'Try Mic Again'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopVoiceCapture();
                        setVoiceModalOpen(false);
                      }}
                      className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl text-center active:scale-98 transition-colors"
                    >
                      ✕ {language === 'hi' ? 'मोडल बंद करें' : 'Close Window'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
