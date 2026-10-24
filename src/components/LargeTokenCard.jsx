import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Volume2 } from 'lucide-react';
import { speakText } from '../utils/tts';
import { getDepartmentById } from '../data/departments';

export default function LargeTokenCard({ patient, onClose }) {
  const { t, language } = useApp();
  if (!patient) return null;

  const dept = getDepartmentById(patient.departmentId);
  const deptName = dept[`name_${language}`] || dept.name;

  const handleSpeak = () => {
    speakText(`टोकन नंबर ${patient.token}. कमरा नंबर ${dept.room}. ${deptName}.`, language);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-4 border-sky-600 shadow-2xl text-center space-y-6 relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
          aria-label={t.buttons.close}
        >
          <X className="w-8 h-8" />
        </button>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
            {t.slip.largeCardTitle}
          </span>
          <p className="text-sm font-semibold text-sky-700 mt-1">
            {t.hospitalName} • OPD
          </p>
        </div>

        {/* Huge Token Display */}
        <div className="bg-sky-50 border-4 border-dashed border-sky-500 rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.slip.tokenLabel}
          </p>
          <div className="text-5xl sm:text-7xl font-black text-slate-950 tracking-tight my-2">
            {patient.token}
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-sky-800">
            {dept.room} • 1st Floor
          </div>
        </div>

        {/* Department & Patient Info */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            {deptName}
          </h3>
          <p className="text-base text-slate-600 font-medium">
            {patient.name} ({patient.age}y / {patient.gender})
          </p>
          <p className="text-xs text-slate-400">
            {dept.doctorName}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSpeak}
            className="flex-1 min-h-[54px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          >
            <Volume2 className="w-5 h-5 text-sky-600" />
            <span>{t.buttons.listen}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 min-h-[54px] bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-base shadow-md"
          >
            {t.buttons.close}
          </button>
        </div>
      </div>
    </div>
  );
}
