import React from 'react';
import { useApp } from '../context/AppContext';
import { Languages, Check } from 'lucide-react';

export default function FirstVisitModal() {
  const { showFirstVisitLangModal, setLanguage, language } = useApp();

  if (!showFirstVisitLangModal) return null;

  const languages = [
    { code: 'hi', label: 'हिंदी', sublabel: 'Hindi • अपनी भाषा चुनें', flag: '🇮🇳' },
    { code: 'en', label: 'English', sublabel: 'English • Select your language', flag: '🌐' },
    { code: 'ta', label: 'தமிழ்', sublabel: 'Tamil • உங்கள் மொழியைத் தேர்வுசெய்க', flag: '🇮🇳' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-sky-500 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
          <Languages className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Welcome to OPD Saathi
          </h2>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            कृपया अपनी पसंदीदा भाषा चुनें / Select language / மொழியைத் தேர்ந்தெடுக்கவும்
          </p>
        </div>

        <div className="space-y-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`w-full min-h-[64px] p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${
                language === l.code
                  ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-400 shadow-md'
                  : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{l.flag}</span>
                <div>
                  <div className="text-lg font-bold text-slate-900">{l.label}</div>
                  <div className="text-xs text-slate-500">{l.sublabel}</div>
                </div>
              </div>
              {language === l.code && <Check className="w-6 h-6 text-sky-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
