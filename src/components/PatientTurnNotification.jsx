import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDepartmentById } from '../data/departments';
import {
  Bell,
  Navigation,
  Volume2,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { speakText, playChime } from '../utils/tts';

export default function PatientTurnNotification() {
  const {
    activeToken,
    patients,
    language,
    getEstimatedWait,
    hasRegistered
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  // Notification state - Hooks must ALWAYS be called unconditionally in the exact same order!
  const [dismissedForCalled, setDismissedForCalled] = useState(false);
  const [dismissedForCloser, setDismissedForCloser] = useState(false);
  const [dismissedForCompleted, setDismissedForCompleted] = useState(false);

  // Selected language resolution (strictly 'hi', 'ta', or 'en')
  const currentLang = (language === 'ta' || language === 'en') ? language : 'hi';

  // Find active patient object ONLY if patient has registered in this browser
  const patient = (hasRegistered && activeToken && patients && patients.length > 0)
    ? (patients.find(p => p.token === activeToken) || null)
    : null;

  const dept = patient ? getDepartmentById(patient.departmentId || 'general_medicine') : null;
  const deptName = dept ? (dept[`name_${currentLang}`] || dept.name) : '';
  const roomName = dept
    ? (currentLang === 'hi'
        ? dept.room.replace('Room', 'कमरा')
        : currentLang === 'ta'
        ? dept.room.replace('Room', 'அறை')
        : dept.room)
    : '';
  const floorName = dept
    ? (currentLang === 'hi'
        ? (dept.floor === 1 ? 'प्रथम तल' : 'भूतल')
        : currentLang === 'ta'
        ? (dept.floor === 1 ? 'முதல் தளம்' : 'தரை தளம்')
        : (dept.floor === 1 ? '1st Floor' : 'Ground Floor'))
    : '';

  // Queue calculation safely
  const deptWaiting = (patient && dept)
    ? patients.filter(p => p.departmentId === dept.id && p.status === 'waiting')
    : [];
  const targetIdx = patient ? deptWaiting.findIndex(p => p.token === patient.token) : -1;
  const isCalled = patient ? patient.status === 'serving' : false;
  const isCompleted = patient ? patient.status === 'completed' : false;

  const peopleAhead = isCalled
    ? 0
    : targetIdx !== -1
    ? targetIdx
    : deptWaiting.length;

  const estWait = (patient && dept) ? getEstimatedWait(dept.id, patient.token) : 5;

  // Track previous status to detect the exact moment doctor calls the patient
  const prevStatusRef = useRef(patient?.status);
  const prevAheadRef = useRef(peopleAhead);

  // 1. Detect when patient turn is called by doctor
  useEffect(() => {
    if (!hasRegistered || !patient || !dept) return;
    if (location.pathname === '/staff' || location.pathname === '/board') return;

    if (isCalled && prevStatusRef.current !== 'serving') {
      setDismissedForCalled(false);
      playChime();

      // Trigger voice announcement in the SELECTED LANGUAGE ONLY
      const voiceMsg = currentLang === 'hi'
        ? `ध्यान दें! आपकी बारी आ गई है। टोकन ${patient.token}, कृपया तुरंत ${roomName} में जाएं। डॉक्टर तैयार हैं।`
        : currentLang === 'ta'
        ? `கவனிக்கவும்! உங்கள் முறை வந்துவிட்டது. டோக்கன் ${patient.token}, உடனடியாக ${roomName}-க்குள் செல்லவும். மருத்துவர் தயாராக உள்ளார்.`
        : `Attention! Your turn has come. Token ${patient.token}, please proceed immediately to ${roomName}. The doctor is ready.`;
      speakText(voiceMsg, currentLang);

      // Browser Notification if permitted in the SELECTED LANGUAGE ONLY
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const notifTitle = currentLang === 'hi'
          ? 'आपकी बारी आ गई है!'
          : currentLang === 'ta'
          ? 'உங்கள் முறை வந்துவிட்டது!'
          : 'Your Turn Has Come!';
        const notifBody = currentLang === 'hi'
          ? `टोकन ${patient.token}, कृपया तुरंत ${roomName} (${deptName}) में जाएं।`
          : currentLang === 'ta'
          ? `டோக்கன் ${patient.token}, உடனடியாக ${roomName} (${deptName})-க்குள் செல்லவும்.`
          : `Token ${patient.token}, please proceed immediately to ${roomName} (${deptName}).`;

        if (Notification.permission === 'granted') {
          new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    }
    prevStatusRef.current = patient?.status;
  }, [isCalled, patient?.token, roomName, deptName, currentLang, location.pathname, hasRegistered]);

  // 2. Detect when patient turn is approaching (1, 2, or 3 patients ahead)
  useEffect(() => {
    if (!hasRegistered || !patient || !dept) return;
    if (location.pathname === '/staff' || location.pathname === '/board') return;

    if (!isCalled && !isCompleted && peopleAhead > 0 && peopleAhead <= 3) {
      if (prevAheadRef.current > 3 || prevAheadRef.current === null) {
        setDismissedForCloser(false);
        playChime();

        // Voice announcement in the SELECTED LANGUAGE ONLY
        const nearMsg = currentLang === 'hi'
          ? `आपकी बारी करीब आ गई है। केवल ${peopleAhead} मरीज आगे हैं। कृपया ${roomName} के पास पहुंचें।`
          : currentLang === 'ta'
          ? `உங்கள் முறை நெருங்கிவிட்டது. ${peopleAhead} நோயாளிகள் மட்டுமே உள்ளனர். ${roomName} அருகில் செல்லவும்.`
          : `Your turn is approaching! Only ${peopleAhead} patients ahead. Please wait near ${roomName}.`;
        speakText(nearMsg, currentLang);
      }
    }
    prevAheadRef.current = peopleAhead;
  }, [peopleAhead, isCalled, isCompleted, roomName, currentLang, location.pathname, hasRegistered]);

  // Do not show notification banner on Staff Desk or TV Board, or if patient has not registered yet
  if (!hasRegistered || location.pathname === '/staff' || location.pathname === '/board' || !patient || !dept) {
    return null;
  }

  const handleRepeatVoice = () => {
    if (isCalled) {
      const msg = currentLang === 'hi'
        ? `आपकी बारी आ गई है! टोकन ${patient.token}, ${roomName} में सीधे अंदर जाएं।`
        : currentLang === 'ta'
        ? `உங்கள் முறை வந்துவிட்டது! டோக்கன் ${patient.token}, ${roomName}-க்குள் நேரடியாக செல்லவும்.`
        : `Your turn has come! Token ${patient.token}, proceed directly to ${roomName}.`;
      speakText(msg, currentLang);
    } else {
      const msg = currentLang === 'hi'
        ? `आपकी बारी करीब है। आपसे पहले ${peopleAhead} मरीज हैं। अनुमानित समय लगभग ${estWait} मिनट है।`
        : currentLang === 'ta'
        ? `உங்கள் முறை நெருங்கிவிட்டது. உங்களுக்கு முன் ${peopleAhead} நோயாளிகள் உள்ளனர். தோராய நேரம் சுமார் ${estWait} நிமிடங்கள்.`
        : `Your turn is near! ${peopleAhead} patients ahead of you. Estimated wait is ~${estWait} minutes.`;
      speakText(msg, currentLang);
    }
  };

  // Case A: Doctor called this patient right now! (TURN HAS COME)
  if (isCalled && !dismissedForCalled) {
    return (
      <aside aria-label="Turn Called Alert" className="sticky top-14 z-50 px-3 sm:px-4 py-2 pointer-events-auto">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-yellow-300 ring-4 ring-emerald-400/50 space-y-3 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-emerald-950 flex items-center justify-center font-black text-2xl flex-shrink-0 animate-bounce">
                🔔
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-300 text-emerald-950 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {currentLang === 'hi'
                      ? 'आपकी बारी आ गई है!'
                      : currentLang === 'ta'
                      ? 'உங்கள் முறை வந்துவிட்டது!'
                      : 'YOUR TURN HAS COME!'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                  {currentLang === 'hi'
                    ? `टोकन ${patient.token}: कृपया तुरंत अंदर जाएं!`
                    : currentLang === 'ta'
                    ? `டோக்கன் ${patient.token}: உடனடியாக உள்ளே செல்லவும்!`
                    : `Token ${patient.token}: Please Enter Now!`}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 font-semibold mt-0.5">
                  📍 {deptName} • <strong>{roomName}</strong> ({floorName}) • {dept.doctorName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissedForCalled(true)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex-shrink-0"
              title="Dismiss Alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-500/50">
            <button
              onClick={() => navigate(`/find-place?to=${dept.roomId}`)}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-emerald-950 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>
                {currentLang === 'hi'
                  ? 'कमरे का रास्ता देखें'
                  : currentLang === 'ta'
                  ? 'அறைக்கான வழி'
                  : 'Show Directions to Room'}
              </span>
            </button>

            <button
              onClick={() => navigate('/my-turn')}
              className="px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-emerald-400"
            >
              <span>
                {currentLang === 'hi'
                  ? 'लाइव पर्चा देखें'
                  : currentLang === 'ta'
                  ? 'நேரலை சீட்டு'
                  : 'View Slip'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleRepeatVoice}
              className="px-3 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-emerald-950 rounded-xl font-black text-xs flex items-center gap-1.5 ml-auto"
              title="Listen Announcement in Voice"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentLang === 'hi'
                  ? 'दोबारा सुनें'
                  : currentLang === 'ta'
                  ? 'மீண்டும் கேட்க'
                  : 'Listen'}
              </span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Case B: Turn is Approaching / Closer (1, 2, or 3 patients ahead)
  if (!isCalled && !isCompleted && peopleAhead > 0 && peopleAhead <= 3 && !dismissedForCloser) {
    return (
      <aside aria-label="Turn Approaching Alert" className="sticky top-14 z-50 px-3 sm:px-4 py-2 pointer-events-auto">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 rounded-3xl p-4 sm:p-5 shadow-xl border-3 border-amber-300 ring-2 ring-amber-400/50 space-y-2.5 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-300 flex items-center justify-center font-black text-xl flex-shrink-0 animate-pulse">
                <Bell className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  <span>
                    ⏱️ {currentLang === 'hi'
                      ? 'आपकी बारी करीब है!'
                      : currentLang === 'ta'
                      ? 'உங்கள் முறை நெருங்குகிறது!'
                      : 'TURN APPROACHING'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight mt-0.5 text-slate-950">
                  {currentLang === 'hi'
                    ? `टोकन ${patient.token}: आपसे पहले केवल ${peopleAhead} मरीज हैं!`
                    : currentLang === 'ta'
                    ? `டோக்கன் ${patient.token}: உங்களுக்கு முன் ${peopleAhead} நோயாளிகள் மட்டுமே!`
                    : `Token ${patient.token}: Only ${peopleAhead} patient${peopleAhead > 1 ? 's' : ''} ahead!`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-900 font-bold">
                  {currentLang === 'hi'
                    ? `कृपया ${roomName} (${deptName}) के बाहर प्रतीक्षा कक्ष में पहुंचें। अनुमानित समय ~${estWait} मिनट।`
                    : currentLang === 'ta'
                    ? `தயவுசெய்து ${roomName} (${deptName}) அருகில் காத்திருக்கவும். தோராய நேரம் ~${estWait} நிமிடம்.`
                    : `Please move near ${roomName} (${deptName}). Estimated wait: ~${estWait} mins.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissedForCloser(true)}
              className="p-2 text-slate-900/80 hover:text-slate-950 hover:bg-slate-950/10 rounded-xl transition-colors flex-shrink-0"
              title="Dismiss Alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-600/40">
            <button
              onClick={() => navigate('/my-turn')}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-200 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                {currentLang === 'hi'
                  ? 'कतार देखें'
                  : currentLang === 'ta'
                  ? 'வரிசையைக் காண்க'
                  : 'Track Live Queue'}
              </span>
            </button>

            <button
              onClick={() => navigate(`/find-place?to=${dept.roomId}`)}
              className="px-3.5 py-2 bg-white/80 hover:bg-white text-slate-900 rounded-xl font-extrabold text-xs flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {currentLang === 'hi'
                  ? `कमरे का रास्ता (${roomName})`
                  : currentLang === 'ta'
                  ? `வழிகாட்டுதல் (${roomName})`
                  : `Directions (${roomName})`}
              </span>
            </button>

            <button
              onClick={handleRepeatVoice}
              className="px-3 py-2 bg-white/60 hover:bg-white text-slate-900 rounded-xl font-black text-xs flex items-center gap-1.5 ml-auto"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentLang === 'hi'
                  ? 'आवाज में सुनें'
                  : currentLang === 'ta'
                  ? 'குரலில் கேட்க'
                  : 'Listen'}
              </span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Case C: Consultation Completed (Doctor ended session) -> Show Back to Patient Dashboard
  if (isCompleted && !dismissedForCompleted && location.pathname !== '/patient-dashboard') {
    return (
      <aside aria-label="Consultation Completed Alert" className="sticky top-14 z-50 px-3 sm:px-4 py-2 pointer-events-auto">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-yellow-300 ring-4 ring-emerald-400/50 space-y-3 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-300 text-emerald-950 flex items-center justify-center font-black text-2xl flex-shrink-0 animate-bounce">
                ✓
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-300 text-emerald-950 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {currentLang === 'hi'
                      ? 'जांच सम्पन्न • अस्पताल यात्रा पूर्ण'
                      : currentLang === 'ta'
                      ? 'பரிசோதனை முடிந்தது • பயணம் நிறைவு'
                      : 'CHECKUP DONE • JOURNEY COMPLETED'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                  {currentLang === 'hi'
                    ? `टोकन ${patient.token}: डॉक्टर परामर्श पूर्ण हो गया है!`
                    : currentLang === 'ta'
                    ? `டோக்கன் ${patient.token}: மருத்துவ ஆலோசனை முடிந்தது!`
                    : `Token ${patient.token}: Consultation Completed!`}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 font-semibold">
                  {currentLang === 'hi'
                    ? 'अस्पताल यात्रा के सभी 6 चरण पूरे हो चुके हैं। कृपया मरीज डैशबोर्ड देखें।'
                    : currentLang === 'ta'
                    ? 'அனைத்து 6 படிகளும் நிறைவடைந்தன. நோயாளி டாஷ்போர்டுக்கு செல்லவும்.'
                    : 'All 6 visit stages are completed. Click below to return to your Patient Dashboard.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissedForCompleted(true)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex-shrink-0"
              title="Dismiss Alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-500/40">
            <button
              onClick={() => {
                setDismissedForCompleted(true);
                navigate('/patient-dashboard');
              }}
              className="px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-emerald-950 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all ring-2 ring-white"
            >
              <span>👵</span>
              <span>
                {currentLang === 'hi'
                  ? 'मरीज डैशबोर्ड पर वापस जाएं (Back to Dashboard)'
                  : currentLang === 'ta'
                  ? 'நோயாளி டாஷ்போர்டு'
                  : 'Back to Patient Dashboard'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => {
                setDismissedForCompleted(true);
                navigate('/health-records');
              }}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 border border-white/20"
            >
              <span>🩺</span>
              <span>
                {currentLang === 'hi'
                  ? 'पर्चा व रिकॉर्ड देखें'
                  : currentLang === 'ta'
                  ? 'பதிவுகளைக் காண்க'
                  : 'View Records'}
              </span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
