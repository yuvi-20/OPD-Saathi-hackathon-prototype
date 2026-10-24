import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Languages,
  Check,
  Sparkles,
  ArrowRight,
  Siren,
  UserCheck,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { speakText, playChime } from '../utils/tts';

export default function SelectLanguagePage() {
  const { setLanguage, language, setEmergencyModalOpen } = useApp();
  const navigate = useNavigate();

  const languageOptions = [
    {
      code: 'hi',
      name: 'हिंदी',
      greeting: 'नमस्ते',
      sublabel: 'ओपीडी पर्चा व पंजीकरण शुरू करें',
      voice: 'नमस्ते! ओपीडी साथी में आपका स्वागत है। पंजीकरण के लिए आगे बढ़ रहे हैं।',
      flag: '🇮🇳',
      color: 'from-amber-500 via-orange-500 to-amber-600',
      badge: '1-टच में पंजीकरण'
    },
    {
      code: 'en',
      name: 'English',
      greeting: 'Welcome',
      sublabel: 'Start OPD token & registration',
      voice: 'Welcome to OPD Saathi. Proceeding to registration.',
      flag: '🌐',
      color: 'from-sky-600 via-blue-600 to-indigo-700',
      badge: '1-Tap Registration'
    },
    {
      code: 'ta',
      name: 'தமிழ்',
      greeting: 'வணக்கம்',
      sublabel: 'ஓபிடி சீட்டு மற்றும் பதிவு தொடங்கவும்',
      voice: 'வணக்கம்! ஓபிடி சாதிக்கு வரவேற்கிறோம். பதிவுக்கு செல்லவும்.',
      flag: '🇮🇳',
      color: 'from-teal-600 via-emerald-600 to-cyan-700',
      badge: 'ஓபிடி பதிவு'
    }
  ];

  const handleSelectLanguage = (code, voiceText) => {
    setLanguage(code);
    playChime();
    speakText(voiceText, code);
    // User requested: application should open with language first, then go to register page!
    navigate('/register');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Hospital Identity Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-900 border border-sky-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-sm">
          <Sparkles className="w-4 h-4 text-sky-700" />
          <span>Government of National Capital Region • OPD Saathi</span>
        </div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-sky-200">
          <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 fill-current">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          नगर जिला अस्पताल • City District Hospital
        </h1>

        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 max-w-lg mx-auto shadow-sm">
          <p className="text-base sm:text-lg font-black text-sky-950">
            कृपया अपनी पसंदीदा भाषा चुनें
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
            Choose Your Language • உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்
          </p>
        </div>
      </div>

      {/* 3 Big Accessible Language Cards */}
      <div className="space-y-3.5 sm:space-y-4">
        {languageOptions.map((item) => (
          <button
            key={item.code}
            onClick={() => handleSelectLanguage(item.code, item.voice)}
            className={`w-full min-h-[88px] sm:min-h-[96px] p-4 sm:p-5 rounded-3xl border-3 flex items-center justify-between text-left transition-all transform active:scale-[0.98] shadow-md hover:shadow-xl bg-white ${
              language === item.code
                ? 'border-sky-600 ring-4 ring-sky-200'
                : 'border-slate-300 hover:border-sky-400'
            }`}
          >
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="text-3xl sm:text-4xl flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shadow-inner">
                {item.flag}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {item.name}
                  </h2>
                  <span className="text-xs font-bold text-slate-500 hidden xs:inline">
                    ({item.greeting})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5 truncate">
                  {item.sublabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="hidden sm:inline-block bg-sky-100 text-sky-900 text-xs font-black px-3 py-1.5 rounded-full border border-sky-200">
                {item.badge}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Alternatives: Returning Patient Login & Emergency */}
      <div className="space-y-3 pt-2">
        {/* Returning Patient Option */}
        <button
          onClick={() => navigate('/returning-patient')}
          className="w-full min-h-[56px] p-4 rounded-2xl border-2 border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-sm transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5 text-left">
            <UserCheck className="w-5 h-5 text-teal-700 flex-shrink-0" />
            <div>
              <span className="block font-black text-sm">
                पहले आ चुके हैं? मरीज आईडी (Patient ID) से लॉगिन करें
              </span>
              <span className="block text-[11px] text-teal-800 font-semibold">
                Already visited? Repeat visit with Patient ID (No form needed)
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-teal-700 flex-shrink-0" />
        </button>

        {/* Emergency Shortcut */}
        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="w-full min-h-[50px] p-3 rounded-2xl border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Siren className="w-4 h-4 text-red-600 animate-bounce" />
          <span>गंभीर आपातकाल (Emergency / Casualty 24x7 - No Token Needed)</span>
        </button>
      </div>

      {/* Footer links for staff and display boards */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff')}
            className="font-bold text-sky-700 hover:text-sky-900 underline"
          >
            👨‍⚕️ Staff & Doctor Desk
          </button>
          <span>•</span>
          <button
            onClick={() => navigate('/board')}
            className="font-bold text-sky-700 hover:text-sky-900 underline"
          >
            📺 Waiting TV Board
          </button>
        </div>
        <span>City District Hospital OPD Saathi</span>
      </div>
    </div>
  );
}
