import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Siren,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  HelpCircle,
  Monitor,
  Users,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  Check
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/tts';

export default function Navbar() {
  const {
    t,
    language,
    setLanguage,
    setEmergencyModalOpen,
    highContrast,
    setHighContrast,
    assistedMode,
    setAssistedMode,
    autoReadAloud,
    setAutoReadAloud,
    currentAccount,
    hasRegistered
  } = useApp();

  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Close menu on route changes
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleSpeakNav = () => {
    if (autoReadAloud) {
      stopSpeech();
      setAutoReadAloud(false);
    } else {
      setAutoReadAloud(true);
      speakText(`${t.appName}. ${t.hospitalName}.`, language);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors duration-200">
      {/* Top Urgent Emergency Alert Bar */}
      <div className="bg-red-600 text-white px-3 py-1 flex items-center justify-between text-xs font-semibold gap-2 shadow-inner">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Siren className="w-3.5 h-3.5 animate-bounce text-yellow-300 flex-shrink-0" />
          <span className="truncate text-[11px] sm:text-xs font-bold">{t.emergency.anyOfThese}</span>
        </div>
        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="bg-yellow-300 hover:bg-yellow-400 text-red-950 font-black px-2 py-0.5 rounded text-[10px] sm:text-xs shadow-sm flex items-center gap-1 flex-shrink-0 uppercase tracking-wider"
          aria-label="Open Emergency Window"
        >
          <Siren className="w-3 h-3" />
          <span>{t.buttons.close === "Close" ? "EMERGENCY" : "आपातकाल"}</span>
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between gap-2 relative">
        {/* Brand & Logo (Always clearly visible on the Left side across mobile & desktop) */}
        <Link
          to="/"
          className="flex items-center gap-2 group focus:ring-2 focus:ring-sky-500 rounded-xl p-0.5 flex-shrink-0"
          aria-label="OPD Saathi Home"
        >
          {/* Distinct Medical Cross Logo Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform flex-shrink-0 border border-sky-300/40">
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
            </svg>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block bg-sky-100 text-sky-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-sky-200">
                GOVT OPD
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 leading-tight mt-0.5 truncate max-w-[200px] md:max-w-none">
              {t.hospitalName}
            </p>
          </div>
        </Link>

        {/* ----------------- PHONE RESPONSIVE CONTROLS (Right Side: Voice, Language, Profile) ----------------- */}
        <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0 relative">
          {/* 1. Voice Assistant on Phone */}
          <button
            onClick={handleSpeakNav}
            className={`w-9 h-9 rounded-xl border text-xs font-medium flex items-center justify-center transition-all ${
              autoReadAloud
                ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm ring-2 ring-amber-300'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Voice Assistant (आवाज सहायक)"
            aria-label="Toggle Voice Assistant"
          >
            {autoReadAloud ? <Volume2 className="w-4 h-4 text-amber-700 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* 2. Language Selector on Phone */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs py-2 pl-2 pr-5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none min-h-[36px]"
              aria-label="Select Language"
            >
              <option value="hi">हिंदी</option>
              <option value="en">Eng</option>
              <option value="ta">தமிழ்</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-500">
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* 3. User Profile Button on Phone (Opens Drawer Box) */}
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`min-h-[36px] px-2.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1 shadow-sm active:scale-95 ${
              profileMenuOpen
                ? 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300'
                : hasRegistered && currentAccount
                ? 'bg-teal-100 border-teal-300 text-teal-950'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            aria-expanded={profileMenuOpen}
            aria-label="User Profile & Quick Menu"
          >
            <span className="text-sm">👤</span>
            <span className="max-w-[65px] truncate font-bold text-xs">
              {hasRegistered && currentAccount?.name
                ? currentAccount.name.split(' ')[0]
                : (language === 'hi' ? 'प्रोफ़ाइल' : language === 'ta' ? 'சுயவிவரம்' : 'Profile')}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* POPUP BOX APPEARS WHEN USER CLICKS PROFILE ON PHONE */}
          {profileMenuOpen && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2"
            >
              {/* Profile Header & Info */}
              <div className="p-3 bg-gradient-to-r from-sky-50 via-teal-50 to-indigo-50 rounded-xl border border-teal-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    👤
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-sm text-slate-900 truncate">
                      {hasRegistered && currentAccount?.name
                        ? currentAccount.name
                        : (language === 'hi' ? 'अतिथि मरीज (Guest)' : language === 'ta' ? 'விருந்தினர் நோயாளி' : 'Guest Patient')}
                    </div>
                    <div className="text-[11px] font-bold text-teal-800">
                      {hasRegistered && currentAccount?.id
                        ? `ID: ${currentAccount.id}`
                        : (language === 'hi' ? 'नया मरीज' : 'New OPD Patient')}
                    </div>
                  </div>
                </div>

                <Link
                  to={hasRegistered && currentAccount ? "/patient-dashboard" : "/register"}
                  onClick={() => setProfileMenuOpen(false)}
                  className="mt-2.5 w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
                >
                  <span>
                    {hasRegistered && currentAccount
                      ? (language === 'hi' ? 'मरीज डैशबोर्ड देखें' : 'View Patient Dashboard')
                      : (language === 'hi' ? 'नया पर्चा / रजिस्ट्रेशन' : 'New OPD Registration')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Options List: Staff Desk, TV Board, Theme Change, Settings in Last */}
              <div className="space-y-1">
                {/* 1. Staff Desk */}
                <Link
                  to="/staff"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold text-xs transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-base flex-shrink-0">
                    👨‍⚕️
                  </span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-extrabold text-slate-900 truncate">
                      {language === 'hi' ? 'स्टाफ व डॉक्टर डेस्क' : language === 'ta' ? 'பணியாளர் மேசை' : 'Staff & Doctor Desk'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">
                      {language === 'hi' ? 'मरीजों को बुलाएं व कतार देखें' : 'Call patients & manage queues'}
                    </div>
                  </div>
                </Link>

                {/* 2. TV Board */}
                <Link
                  to="/board"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold text-xs transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-base flex-shrink-0">
                    📺
                  </span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-extrabold text-slate-900 truncate">
                      {language === 'hi' ? 'प्रतीक्षा हॉल टीवी बोर्ड' : language === 'ta' ? 'காத்திருப்பு பலகை' : 'Waiting Hall TV Board'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">
                      {language === 'hi' ? 'लाइव ओपीडी टोकन डिस्प्ले' : 'Live OPD token waiting display'}
                    </div>
                  </div>
                </Link>

                {/* 3. Theme Change (High Contrast) */}
                <button
                  type="button"
                  onClick={() => {
                    setHighContrast(!highContrast);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold text-xs transition-colors text-left"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                    highContrast ? 'bg-black text-yellow-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    🌓
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-slate-900 flex items-center justify-between">
                      <span className="truncate">
                        {language === 'hi' ? 'थीम बदलें (Contrast)' : 'Theme (High Contrast)'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        highContrast ? 'bg-black text-yellow-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {highContrast ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">
                      {language === 'hi' ? 'उच्च कंट्रास्ट डार्क मोड' : 'High contrast dark theme'}
                    </div>
                  </div>
                </button>

                {/* 4. Settings in Last */}
                <Link
                  to="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center gap-3 text-slate-800 font-bold text-xs transition-colors border-t border-slate-100 mt-1"
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-base flex-shrink-0">
                    ⚙️
                  </span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-extrabold text-slate-900 truncate">
                      {language === 'hi' ? 'सेटिंग्स व प्राथमिकताएं' : language === 'ta' ? 'அமைப்புகள்' : 'Settings & Options'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">
                      {language === 'hi' ? 'आवाज, फॉन्ट साइज और लॉगआउट' : 'Sound, font size, accessibility'}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ----------------- DESKTOP CONTROLS (Only visible on sm: screens and up) ----------------- */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-1.5 pl-2 pr-6 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none"
              aria-label="Select Language"
            >
              <option value="hi">हिंदी</option>
              <option value="en">Eng</option>
              <option value="ta">தமிழ்</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-500">
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Voice Guidance Read Aloud Toggle */}
          <button
            onClick={handleSpeakNav}
            className={`w-9 h-9 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors ${
              autoReadAloud
                ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Read Aloud Voice Guidance"
            aria-label="Toggle Voice Guidance"
          >
            {autoReadAloud ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-9 h-9 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors ${
              highContrast
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="High Contrast Mode"
            aria-label="Toggle High Contrast"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Patient Account Dashboard Link */}
          <Link
            to={hasRegistered && currentAccount ? "/patient-dashboard" : "/register"}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-black transition-colors flex items-center gap-1.5 ${
              location.pathname === '/patient-dashboard' || location.pathname === '/returning-patient' || location.pathname === '/register'
                ? 'bg-teal-100 border-teal-400 text-teal-900 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={hasRegistered && currentAccount ? "Patient Dashboard & Records" : "New OPD Registration"}
            aria-label="Patient Account"
          >
            <span className="text-sm">👤</span>
            <span className="font-bold">
              {hasRegistered && currentAccount?.name
                ? currentAccount.name.split(' ')[0]
                : (language === 'hi' ? 'रजिस्टर' : 'Register')}
            </span>
          </Link>

          {/* Staff Desk Quick Access */}
          <Link
            to="/staff"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-black transition-colors flex items-center gap-1 ${
              location.pathname === '/staff'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Staff & Doctor Queue Desk"
            aria-label="Staff Desk"
          >
            <span className="text-sm">👨‍⚕️</span>
            <span className="font-bold">Staff Desk</span>
          </Link>

          {/* Settings Link */}
          <Link
            to="/settings"
            className={`w-9 h-9 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors ${
              location.pathname === '/settings'
                ? 'bg-sky-100 border-sky-400 text-sky-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Display & Accessibility Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Assisted Mode Banner if active */}
      {assistedMode && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 px-4 py-2 text-xs sm:text-sm font-black flex items-center justify-between shadow-md border-b-2 border-amber-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-950 text-amber-200 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
              🤝 ASSISTED MODE ON
            </span>
            <span>
              🔊 Voice Reading Active • 🛗 Stair-Free Lift/Ramp Routing • 🔍 24px Big Text
            </span>
          </div>
          <button
            onClick={() => setAssistedMode(false)}
            className="bg-amber-950 hover:bg-black text-amber-100 font-bold px-3 py-1 rounded-lg text-xs transition-colors ml-2 shadow-sm"
          >
            Turn Off (बंद करें)
          </button>
        </div>
      )}
    </header>
  );
}
