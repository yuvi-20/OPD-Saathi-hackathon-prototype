import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Siren, PhoneCall, AlertTriangle, MapPin, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { speakText } from '../utils/tts';

export default function EmergencyModal() {
  const {
    emergencyModalOpen,
    setEmergencyModalOpen,
    t,
    language,
    raiseUrgentFlag,
    activeToken
  } = useApp();

  const navigate = useNavigate();
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  if (!emergencyModalOpen) return null;

  const handleTriggerUrgentHelp = () => {
    raiseUrgentFlag({
      location: "Patient / Visitor App",
      message: `Emergency SOS pressed by patient (${activeToken || "Unregistered visitor"})`
    });
    setFlagSubmitted(true);
    speakText(t.emergency.urgentHelpSent, language);
  };

  const handleShowMapRoute = () => {
    setEmergencyModalOpen(false);
    navigate('/find-place?to=ground_emergency');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-red-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full border-4 border-red-600 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Siren className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <h2 id="emergency-dialog-title" className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {t.emergency.title}
              </h2>
              <p className="text-red-100 text-xs sm:text-sm font-medium mt-0.5">
                {t.emergency.subhead}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmergencyModalOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white"
            aria-label={t.buttons.close}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Action 1: Instant SOS Flag to Staff Dashboard */}
          {!flagSubmitted ? (
            <div className="bg-rose-50 border-2 border-red-300 rounded-2xl p-4 text-center space-y-3">
              <p className="text-red-900 font-bold text-sm sm:text-base">
                Are you feeling very unwell or need a stretcher / doctor right now?
              </p>
              <button
                onClick={handleTriggerUrgentHelp}
                className="w-full min-h-[58px] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-red-300 transition-all flex items-center justify-center gap-2 transform active:scale-95 animate-urgent"
              >
                <ShieldAlert className="w-6 h-6 text-yellow-300" />
                <span>{t.emergency.urgentHelpBtn}</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-900 text-base">
                {t.emergency.urgentHelpSent}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-700">
                A staff alert with sound is active at the nursing & registration desk. Please approach any hospital guard or staff member immediately.
              </p>
            </div>
          )}

          {/* Emergency Phone Dialers (112 and 108) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href="tel:112"
              className="min-h-[54px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-colors"
            >
              <PhoneCall className="w-5 h-5 text-amber-400" />
              <span>{t.emergency.dial112}</span>
            </a>
            <a
              href="tel:108"
              className="min-h-[54px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-colors"
            >
              <PhoneCall className="w-5 h-5 text-yellow-300" />
              <span>{t.emergency.dial108}</span>
            </a>
          </div>

          {/* Way to Casualty Department */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {t.emergency.casualtyLocation}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                  Enter Main Gate, turn right following the large red illuminated signs. Ramp access is available directly for stretchers and wheelchairs.
                </p>
              </div>
            </div>
            <button
              onClick={handleShowMapRoute}
              className="w-full bg-white hover:bg-slate-50 border-2 border-red-500 text-red-700 font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.buttons.getDirections} ({t.emergency.title})</span>
            </button>
          </div>

          {/* Critical Emergency Signs Check */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.emergency.warningTitle}</span>
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
              {t.emergency.signs.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Medical Safety Notice */}
          <p className="text-[11px] text-slate-500 text-center italic">
            {t.emergency.qualifiedStaffNotice}
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setEmergencyModalOpen(false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-colors"
          >
            {t.buttons.close}
          </button>
        </div>
      </div>
    </div>
  );
}
