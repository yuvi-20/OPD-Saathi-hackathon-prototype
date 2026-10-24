import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDepartmentById } from '../data/departments';
import {
  Clock,
  Users,
  CheckCircle2,
  Navigation,
  Bell,
  MessageSquare,
  AlertCircle,
  Volume2,
  ArrowRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { speakText, playChime } from '../utils/tts';
import HospitalJourneyStepper from '../components/HospitalJourneyStepper';

export default function MyTurnPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  const {
    activeToken,
    setActiveToken,
    patients,
    doctorStatus,
    t,
    language,
    getEstimatedWait
  } = useApp();

  const navigate = useNavigate();

  // If token param in URL, set as active
  useEffect(() => {
    if (tokenParam && tokenParam !== activeToken) {
      setActiveToken(tokenParam);
    }
  }, [tokenParam, activeToken, setActiveToken]);

  // Current Patient
  const patient = patients.find(p => p.token === (tokenParam || activeToken)) || null;

  if (!patient) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md space-y-4">
          <div className="text-5xl">⏱️</div>
          <h2 className="text-xl font-black text-slate-900">
            {language === 'hi' ? 'कोई सक्रिय टोकन नहीं मिला' : 'No Active Token Selected'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'hi'
              ? 'कृपया पहले अपना ओपीडी टोकन पर्चा चुनें या नया टोकन प्राप्त करें।'
              : 'Please enter your OPD token or generate a new token to track your live turn.'}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigate('/have-slip')}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-sm"
            >
              {language === 'hi' ? 'मेरे पास पर्चा है (Find Token)' : 'I Have My Slip'}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm"
            >
              {language === 'hi' ? 'नया पर्चा बनाएं (Register)' : 'New OPD Registration'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dept = getDepartmentById(patient?.departmentId || 'general_medicine');
  const deptName = dept[`name_${language}`] || dept.name;

  // Queue calculation
  const deptWaiting = patients.filter(
    p => p.departmentId === dept.id && p.status === 'waiting'
  );
  const currentlyServing = patients.find(
    p => p.departmentId === dept.id && p.status === 'serving'
  );

  const targetIdx = deptWaiting.findIndex(p => p.token === patient?.token);
  const isCalled = patient?.status === 'serving';
  const isCompleted = patient?.status === 'completed';

  const peopleAhead = isCalled
    ? 0
    : targetIdx !== -1
    ? targetIdx
    : deptWaiting.length;

  const estWait = getEstimatedWait(dept.id, patient?.token);
  const doc = doctorStatus[dept.id] || { status: 'available', delayMin: 0 };

  // 3-Ahead Proactive Alert Trigger
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [showSimulatedSms, setShowSimulatedSms] = useState(false);
  const [calledAlertTriggered, setCalledAlertTriggered] = useState(false);
  const [completedVoiceTriggered, setCompletedVoiceTriggered] = useState(false);

  // Alert when checkup is completed
  useEffect(() => {
    if (isCompleted && !completedVoiceTriggered) {
      setCompletedVoiceTriggered(true);
      playChime();
      const completedVoice = language === 'hi'
        ? `टोकन ${patient?.token}, आपकी डॉक्टर जांच पूरी हो चुकी है। आप कतार से बाहर आ चुके हैं। कृपया अपना डिजिटल पर्चा और डॉक्टर सलाह देखें।`
        : language === 'ta'
        ? `டோக்கன் ${patient?.token}, உங்கள் மருத்துவ பரிசோதனை முடிந்தது. நீங்கள் இனி காத்திருப்பு வரிசையில் இல்லை. உங்கள் டிஜிட்டல் மருந்துச்சீட்டைப் பார்க்கவும்.`
        : `Token ${patient?.token}, your doctor checkup is completed! You are no longer in the waiting queue. Please review your digital prescription and doctor advice.`;
      speakText(completedVoice, language);
    }
  }, [isCompleted, completedVoiceTriggered, patient?.token, language]);

  // Alert when token is called into doctor's room
  useEffect(() => {
    if (isCalled && !calledAlertTriggered) {
      setCalledAlertTriggered(true);
      playChime();
      const calledVoice = language === 'hi'
        ? `आपकी बारी आ गई है! टोकन ${patient?.token}, कृपया तुरंत कमरा ${dept.room} में जाएं।`
        : language === 'ta'
        ? `உங்கள் முறை வந்துவிட்டது! டோக்கன் ${patient?.token}, அறை ${dept.room}-க்குள் செல்லவும்.`
        : `Your turn has come! Token ${patient?.token}, please proceed immediately to ${dept.room}.`;
      speakText(calledVoice, language);
    }
  }, [isCalled, calledAlertTriggered, patient?.token, dept.room, language]);

  useEffect(() => {
    // Check if peopleAhead <= 3 and patient is waiting
    if (!isCalled && !isCompleted && peopleAhead > 0 && peopleAhead <= 3 && !alertTriggered) {
      setAlertTriggered(true);
      setShowSimulatedSms(true);
      playChime();

      // Browser Notification if granted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(t.myTurn.closeAlertTitle, {
            body: t.myTurn.closeAlertBody,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }

      // Voice read
      speakText(`${t.myTurn.closeAlertTitle}. ${t.myTurn.closeAlertBody}`, language);
    }
  }, [peopleAhead, isCalled, isCompleted, alertTriggered, language, t]);

  const handleReadStatus = () => {
    if (isCalled) {
      speakText(`${t.myTurn.calledTitle}. ${t.myTurn.calledBody.replace('{room}', dept.room)}`, language);
    } else {
      speakText(
        `${t.myTurn.title}. ${t.myTurn.aheadCount.replace('{count}', peopleAhead)}. ${t.myTurn.waitEstimate.replace('{min}', estWait)}.`,
        language
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Simulated SMS Alert Popup Modal */}
      {showSimulatedSms && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 border-2 border-amber-400 shadow-2xl space-y-3 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>{t.myTurn.simulatedSmsTitle}</span>
            </div>
            <button
              onClick={() => setShowSimulatedSms(false)}
              className="text-xs text-slate-400 hover:text-white underline font-bold"
            >
              {t.buttons.close}
            </button>
          </div>
          <p className="text-sm sm:text-base font-semibold text-slate-100 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            💬 "Govt Hospital Alert: Token {patient?.token}, your turn is approaching! Only {peopleAhead} patients ahead. Please proceed to {dept.room} on 1st Floor."
          </p>
        </div>
      )}

      {/* STATE 0: DOCTOR CONSULTATION COMPLETED (CHECKUP FINISHED - NOT IN QUEUE) */}
      {isCompleted && (
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-300 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-400/20 border-2 border-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-emerald-300" />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-yellow-300 text-emerald-950 font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest shadow-sm">
              {language === 'hi' ? 'जांच सम्पन्न • कतार समाप्त' : 'CONSULTATION COMPLETED'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {language === 'hi' ? 'डॉक्टर परामर्श पूर्ण हो गया है' : 'Doctor Checkup Completed!'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base font-semibold max-w-md mx-auto">
              {language === 'hi'
                ? `टोकन ${patient?.token} (${patient?.name}) की जांच पूरी हो चुकी है। अब आप कतार में नहीं हैं।`
                : `Token ${patient?.token} (${patient?.name}), your examination with ${dept.doctorName} is finished. You are no longer in the waiting queue.`}
            </p>
          </div>

          {/* Consultation Summary pill box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-left space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
              {language === 'hi' ? 'मुलाकात का विवरण (Visit Summary)' : 'Visit Summary'}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-emerald-200 block text-[11px]">{language === 'hi' ? 'विभाग / कमरा' : 'Department'}</span>
                <span className="font-extrabold text-white">{deptName} ({dept.room})</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[11px]">{language === 'hi' ? 'डॉक्टर' : 'Doctor'}</span>
                <span className="font-extrabold text-white">{dept.doctorName}</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[11px]">{language === 'hi' ? 'टोकन संख्या' : 'Token No.'}</span>
                <span className="font-extrabold text-white">{patient?.token}</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[11px]">{language === 'hi' ? 'स्थिति' : 'Status'}</span>
                <span className="font-extrabold text-yellow-300">✓ {language === 'hi' ? 'जांच सम्पन्न (Finished)' : 'Checkup Finished'}</span>
              </div>
            </div>
          </div>

          {/* Next Steps Guidance */}
          <div className="bg-emerald-950/60 rounded-2xl p-4 sm:p-5 border border-emerald-500/40 text-left space-y-2">
            <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
              <span>👉</span>
              <span>{language === 'hi' ? 'अगला कदम क्या करें? (Next Steps)' : 'What to do next:'}</span>
            </span>
            <ul className="text-xs sm:text-sm text-emerald-100 space-y-2 list-disc list-inside font-medium">
              <li>{language === 'hi' ? 'डॉक्टर का डिजिटल पर्चा और दवा सलाह देखें।' : 'Review your digital prescription and medicine dosage.'}</li>
              <li>{language === 'hi' ? 'यदि कोई जांच (खून/जांच) लिखी गई है तो लैब टेस्ट निर्देश देखें।' : 'Check ordered laboratory or diagnostic tests if recommended.'}</li>
              <li>{language === 'hi' ? 'अपने सभी स्वास्थ्य रिकॉर्ड कभी भी अपने फोन पर सुरक्षित देखें।' : 'Access your complete digital health records anytime on your device.'}</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary Button: Back to Patient Dashboard */}
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="w-full min-h-[64px] py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-xl rounded-2xl shadow-2xl flex items-center justify-center gap-3 transform active:scale-95 transition-all ring-4 ring-yellow-300 animate-bounce-short"
            >
              <span className="text-2xl">👵</span>
              <span>{language === 'hi' ? 'मरीज डैशबोर्ड पर वापस जाएं (Back to Dashboard)' : 'Back to Patient Dashboard'}</span>
              <ArrowRight className="w-6 h-6 ml-1 flex-shrink-0" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/health-records')}
                className="min-h-[50px] py-2.5 px-3 bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <span>🩺</span>
                <span>{language === 'hi' ? 'डिजिटल पर्चा व स्वास्थ्य रिकॉर्ड' : 'View Digital Prescription & Records'}</span>
              </button>

              <button
                onClick={() => navigate('/find-place?to=ground_entrance')}
                className="min-h-[50px] py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-white/30 active:scale-95 transition-all"
              >
                <span>🚪</span>
                <span>{language === 'hi' ? 'अस्पताल निकास (Exit Gate 1)' : 'Hospital Exit (Gate 1)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: TOKEN IS CALLED (NOW SERVING THIS PATIENT!) */}
      {!isCompleted && isCalled && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-300 text-center space-y-4 animate-bounce-short">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Sparkles className="w-10 h-10 text-yellow-300" />
          </div>

          <div>
            <span className="bg-yellow-300 text-emerald-950 font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest">
              PLEASE GO IN NOW
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
              {t.myTurn.calledTitle}
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg font-bold mt-1">
              Token {patient?.token} • {dept.room}
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 text-emerald-50 text-sm font-medium">
            Doctor {dept.doctorName} is ready to examine you inside {dept.room}.
          </div>

          <button
            onClick={() => navigate(`/find-place?to=${dept.roomId}`)}
            className="w-full min-h-[60px] bg-white hover:bg-slate-100 text-emerald-900 font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            <Navigation className="w-6 h-6 text-emerald-700" />
            <span>Show Directions to {dept.room}</span>
          </button>
        </div>
      )}

      {/* STATE 2: 3-AHEAD BANNER ALERT */}
      {!isCompleted && !isCalled && peopleAhead <= 3 && peopleAhead > 0 && (
        <div className="bg-amber-500 text-slate-950 rounded-3xl p-5 border-4 border-amber-300 shadow-xl space-y-2 animate-pulse">
          <div className="flex items-center gap-2.5 font-black text-base sm:text-lg">
            <Bell className="w-6 h-6 text-slate-950" />
            <span>{t.myTurn.closeAlertTitle}</span>
          </div>
          <p className="font-bold text-sm text-slate-900">
            {t.myTurn.closeAlertBody} ({dept.room}, 1st Floor)
          </p>
        </div>
      )}

      {/* LIVE QUEUE STATUS CARD (ONLY SHOWN WHILE WAITING OR BEING EXAMINED) */}
      {!isCompleted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                LIVE QUEUE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {deptName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {dept.room} • {dept.doctorName}
              </p>
            </div>

            <button
              onClick={handleReadStatus}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center gap-1.5"
              title="Read live status aloud"
            >
              <Volume2 className="w-6 h-6 text-sky-600" />
            </button>
          </div>

          {/* Current Patient Token Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 text-center space-y-2 shadow-inner">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              {t.myTurn.tokenLabel}
            </span>
            <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              {patient?.token}
            </div>
            <div className="text-sm font-medium text-slate-300">
              {patient?.name} ({patient?.age}y / {patient?.gender})
            </div>
          </div>

          {/* Serving Now vs Ahead in Queue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-sky-800 font-bold uppercase tracking-wider block">
                {t.myTurn.currentServing}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-sky-950">
                {currentlyServing ? currentlyServing.token : "Calling Next..."}
              </div>
              <span className="text-xs text-sky-700 block">
                {currentlyServing ? currentlyServing.name : "Door opening soon"}
              </span>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-indigo-800 font-bold uppercase tracking-wider block">
                Your Position
              </span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-950">
                {isCalled ? "0 (Inside)" : `${peopleAhead} ahead`}
              </div>
              <span className="text-xs text-indigo-700 block">
                Est. wait: ~{estWait} mins
              </span>
            </div>
          </div>

          {/* Doctor Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900">{t.myTurn.doctorStatus}:</h4>
              <p className="text-slate-600 mt-0.5">
                {doc.status === 'break'
                  ? t.myTurn.docBreak.replace('{time}', doc.breakUntil || '11:30')
                  : doc.status === 'running_late'
                  ? t.myTurn.docLate.replace('{min}', doc.delayMin || '15')
                  : t.myTurn.docAvailable}
              </p>
            </div>
          </div>

          {/* Directions Link */}
          <button
            onClick={() => navigate(`/find-place?to=${dept.roomId}`)}
            className="w-full min-h-[56px] bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base rounded-2xl shadow-md flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5 text-emerald-400" />
            <span>{t.buttons.getDirections} ({dept.room})</span>
          </button>

          {/* Patient Dashboard & Records Links */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="py-3 px-4 rounded-xl border-2 border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span>👵</span>
              <span>{language === 'hi' ? 'मरीज डैशबोर्ड' : 'My Dashboard'}</span>
            </button>

            <button
              onClick={() => navigate('/health-records')}
              className="py-3 px-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span>🩺</span>
              <span>{language === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'Health Records'}</span>
            </button>
          </div>

          {/* Live sync footnote */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.myTurn.lastUpdated}</span>
            </span>
          </div>
        </div>
      )}

      {/* Hospital Journey Stepper */}
      <HospitalJourneyStepper
        currentStage={
          isCompleted
            ? 'completed'
            : isCalled
            ? 'doctor'
            : peopleAhead <= 3
            ? 'navigation'
            : 'queue'
        }
      />
    </div>
  );
}
