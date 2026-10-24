import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Ticket,
  Users,
  Navigation,
  Stethoscope,
  Volume2
} from 'lucide-react';
import { speakText } from '../utils/tts';

export default function HospitalJourneyStepper({ currentStage = 'queue' }) {
  const { language, t } = useApp();

  // Exactly 6 core hospital visit journey stages
  const stages = [
    {
      id: 'registration',
      step: 1,
      label_en: '1. Registration',
      label_hi: '1. मरीज पंजीकरण',
      label_ta: '1. நோயாளி பதிவு',
      icon: FileText
    },
    {
      id: 'token',
      step: 2,
      label_en: '2. OPD Token',
      label_hi: '2. ओपीडी पर्चा',
      label_ta: '2. ஓபிடி டோக்கன்',
      icon: Ticket
    },
    {
      id: 'queue',
      step: 3,
      label_en: '3. Waiting in Queue',
      label_hi: '3. कतार प्रतीक्षा',
      label_ta: '3. காத்திருப்பு',
      icon: Users
    },
    {
      id: 'navigation',
      step: 4,
      label_en: '4. Ward Directions',
      label_hi: '4. कमरे का रास्ता',
      label_ta: '4. அறை வழி',
      icon: Navigation
    },
    {
      id: 'doctor',
      step: 5,
      label_en: '5. Doctor Checkup',
      label_hi: '5. डॉक्टर जांच',
      label_ta: '5. மருத்துவர் ஆலோசனை',
      icon: Stethoscope
    },
    {
      id: 'completed',
      step: 6,
      label_en: '6. Checkup Completed',
      label_hi: '6. जांच सम्पन्न',
      label_ta: '6. பரிசோதனை முடிந்தது',
      icon: CheckCircle2
    }
  ];

  const stageOrder = stages.map(s => s.id);
  const currentIdx = stageOrder.indexOf(currentStage) !== -1 ? stageOrder.indexOf(currentStage) : 2;
  const isCheckupCompleted = currentStage === 'completed';

  const getStatus = (idx) => {
    if (isCheckupCompleted) {
      // When checkup is completed, all 6 stages are marked complete
      return 'completed';
    }
    if (idx < currentIdx) return 'completed';
    if (idx === currentIdx) return 'current';
    return 'upcoming';
  };

  const completedCount = stages.filter((_, idx) => getStatus(idx) === 'completed').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  const handleVoiceRead = () => {
    if (isCheckupCompleted) {
      const msg = language === 'hi'
        ? 'बधाई हो! आपकी डॉक्टर जांच पूरी हो चुकी है। अस्पताल यात्रा के सभी 6 चरण सम्पन्न हो चुके हैं।'
        : language === 'ta'
        ? 'வாழ்த்துகள்! உங்கள் மருத்துவ பரிசோதனை முடிந்தது. அனைத்து 6 படிகளும் நிறைவடைந்தன.'
        : 'Congratulations! Your doctor checkup is completed. All 6 stages of your hospital visit are complete.';
      speakText(msg, language);
      return;
    }

    const stage = stages[currentIdx] || stages[2];
    const stageName = language === 'hi' ? stage.label_hi : language === 'ta' ? stage.label_ta : stage.label_en;
    const msg = language === 'hi'
      ? `अस्पताल यात्रा: वर्तमान चरण ${stageName} है। कुल 6 में से ${completedCount} चरण पूरे हो चुके हैं।`
      : `Hospital Journey: Current step is ${stageName}. ${completedCount} of 6 steps completed.`;
    speakText(msg, language);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-md space-y-5 transition-all">
      {/* Header and Progress Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === 'hi' ? '🏥 अस्पताल यात्रा प्रगति' : '🏥 Hospital Visit Journey'}
            </h3>
            <span className={`text-xs font-black px-3 py-0.5 rounded-full border ${
              isCheckupCompleted
                ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                : 'bg-sky-100 text-sky-900 border-sky-300'
            }`}>
              {isCheckupCompleted
                ? (language === 'hi' ? 'जांच सम्पन्न ✓' : 'Checkup Done ✓')
                : `Step ${currentIdx + 1} of ${stages.length}`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            {isCheckupCompleted
              ? (language === 'hi' ? 'डॉक्टर जांच पूर्ण हो चुकी है • कतार समाप्त' : 'Doctor checkup complete • Queue exited')
              : (language === 'hi' ? 'देखें अस्पताल में कौन-से चरण पूरे हुए और आगे क्या करना है' : 'Track your completed steps and current queue status')}
          </p>
        </div>

        <button
          onClick={handleVoiceRead}
          className="self-start sm:self-auto p-2 sm:px-3.5 sm:py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-xl font-black text-xs flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-sm"
          title="Listen Journey Status"
        >
          <Volume2 className="w-4 h-4 text-sky-700" />
          <span>{language === 'hi' ? 'आवाज में सुनें' : 'Read Out'}</span>
        </button>
      </div>

      {/* Progress Bar Line */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-black text-slate-600">
          <span>{language === 'hi' ? `प्रगति: 6 में से ${completedCount} चरण पूर्ण` : `Progress: ${completedCount} of 6 steps completed`}</span>
          <span className="text-sky-700 font-black">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCheckupCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600'
            }`}
            style={{ width: `${Math.max(16, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* SUCCESS CALLOUT BANNER WHEN CHECKUP IS COMPLETED */}
      {isCheckupCompleted && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-yellow-300 flex items-start gap-3 sm:gap-4 animate-in slide-in-from-top-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-yellow-300 text-emerald-950 flex items-center justify-center font-black text-xl sm:text-2xl flex-shrink-0 shadow-md">
            ✓
          </div>
          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-300 text-emerald-950 text-xs font-black uppercase tracking-wider">
              <span>{language === 'hi' ? 'जांच सम्पन्न • CHECKUP COMPLETED' : 'CHECKUP COMPLETED'}</span>
            </div>
            <h4 className="text-base sm:text-lg font-black tracking-tight">
              {language === 'hi' ? 'डॉक्टर परामर्श पूरा हो चुका है! आप अब कतार में नहीं हैं।' : 'Doctor checkup completed! You are no longer in the waiting queue.'}
            </h4>
            <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-relaxed">
              {language === 'hi'
                ? 'अस्पताल यात्रा के सभी 6 चरण पूरे हो चुके हैं। आपका डिजिटल ओपीडी पर्चा सुरक्षित सहेज लिया गया है।'
                : 'All 6 stages of your hospital visit are completed. Your OPD visit records are safely stored.'}
            </p>
          </div>
        </div>
      )}

      {/* Grid of 6 Wide Rectangular Boxes (Width Greater than Height) with Smooth Rounded Corners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stages.map((stage, idx) => {
          const status = getStatus(idx);
          const Icon = stage.icon;
          const label = language === 'hi' ? stage.label_hi : language === 'ta' ? stage.label_ta : stage.label_en;

          let cardStyle = 'bg-slate-50 border-2 border-slate-300 text-slate-700 hover:border-slate-400';
          let statusBadge = 'bg-slate-200 text-slate-700 border border-slate-300 font-bold';
          let statusText = language === 'hi' ? 'आगे' : 'Next';
          let iconWrapper = 'bg-slate-200 text-slate-600';
          let StatusIcon = Circle;

          if (status === 'completed') {
            cardStyle = 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 text-emerald-950 shadow-sm';
            statusBadge = 'bg-emerald-600 text-white font-black shadow-sm';
            statusText = language === 'hi' ? 'पूरा हुआ ✓' : 'Done ✓';
            iconWrapper = 'bg-emerald-200/90 text-emerald-800';
            StatusIcon = CheckCircle2;
          } else if (status === 'current') {
            cardStyle = 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-300 animate-pulse-gentle';
            statusBadge = 'bg-amber-400 text-slate-950 font-black ring-1 ring-amber-300 shadow-sm';
            statusText = language === 'hi' ? 'चालू है ⏳' : 'Active ⏳';
            iconWrapper = 'bg-amber-200 text-amber-950';
            StatusIcon = Clock;
          }

          return (
            <div
              key={stage.id}
              className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl transition-all flex flex-col justify-between min-h-[96px] sm:min-h-[105px] h-full ${cardStyle}`}
            >
              {/* Top Row: Icon + Status Chip */}
              <div className="flex items-center justify-between gap-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${iconWrapper}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black flex items-center gap-1 ${statusBadge}`}>
                  <StatusIcon className="w-3 h-3 flex-shrink-0" />
                  <span>{statusText}</span>
                </span>
              </div>

              {/* Bottom Row: Clear Bold Label */}
              <p className="text-xs sm:text-sm font-black leading-snug break-words mt-2">
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Helpful Footnote */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
        <span>
          {language === 'hi'
            ? '💡 सुझाव: अपना ओपीडी पर्चा और डॉक्टर सलाह किसी भी समय "स्वास्थ्य रिकॉर्ड" में डिजिटल रूप से देख सकते हैं।'
            : '💡 Tip: Access your OPD slip and doctor prescriptions anytime under "Health Records".'}
        </span>
      </div>
    </div>
  );
}
