import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/departments';
import { UserPlus, Printer, ArrowLeft, CheckCircle2, Ticket } from 'lucide-react';

export default function RegistrationCounterPage() {
  const { registerPatient, t, language } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('45');
  const [gender, setGender] = useState('female');
  const [departmentId, setDepartmentId] = useState('general_medicine');
  const [lastGenerated, setLastGenerated] = useState(null);

  const handleQuickRegister = (e) => {
    e.preventDefault();
    const patient = registerPatient({
      name: name.trim() || "Walk-in Patient",
      age: parseInt(age, 10) || 45,
      gender,
      phone: "", // No phone needed for walk-in counter
      departmentId
    });

    setLastGenerated(patient);
    setName('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/staff')}
          className="text-xs sm:text-sm font-bold text-sky-700 flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Staff Dashboard</span>
        </button>

        <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          COUNTER MODE
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-sky-600" />
            <span>Registration Counter</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Quick tap registration for patients visiting without a mobile phone.
          </p>
        </div>

        {lastGenerated && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-extrabold text-emerald-950 text-sm">
                  Slip Created: {lastGenerated.token} ({lastGenerated.name})
                </span>
                <p className="text-xs text-emerald-700">
                  Ready to print and hand to patient.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/opd-slip')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        )}

        <form onSubmit={handleQuickRegister} className="space-y-4">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Patient Full Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ram Prasad"
              className="w-full min-h-[52px] text-base font-bold px-4 rounded-xl border-2 border-slate-300 focus:border-sky-500 outline-none"
              autoFocus
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Age:
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full min-h-[52px] text-base font-bold px-4 rounded-xl border-2 border-slate-300 focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Gender:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full min-h-[52px] text-sm font-bold px-3 rounded-xl border-2 border-slate-300 bg-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Assigned Department:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setDepartmentId(dept.id)}
                  className={`p-3 rounded-xl border-2 text-left font-bold text-xs transition-all ${
                    departmentId === dept.id
                      ? 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-400'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate">{dept.room} • {dept[`name_${language}`] || dept.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{dept.doctorName.split('/')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full min-h-[58px] bg-sky-600 hover:bg-sky-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Ticket className="w-5 h-5" />
            <span>Generate Token & OPD Slip</span>
          </button>
        </form>
      </div>
    </div>
  );
}
