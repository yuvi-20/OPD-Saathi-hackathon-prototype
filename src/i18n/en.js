export const en = {
  appName: "OPD Saathi",
  appTagline: "Accessible OPD Registration & Hospital Navigation",
  hospitalName: "City District Hospital",
  hospitalSubtitle: "Government Hospital • 3 Floors",

  // Navigation & Header
  nav: {
    home: "Home",
    register: "Register",
    mySlip: "My Slip",
    myTurn: "My Turn",
    findPlace: "Find Place",
    emergency: "EMERGENCY",
    settings: "Settings",
    staff: "Staff Desk",
    board: "TV Board"
  },

  // Common buttons
  buttons: {
    next: "Next",
    back: "Back",
    submit: "Confirm & Get OPD Slip",
    cancel: "Cancel",
    speak: "Speak",
    listening: "Listening...",
    listen: "Read Aloud",
    stop: "Stop Voice",
    print: "Print Slip",
    download: "Save Slip",
    showLarge: "Show to Staff",
    close: "Close",
    iAmLost: "I Am Lost (Help Me)",
    callNext: "Call Next",
    noShow: "No Show",
    sendToEnd: "Send to End",
    moveDept: "Move Dept",
    markSeen: "Mark as Seen",
    reset: "Logout",
    logout: "Logout",
    add20: "+20 Demo Patients",
    speed10x: "Auto Speed (10x)",
    speedOff: "Normal Speed",
    trackQueue: "Track My Live Turn",
    getDirections: "Show Way to Room",
    switchLanguage: "Change Language",
    avoidStairs: "Avoid Stairs (Lifts & Ramps Only)"
  },

  // Emergency
  emergency: {
    title: "Emergency / Casualty (24x7)",
    subhead: "Immediate medical care is available. No token or registration needed.",
    warningTitle: "Does the patient have any of these critical signs?",
    signs: [
      "Severe chest pain or crushing heaviness",
      "Severe trouble breathing or gasping for air",
      "Heavy bleeding that will not stop",
      "Fainting, unconsciousness, or unable to wake up",
      "Sudden weakness, numbness, or face drooping (stroke signs)",
      "Severe injury from a road accident or fall",
      "Pregnant woman with bleeding, water break, or unbearable pain",
      "Child or infant who is unresponsive, turning blue, or having fits"
    ],
    anyOfThese: "If YES to any of these: Go to Emergency right now. Do not wait for a token.",
    casualtyLocation: "Emergency (Casualty) is on Ground Floor, Right Wing.",
    goNow: "Proceed straight to Ground Floor Casualty.",
    dial112: "Call 112 (National Emergency)",
    dial108: "Call 108 (Free Govt Ambulance)",
    urgentHelpBtn: "I Need Urgent Help Now",
    urgentHelpSent: "Emergency staff notified! A doctor or nurse is on high alert. Stay calm.",
    qualifiedStaffNotice: "Important: Clinical emergency decisions are made only by qualified doctors and nurses."
  },

  // Home Screen
  home: {
    welcome: "Welcome to City District Hospital OPD",
    chooseLanguageTitle: "Select your preferred language",
    heroInstruction: "Touch any big button below to begin:",
    cardRegister: "New OPD Slip",
    cardRegisterDesc: "Get doctor consultation token for fever, pain, checkup",
    cardHaveSlip: "I Have My Slip",
    cardHaveSlipDesc: "Check your token status or find your room",
    cardFindPlace: "Find a Place",
    cardFindPlaceDesc: "Map & step-by-step walking directions",
    cardEmergency: "Emergency (Casualty)",
    cardEmergencyDesc: "Serious injury or severe pain. No token needed.",
    opdTimings: "OPD Registration Hours: Monday to Saturday, 9:00 AM to 2:00 PM",
    assistedModeActive: "Assisted Mode is ON (Larger text & voice assistance)"
  },

  // Registration
  register: {
    step: "Step",
    of: "of",
    assistedSwitch: "Someone is helping me (Assisted Mode)",
    assistedSwitchHint: "Turns on bigger buttons and automatic voice reading",
    step1Title: "Urgent Medical Check",
    step1Subtitle: "Before making an OPD token, check for serious signs:",
    noEmergencyConfirm: "No critical emergency. Continue to normal OPD",
    step2Title: "Patient Name",
    step2Subtitle: "What is the patient's full name?",
    namePlaceholder: "Enter your full name",
    step3Title: "Age & Gender",
    step3Subtitle: "Enter age in years and select gender:",
    ageLabel: "Age (in years)",
    agePlaceholder: "Enter your age in years",
    genderLabel: "Gender",
    male: "Male (पुरुष)",
    female: "Female (महिला)",
    other: "Other (अन्य)",
    step4Title: "Mobile Number (Optional)",
    step4Subtitle: "We will send free SMS alerts when your turn is near:",
    phonePlaceholder: "Enter 10-digit mobile number",
    phoneSkip: "You can skip this if you do not have a phone",
    step5Title: "Which doctor do you need?",
    step5Subtitle: "Tap the card that matches your health trouble:",
    notSureHelpDesk: "Not sure which doctor? Ask at the Help Desk",
    helpDeskGuide: "Our hospital assistants at the Ground Floor Help Desk will guide you."
  },

  // OPD Slip
  slip: {
    title: "Government OPD Registration Slip",
    hospitalTag: "City District Hospital • Government of Health Services",
    tokenLabel: "Your Token Number",
    patientName: "Patient Name",
    ageGender: "Age / Gender",
    department: "Department",
    room: "Assigned Room",
    floor: "Floor",
    doctor: "Consulting Doctor",
    peopleAhead: "People Ahead of You",
    estWait: "Estimated Waiting Time",
    aboutMinutes: "about {min} minutes",
    statusServingNow: "Now Serving Token",
    scanQrHint: "Scan this QR code with any phone camera to view live queue:",
    largeCardTitle: "Show This Screen to Hospital Staff",
    instructions: "Please proceed to Waiting Hall A on the 1st Floor. Watch the TV display for your token."
  },

  // My Turn Screen
  myTurn: {
    title: "Live Queue Status",
    tokenLabel: "Your Token",
    currentServing: "Currently Inside Room",
    aheadCount: "{count} people ahead of you",
    waitEstimate: "Estimated wait: about {min} minutes",
    doctorStatus: "Doctor Status",
    docAvailable: "Doctor is in the room examining patients",
    docBreak: "Doctor is on a short break until {time}",
    docLate: "Running late by about {min} minutes due to emergency cases",
    closeAlertTitle: "Your turn is coming up!",
    closeAlertBody: "Only 3 people ahead. Please move near the door now.",
    calledTitle: "YOUR TOKEN IS BEING CALLED!",
    calledBody: "Please walk inside {room} immediately.",
    simulatedSmsTitle: "Simulated SMS Alert Received",
    simulatedSmsBody: "Govt Hospital: Token {token}, your turn is approaching. Please proceed to {room} on {floor}.",
    lastUpdated: "Updated just now • Live sync"
  },

  // I Have Slip
  haveSlip: {
    title: "Find Your Existing OPD Slip",
    enterTokenLabel: "Enter Token Number:",
    placeholder: "e.g. MED-042",
    orScan: "OR Scan QR Code from your paper slip",
    scanWithCamera: "Open Camera to Scan QR",
    cameraNotSupported: "Camera QR detection not available on this device. Please type token above.",
    sampleTokens: "Quick test tokens from today:"
  },

  // Find Place & Navigation
  navigation: {
    title: "Hospital Map & Walking Directions",
    fromLabel: "Start Location",
    toLabel: "Destination",
    selectDestination: "Where do you want to go?",
    avoidStairsLabel: "Avoid stairs (use lift and ramps only)",
    distance: "Distance",
    totalSteps: "Total steps",
    estimatedWalk: "about {min} min walk",
    routeStepsTitle: "Step-by-Step Directions with Landmarks",
    stepCount: "Step {num}",
    currentFloor: "Viewing Floor: {floor}",
    groundFloor: "Ground Floor",
    firstFloor: "1st Floor (OPD Rooms)",
    secondFloor: "2nd Floor (Wards)",
    lostCardTitle: "I Am Lost - Help Me Card",
    lostCardInstruction: "Show this screen to any doctor, nurse, or guard in uniform:",
    lostCardMessage: "Hello! I am looking for: {destination}. Please point me in the right direction.",
    nearestHelpDeskRoute: "Guide me to Nearest Help Desk"
  },

  // Settings
  settings: {
    title: "Accessibility & Display Settings",
    language: "App Language",
    textSize: "Text Size",
    normal: "Normal (18px)",
    large: "Large (21px)",
    xlarge: "Extra Large (24px)",
    highContrast: "High Contrast (Yellow / White on Black)",
    highContrastDesc: "Enhances text visibility for low vision",
    readAloud: "Text-to-Speech (Voice Guidance)",
    readAloudDesc: "Automatically reads aloud screen instructions",
    assistedMode: "Assisted Mode",
    assistedModeDesc: "Simplified cards, bigger buttons, helper-friendly"
  },

  // Staff Dashboard
  staff: {
    title: "OPD Staff & Queue Management Desk",
    notice: "Prototype Staff View • In a production hospital, this screen requires a verified staff login.",
    urgentAlertTitle: "URGENT PATIENT ASSISTANCE FLAGS",
    urgentAlertDesc: "Patients who pressed 'I Need Urgent Help' from mobile screens:",
    markAttended: "Mark Attended / Resolve",
    allClear: "No active emergency flags. All clear.",
    queueManagement: "OPD Departments Queue",
    servingToken: "Now Serving",
    waitingCount: "Waiting",
    avgWait: "Avg Wait",
    overcrowding: "Waiting Hall Density",
    lowDensity: "Low (Normal)",
    mediumDensity: "Moderate",
    highDensity: "High Overcrowding!",
    updateDoctorStatus: "Doctor Status:",
    setAvailable: "Available in OPD",
    setBreak: "On 15m Break",
    setLate: "Delay +15m",
    demoControlsTitle: "Hackathon Demo Controls (Show Flow in 2 Minutes)",
    demoResetConfirm: "All tokens and queues reset to initial state.",
    regCounterTitle: "Registration Counter Quick Mode (No Phone Needed)"
  },

  // TV Board
  board: {
    title: "CITY DISTRICT HOSPITAL - LIVE OPD QUEUE DISPLAY",
    hallTitle: "WAITING HALL A • FIRST FLOOR",
    room: "Room / Doctor",
    serving: "NOW SERVING",
    nextInLine: "NEXT IN LINE",
    doctorState: "DOCTOR STATUS",
    announcementNotice: "Token announcements are broadcast in Hindi, English, and Tamil.",
    bottomTicker: "Kindly keep your OPD slip ready. Elderly patients may request wheelchair assistance at the Ground Floor Help Desk. Emergency cases please report directly to Casualty."
  },

  // Returning Patient & Patient Account
  account: {
    title: "Patient Profile & Account",
    returningPatient: "Returning Patient",
    returningPatientDesc: "Already have a Patient ID or visited before? Repeat visit in 1 tap.",
    welcomeBack: "Welcome back",
    loginTitle: "Returning Patient Identification",
    loginSubtitle: "Enter your Patient ID or 10-digit Mobile number to view records or repeat your visit without filling forms again.",
    idOrPhonePlaceholder: "Enter Patient ID or 10-digit mobile number",
    searchBtn: "Retrieve Patient Profile",
    patientIdLabel: "Patient ID",
    repeatVisitBtn: "Repeat Hospital Visit / Generate New Token",
    repeatVisitDesc: "Select department and get your token instantly without typing personal details.",
    myRecordsBtn: "My Health Records & Reports",
    checkQueueBtn: "Check Live Queue",
    findDeptBtn: "Hospital Navigation (Find Room)",
    assistantModeBtn: "Voice Assistant Mode",
    elderlyModeBtn: "Elderly-Friendly Mode",
    askStaffHelp: "Ask Hospital Staff for Help",
    staffHelpDeskTitle: "May I Help You Desk (Ground Floor)",
    staffHelpDeskDesc: "A hospital volunteer or staff member is available at Counter 1 to assist you with registration and wheelchair support.",
    logout: "Exit / Switch Patient",
    whatDoYouWantToDo: "What do you want to do today?"
  },

  // Digital Health Records
  records: {
    title: "My Digital Health Records",
    subtitle: "Past hospital checkups, lab test reports, and doctor prescriptions.",
    demoDisclaimer: "Demo / Sample Data — For Hackathon Demonstration Only",
    shareWithDoctor: "Share Records with Doctor",
    shareModalTitle: "Share Health Records with Consulting Doctor",
    shareModalDesc: "Your selected health records and past lab reports will be shared securely with the doctor on duty.",
    confirmShare: "Share Records",
    cancelShare: "Cancel",
    shareSuccess: "Health records shared successfully with the doctor's room.",
    pastVisitsTab: "Past OPD Visits",
    labReportsTab: "Lab & Test Reports",
    prescriptionsTab: "Prescriptions",
    allTab: "All Records",
    diagnosedCondition: "Diagnosis / Reason",
    prescribedMeds: "Prescribed Medications",
    labFindings: "Lab Findings",
    doctorNotes: "Doctor's Advice",
    followUpDate: "Follow-up Date",
    noRecords: "No past records found."
  },

  // Hospital Journey Stepper
  journey: {
    title: "Hospital Visit Journey",
    subtitle: "Track what you have completed and what to do next",
    step1: "Registration",
    step2: "OPD Token",
    step3: "Queue Waiting",
    step4: "Ward Navigation",
    step5: "Doctor Consultation",
    step6: "Lab / Diagnostics",
    step7: "Medicine Pharmacy",
    step8: "Follow-up",
    completed: "Completed",
    current: "In Progress",
    upcoming: "Next Step"
  }
};
