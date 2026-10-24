import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CurrentVisitCard from '../components/CurrentVisitCard';
import HospitalJourneyStepper from '../components/HospitalJourneyStepper';
import {
  Ticket,
  Clock,
  HeartPulse,
  FileText,
  Navigation,
  Volume2,
  Sparkles,
  ShieldCheck,
  User,
  ArrowRight,
  LogOut,
  Sliders,
  CheckCircle2,
  Phone,
  Eye
} from 'lucide-react';
import { speakText, playClickBeep } from '../utils/tts';

export default function PatientDashboardPage() {
  const {
    currentAccount,
    currentPatient,
    hasRegistered,
    assistedMode,
    setAssistedMode,
    elderlyMode,
    setElderlyMode,
    language,
    t
  } = useApp();

  const navigate = useNavigate();

  if (!hasRegistered || !currentAccount) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md space-y-4">
          <div className="text-5xl">👤</div>
          <h2 className="text-2xl font-black text-slate-900">
            {language === 'hi' ? 'पहले पंजीकरण करें (Register First)' : 'Please Register First'}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {language === 'hi'
              ? 'आपने अभी तक पंजीकरण नहीं किया है। कृपया पहले नया ओपीडी पर्चा बनाएं या पुराने मरीज के रूप में पहचान करें।'
              : 'You have not registered an OPD visit yet. Please register first or identify yourself as a returning patient.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95"
            >
              {language === 'hi' ? '📝 नया पर्चा बनाएं (Register)' : '📝 New OPD Registration'}
            </button>
            <button
              onClick={() => navigate('/returning-patient')}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95"
            >
              {language === 'hi' ? 'पुराने मरीज पहचान (Login)' : 'Returning Patient Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const account = currentAccount;

  const handleVoiceDashboard = () => {
    playClickBeep();
    const msg = language === 'hi'
      ? `नमस्ते ${account.name} जी! यह आपका मरीज डैशबोर्ड है। आप नया टोकन ले सकते हैं, कतार देख सकते हैं, या पुराने स्वास्थ्य रिकॉर्ड देख सकते हैं।`
      : `Hello ${account.name}! This is your Patient Dashboard. You can generate a new token, check your queue, or review your health records.`;
    speakText(msg, language);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Top Greeting & Patient Identity Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 border border-white/20 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'सत्यापित मरीज खाता • Verified Patient Profile' : 'Verified Patient Account'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              👋 {language === 'hi' ? `नमस्ते, ${account.name} जी` : `Namaste, ${account.name}`}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm text-sky-200 font-semibold">
              <span className="bg-sky-500/30 text-white border border-sky-400/40 px-3 py-1 rounded-xl font-extrabold tracking-wide">
                Patient ID: {account.id}
              </span>
              <span>• {account.age} yrs</span>
              <span>• {account.gender === 'female' ? (language === 'hi' ? 'महिला' : 'Female') : (language === 'hi' ? 'पुरुष' : 'Male')}</span>
              <span>• 📞 {account.phone}</span>
            </div>
          </div>

          {/* Quick Voice Assistant button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoiceDashboard}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg transition-transform"
            >
              <Volume2 className="w-5 h-5 text-slate-950" />
              <span>{language === 'hi' ? 'डैशबोर्ड सुनें' : 'Listen Guide'}</span>
            </button>

            <button
              onClick={() => navigate('/returning-patient')}
              className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-colors"
              title="Switch Patient"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* CONSULTATION COMPLETED CELEBRATION CALLOUT */}
      {currentPatient?.status === 'completed' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-yellow-300 flex items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-emerald-950 flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-md">
              ✓
            </div>
            <div className="space-y-0.5">
              <span className="bg-yellow-300 text-emerald-950 text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full">
                {language === 'hi' ? 'यात्रा सम्पन्न • JOURNEY COMPLETED' : 'JOURNEY COMPLETED'}
              </span>
              <h3 className="text-lg sm:text-xl font-black mt-1">
                {language === 'hi' ? 'अस्पताल यात्रा सफलतापूर्वक सम्पन्न हो गई है!' : 'Hospital Visit Journey Completed!'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-semibold">
                {language === 'hi'
                  ? 'डॉक्टर परामर्श पूर्ण हो चुका है। अस्पताल यात्रा के सभी 6 चरण पूरे हो चुके हैं।'
                  : 'Doctor consultation completed. All 6 stages of your visit are finished.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/health-records')}
            className="hidden sm:flex px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs sm:text-sm items-center gap-1.5 shadow-md hover:bg-emerald-50 flex-shrink-0"
          >
            <span>🩺</span>
            <span>{language === 'hi' ? 'पर्चा देखें' : 'View Records'}</span>
          </button>
        </div>
      )}

      {/* FEATURE 11: CURRENT ACTIVE VISIT CARD (IF TOKEN GENERATED) */}
      {currentPatient && (
        <div className="space-y-4">
          <CurrentVisitCard patient={currentPatient} />
        </div>
      )}

      {/* FEATURE 10: WHAT DO YOU WANT TO DO? (LARGE ACCESSIBLE BUTTONS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>👉</span>
            <span>{language === 'hi' ? 'आज आप क्या करना चाहते हैं?' : 'What do you want to do?'}</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            {language === 'hi' ? 'किसी भी बड़े बटन को दबाएं' : 'Select any option below'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Generate New Token / Repeat Visit */}
          <button
            onClick={() => {
              playClickBeep();
              navigate('/returning-patient');
            }}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-left shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">🎫</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                1-TAP VISIT
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {language === 'hi' ? 'नया टोकन प्राप्त करें' : 'Generate New Token'}
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                {language === 'hi' ? 'दोबारा अस्पताल पर्चा (Repeat Visit)' : 'Repeat hospital visit without typing'}
              </p>
            </div>
          </button>

          {/* 2. Check Queue (My Turn) */}
          <button
            onClick={() => {
              playClickBeep();
              navigate('/my-turn');
            }}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-left shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">⏱️</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                LIVE STATUS
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {language === 'hi' ? 'लाइव कतार देखें' : 'Check Queue'}
              </h3>
              <p className="text-xs text-sky-100 mt-1">
                {language === 'hi' ? 'देखें कितने मरीज आगे हैं' : 'Live turn tracking & wait estimation'}
              </p>
            </div>
          </button>

          {/* 3. My Health Records */}
          <button
            onClick={() => {
              playClickBeep();
              navigate('/health-records');
            }}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white text-left shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">🩺</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                DIGITAL RECORDS
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {language === 'hi' ? 'मेरे स्वास्थ्य रिकॉर्ड' : 'My Health Records'}
              </h3>
              <p className="text-xs text-indigo-100 mt-1">
                {language === 'hi' ? 'पुरानी दवाएं, जांच रिपोर्ट व डॉक्टर सलाह' : 'Lab reports, prescriptions & doctor advice'}
              </p>
            </div>
          </button>

          {/* 4. Previous Visits */}
          <button
            onClick={() => {
              playClickBeep();
              navigate('/health-records');
            }}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-800 hover:from-teal-600 hover:to-cyan-700 text-white text-left shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">📋</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                HISTORY
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {language === 'hi' ? 'पिछली अस्पताल मुलाकातें' : 'Previous Visits'}
              </h3>
              <p className="text-xs text-teal-100 mt-1">
                {language === 'hi' ? '12 Oct 2026, 05 Aug 2026, 18 May 2026' : '3 completed OPD visits recorded'}
              </p>
            </div>
          </button>

          {/* 5. Find Department (Hospital Navigation) */}
          <button
            onClick={() => {
              playClickBeep();
              navigate('/find-place');
            }}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white text-left shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">🗺️</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                NAVIGATION
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {language === 'hi' ? 'कमरा / विभाग का रास्ता' : 'Find Department'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'hi' ? 'कदम-दर-कदम नक्शा और निर्देश' : 'Step-by-step hospital floor directions'}
              </p>
            </div>
          </button>

          {/* 6. Assistant Mode / Low Digital Literacy */}
          <button
            onClick={() => {
              playClickBeep();
              setAssistedMode(!assistedMode);
            }}
            className={`p-5 sm:p-6 rounded-3xl text-left shadow-lg active:scale-95 transition-all flex flex-col justify-between min-h-[140px] border-2 ${
              assistedMode
                ? 'bg-amber-400 text-slate-950 border-amber-500 ring-4 ring-amber-200'
                : 'bg-white text-slate-900 border-slate-300 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">🔊</span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                assistedMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                {assistedMode ? 'ACTIVE' : 'TOGGLE'}
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {language === 'hi' ? 'सहायता मोड (Assistant Mode)' : 'Assistant Mode'}
              </h3>
              <p className={`text-xs mt-1 ${assistedMode ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                {assistedMode
                  ? (language === 'hi' ? 'आवाज व बड़े अक्षर चालू हैं' : 'Voice guidance & big text ON')
                  : (language === 'hi' ? 'कम पढ़े-लिखे मरीजों के लिए आवाज सहायता' : 'Voice & step-by-step guidance')}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* FEATURE 9: ACCESSIBILITY & ELDERLY MODE TOGGLE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">👵</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-950">
              {language === 'hi' ? 'बुजुर्ग सहायता मोड (Elderly Mode)' : 'Elderly-Friendly Accessibility Mode'}
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 mt-0.5">
              {language === 'hi'
                ? 'बड़े बटन, बड़ा फॉन्ट साइज, ज्यादा जगह और सरल नेविगेशन ताकि बुजुर्ग आसानी से इस्तेमाल कर सकें।'
                : 'Enlarges font size, buttons, and spacing for high readability and comfort.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClickBeep();
            setElderlyMode(!elderlyMode);
          }}
          className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 flex-shrink-0 ${
            elderlyMode
              ? 'bg-amber-600 text-white ring-2 ring-amber-400'
              : 'bg-white text-amber-950 border-2 border-amber-400 hover:bg-amber-100'
          }`}
        >
          <span>{elderlyMode ? '✓ ON (सक्रिय)' : 'Turn ON'}</span>
        </button>
      </div>

      {/* FEATURE 12: HOSPITAL JOURNEY STEPPER */}
      <HospitalJourneyStepper
        currentStage={
          currentPatient?.status === 'completed'
            ? 'completed'
            : currentPatient?.status === 'serving'
            ? 'doctor'
            : 'queue'
        }
      />
    </div>
  );
}
