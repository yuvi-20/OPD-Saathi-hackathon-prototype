import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEMO_HEALTH_RECORDS } from '../data/healthRecords';
import {
  FileText,
  Share2,
  Calendar,
  Stethoscope,
  Pill,
  TestTube,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Download,
  Info
} from 'lucide-react';
import { speakText, playClickBeep } from '../utils/tts';

export default function HealthRecordsPage() {
  const {
    currentAccount,
    language,
    isRecordsShared,
    setIsRecordsShared,
    t
  } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // all, visits, labs, prescriptions
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareSuccessNotice, setShareSuccessNotice] = useState(false);

  const account = currentAccount || {
    id: "OPD-DEMO",
    name: language === 'hi' ? "मरीज" : "Patient",
    age: "--",
    gender: "unspecified",
    phone: "----------"
  };

  const records = DEMO_HEALTH_RECORDS;

  const handleOpenShare = () => {
    playClickBeep();
    setShareModalOpen(true);
  };

  const handleConfirmShare = () => {
    playClickBeep();
    setIsRecordsShared(true);
    setShareModalOpen(false);
    setShareSuccessNotice(true);

    const voice = language === 'hi'
      ? "स्वास्थ्य रिकॉर्ड डॉक्टर के कंप्यूटर पर सुरक्षित रूप से साझा कर दिए गए हैं।"
      : "Your health records have been securely shared with the consulting doctor.";
    speakText(voice, language);

    setTimeout(() => {
      setShareSuccessNotice(false);
    }, 6000);
  };

  const handleVoiceReadRecords = () => {
    playClickBeep();
    const patientName = currentAccount?.name || (language === 'hi' ? 'मरीज' : 'Patient');
    const msg = language === 'hi'
      ? `मरीज ${patientName}। कुल 3 पुरानी मुलाकातें हैं। पिछली मुलाकात 12 अक्टूबर 2026 को सामान्य चिकित्सा विभाग में हुई थी। सभी जांच परिणाम सामान्य पाए गए।`
      : `Patient ${patientName}. 3 past visits recorded. Last visit was on 12 October 2026 for General Medicine. All test results normal.`;
    speakText(msg, language);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Top Navigation & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'पीछे जाएं' : 'Back'}</span>
        </button>

        <button
          onClick={handleVoiceReadRecords}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200 shadow-sm"
        >
          <Volume2 className="w-4 h-4 text-indigo-700" />
          <span>{language === 'hi' ? 'रिकॉर्ड सुनें' : 'Read Aloud'}</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/20 text-xs font-black">
              <span>🩺 {language === 'hi' ? 'डिजिटल स्वास्थ्य रिकॉर्ड' : 'My Health Records'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mt-2 tracking-tight">
              {language === 'hi' ? `स्वास्थ्य रिकॉर्ड: ${account.name}` : `Health Records: ${account.name}`}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 font-semibold">
              Patient ID: <span className="text-white font-bold">{account.id}</span> • {account.age} yrs • {account.gender === 'female' ? 'Female' : 'Male'}
            </p>
          </div>

          {/* FEATURE 5: SHARE RECORDS WITH DOCTOR BUTTON */}
          <button
            onClick={handleOpenShare}
            className={`min-h-[52px] px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 flex-shrink-0 ${
              isRecordsShared
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-white text-indigo-950 hover:bg-indigo-50'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>
              {isRecordsShared
                ? (language === 'hi' ? '✓ डॉक्टर के साथ साझा (Shared)' : '✓ Records Shared with Doctor')
                : (language === 'hi' ? 'डॉक्टर के साथ रिकॉर्ड साझा करें' : 'Share Records with Doctor')}
            </span>
          </button>
        </div>

        {/* Mandatory Demo / Prototype Privacy Disclaimer */}
        <div className="bg-white/10 rounded-2xl p-3 border border-white/20 text-xs text-indigo-100 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0 text-amber-300" />
          <span>
            <strong>Demo Prototype Notice:</strong> Patient data shown here is completely simulated dummy data for the hackathon. Patient controls whether records are shared.
          </span>
        </div>
      </div>

      {/* Success Notification Bar after Sharing */}
      {shareSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {language === 'hi'
                ? 'स्वास्थ्य रिकॉर्ड डॉक्टर के कमरे (Room 1 & 2) में सफलतापूर्वक साझा हो गए हैं।'
                : 'Records shared successfully with the consulting doctor.'}
            </span>
          </div>
          <button onClick={() => setShareSuccessNotice(false)} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label_en: 'All Records', label_hi: 'सभी रिकॉर्ड' },
          { id: 'visits', label_en: 'OPD Visits', label_hi: 'ओपीडी मुलाकातें' },
          { id: 'labs', label_en: 'Lab Reports', label_hi: 'लैब जांच' },
          { id: 'prescriptions', label_en: 'Prescriptions', label_hi: 'दवाओं के पर्चे' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              playClickBeep();
              setActiveTab(tab.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {language === 'hi' ? tab.label_hi : tab.label_en}
          </button>
        ))}
      </div>

      {/* HEALTH RECORDS LIST */}
      <div className="space-y-5">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-sm space-y-4 hover:border-indigo-300 transition-colors"
          >
            {/* Record Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {rec.department} ({rec.room})
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {rec.doctor} • {rec.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
                  ✓ {rec.status}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  ID: {rec.id}
                </span>
              </div>
            </div>

            {/* Diagnosis / Complaint */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <span>{language === 'hi' ? 'बीमारी / कारण' : 'Diagnosis & Symptoms'}</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {rec.diagnosis}
              </p>
              <p className="text-xs text-slate-600">
                Chief Complaint: {rec.complaint}
              </p>
            </div>

            {/* Prescriptions (Shown if activeTab is 'all' or 'prescriptions') */}
            {(activeTab === 'all' || activeTab === 'prescriptions') && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'hi' ? 'लिखी गई दवाएं (Prescriptions)' : 'Prescriptions'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rec.prescriptions.map((med, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs">
                      <div className="font-black text-indigo-950">{med.name}</div>
                      <div className="text-slate-600">{med.dosage} • {med.duration}</div>
                      <div className="text-[11px] text-indigo-700 font-bold mt-0.5">Timing: {med.timing}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Reports (Shown if activeTab is 'all' or 'labs') */}
            {(activeTab === 'all' || activeTab === 'labs') && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-teal-950 flex items-center gap-1.5">
                  <TestTube className="w-4 h-4 text-teal-600" />
                  <span>{language === 'hi' ? 'लैब एवं जांच रिपोर्ट (Lab & Test Results)' : 'Lab & Test Results'}</span>
                </h4>
                <div className="space-y-1.5">
                  {rec.reports.map((rep, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-black text-teal-950">{rep.testName}</span>
                        <div className="text-slate-700">{rep.result}</div>
                      </div>
                      <span className="self-start sm:self-center px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 text-[10px] font-black border border-teal-300">
                        {rep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Advice & Follow-up */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <strong>Advice:</strong> {rec.doctorAdvice}
              </div>
              <div className="font-bold text-slate-700">
                Follow-up: {rec.followUp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURE 5: SHARE RECORDS CONFIRMATION MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-indigo-300 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-900 font-black text-lg">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <span>{language === 'hi' ? 'डॉक्टर के साथ रिकॉर्ड साझा करें' : 'Share Records with Doctor'}</span>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <p className="font-bold text-slate-900 text-base">
                {language === 'hi'
                  ? 'क्या आप अपने स्वास्थ्य रिकॉर्ड ड्यूटी डॉक्टर के साथ साझा करना चाहते हैं?'
                  : 'Your selected health records will be shared with the consulting doctor.'}
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div>✓ 3 past OPD visit summaries</div>
                <div>✓ Previous CBC & blood sugar lab test results</div>
                <div>✓ Past prescription history (Dr. Rajesh Verma & Dr. Sunita Rao)</div>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'आप अपने रिकॉर्ड साझा करने पर पूरा नियंत्रण रखते हैं। डॉक्टर केवल परामर्श के दौरान इसे देख सकेंगे।'
                  : 'You control whether your records are shared. The doctor will securely view them during consultation.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="flex-1 min-h-[50px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmShare}
                className="flex-1 min-h-[50px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md"
              >
                {language === 'hi' ? 'साझा करें (Share)' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
