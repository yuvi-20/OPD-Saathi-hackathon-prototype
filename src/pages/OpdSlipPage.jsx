import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDepartmentById } from '../data/departments';
import { QrCodeSvg } from '../utils/qrCode';
import LargeTokenCard from '../components/LargeTokenCard';
import HospitalJourneyStepper from '../components/HospitalJourneyStepper';
import {
  Printer,
  Volume2,
  Maximize2,
  Navigation,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  Share2
} from 'lucide-react';
import { speakText } from '../utils/tts';

export default function OpdSlipPage() {
  const {
    currentPatient,
    currentAccount,
    t,
    language,
    getEstimatedWait,
    patients
  } = useApp();

  const navigate = useNavigate();
  const [showLargeCard, setShowLargeCard] = useState(false);

  const patient = currentPatient;

  if (!patient) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-md space-y-4">
          <div className="text-5xl">🎫</div>
          <h2 className="text-xl font-black text-slate-900">
            {language === 'hi' ? 'कोई सक्रिय ओपीडी पर्चा नहीं मिला' : 'No Active OPD Slip Found'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'hi'
              ? 'कृपया पहले नया पंजीकरण करके टोकन प्राप्त करें या अपना पर्चा ढूंढें।'
              : 'Please register for an OPD token or look up an existing slip.'}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-sm"
            >
              {language === 'hi' ? 'नया पर्चा बनाएं (Register)' : 'New OPD Registration'}
            </button>
            <button
              onClick={() => navigate('/have-slip')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm"
            >
              {language === 'hi' ? 'मेरे पास पर्चा है (I Have Slip)' : 'I Have My Slip'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dept = getDepartmentById(patient?.departmentId || 'general_medicine');
  const deptName = dept[`name_${language}`] || dept.name;

  // Waiting stats
  const deptWaiting = patients.filter(
    p => p.departmentId === dept.id && p.status === 'waiting'
  );
  const targetIdx = deptWaiting.findIndex(p => p.token === patient?.token);
  const peopleAhead = targetIdx !== -1 ? targetIdx : deptWaiting.length;
  const estWait = getEstimatedWait(dept.id, patient?.token);

  const handlePrint = () => {
    window.print();
  };

  const handleReadAloud = () => {
    speakText(
      `${t.slip.title}. ${t.slip.tokenLabel}: ${patient?.token}. ${t.slip.department}: ${deptName}. ${t.slip.room}: ${dept.room}. ${t.slip.peopleAhead}: ${peopleAhead}. ${t.slip.estWait}: ${estWait} minutes.`,
      language
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `OPD Token ${patient?.token} - ${t.hospitalName}`,
        text: `OPD Token: ${patient?.token}, Room: ${dept.room}, Est Wait: ${estWait}m`,
        url: window.location.origin + `/my-turn?token=${patient?.token}`
      }).catch(() => {});
    } else {
      alert(`Token: ${patient?.token}\nRoom: ${dept.room}\nWait: ~${estWait} min`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Top Notification / Action Bar */}
      <div className="no-print bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
          <div>
            <h3 className="font-extrabold text-emerald-950 text-sm sm:text-base">
              Registration Successful!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800">
              Your OPD slip has been generated and queued live.
            </p>
          </div>
        </div>

        <button
          onClick={handleReadAloud}
          className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl flex items-center gap-1.5 text-xs font-bold"
        >
          <Volume2 className="w-5 h-5 text-emerald-700" />
          <span className="hidden sm:inline">{t.buttons.listen}</span>
        </button>
      </div>

      {/* PRINTABLE OPD SLIP */}
      <div className="opd-slip-printable bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-xl space-y-6 text-slate-900 relative">
        {/* Hospital Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
          <div className="inline-flex items-center gap-1.5 text-sky-700 font-extrabold text-xs tracking-wider uppercase bg-sky-50 px-3 py-1 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Govt of National Capital Region</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {t.hospitalName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {t.slip.title} • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Big Token Display Box */}
        <div className="bg-sky-50 border-2 border-sky-400 rounded-3xl p-5 sm:p-6 text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-800">
            {t.slip.tokenLabel}
          </span>
          <div className="text-5xl sm:text-6xl font-black text-sky-950 tracking-tight">
            {patient?.token}
          </div>
          <div className="inline-block bg-white px-4 py-1.5 rounded-full border border-sky-300 text-sky-900 font-extrabold text-sm sm:text-base shadow-sm">
            📍 {dept.room} • {dept.floor === 1 ? "1st Floor" : "Ground Floor"}
          </div>
        </div>

        {/* Prominent Permanent Patient ID Card for Future Login */}
        <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border-2 border-teal-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow-sm">
              🆔
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 block">
                {language === 'hi' ? 'स्थायी पेशेंट आईडी (भविष्य में लॉगिन हेतु)' : language === 'ta' ? 'நிலையான நோயாளி ஐடி (எதிர்கால உள்நுழைவு)' : 'Permanent Patient ID (For Future Logins)'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider font-mono">
                {patient?.patientId || currentAccount?.id || "OPD-10245"}
              </span>
            </div>
          </div>
          <div className="text-xs text-teal-900 font-bold max-w-xs bg-white/70 p-2 rounded-xl border border-teal-200">
            {language === 'hi'
              ? '💡 अगली बार केवल इस आईडी से 1-टच में पर्चा पाएं। फोन या फॉर्म की जरूरत नहीं।'
              : language === 'ta'
              ? '💡 அடுத்த முறை இந்த ஐடியை மட்டும் கொண்டு 1-டச்சில் நுழையலாம்.'
              : '💡 Note this ID! Next visit, login in 1-tap at any kiosk without filling forms.'}
          </div>
        </div>

        {/* Slip Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-semibold block">{t.slip.patientName}</span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">{patient?.name}</span>
            <span className="text-[11px] font-black text-sky-700 block mt-0.5">
              ID: {patient?.patientId || currentAccount?.id || "OPD-10245"}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-semibold block">{t.slip.ageGender}</span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">
              {patient?.age} Yrs / {patient?.gender}
            </span>
            <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
              📞 {patient?.phone || "Saved in Profile"}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-semibold block">{t.slip.department}</span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">{deptName}</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-semibold block">{t.slip.doctor}</span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">{dept.doctorName}</span>
          </div>
        </div>

        {/* Live Wait & Ahead Count */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-3">
            <Users className="w-7 h-7 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-amber-800 font-semibold block">Ahead in Queue</span>
              <span className="text-lg sm:text-xl font-black text-amber-950">{peopleAhead} Patients</span>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl flex items-center gap-3">
            <Clock className="w-7 h-7 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-indigo-800 font-semibold block">Est Wait Time</span>
              <span className="text-lg sm:text-xl font-black text-indigo-950">~{estWait} mins</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <QrCodeSvg value={patient?.token || "MED-042"} size={130} />
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              Live Queue QR Pass
            </h4>
            <p className="text-xs text-slate-600">
              {t.slip.scanQrHint}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Token ID: {patient?.token}
            </p>
          </div>
        </div>

        {/* Slip Instructions */}
        <p className="text-xs text-slate-500 text-center leading-relaxed italic border-t border-slate-100 pt-3">
          {t.slip.instructions}
        </p>
      </div>

      {/* Action Buttons (Screen Only) */}
      <div className="no-print space-y-3">
        {/* Main Action 1: Track My Live Turn */}
        <button
          onClick={() => navigate('/my-turn')}
          className="w-full min-h-[60px] bg-sky-600 hover:bg-sky-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
        >
          <Clock className="w-6 h-6" />
          <span>{t.buttons.trackQueue}</span>
        </button>

        {/* Main Action 2: Show Way to Room (Navigation) */}
        <button
          onClick={() => navigate(`/find-place?to=${dept.roomId}`)}
          className="w-full min-h-[56px] bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <Navigation className="w-5 h-5 text-emerald-400" />
          <span>{t.buttons.getDirections} ({dept.room})</span>
        </button>

        {/* Utility Buttons: Show Large, Print, Share */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => setShowLargeCard(true)}
            className="min-h-[52px] bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-sm"
          >
            <Maximize2 className="w-4 h-4 text-sky-600" />
            <span>{t.buttons.showLarge}</span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[52px] bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>{t.buttons.print}</span>
          </button>

          <button
            onClick={handleShare}
            className="min-h-[52px] bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>{t.buttons.download}</span>
          </button>
        </div>
        {/* Patient Dashboard & Health Records Shortcuts */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="min-h-[50px] bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-teal-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <span>👵</span>
            <span>{language === 'hi' ? 'मरीज डैशबोर्ड' : 'My Dashboard'}</span>
          </button>

          <button
            onClick={() => navigate('/health-records')}
            className="min-h-[50px] bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <span>🩺</span>
            <span>{language === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'Health Records'}</span>
          </button>
        </div>
      </div>

      {/* Hospital Journey Stepper */}
      <div className="no-print">
        <HospitalJourneyStepper
          currentStage={
            patient?.status === 'completed'
              ? 'completed'
              : patient?.status === 'serving'
              ? 'doctor'
              : 'token'
          }
        />
      </div>

      {/* Large Token Display Modal */}
      {showLargeCard && (
        <LargeTokenCard patient={patient} onClose={() => setShowLargeCard(false)} />
      )}
    </div>
  );
}
