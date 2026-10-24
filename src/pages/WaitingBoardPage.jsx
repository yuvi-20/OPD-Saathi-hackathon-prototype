import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/departments';
import { Volume2, VolumeX, Monitor, Clock, Siren, ArrowRight } from 'lucide-react';
import { speakText, playChime } from '../utils/tts';

export default function WaitingBoardPage() {
  const { patients, doctorStatus, t } = useApp();

  // Language cycling for TV: alternates every 8 seconds between 'hi', 'en', and 'ta'
  const [boardLang, setBoardLang] = useState('hi');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock ticker
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Language rotator for Waiting TV
  useEffect(() => {
    const langRotator = setInterval(() => {
      setBoardLang((curr) => {
        if (curr === 'hi') return 'en';
        if (curr === 'en') return 'ta';
        return 'hi';
      });
    }, 8000);
    return () => clearInterval(langRotator);
  }, []);

  // Listen for newly called tokens and announce over TV audio
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('opd_saathi_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'TOKEN_CALLED') {
          const { token, departmentId } = event.data.payload || {};
          const dept = DEPARTMENTS.find(d => d.id === departmentId);
          if (dept && soundEnabled) {
            playChime();
            setTimeout(() => {
              if (boardLang === 'hi') {
                speakText(`टोकन ${token}, कृपया ${dept.room} में जाएं।`, 'hi');
              } else if (boardLang === 'ta') {
                speakText(`டோக்கன் ${token}, ${dept.room}-க்கு செல்லவும்.`, 'ta');
              } else {
                speakText(`Token ${token}, please proceed to ${dept.room}.`, 'en');
              }
            }, 600);
          }
        }
      };
      return () => bc.close();
    }
  }, [boardLang, soundEnabled]);

  // Headers per language
  const headers = {
    hi: {
      hospital: "नगर जिला अस्पताल • लाइव ओपीडी प्रतीक्षा डिस्प्ले",
      hall: "प्रतीक्षा कक्ष A • प्रथम तल",
      nowServing: "वर्तमान टोकन (बुलाया गया)",
      nextTokens: "अगले 3 टोकन",
      doctorStatus: "डॉक्टर की स्थिति",
      announcement: "आवाज से घोषणा चालू है",
      ticker: "कृपया अपना ओपीडी पर्चा तैयार रखें। वरिष्ठ नागरिकों के लिए ग्राउंड फ्लोर हेल्प डेस्क पर व्हीलचेयर उपलब्ध है। आपातकालीन मरीज सीधे कैजुअल्टी वार्ड जाएं।"
    },
    en: {
      hospital: "CITY DISTRICT HOSPITAL • LIVE OPD QUEUE DISPLAY",
      hall: "WAITING HALL A • FIRST FLOOR",
      nowServing: "NOW SERVING",
      nextTokens: "NEXT 3 TOKENS",
      doctorStatus: "DOCTOR STATUS",
      announcement: "Spoken Voice Announcements Active",
      ticker: "Kindly keep your OPD slip ready. Wheelchairs available at Ground Floor Help Desk. Emergency cases report directly to Ground Floor Casualty."
    },
    ta: {
      hospital: "நகர மாவட்ட அரசு மருத்துவமனை • நேரலை ஓபிடி பலகை",
      hall: "காத்திருப்பு அறை A • முதல் தளம்",
      nowServing: "தற்போது அழைக்கப்படுவது",
      nextTokens: "அடுத்து வருபவர்கள் (3)",
      doctorStatus: "மருத்துவர் நிலை",
      announcement: "குரல் அறிவிப்பு இயங்குகிறது",
      ticker: "ஓபிடி சீட்டை கையில் வைத்திருக்கவும். முதியவர்களுக்கு தரைத்தள உதவி மையத்தில் சக்கர நாற்காலி கிடைக்கும். அவசர சிகிச்சை நோயாளிகள் நேரடியாக கேஷுவல்டி பிரிவுக்கு செல்லவும்."
    }
  };

  const h = headers[boardLang] || headers.en;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between select-none">
      {/* Top TV Board Header */}
      <div className="bg-slate-900 border-b-2 border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center font-black text-xl shadow-lg shadow-sky-900">
            TV
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{h.hospital}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-900 text-sky-200 border border-sky-700">
                {boardLang.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-sky-400 font-bold tracking-wide">
              {h.hall}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              soundEnabled ? 'bg-sky-950 border-sky-600 text-sky-300' : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title="Audio announcement toggle"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-sky-400" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden md:inline">{soundEnabled ? "Audio ON" : "Audio Muted"}</span>
          </button>

          <div className="text-right font-mono text-xl sm:text-2xl font-black text-amber-400">
            {currentTime}
          </div>
        </div>
      </div>

      {/* Main High-Visibility Room Cards Grid */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
        {DEPARTMENTS.map((dept) => {
          const deptPatients = patients.filter(p => p.departmentId === dept.id);
          const currentlyServing = deptPatients.find(p => p.status === 'serving');
          const waitingTokens = deptPatients.filter(p => p.status === 'waiting').slice(0, 3);
          const doc = doctorStatus[dept.id] || { status: 'available', delayMin: 0 };
          const deptName = dept[`name_${boardLang}`] || dept.name;

          return (
            <div
              key={dept.id}
              className="bg-slate-900 rounded-3xl p-5 border-2 border-slate-800 flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Room & Dept Title */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-amber-400 font-black text-lg">
                      {dept.room}
                    </span>
                    <h2 className="text-base font-bold text-slate-200 line-clamp-1">
                      {deptName}
                    </h2>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    doc.status === 'break'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : doc.status === 'running_late'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}>
                    {doc.status === 'break' ? `Break` : doc.status === 'running_late' ? `Late` : 'In OPD'}
                  </span>
                </div>

                {/* Big Serving Now Block */}
                <div className="my-4 bg-slate-950 border-2 border-sky-500 rounded-2xl p-4 text-center shadow-inner">
                  <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-widest block">
                    {h.nowServing}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight my-1">
                    {currentlyServing ? currentlyServing.token : "—"}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 block truncate">
                    {currentlyServing ? currentlyServing.name : "Waiting..."}
                  </span>
                </div>
              </div>

              {/* Next In Line */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {h.nextTokens}:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {waitingTokens.length > 0 ? (
                    waitingTokens.map((p, idx) => (
                      <span
                        key={p.token}
                        className="bg-slate-800 text-slate-200 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-slate-700"
                      >
                        #{idx + 1} {p.token}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600 italic">Queue clear</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Marquee News Ticker */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-sky-950 border-t-2 border-slate-800 py-2.5 px-4 overflow-hidden relative flex items-center">
        <span className="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded shadow-md z-10 mr-3 flex-shrink-0 flex items-center gap-1">
          <Siren className="w-3.5 h-3.5 animate-pulse" />
          <span>NOTICE</span>
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <span className="ticker-content text-sm font-bold text-amber-200 tracking-wide">
            {h.ticker} • {h.announcement} • OPD Timings 9:00 AM to 2:00 PM • Emergencies report to Casualty 24x7.
          </span>
        </div>
      </div>
    </div>
  );
}
