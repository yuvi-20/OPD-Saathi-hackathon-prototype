import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { en } from '../i18n/en';
import { hi } from '../i18n/hi';
import { ta } from '../i18n/ta';
import { INITIAL_PATIENTS, INITIAL_DOCTOR_STATUS, generateDemoPatients } from '../data/patients';
import { DEPARTMENTS, getDepartmentById } from '../data/departments';
import { speakText, playChime, playUrgentAlert, stopSpeech } from '../utils/tts';
import { DEMO_PATIENT_ACCOUNT, INITIAL_ACCOUNTS } from '../data/healthRecords';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  LANG: 'opd_language',
  FONT_SIZE: 'opd_font_size',
  HIGH_CONTRAST: 'opd_high_contrast',
  ASSISTED_MODE: 'opd_assisted_mode',
  READ_ALOUD: 'opd_read_aloud',
  AVOID_STAIRS: 'opd_avoid_stairs',
  PATIENTS: 'opd_patients',
  DOCTORS: 'opd_doctor_status',
  URGENT_FLAGS: 'opd_urgent_flags',
  ACTIVE_TOKEN: 'opd_active_token',
  HAS_VISITED: 'opd_has_visited',
  ACCOUNT: 'opd_current_account',
  ELDERLY_MODE: 'opd_elderly_mode',
  ALL_ACCOUNTS: 'opd_patient_accounts',
  HAS_REGISTERED: 'opd_has_registered'
};

const BROADCAST_CHANNEL_NAME = 'opd_saathi_channel';

