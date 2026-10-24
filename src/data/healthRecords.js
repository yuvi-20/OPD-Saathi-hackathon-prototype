/**
 * Simulated / Demo Health Records for Hackathon Prototype
 * IMPORTANT: All data shown here is completely simulated dummy data.
 * No real hospital database or patient health data is accessed.
 */

export const DEMO_PATIENT_ACCOUNT = {
  id: "OPD-10245",
  name: "Patient (मरीज)",
  age: 62,
  gender: "female",
  phone: "9876543210",
  preferredLanguage: "hi",
  emergencyContact: "9876500000 (Family)",
  address: "Ward 12, Vikas Nagar, City District",
  registeredOn: "2026-05-18",
  accessibilityPreference: {
    assistedMode: true,
    elderlyMode: true,
    avoidStairs: true,
    largeFont: true
  }
};

export const DEMO_HEALTH_RECORDS = [
  {
    id: "REC-2026-1012",
    patientId: "OPD-10245",
    patientName: "Patient (मरीज)",
    date: "12 Oct 2026",
    department: "General Medicine",
    departmentId: "general_medicine",
    room: "Room 1 & 2",
    doctor: "Dr. Rajesh Verma",
    complaint: "Seasonal viral fever & mild body ache",
    diagnosis: "Acute Viral Pyrexia (Mild)",
    status: "Completed",
    isShared: false,
    vitals: {
      bp: "126/82 mmHg",
      pulse: "78 bpm",
      temp: "99.1 °F",
      weight: "58 kg"
    },
    prescriptions: [
      { name: "Paracetamol 500mg", dosage: "1 tablet after meals", duration: "3 days", timing: "Morning - Night" },
      { name: "ORS Hydration Sachet", dosage: "1 packet in 1L water", duration: "2 days", timing: "Sip throughout day" },
      { name: "Multivitamin & Zinc", dosage: "1 capsule after lunch", duration: "10 days", timing: "Afternoon" }
    ],
    reports: [
      { testName: "CBC (Complete Blood Count)", result: "Hemoglobin 11.4 g/dL, TLC 6,800/uL", status: "Normal" },
      { testName: "Rapid Dengue NS1 & Malarial Antigen", result: "Negative / Non-reactive", status: "Clear" },
      { testName: "Random Blood Sugar", result: "108 mg/dL", status: "Normal" }
    ],
    doctorAdvice: "Drink plenty of boiled warm water. Rest for 2 days. Return if fever exceeds 101°F.",
    followUp: "As needed"
  },
  {
    id: "REC-2026-0805",
    patientId: "OPD-10245",
    patientName: "Patient (मरीज)",
    date: "05 Aug 2026",
    department: "General Medicine",
    departmentId: "general_medicine",
    room: "Room 1 & 2",
    doctor: "Dr. Sunita Rao",
    complaint: "General weakness and fatigue on walking",
    diagnosis: "Mild Nutritional Anemia",
    status: "Completed",
    isShared: false,
    vitals: {
      bp: "122/78 mmHg",
      pulse: "74 bpm",
      temp: "98.4 °F",
      weight: "57.5 kg"
    },
    prescriptions: [
      { name: "Ferrous Ascorbate + Folic Acid", dosage: "1 tablet after dinner", duration: "30 days", timing: "Night" },
      { name: "Calcium + Vitamin D3", dosage: "1 tablet after breakfast", duration: "30 days", timing: "Morning" }
    ],
    reports: [
      { testName: "Serum Ferritin & Iron Profile", result: "Ferritin 18 ng/mL (Mildly Low)", status: "Mild Deficiency" },
      { testName: "HbA1c (3-Month Sugar Average)", result: "5.6% (Normal Non-Diabetic)", status: "Normal" }
    ],
    doctorAdvice: "Include green leafy vegetables, jaggery (gud), and milk in daily diet.",
    followUp: "After 2 months"
  },
  {
    id: "REC-2026-0518",
    patientId: "OPD-10245",
    patientName: "Patient (मरीज)",
    date: "18 May 2026",
    department: "Orthopedics & Joint Care",
    departmentId: "orthopedics",
    room: "Room 7",
    doctor: "Dr. Ramesh Iyer",
    complaint: "Both knees painful while climbing stairs or squatting",
    diagnosis: "Bilateral Primary Knee Osteoarthritis (Grade 1)",
    status: "Completed",
    isShared: false,
    vitals: {
      bp: "130/84 mmHg",
      pulse: "76 bpm",
      temp: "98.6 °F",
      weight: "59 kg"
    },
    prescriptions: [
      { name: "Glucosamine + Diacerein", dosage: "1 tablet after lunch", duration: "30 days", timing: "Afternoon" },
      { name: "Diclofenac Pain Relief Gel", dosage: "Apply gently twice daily", duration: "15 days", timing: "Local application" }
    ],
    reports: [
      { testName: "X-Ray Both Knees (Standing AP / Lat)", result: "Mild medial joint space narrowing, no osteophytes", status: "Mild Arthritic Changes" }
    ],
    doctorAdvice: "Avoid sitting on floor. Use western toilet or commode chair. Use elevator/ramp instead of stairs.",
    followUp: "Follow-up in 6 months or if pain worsens"
  }
];

export const INITIAL_ACCOUNTS = [DEMO_PATIENT_ACCOUNT];
