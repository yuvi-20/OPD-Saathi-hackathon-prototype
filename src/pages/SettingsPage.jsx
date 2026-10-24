import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Languages,
  Type,
  Eye,
  Volume2,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  HeartHandshake,
  Check,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const {
    t,
    language,
    setLanguage,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    autoReadAloud,
    setAutoReadAloud,
    avoidStairs,
    setAvoidStairs,
    assistedMode,
    setAssistedMode,
    logoutAccount
  } = useApp();

  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmMsg = language === 'hi'
      ? "क्या आप मरीज खाते से लॉगआउट करना चाहते हैं?"
      : language === 'ta'
      ? "உங்கள் கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா?"
      : "Are you sure you want to log out of your patient account?";
    if (confirm(confirmMsg)) {
      if (typeof logoutAccount === 'function') {
        logoutAccount();
      }
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-inner">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.settings.title}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Accessibility, visual adjustments, and voice options.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
        {/* 1. Language Picker */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <label className="block text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Languages className="w-5 h-5 text-sky-600" />
            <span>{t.settings.language}</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
              { code: 'en', label: 'English', flag: '🌐' },
              { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`min-h-[56px] p-3 rounded-2xl border-2 font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all ${
                  language === l.code
                    ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-300 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xl">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Text Size (3 Steps) */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <label className="block text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Type className="w-5 h-5 text-sky-600" />
            <span>{t.settings.textSize}</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'normal', label: t.settings.normal, sample: 'Aa' },
              { id: 'large', label: t.settings.large, sample: 'Aa+' },
              { id: 'xlarge', label: t.settings.xlarge, sample: 'Aa++' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setFontSize(s.id)}
                className={`min-h-[56px] p-3 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center ${
                  fontSize === s.id
                    ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-300 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xl">{s.sample}</span>
                <span className="text-[11px] font-medium">{s.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. High Contrast Mode Toggle */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-600" />
              <span>{t.settings.highContrast}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {t.settings.highContrastDesc}
            </p>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`min-h-[44px] min-w-[70px] rounded-full px-4 font-bold text-xs sm:text-sm transition-colors ${
              highContrast ? 'bg-black text-yellow-300 border-2 border-yellow-400' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {highContrast ? "ON" : "OFF"}
          </button>
        </div>

        {/* 4. Text-to-Speech Read Aloud Guidance */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-sky-600" />
              <span>{t.settings.readAloud}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {t.settings.readAloudDesc}
            </p>
          </div>
          <button
            onClick={() => setAutoReadAloud(!autoReadAloud)}
            className={`min-h-[44px] min-w-[70px] rounded-full px-4 font-bold text-xs sm:text-sm transition-colors ${
              autoReadAloud ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {autoReadAloud ? "ON" : "OFF"}
          </button>
        </div>

        {/* 5. Avoid Stairs (Navigation) */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-purple-600" />
              <span>{t.buttons.avoidStairs}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Routes navigation through passenger elevators and ramps only.
            </p>
          </div>
          <button
            onClick={() => setAvoidStairs(!avoidStairs)}
            className={`min-h-[44px] min-w-[70px] rounded-full px-4 font-bold text-xs sm:text-sm transition-colors ${
              avoidStairs ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {avoidStairs ? "ON" : "OFF"}
          </button>
        </div>

        {/* 6. Assisted Mode */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-600" />
              <span>{t.settings.assistedMode}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {t.settings.assistedModeDesc}
            </p>
          </div>
          <button
            onClick={() => setAssistedMode(!assistedMode)}
            className={`min-h-[44px] min-w-[70px] rounded-full px-4 font-bold text-xs sm:text-sm transition-colors ${
              assistedMode ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {assistedMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Logout Button */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full min-h-[56px] rounded-2xl border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-900 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            title="Log out of patient account"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span>{t.buttons.logout || t.buttons.reset || (language === 'hi' ? 'लॉगआउट (Logout)' : language === 'ta' ? 'வெளியேறு (Logout)' : 'Logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
