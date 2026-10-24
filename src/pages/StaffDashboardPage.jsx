import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/departments';
import {
  Siren,
  Users,
  Clock,
  PhoneForwarded,
  UserX,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  MoveRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { playClickBeep } from '../utils/tts';

export default function StaffDashboardPage() {
  const {
    patients,
    doctorStatus,
    urgentFlags,
    activeToken,
    callNextPatient,
    callPatientByToken,
    completeConsultation,
    markNoShow,
    sendToEndOfQueue,
    movePatientDepartment,
    updateDoctorStatus,
    markUrgentFlagSeen,
    add20DemoPatients,
    resetAllDemoData,
    isDemoSpeed10x,
    setIsDemoSpeed10x,
    t,
    language
  } = useApp();

  const navigate = useNavigate();

  // State for move department modal
  const [movingPatientToken, setMovingPatientToken] = useState(null);

  // Overcrowding capacity thresholds (Waiting Hall A has 60 seats)
  const safePatients = patients || [];
  const totalWaitingCount = safePatients.filter(p => p && p.status === 'waiting').length;
  let overcrowdingLevel = 'low';
  let overcrowdingColor = 'bg-emerald-500 text-white';
  let overcrowdingText = t?.staff?.lowDensity || 'Low (Normal)';

  if (totalWaitingCount > 45) {
    overcrowdingLevel = 'high';
    overcrowdingColor = 'bg-red-600 text-white animate-pulse';
    overcrowdingText = t?.staff?.highDensity || 'High';
  } else if (totalWaitingCount > 25) {
    overcrowdingLevel = 'medium';
    overcrowdingColor = 'bg-amber-500 text-slate-950';
    overcrowdingText = t?.staff?.mediumDensity || 'Moderate';
  }

  const handleCallNext = (deptId) => {
    playClickBeep();
    callNextPatient(deptId);
  };

  const handleDocStatusToggle = (deptId, newStatus) => {
    playClickBeep();
    if (newStatus === 'available') {
      updateDoctorStatus(deptId, { status: 'available', delayMin: 0, breakUntil: null });
    } else if (newStatus === 'break') {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);
      const breakTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      updateDoctorStatus(deptId, { status: 'break', delayMin: 0, breakUntil: breakTimeStr });
    } else if (newStatus === 'late') {
      const currentDelay = doctorStatus[deptId]?.delayMin || 0;
      updateDoctorStatus(deptId, { status: 'running_late', delayMin: currentDelay + 15 });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Top Staff Notice Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.staff.title}
            </h1>
            <span className="bg-sky-100 text-sky-800 font-extrabold text-xs px-2.5 py-1 rounded-full border border-sky-300">
              DESK VIEW
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.staff.notice}
          </p>
        </div>

        {/* Overcrowding Density Indicator */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm flex-shrink-0">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Waiting Hall A Density ({totalWaitingCount}/60 seats)
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${overcrowdingColor}`}>
                {overcrowdingText}
              </span>
              <span className="text-xs font-bold text-slate-700">
                {totalWaitingCount} waiting
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PINNED URGENT EMERGENCY FLAGS ALERT SECTION */}
      {urgentFlags.length > 0 && (
        <div className="bg-red-600 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-yellow-300 space-y-4 animate-urgent">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Siren className="w-8 h-8 text-yellow-300 animate-bounce flex-shrink-0" />
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  {t.staff.urgentAlertTitle} ({urgentFlags.length})
                </h2>
                <p className="text-red-100 text-xs sm:text-sm">
                  {t.staff.urgentAlertDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {urgentFlags.map((flag) => (
              <div
                key={flag.id}
                className="bg-white text-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 font-black text-xs px-2.5 py-0.5 rounded-full">
                      TOKEN: {flag.token}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(flag.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {flag.message} • Location: {flag.location}
                  </p>
                </div>

                <button
                  onClick={() => markUrgentFlagSeen(flag.id)}
                  className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 flex-shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.staff.markAttended}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEMO CONTROLS BAR (Hackathon Rapid Demo) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border-2 border-indigo-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.staff.demoControlsTitle}</span>
          </div>

          <span className="text-xs text-slate-400">
            Simulate real patient flow in front of judges in seconds!
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Add 20 Patients */}
          <button
            onClick={add20DemoPatients}
            className="min-h-[46px] px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>{t.buttons.add20}</span>
          </button>

          {/* 10x Speed Auto Simulation */}
          <button
            onClick={() => setIsDemoSpeed10x(!isDemoSpeed10x)}
            className={`min-h-[46px] px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
              isDemoSpeed10x
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isDemoSpeed10x ? "10x Speed ACTIVE (Auto-Advancing)" : t.buttons.speed10x}</span>
          </button>

          {/* Patient Health Records Shortcut */}
          <button
            onClick={() => navigate('/health-records')}
            className="min-h-[46px] px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>🩺</span>
            <span>View Shared Health Records</span>
          </button>

          {/* 1-Click Demo: Call Active Patient to test Turn Notification */}
          {activeToken && safePatients.some(p => p && p.token === activeToken && p.status === 'waiting') && (
            <button
              onClick={() => {
                playClickBeep();
                callPatientByToken(activeToken);
              }}
              className="min-h-[46px] px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all ring-2 ring-emerald-300 animate-pulse"
              title="Instant Demo: Call Active Patient to test notification"
            >
              <span>📢</span>
              <span>Demo: Call Active Patient ({activeToken})</span>
            </button>
          )}

          {/* 1-Click Demo: Doctor End Session / Complete Checkup for Active Patient */}
          {activeToken && safePatients.some(p => p && p.token === activeToken && p.status === 'serving') && (
            <button
              onClick={() => {
                playClickBeep();
                completeConsultation(activeToken);
              }}
              className="min-h-[46px] px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all ring-2 ring-yellow-300 animate-pulse"
              title="Doctor Ends Session: Marks checkup completed for active patient"
            >
              <CheckCircle2 className="w-4 h-4 text-yellow-300" />
              <span>Demo: Doctor End Session / Checkup Done ({activeToken})</span>
            </button>
          )}

          {/* Reset All */}
          <button
            onClick={resetAllDemoData}
            className="min-h-[46px] px-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.buttons.reset}</span>
          </button>
        </div>
      </div>

      {/* OPD DEPARTMENTS QUEUE MANAGEMENT GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t.staff.queueManagement}
          </h2>
          <button
            onClick={() => navigate('/counter')}
            className="text-xs sm:text-sm font-bold text-sky-700 hover:underline flex items-center gap-1"
          >
            <span>Registration Counter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEPARTMENTS.map((dept) => {
            const deptPatients = safePatients.filter(p => p && p.departmentId === dept.id);
            const currentlyServing = deptPatients.find(p => p && p.status === 'serving');
            const waitingPatients = deptPatients.filter(p => p && p.status === 'waiting');
            const doc = (doctorStatus && doctorStatus[dept.id]) || { status: 'available', delayMin: 0 };
            const deptName = dept[`name_${language}`] || dept.name;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-md space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-lg text-slate-900">
                        {dept.room} • {deptName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      👨‍⚕️ {dept.doctorName}
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    doc.status === 'break'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : doc.status === 'running_late'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {doc.status === 'break'
                      ? `Break until ${doc.breakUntil || '11:30'}`
                      : doc.status === 'running_late'
                      ? `Late (+${doc.delayMin}m)`
                      : 'Available'}
                  </span>
                </div>

                {/* Queue Numbers Bar */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-sky-800 uppercase block">
                      {t.staff.servingToken}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-sky-950 block mt-0.5">
                      {currentlyServing ? currentlyServing.token : "—"}
                    </span>
                    <span className="text-[11px] text-sky-700 block truncate">
                      {currentlyServing ? currentlyServing.name : "None inside"}
                    </span>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-indigo-800 uppercase block">
                      {t.staff.waitingCount}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-indigo-950 block mt-0.5">
                      {waitingPatients.length}
                    </span>
                    <span className="text-[11px] text-indigo-700 block">
                      Avg wait: ~{waitingPatients.length * dept.avgConsultationMin}m
                    </span>
                  </div>
                </div>

                {/* Staff Actions for Next Token */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCallNext(dept.id)}
                    className="flex-1 min-h-[50px] bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t.buttons.callNext}</span>
                  </button>

                  {currentlyServing && (
                    <button
                      onClick={() => {
                        playClickBeep();
                        completeConsultation(currentlyServing.token);
                      }}
                      className="min-h-[50px] px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all ring-1 ring-emerald-300"
                      title="Doctor finishes consultation: marks checkup complete and ends session"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>End Session ✓</span>
                    </button>
                  )}

                  {currentlyServing && (
                    <button
                      onClick={() => markNoShow(currentlyServing.token)}
                      className="min-h-[50px] px-3 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1 transition-colors"
                      title={t.buttons.noShow}
                    >
                      <UserX className="w-4 h-4" />
                      <span>{t.buttons.noShow}</span>
                    </button>
                  )}
                </div>

                {/* Next in Line Preview */}
                {waitingPatients.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Next up:
                    </span>
                    <div className="space-y-1">
                      {waitingPatients.slice(0, 2).map((wp, idx) => (
                        <div
                          key={wp.token}
                          className={`flex items-center justify-between text-xs font-semibold p-2 rounded-lg border ${
                            wp.token === activeToken
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="truncate">
                            #{idx + 1} {wp.token} ({wp.name})
                            {wp.token === activeToken && (
                              <span className="ml-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black uppercase">
                                Active Patient
                              </span>
                            )}
                          </span>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                playClickBeep();
                                callPatientByToken(wp.token);
                              }}
                              className="text-[10px] px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                              title="Call this patient now"
                            >
                              Call
                            </button>
                            <button
                              onClick={() => sendToEndOfQueue(wp.token)}
                              className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold"
                              title="Send to end of queue"
                            >
                              End
                            </button>
                            <button
                              onClick={() => setMovingPatientToken(wp.token)}
                              className="text-[10px] px-1.5 py-0.5 bg-sky-100 hover:bg-sky-200 rounded text-sky-800 font-bold"
                              title="Transfer to another doctor"
                            >
                              Move
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Status Quick Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-400 font-bold">Doc Status:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDocStatusToggle(dept.id, 'available')}
                      className={`px-2 py-1 rounded font-bold ${
                        doc.status === 'available' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Avail
                    </button>
                    <button
                      onClick={() => handleDocStatusToggle(dept.id, 'break')}
                      className={`px-2 py-1 rounded font-bold ${
                        doc.status === 'break' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Break
                    </button>
                    <button
                      onClick={() => handleDocStatusToggle(dept.id, 'late')}
                      className={`px-2 py-1 rounded font-bold ${
                        doc.status === 'running_late' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      +15m Late
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOVE DEPARTMENT MODAL */}
      {movingPatientToken && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-slate-300 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900">
              Transfer Token {movingPatientToken} to Another OPD
            </h3>
            <p className="text-xs text-slate-500">
              Select destination department for patient:
            </p>

            <div className="space-y-2">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    movePatientDepartment(movingPatientToken, d.id);
                    setMovingPatientToken(null);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-left font-bold text-sm text-slate-800 flex items-center justify-between"
                >
                  <span>{d.room} • {d[`name_${language}`] || d.name}</span>
                  <MoveRight className="w-4 h-4 text-sky-600" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setMovingPatientToken(null)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm"
            >
              {t.buttons.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
