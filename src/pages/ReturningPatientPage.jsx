import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/departments';
import {
  UserCheck,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Volume2,
  Calendar,
  Phone,
  FileText,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Stethoscope,
  Info
} from 'lucide-react';
import { speakText, playClickBeep } from '../utils/tts';

export default function ReturningPatientPage() {
  const {
    currentAccount,
    loginAccount,
    repeatVisit,
    language,
    setLanguage,
    t
  } = useApp();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedAccount, setSearchedAccount] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('general_medicine');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccessRepeat, setIsSuccessRepeat] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    playClickBeep();
    if (!searchQuery.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया मरीज आईडी या मोबाइल नंबर दर्ज करें' : 'Please enter Patient ID or Mobile number');
      setSearchedAccount(null);
      return;
    }

    const acc = loginAccount(searchQuery.trim());
    if (acc) {
      setSearchedAccount(acc);
      setErrorMsg('');
      const greeting = language === 'hi'
        ? `वापसी पर स्वागत है, ${acc.name} जी। आपका प्रोफाइल लोड हो गया है।`
        : `Welcome back, ${acc.name}. Your profile has been loaded.`;
      speakText(greeting, language);
    } else {
      setSearchedAccount(null);
      setErrorMsg(language === 'hi' ? 'मरीज रिकॉर्ड नहीं मिला। कृपया जांचें या नया पंजीकरण करें।' : 'Patient not found. Check details or register as new.');
    }
  };

  // Feature 3: Repeat Hospital Visit / Generate New Token
  const handleRepeatVisit = () => {
    playClickBeep();
    const targetAccount = searchedAccount || currentAccount;
    if (!targetAccount) return;

    const newPatient = repeatVisit(selectedDeptId);
    setGeneratedToken(newPatient.token);
    setIsSuccessRepeat(true);

    const dept = DEPARTMENTS.find(d => d.id === selectedDeptId);
    const successVoice = language === 'hi'
      ? `बधाई हो ${targetAccount.name} जी! आपका नया टोकन ${newPatient.token} तैयार है। विभाग: ${dept?.name_hi || dept?.name}।`
      : `Success! Your new token ${newPatient.token} has been generated for ${dept?.name}.`;
    speakText(successVoice, language);

    setTimeout(() => {
      navigate('/opd-slip');
    }, 1800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-xs sm:text-sm font-extrabold">
          <UserCheck className="w-4 h-4 text-teal-700" />
          <span>{language === 'hi' ? 'पुराने मरीज सेवा • Repeat Hospital Visit' : 'Returning Patient Service'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'पुराने मरीज पहचान एवं दोबारा पर्चा' : 'Returning Patient Identification'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          {language === 'hi'
            ? 'यदि आप पहले कभी अस्पताल आए हैं, तो पूरा फॉर्म दोबारा भरने की जरूरत नहीं है। अपनी आईडी से तुरंत पर्चा पाएं।'
            : 'If you have visited before, skip the long registration. Identify yourself to repeat visit in 1 tap.'}
        </p>
      </div>

      {/* Identification Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-md space-y-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-sm sm:text-base font-extrabold text-slate-800">
            {language === 'hi' ? 'मरीज आईडी (Patient ID) या मोबाइल नंबर दर्ज करें:' : 'Enter Patient ID or Mobile Number:'}
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'अपनी मरीज आईडी या मोबाइल नंबर दर्ज करें' : 'Enter your Patient ID or Mobile Number'}
                className="w-full min-h-[56px] px-4 pl-12 rounded-2xl border-2 border-slate-300 text-lg font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="min-h-[56px] px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-md transition-all flex-shrink-0"
            >
              <span>{language === 'hi' ? 'मरीज खोजें' : 'Retrieve Profile'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              ⚠️ {errorMsg}
            </p>
          )}
        </form>

        {/* Fallback Help Desk */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <span>
              {language === 'hi'
                ? 'आईडी भूल गए? काउंटर नंबर 1 पर हमारे सहायक स्टाफ से मदद लें।'
                : 'Forgot ID? Ask our Help Desk staff at Counter 1 for instant lookup.'}
            </span>
          </div>
        </div>
      </div>

      {/* RETRIEVED PATIENT PROFILE & REPEAT VISIT CARD - Only shown after user actually searches */}
      {searchedAccount && (
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50/40 to-white rounded-3xl p-5 sm:p-8 border-2 border-teal-400 shadow-xl space-y-6 animate-in slide-in-from-bottom-4">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-teal-800 tracking-wider">
                {language === 'hi' ? 'सत्यापित मरीज प्रोफाइल' : 'Verified Patient Profile'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                <span>👋 {language === 'hi' ? `वापसी पर स्वागत है, ${searchedAccount.name} जी` : `Welcome back, ${searchedAccount.name}`}</span>
              </h2>
              <p className="text-xs sm:text-sm font-bold text-teal-900 mt-1 flex items-center gap-2">
                <span className="bg-teal-600 text-white px-2.5 py-0.5 rounded-md font-black">
                  ID: {searchedAccount.id}
                </span>
                <span>• {searchedAccount.age} yrs • {searchedAccount.gender === 'female' ? (language === 'hi' ? 'महिला' : 'Female') : (language === 'hi' ? 'पुरुष' : 'Male')}</span>
                <span>• 📞 {searchedAccount.phone}</span>
              </p>
            </div>

            <button
              onClick={() => navigate('/patient-dashboard')}
              className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-teal-300 text-teal-950 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm"
            >
              <span>👵</span>
              <span>{language === 'hi' ? 'मरीज डैशबोर्ड' : 'Full Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* REPEAT VISIT SECTION - MAIN PROMPT SELLING POINT */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-300 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300 mb-1">
                  ⭐ {language === 'hi' ? 'मुख्य सुविधा (Main Feature)' : 'Fast Track Repeat Visit'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {language === 'hi' ? 'दोबारा अस्पताल पर्चा बनाएं (Repeat Hospital Visit)' : 'Repeat Hospital Visit / Generate New Token'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  {language === 'hi'
                    ? 'आपकी सारी जानकारी पहले से सुरक्षित है। सिर्फ विभाग चुनें और 1-क्लिक में नया टोकन पाएं:'
                    : 'Your personal information is already loaded. Simply select department and generate new token:'}
                </p>
              </div>
            </div>

            {/* Department Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                {language === 'hi' ? 'डॉक्टर या विभाग चुनें:' : 'Select Doctor / Department:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEPARTMENTS.slice(0, 4).map(dept => {
                  const isSelected = selectedDeptId === dept.id;
                  const deptTitle = dept[`name_${language}`] || dept.name;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        playClickBeep();
                        setSelectedDeptId(dept.id);
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <Stethoscope className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-black text-sm">{deptTitle}</div>
                        <div className="text-xs text-slate-500">{dept.room} • {dept.doctorName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BIG REPEAT VISIT ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRepeatVisit}
                disabled={isSuccessRepeat}
                className="w-full min-h-[64px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl transition-all"
              >
                {isSuccessRepeat ? (
                  <>
                    <CheckCircle2 className="w-7 h-7 text-emerald-200 animate-spin" />
                    <span>{language === 'hi' ? `टोकन ${generatedToken} तैयार है!` : `Token ${generatedToken} Ready!`}</span>
                  </>
                ) : (
                  <>
                    <span>🎫</span>
                    <span>{language === 'hi' ? '1-क्लिक में नया टोकन पर्चा प्राप्त करें' : 'Confirm Visit & Get New OPD Token'}</span>
                    <ArrowRight className="w-6 h-6 text-emerald-200" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Shortcuts for Returning Patient */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/health-records')}
              className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-indigo-200 text-indigo-950 font-black text-sm flex items-center gap-3 shadow-sm transition-all text-left"
            >
              <span className="text-2xl">🩺</span>
              <div>
                <div>{language === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'My Health Records'}</div>
                <div className="text-[11px] text-slate-500 font-normal">{language === 'hi' ? 'पुरानी जांचें व दवाएं' : 'Past visits & prescriptions'}</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/my-turn')}
              className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-sky-200 text-sky-950 font-black text-sm flex items-center gap-3 shadow-sm transition-all text-left"
            >
              <span className="text-2xl">⏱️</span>
              <div>
                <div>{language === 'hi' ? 'लाइव कतार स्थिति' : 'Current Queue'}</div>
                <div className="text-[11px] text-slate-500 font-normal">{language === 'hi' ? 'अपनी बारी देखें' : 'Track your live token'}</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/find-place')}
              className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-amber-200 text-amber-950 font-black text-sm flex items-center gap-3 shadow-sm transition-all text-left"
            >
              <span className="text-2xl">🗺️</span>
              <div>
                <div>{language === 'hi' ? 'अस्पताल नक्शा' : 'Hospital Navigation'}</div>
                <div className="text-[11px] text-slate-500 font-normal">{language === 'hi' ? 'कमरे का सीधा रास्ता' : 'Find ward & room steps'}</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
