import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Siren,
  PhoneCall,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { speakText } from '../utils/tts';

export default function EmergencyPage() {
  const { t, language, raiseUrgentFlag, activeToken } = useApp();
  const navigate = useNavigate();
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  const handleUrgentHelp = () => {
    raiseUrgentFlag({
      location: "Emergency Page",
      message: `Emergency SOS pressed by patient (${activeToken || "Unregistered visitor"})`
    });
    setFlagSubmitted(true);
    speakText(t.emergency.urgentHelpSent, language);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Big Emergency Alert Card */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-300 space-y-5 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Siren className="w-10 h-10 text-yellow-300" />
        </div>

        <div>
          <span className="bg-yellow-300 text-red-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest">
            24x7 CASUALTY CARE
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2">
            {t.emergency.title}
          </h1>
          <p className="text-red-100 text-sm sm:text-base font-medium mt-1">
            {t.emergency.subhead}
          </p>
        </div>

        {/* SOS Button */}
        {!flagSubmitted ? (
          <button
            onClick={handleUrgentHelp}
            className="w-full min-h-[64px] bg-yellow-300 hover:bg-yellow-400 active:scale-95 text-red-950 font-black text-lg sm:text-xl rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all animate-urgent"
          >
            <ShieldAlert className="w-7 h-7 text-red-900" />
            <span>{t.emergency.urgentHelpBtn}</span>
          </button>
        ) : (
          <div className="bg-white/95 text-emerald-950 rounded-2xl p-4 space-y-1 shadow-lg">
            <div className="flex items-center justify-center gap-2 font-black text-base text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.emergency.urgentHelpSent}</span>
            </div>
            <p className="text-xs text-slate-600">
              Emergency alert sound triggered on Staff Dashboard. Please stay calm.
            </p>
          </div>
        )}
      </div>

      {/* Emergency Dialers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="tel:112"
          className="min-h-[60px] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-5 py-3 flex items-center justify-center gap-3 font-extrabold text-base shadow-lg transition-colors"
        >
          <PhoneCall className="w-6 h-6 text-amber-400" />
          <span>{t.emergency.dial112}</span>
        </a>

        <a
          href="tel:108"
          className="min-h-[60px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl px-5 py-3 flex items-center justify-center gap-3 font-extrabold text-base shadow-lg transition-colors"
        >
          <PhoneCall className="w-6 h-6 text-yellow-300" />
          <span>{t.emergency.dial108}</span>
        </a>
      </div>

      {/* Directions to Casualty */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {t.emergency.casualtyLocation}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
              Ground Floor, Right Wing. Enter through the main gate, take an immediate right towards the red illuminated ramp. Stretcher access is open 24x7.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/find-place?to=ground_emergency')}
          className="w-full min-h-[56px] bg-red-600 hover:bg-red-700 text-white font-extrabold text-base rounded-2xl shadow-md flex items-center justify-center gap-2"
        >
          <MapPin className="w-5 h-5 text-yellow-300" />
          <span>{t.buttons.getDirections} ({t.emergency.title})</span>
        </button>
      </div>

      {/* Warning Checklist */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-3">
        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>{t.emergency.warningTitle}</span>
        </h4>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
          {t.emergency.signs.map((sign, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
              <span>{sign}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
