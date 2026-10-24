import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  FilePlus,
  Ticket,
  MapPinned,
  Siren,
  Clock,
  Sparkles,
  Volume2,
  UserCheck
} from 'lucide-react';
import { speakText } from '../utils/tts';

export default function HomePage() {
  const { t, language, setEmergencyModalOpen, assistedMode } = useApp();
  const navigate = useNavigate();

  const handleListenIntro = () => {
    speakText(
      `${t.home.welcome}. ${t.home.cardRegister}: ${t.home.cardRegisterDesc}. ${t.home.cardHaveSlip}: ${t.home.cardHaveSlipDesc}. ${t.home.cardFindPlace}: ${t.home.cardFindPlaceDesc}. ${t.home.cardEmergency}: ${t.home.cardEmergencyDesc}.`,
      language
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Welcome & Hospital Banner */}
      <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold text-sky-100 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t.hospitalSubtitle}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              {t.home.welcome}
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-300 flex-shrink-0" />
              <span>{t.home.opdTimings}</span>
            </p>
          </div>

          <button
            onClick={handleListenIntro}
            className="self-start sm:self-center bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-2 rounded-xl sm:rounded-2xl flex items-center gap-1.5 text-xs sm:text-sm backdrop-blur-sm transition-all focus:ring-2 focus:ring-white flex-shrink-0 shadow-sm"
            aria-label="Read page instructions aloud"
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
            <span>{t.buttons.listen}</span>
          </button>
        </div>
      </div>

      {/* 4 Big Touch Buttons - Mobile First (Minimum 56px height, high contrast, icons + words) */}
      <div className="space-y-2">
        <p className="text-slate-600 text-sm font-semibold px-1">
          {t.home.heroInstruction}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Register */}
          <button
            onClick={() => navigate('/register')}
            className="min-h-[100px] sm:min-h-[120px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-3xl p-5 shadow-lg shadow-sky-200 border-2 border-sky-400 flex items-center gap-4 text-left transition-all duration-200 transform active:scale-[0.98] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FilePlus className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {t.home.cardRegister}
              </h2>
              <p className="text-sky-100 text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                {t.home.cardRegisterDesc}
              </p>
            </div>
          </button>

          {/* Card 1B: Returning Patient (FEATURE 2) */}
          <button
            onClick={() => navigate('/returning-patient')}
            className="min-h-[100px] sm:min-h-[120px] bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white rounded-3xl p-5 shadow-lg shadow-teal-200 border-2 border-teal-400 flex items-center gap-4 text-left transition-all duration-200 transform active:scale-[0.98] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {language === 'hi' ? 'पुराने मरीज (दोबारा पर्चा)' : 'Returning Patient'}
                </h2>
                <span className="bg-amber-300 text-teal-950 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                  1-TAP
                </span>
              </div>
              <p className="text-teal-100 text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                {language === 'hi'
                  ? 'पहले आ चुके हैं? 1-टच में दोबारा टोकन पाएं व स्वास्थ्य रिकॉर्ड देखें'
                  : 'Visited before? Repeat visit & view health records in 1 tap'}
              </p>
            </div>
          </button>

          {/* Card 2: I Have My Slip */}
          <button
            onClick={() => navigate('/have-slip')}
            className="min-h-[100px] sm:min-h-[120px] bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-3xl p-5 shadow-lg shadow-emerald-200 border-2 border-emerald-400 flex items-center gap-4 text-left transition-all duration-200 transform active:scale-[0.98] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Ticket className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {t.home.cardHaveSlip}
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                {t.home.cardHaveSlipDesc}
              </p>
            </div>
          </button>

          {/* Card 3: Find a Place */}
          <button
            onClick={() => navigate('/find-place')}
            className="min-h-[100px] sm:min-h-[120px] bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-3xl p-5 shadow-lg shadow-purple-200 border-2 border-purple-400 flex items-center gap-4 text-left transition-all duration-200 transform active:scale-[0.98] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MapPinned className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {t.home.cardFindPlace}
              </h2>
              <p className="text-purple-100 text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                {t.home.cardFindPlaceDesc}
              </p>
            </div>
          </button>

          {/* Card 4: Emergency (Casualty) */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="min-h-[100px] sm:min-h-[120px] bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-3xl p-5 shadow-lg shadow-red-200 border-2 border-red-400 flex items-center gap-4 text-left transition-all duration-200 transform active:scale-[0.98] group animate-urgent"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Siren className="w-9 h-9 text-yellow-300" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>{t.home.cardEmergency}</span>
                <span className="bg-yellow-300 text-red-950 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                  24x7
                </span>
              </h2>
              <p className="text-red-100 text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                {t.home.cardEmergencyDesc}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Navigation Footer Links for Staff & TV Board */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff')}
            className="font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1.5"
          >
            <span>👨‍⚕️ {t.nav.staff}</span>
          </button>
          <span>•</span>
          <button
            onClick={() => navigate('/board')}
            className="font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1.5"
          >
            <span>📺 {t.nav.board}</span>
          </button>
          <span>•</span>
          <button
            onClick={() => navigate('/counter')}
            className="font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1.5"
          >
            <span>📝 Registration Desk</span>
          </button>
        </div>
        <span>City District Hospital OPD • Prototype</span>
      </div>
    </div>
  );
}
