import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Ticket, QrCode, ArrowRight, Camera, Search, Sparkles } from 'lucide-react';

export default function IHaveSlipPage() {
  const { t, setActiveToken, setHasRegistered, patients } = useApp();
  const navigate = useNavigate();

  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check BarcodeDetector support
  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = tokenInput.trim().toUpperCase();
    if (!clean) {
      setErrorMsg("Please enter your token number (e.g. MED-042)");
      return;
    }

    // Check if token exists or allow anyway
    setActiveToken(clean);
    setHasRegistered(true);
    navigate(`/my-turn?token=${clean}`);
  };

  const handleQuickSelect = (token) => {
    setActiveToken(token);
    setHasRegistered(true);
    navigate(`/my-turn?token=${token}`);
  };

  const handleSimulateScan = () => {
    // Simulated camera scan pick
    setActiveToken("MED-042");
    setHasRegistered(true);
    navigate(`/my-turn?token=MED-042`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <Ticket className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.haveSlip.title}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Enter the token from your paper slip or scan the QR code.
          </p>
        </div>

        {/* Manual Token Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {t.haveSlip.enterTokenLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={t.haveSlip.placeholder}
                className="w-full min-h-[64px] text-xl sm:text-2xl font-black px-5 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none uppercase text-slate-900"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[46px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-transform active:scale-95"
              >
                {t.buttons.next}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs font-bold text-red-600 mt-1.5">
                {errorMsg}
              </p>
            )}
          </div>
        </form>

        {/* QR Scan Section */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            {t.haveSlip.orScan}
          </p>

          <button
            onClick={handleSimulateScan}
            className="w-full min-h-[56px] rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-colors"
          >
            <Camera className="w-5 h-5 text-emerald-700" />
            <span>{t.haveSlip.scanWithCamera}</span>
          </button>
        </div>

        {/* Quick Demo Pick for Judges */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.haveSlip.sampleTokens}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {patients.slice(0, 5).map((p) => (
              <button
                key={p.token}
                onClick={() => handleQuickSelect(p.token)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-sky-50 border border-slate-300 hover:border-sky-400 text-xs font-black text-slate-800 shadow-sm transition-all"
              >
                {p.token} ({p.name})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