export function AppProvider({ children }) {
  // 1. Language: Default to Hindi with easy switch to English & Tamil
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANG) || 'hi';
  });

  // First-visit language selection modal trigger
  const [showFirstVisitLangModal, setShowFirstVisitLangModal] = useState(() => {
    return !localStorage.getItem(STORAGE_KEYS.HAS_VISITED);
  });

  // 2. Accessibility: Font size (normal, large, xlarge)
  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || 'normal';
  });

  // High contrast mode
  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true';
  });

  // Assisted mode ("Someone is helping me" - larger text, automatic read aloud, avoid stairs)
  const [assistedMode, setAssistedModeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ASSISTED_MODE) === 'true';
  });

  // Auto Read Aloud (TTS)
  const [autoReadAloud, setAutoReadAloudState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.READ_ALOUD) === 'true';
  });

  // Avoid Stairs (Defaults to true in assisted mode or when toggled)
  const [avoidStairs, setAvoidStairsState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AVOID_STAIRS);
    return saved !== null ? saved === 'true' : true;
  });

  // Universal Emergency Modal toggle
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // 3. Shared Hospital State: Patients list
  const [patients, setPatientsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  // Doctor status per department
  const [doctorStatus, setDoctorStatusState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      return saved ? JSON.parse(saved) : INITIAL_DOCTOR_STATUS;
    } catch {
      return INITIAL_DOCTOR_STATUS;
    }
  });

  // Urgent Emergency Flags
  const [urgentFlags, setUrgentFlagsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.URGENT_FLAGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Patient Token currently viewing this screen
  const [activeToken, setActiveTokenState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOKEN) || null;
  });

  // Track if patient has registered in this browser (only notify once registered)
  const [hasRegistered, setHasRegisteredState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.HAS_REGISTERED) === 'true';
  });

  // 4. Patient Account & Profiles (Features 1-12)
  const [allAccounts, setAllAccountsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [currentAccount, setCurrentAccountState] = useState(() => {
    try {
      const isReg = localStorage.getItem(STORAGE_KEYS.HAS_REGISTERED) === 'true';
      if (!isReg) return null;
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [elderlyMode, setElderlyModeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ELDERLY_MODE) === 'true';
  });

  const [isRecordsShared, setIsRecordsShared] = useState(false);

  // 10x Demo Speed simulation state
  const [isDemoSpeed10x, setIsDemoSpeed10x] = useState(false);

  // BroadcastChannel reference
  const channelRef = useRef(null);

  // Initialize BroadcastChannel and listen for sync messages from other tabs
  useEffect(() => {
    const handleSync = () => {
      try {
        const p = localStorage.getItem(STORAGE_KEYS.PATIENTS);
        if (p) setPatientsState(JSON.parse(p));
        const d = localStorage.getItem(STORAGE_KEYS.DOCTORS);
        if (d) setDoctorStatusState(JSON.parse(d));
        const u = localStorage.getItem(STORAGE_KEYS.URGENT_FLAGS);
        if (u) setUrgentFlagsState(JSON.parse(u));
        const a = localStorage.getItem(STORAGE_KEYS.ACTIVE_TOKEN);
        if (a) setActiveTokenState(a);
      } catch (e) {
        console.error("Sync error:", e);
      }
    };

    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SYNC_ALL' || type === 'STATE_UPDATED') {
          handleSync();
        } else if (type === 'TOKEN_CALLED') {
          handleSync();
          if (hasRegistered && payload && payload.token === activeToken) {
            playChime();
          }
        } else if (type === 'URGENT_FLAG_RAISED') {
          playUrgentAlert();
        }
      };
    }

    const handleStorage = (e) => {
      if (!e.key || e.key === STORAGE_KEYS.PATIENTS || e.key === STORAGE_KEYS.DOCTORS || e.key === STORAGE_KEYS.ACTIVE_TOKEN) {
        handleSync();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      if (bc) bc.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, [activeToken, hasRegistered]);

  // Sync to body and html classes for font-size, high contrast, assisted mode, and elderly mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      html.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge', 'assisted-mode', 'elderly-mode');
      body.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge', 'high-contrast', 'assisted-mode', 'elderly-mode');

      html.classList.add(`text-size-${fontSize}`);
      body.classList.add(`text-size-${fontSize}`);

      if (highContrast) {
        body.classList.add('high-contrast');
      }
      if (assistedMode) {
        body.classList.add('assisted-mode');
        html.classList.add('assisted-mode');
      }
      if (elderlyMode) {
        body.classList.add('elderly-mode');
        html.classList.add('elderly-mode');
      }
    }
  }, [fontSize, highContrast, assistedMode, elderlyMode]);

  // Broadcast helper
  const broadcast = (type, payload = null) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, payload, timestamp: Date.now() });
    }
  };

  // State update helpers with persistence and broadcast
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    localStorage.setItem(STORAGE_KEYS.HAS_VISITED, 'true');
    setShowFirstVisitLangModal(false);
  };

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
  };

  const setHighContrast = (val) => {
    setHighContrastState(val);
    localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(val));
  };

  const setAssistedMode = (val) => {
    setAssistedModeState(val);
    localStorage.setItem(STORAGE_KEYS.ASSISTED_MODE, String(val));
    if (val) {
      setFontSize('xlarge');
      setAvoidStairs(true);
      setAutoReadAloud(true);
    }
  };

  const setAutoReadAloud = (val) => {
    setAutoReadAloudState(val);
    localStorage.setItem(STORAGE_KEYS.READ_ALOUD, String(val));
    if (!val) stopSpeech();
  };

  const setAvoidStairs = (val) => {
    setAvoidStairsState(val);
    localStorage.setItem(STORAGE_KEYS.AVOID_STAIRS, String(val));
  };

  const setElderlyMode = (val) => {
    setElderlyModeState(val);
    localStorage.setItem(STORAGE_KEYS.ELDERLY_MODE, String(val));
    if (val) {
      setFontSize('xlarge');
      setAutoReadAloud(true);
      setAvoidStairs(true);
    }
  };

  const setActiveToken = (tok) => {
    setActiveTokenState(tok);
    if (tok) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TOKEN, tok);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN);
    }
  };

  const setHasRegistered = (val) => {
    setHasRegisteredState(val);
    if (val) {
      localStorage.setItem(STORAGE_KEYS.HAS_REGISTERED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.HAS_REGISTERED);
    }
  };

  // Returning Patient Login & Identification (Feature 2)
  const loginAccount = (idOrPhone) => {
    const trimmed = String(idOrPhone || '').trim().toLowerCase();
    if (!trimmed) return null;
    const found = allAccounts.find(
      acc => acc.id.toLowerCase() === trimmed || acc.phone === trimmed
    ) || (trimmed === 'opd-10245' || trimmed === '9876543210' ? DEMO_PATIENT_ACCOUNT : null);

    if (found) {
      setCurrentAccountState(found);
      localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(found));
      // Feature 8: Automatically switch to saved preferred language
      if (found.preferredLanguage) {
        setLanguage(found.preferredLanguage);
      }
      if (found.accessibilityPreference?.assistedMode) {
        setAssistedMode(true);
      }
      return found;
    }
    return null;
  };

  const logoutAccount = () => {
    setCurrentAccountState(null);
    setActiveToken(null);
    setHasRegistered(false);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.HAS_REGISTERED);
  };

  // Feature 3: Repeat Hospital Visit
  const repeatVisit = (departmentId = 'general_medicine') => {
    const acc = currentAccount || DEMO_PATIENT_ACCOUNT;
    const newPatient = registerPatient({
      name: acc.name,
      age: acc.age,
      gender: acc.gender,
      phone: acc.phone,
      departmentId: departmentId,
      patientId: acc.id
    });
    return newPatient;
  };

  // Queue Operations
  const updatePatientsList = (newPatients) => {
    setPatientsState(newPatients);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(newPatients));
    broadcast('STATE_UPDATED');
  };

  // Register a new patient (Feature 1: Patient Profile & unique Patient ID)
  const registerPatient = (patientData) => {
    const dept = getDepartmentById(patientData.departmentId);
    const deptPatients = patients.filter(p => p.departmentId === patientData.departmentId);
    const tokenSeq = deptPatients.length + 40; // realistic token numbering
    const token = `${dept.code}-0${tokenSeq < 100 ? tokenSeq : tokenSeq}`;

    // Generate unique simulated Patient ID e.g. OPD-10245 or OPD-XXXXX
    const generatedPatientId = patientData.patientId || `OPD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient = {
      token,
      name: patientData.name || "Patient",
      age: patientData.age || 40,
      gender: patientData.gender || "unspecified",
      phone: patientData.phone || "",
      departmentId: patientData.departmentId,
      patientId: generatedPatientId,
      status: "waiting",
      registeredAt: new Date().toISOString(),
      assistedMode: assistedMode,
      avoidStairs: avoidStairs
    };

    // Update / Save Patient Profile
    const newAccount = {
      id: generatedPatientId,
      name: newPatient.name,
      age: newPatient.age,
      gender: newPatient.gender,
      phone: newPatient.phone,
      preferredLanguage: language,
      emergencyContact: patientData.emergencyContact || "108 / Family",
      registeredOn: new Date().toISOString().split('T')[0],
      accessibilityPreference: {
        assistedMode: assistedMode,
        elderlyMode: elderlyMode,
        avoidStairs: avoidStairs
      }
    };

    const existingIdx = allAccounts.findIndex(a => a.id === generatedPatientId || (a.phone && a.phone === newPatient.phone));
    let updatedAccs;
    if (existingIdx !== -1) {
      updatedAccs = [...allAccounts];
      updatedAccs[existingIdx] = { ...updatedAccs[existingIdx], ...newAccount };
    } else {
      updatedAccs = [newAccount, ...allAccounts];
    }
    setAllAccountsState(updatedAccs);
    localStorage.setItem(STORAGE_KEYS.ALL_ACCOUNTS, JSON.stringify(updatedAccs));
    setCurrentAccountState(newAccount);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(newAccount));

    const updated = [...patients, newPatient];
    updatePatientsList(updated);
    setActiveToken(token);
    setHasRegistered(true);
    return newPatient;
  };

  // Call next patient in a department
  const callNextPatient = (departmentId) => {
    let calledToken = null;
    const updated = patients.map(p => {
      if (p.departmentId === departmentId) {
        if (p.status === 'serving') {
          // Completed
          return { ...p, status: 'completed', completedAt: new Date().toISOString() };
        }
      }
      return p;
    });

    // Find the next waiting patient in this department
    const nextIdx = updated.findIndex(p => p.departmentId === departmentId && p.status === 'waiting');
    if (nextIdx !== -1) {
      updated[nextIdx] = {
        ...updated[nextIdx],
        status: 'serving',
        calledAt: new Date().toISOString()
      };
      calledToken = updated[nextIdx].token;
    }

    updatePatientsList(updated);
    if (calledToken) {
      broadcast('TOKEN_CALLED', { token: calledToken, departmentId });
      playChime();
    }
  };

  // Call a specific patient token
  const callPatientByToken = (token) => {
    const target = patients.find(p => p.token === token);
    if (!target) return;

    const updated = patients.map(p => {
      if (p.departmentId === target.departmentId) {
        if (p.token === token) {
          return { ...p, status: 'serving', calledAt: new Date().toISOString() };
        } else if (p.status === 'serving') {
          return { ...p, status: 'completed', completedAt: new Date().toISOString() };
        }
      }
      return p;
    });

    updatePatientsList(updated);
    broadcast('TOKEN_CALLED', { token: token, departmentId: target.departmentId });
    playChime();
  };

  // Complete consultation / end session for a patient
  const completeConsultation = (token) => {
    const updated = patients.map(p => {
      if (p.token === token) {
        return {
          ...p,
          status: 'completed',
          completedAt: new Date().toISOString()
        };
      }
      return p;
    });

    updatePatientsList(updated);
    broadcast('SESSION_COMPLETED', { token });
    playChime();
  };

  // Mark patient as No-Show
  const markNoShow = (token) => {
    const updated = patients.map(p => {
      if (p.token === token) {
        return { ...p, status: 'no_show', noShowAt: new Date().toISOString() };
      }
      return p;
    });
    updatePatientsList(updated);
  };

  // Send patient to end of queue
  const sendToEndOfQueue = (token) => {
    const patient = patients.find(p => p.token === token);
    if (!patient) return;
    const others = patients.filter(p => p.token !== token);
    const updated = [...others, { ...patient, status: 'waiting', registeredAt: new Date().toISOString() }];
    updatePatientsList(updated);
  };

  // Move patient to another department
  const movePatientDepartment = (token, newDepartmentId) => {
    const updated = patients.map(p => {
      if (p.token === token) {
        const dept = getDepartmentById(newDepartmentId);
        const randomNum = Math.floor(10 + Math.random() * 80);
        const newToken = `${dept.code}-0${randomNum}`;
        return {
          ...p,
          token: newToken,
          departmentId: newDepartmentId,
          status: 'waiting',
          registeredAt: new Date().toISOString()
        };
      }
      return p;
    });
    updatePatientsList(updated);
  };

  // Update doctor status
  const updateDoctorStatus = (departmentId, statusObj) => {
    const updated = {
      ...doctorStatus,
      [departmentId]: {
        ...doctorStatus[departmentId],
        ...statusObj
      }
    };
    setDoctorStatusState(updated);
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updated));
    broadcast('STATE_UPDATED');
  };

  // Raise an urgent emergency flag
  const raiseUrgentFlag = (details = {}) => {
    const newFlag = {
      id: `urgent-${Date.now()}`,
      token: activeToken || "UNREGISTERED",
      location: details.location || "Patient Screen",
      message: details.message || "Patient pressed I Need Urgent Help",
      timestamp: new Date().toISOString(),
      status: "active"
    };

    const updated = [newFlag, ...urgentFlags];
    setUrgentFlagsState(updated);
    localStorage.setItem(STORAGE_KEYS.URGENT_FLAGS, JSON.stringify(updated));
    broadcast('URGENT_FLAG_RAISED', newFlag);
    playUrgentAlert();
    return newFlag;
  };

  // Mark an urgent flag as seen/attended by staff
  const markUrgentFlagSeen = (flagId) => {
    const updated = urgentFlags.filter(f => f.id !== flagId);
    setUrgentFlagsState(updated);
    localStorage.setItem(STORAGE_KEYS.URGENT_FLAGS, JSON.stringify(updated));
    broadcast('STATE_UPDATED');
  };

  // Demo Controls
  const add20DemoPatients = () => {
    const extra = generateDemoPatients();
    const updated = [...patients, ...extra];
    updatePatientsList(updated);
  };

  const resetAllDemoData = () => {
    setPatientsState(INITIAL_PATIENTS);
    setDoctorStatusState(INITIAL_DOCTOR_STATUS);
    setUrgentFlagsState([]);
    setActiveToken(null);
    setHasRegistered(false);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTOR_STATUS));
    localStorage.setItem(STORAGE_KEYS.URGENT_FLAGS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.HAS_REGISTERED);
    broadcast('STATE_UPDATED');
  };

  // 10x Demo auto simulation loop
  useEffect(() => {
    let timer = null;
    if (isDemoSpeed10x) {
      timer = setInterval(() => {
        // Randomly call next token in an active department
        const depts = DEPARTMENTS.map(d => d.id);
        const randomDept = depts[Math.floor(Math.random() * depts.length)];
        callNextPatient(randomDept);
      }, 7000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDemoSpeed10x, patients]);

  // Calculate estimated wait time based on prompt formula:
  // "Estimated wait = the number of people ahead x average consultation time + doctor delay, rounded to 5 mins"
  const getEstimatedWait = (departmentId, targetToken) => {
    const dept = getDepartmentById(departmentId);
    const avgConsult = dept.avgConsultationMin || 8;
    const doc = doctorStatus[departmentId] || { delayMin: 0 };

    const deptWaiting = patients.filter(
      p => p.departmentId === departmentId && p.status === 'waiting'
    );

    const targetIdx = deptWaiting.findIndex(p => p.token === targetToken);
    const aheadCount = targetIdx !== -1 ? targetIdx : deptWaiting.length;

    let rawMin = (aheadCount * avgConsult) + (doc.delayMin || 0);
    if (doc.status === 'break') {
      rawMin += 15;
    }

    if (rawMin <= 0) return 5;
    // Round to nearest 5 minutes
    const rounded = Math.round(rawMin / 5) * 5;
    return Math.max(5, rounded);
  };

  // Get current active patient object
  const currentPatient = activeToken ? (patients.find(p => p.token === activeToken) || null) : null;

  // Dictionary for active language
  const t = language === 'hi' ? hi : language === 'ta' ? ta : en;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        showFirstVisitLangModal,
        setShowFirstVisitLangModal,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        assistedMode,
        setAssistedMode,
        autoReadAloud,
        setAutoReadAloud,
        avoidStairs,
        setAvoidStairs,
        emergencyModalOpen,
        setEmergencyModalOpen,
        patients,
        doctorStatus,
        urgentFlags,
        activeToken,
        setActiveToken,
        currentPatient,
        allAccounts,
        currentAccount,
        elderlyMode,
        setElderlyMode,
        loginAccount,
        logoutAccount,
        repeatVisit,
        hasRegistered,
        setHasRegistered,
        isRecordsShared,
        setIsRecordsShared,
        registerPatient,
        callNextPatient,
        callPatientByToken,
        completeConsultation,
        markNoShow,
        sendToEndOfQueue,
        movePatientDepartment,
        updateDoctorStatus,
        raiseUrgentFlag,
        markUrgentFlagSeen,
        add20DemoPatients,
        resetAllDemoData,
        isDemoSpeed10x,
        setIsDemoSpeed10x,
        getEstimatedWait,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
