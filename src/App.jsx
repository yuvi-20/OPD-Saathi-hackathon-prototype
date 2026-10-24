import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import EmergencyModal from './components/EmergencyModal';
import FirstVisitModal from './components/FirstVisitModal';
import PatientTurnNotification from './components/PatientTurnNotification';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import OpdSlipPage from './pages/OpdSlipPage';
import MyTurnPage from './pages/MyTurnPage';
import IHaveSlipPage from './pages/IHaveSlipPage';
import FindPlacePage from './pages/FindPlacePage';
import EmergencyPage from './pages/EmergencyPage';
import SettingsPage from './pages/SettingsPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import RegistrationCounterPage from './pages/RegistrationCounterPage';
import WaitingBoardPage from './pages/WaitingBoardPage';
import ReturningPatientPage from './pages/ReturningPatientPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import HealthRecordsPage from './pages/HealthRecordsPage';
import SelectLanguagePage from './pages/SelectLanguagePage';

// Simple Error Boundary Component to prevent blank screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-red-300 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Something went wrong
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 break-words font-mono bg-slate-100 p-3 rounded-xl border border-slate-200 text-left">
              {this.state.error?.message || "An unexpected error occurred. Please refresh or return to Home."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="flex-1 min-h-[48px] bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Return to Home
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch (e) {
                    console.error(e);
                  }
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-4 min-h-[48px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-sm transition-all"
                title="Clears corrupted browser storage and restores initial hospital demo state"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const location = useLocation();
  const isBoardView = location.pathname === '/board';

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {!isBoardView && <Navbar />}
        <PatientTurnNotification />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/opd-slip" element={<OpdSlipPage />} />
            <Route path="/my-turn" element={<MyTurnPage />} />
            <Route path="/have-slip" element={<IHaveSlipPage />} />
            <Route path="/find-place" element={<FindPlacePage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/staff" element={<StaffDashboardPage />} />
            <Route path="/counter" element={<RegistrationCounterPage />} />
            <Route path="/board" element={<WaitingBoardPage />} />
            <Route path="/returning-patient" element={<ReturningPatientPage />} />
            <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
            <Route path="/health-records" element={<HealthRecordsPage />} />
            <Route path="/select-language" element={<SelectLanguagePage />} />
            {/* Fallback route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <EmergencyModal />
        <FirstVisitModal />
      </div>
    </ErrorBoundary>
  );
}
