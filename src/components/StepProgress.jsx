import React from 'react';
import { useApp } from '../context/AppContext';

export default function StepProgress({ currentStep, totalSteps = 5 }) {
  const { t } = useApp();
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 mb-2">
        <span className="bg-sky-100 text-sky-900 px-3 py-1 rounded-full border border-sky-200">
          {t.register.step} {currentStep} {t.register.of} {totalSteps}
        </span>
        <span className="text-slate-500 font-semibold">{percentage}%</span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-sky-500 to-sky-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}
