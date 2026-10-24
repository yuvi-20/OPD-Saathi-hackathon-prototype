import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Stethoscope,
  Baby,
  HeartHandshake,
  Bone,
  Ear,
  Eye,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { speakText } from '../utils/tts';

const ICON_MAP = {
  Stethoscope: Stethoscope,
  Baby: Baby,
  HeartHandshake: HeartHandshake,
  Bone: Bone,
  Ear: Ear,
  Eye: Eye,
  ShieldAlert: ShieldAlert
};

export default function SymptomCard({ department, isSelected, onSelect }) {
  const { language, assistedMode } = useApp();

  const IconComponent = ICON_MAP[department.icon] || Stethoscope;
  const name = department[`name_${language}`] || department.name;
  const desc = department[`plainDesc_${language}`] || department.plainDesc_en;

  const handleSpeak = (e) => {
    e.stopPropagation();
    speakText(`${name}. ${desc}`, language);
  };

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-3xl p-5 sm:p-6 border-3 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
        isSelected
          ? 'bg-amber-50/90 border-amber-600 shadow-xl ring-4 ring-amber-400 scale-[1.02]'
          : assistedMode
          ? 'bg-white hover:bg-amber-50/50 border-amber-300 shadow-md hover:border-amber-400'
          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:border-slate-300'
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
              isSelected
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <IconComponent className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-full bg-slate-900 text-white shadow-sm">
              {department.room}
            </span>
            <button
              onClick={handleSpeak}
              className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              title="Listen aloud"
              aria-label={`Listen to ${name}`}
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>{language === 'hi' ? 'सुनें' : language === 'ta' ? 'கேட்க' : 'Listen'}</span>
            </button>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-950 leading-snug">
          {name}
        </h3>

        <p className="text-sm sm:text-base text-slate-700 mt-2 font-medium leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600">
        <span>👨‍⚕️ {department.doctorName.split('/')[0]}</span>
        <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-extrabold">
          ~{department.avgConsultationMin} min
        </span>
      </div>
    </div>
  );
}
