import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDepartmentById } from '../data/departments';
import {
  Ticket,
  Users,
  Clock,
  Navigation,
  Volume2,
  Stethoscope,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { speakText, playClickBeep } from '../utils/tts';

export default function CurrentVisitCard({ patient, showJourney = false }) {
  const {
    patients,
    doctorStatus,
    getEstimatedWait,
    language,
    t
  } = useApp();

  const navigate = useNavigate();

  if (!patient) return null;

  const dept = getDepartmentById(patient.departmentId || 'general_medicine');
  const deptName = dept[`name_${language}`] || dept.name;

  // Queue computations
  const deptWaiting = patients.filter(
    p => p.departmentId === dept.id && p.status === 'waiting'
  );
  const targetIdx = deptWaiting.findIndex(p => p.token === patient.token);
  const peopleAhead = targetIdx !== -1 ? targetIdx : deptWaiting.length;
  const estWait = getEstimatedWait(dept.id, patient.token);

  // Current token serving
  const servingPatient = patients.find(
    p => p.departmentId === dept.id && p.status === 'serving'
  );
  const currentToken = servingPatient?.token || `${dept.code}-0${Math.max(1, parseInt(patient.token.split('-')[1] || 40, 10) - peopleAhead)}`;

  const isCalled = patient.status === 'serving';
  const isCompleted = patient.status === 'completed';

  const handleVoiceAssistant = () => {
    playClickBeep();
    if (isCompleted) {
      const msg = language === 'hi'
        ? `बधाई हो ${patient.name} जी! आपकी डॉक्टर जांच पूरी हो चुकी है। अब आप कतार में नहीं हैं। कृपया अपना डिजिटल पर्चा और डॉक्टर सलाह देखें।`
        : language === 'ta'
        ? `வாழ்த்துகள் ${patient.name}! உங்கள் மருத்துவ ஆலோசனை முடிந்தது. இனி காத்திருப்பு தேவையில்லை. உங்கள் டிஜிட்டல் மருந்துச்சீட்டைப் பார்க்கவும்.`
        : `Congratulations ${patient.name}! Your doctor checkup is completed. You are no longer in the queue. Please review your digital prescription and medical advice.`;
      speakText(msg, language);
    } else if (isCalled) {
      const msg = language === 'hi'
        ? `नमस्ते ${patient.name} जी! आपका टोकन ${patient.token} बुलाया गया है। कृपया कमरा ${dept.room} में सीधे अंदर जाइए।`
        : `Hello ${patient.name}! Your token ${patient.token} is called. Please proceed directly inside ${dept.room}.`;
      speakText(msg, language);
    } else {
      const msg = language === 'hi'
        ? `नमस्ते ${patient.name} जी। आपका टोकन ${patient.token} है। वर्तमान में टोकन ${currentToken} देखा जा रहा है। आपसे पहले ${peopleAhead} मरीज हैं। अनुमानित प्रतीक्षा समय लगभग ${estWait} मिनट है। विभाग: ${deptName}, कमरा: ${dept.room}।`
        : `Hello ${patient.name}. Your token is ${patient.token}. Currently serving token ${currentToken}. There are ${peopleAhead} patients ahead of you. Estimated wait is ${estWait} minutes for ${deptName}, ${dept.room}.`;
      speakText(msg, language);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-white rounded-3xl p-5 sm:p-7 border-2 shadow-xl space-y-5 transition-all ${
      isCompleted
        ? 'via-emerald-50/60 to-teal-50/50 border-emerald-400'
        : 'via-sky-50/50 to-indigo-50/40 border-sky-300'
    }`}>
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-emerald-500 animate-ping'}`} />
          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
            {isCompleted
              ? (language === 'hi' ? 'ओपीडी जांच सम्पन्न (Checkup Done)' : 'Consultation Completed')
              : (language === 'hi' ? 'वर्तमान अस्पताल यात्रा (Active Visit)' : 'Current Hospital Visit')}
          </span>
        </div>
        <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black border ${
          isCompleted
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
            : isCalled
            ? 'bg-emerald-500 text-white border-emerald-600 animate-bounce'
            : 'bg-amber-100 text-amber-900 border-amber-300'
        }`}>
          {isCompleted
            ? (language === 'hi' ? '✅ जांच पूर्ण • कतार समाप्त' : '✅ Checkup Done • Queue Exited')
            : isCalled
            ? (language === 'hi' ? '🔔 आपकी बारी है! अंदर जाएं' : '🔔 YOUR TURN! ENTER NOW')
            : (language === 'hi' ? '⏳ कतार में प्रतीक्षा' : '⏳ Waiting in Queue')}
        </span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Side: Patient & Dept */}
        <div className="space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'मरीज का नाम' : 'Patient Name'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{patient.name}</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                {patient.age}y • {patient.gender === 'female' ? (language === 'hi' ? 'महिला' : 'Female') : (language === 'hi' ? 'पुरुष' : 'Male')}
              </span>
            </h3>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'विभाग एवं डॉक्टर' : 'Department & Room'}
            </span>
            <p className="text-sm sm:text-base font-extrabold text-sky-950 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>{deptName} ({dept.room})</span>
            </p>
            <p className="text-xs text-slate-500">{dept.doctorName}</p>
          </div>
        </div>

        {/* Right Side: Token & Status Numbers */}
        {isCompleted ? (
          <div className="grid grid-cols-2 gap-2 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
            <div className="text-center p-2 rounded-xl bg-white border border-emerald-300">
              <span className="text-[10px] font-black uppercase text-emerald-800 block">
                {language === 'hi' ? 'आपका टोकन' : 'Your Token'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                {patient.token}
              </span>
            </div>

            <div className="text-center p-2 rounded-xl bg-emerald-600 text-white border border-emerald-700">
              <span className="text-[10px] font-black uppercase text-emerald-100 block">
                {language === 'hi' ? 'सत्र स्थिति' : 'Session Status'}
              </span>
              <span className="text-lg sm:text-xl font-black block mt-0.5">
                {language === 'hi' ? 'सम्पन्न ✓' : 'Done ✓'}
              </span>
            </div>

            <div className="text-center p-2 rounded-xl bg-white border border-emerald-200 col-span-2">
              <span className="text-[10px] font-black uppercase text-emerald-800 block">
                {language === 'hi' ? 'अगला कदम (Next Action)' : 'Next Action'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 block mt-0.5">
                📄 {language === 'hi' ? 'डिजिटल पर्चा व डॉक्टर सलाह (Prescription & Advice)' : 'Digital Prescription & Doctor Advice'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 bg-white/90 p-3.5 rounded-2xl border border-sky-200">
            <div className="text-center p-2 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-[10px] font-black uppercase text-sky-700 block">
                {language === 'hi' ? 'आपका टोकन' : 'Your Token'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-sky-900 tracking-tight">
                {patient.token}
              </span>
            </div>

            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-600 block">
                {language === 'hi' ? 'वर्तमान टोकन' : 'Current Serving'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {currentToken}
              </span>
            </div>

            <div className="text-center p-2 rounded-xl bg-amber-50 border border-amber-200 col-span-1">
              <span className="text-[10px] font-black uppercase text-amber-800 block">
                {language === 'hi' ? 'आगे मरीज' : 'Ahead'}
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-950">
                {peopleAhead}
              </span>
            </div>

            <div className="text-center p-2 rounded-xl bg-indigo-50 border border-indigo-200 col-span-1">
              <span className="text-[10px] font-black uppercase text-indigo-800 block">
                {language === 'hi' ? 'अनुमानित समय' : 'Est. Wait'}
              </span>
              <span className="text-lg sm:text-xl font-black text-indigo-950">
                ~{estWait}m
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        {isCompleted ? (
          <>
            <button
              onClick={() => navigate('/health-records')}
              className="min-h-[52px] py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>📄</span>
              <span>{language === 'hi' ? 'डिजिटल पर्चा देखें' : 'View Prescription'}</span>
            </button>

            <button
              onClick={() => navigate('/health-records')}
              className="min-h-[52px] py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>📋</span>
              <span>{language === 'hi' ? 'स्वास्थ्य रिकॉर्ड देखें' : 'View Health Records'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/my-turn')}
              className="min-h-[52px] px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Users className="w-5 h-5 text-sky-200" />
              <span>{language === 'hi' ? '⏱️ कतार देखें (View Queue)' : '⏱️ View Queue'}</span>
            </button>

            <button
              onClick={() => navigate(`/find-place?to=${dept.roomId}`)}
              className="min-h-[52px] px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Navigation className="w-5 h-5 text-emerald-400" />
              <span>{language === 'hi' ? '🗺️ कमरे का रास्ता' : '🗺️ Navigate to Ward'}</span>
            </button>
          </>
        )}

        <button
          onClick={handleVoiceAssistant}
          className="min-h-[52px] px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <Volume2 className="w-5 h-5 text-slate-950" />
          <span>{language === 'hi' ? '🔊 आवाज सहायक' : '🔊 Use Voice Assistant'}</span>
        </button>
      </div>
    </div>
  );
}
