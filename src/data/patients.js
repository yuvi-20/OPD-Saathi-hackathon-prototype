export const INITIAL_PATIENTS = [
  // General Medicine queue (Room 1 & 2)
  {
    token: "MED-039",
    name: "Ramesh",
    age: 48,
    gender: "male",
    phone: "9876543210",
    departmentId: "general_medicine",
    status: "serving", // currently inside doctor's room
    registeredAt: new Date(Date.now() - 40 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    token: "MED-040",
    name: "Suresh",
    age: 55,
    gender: "male",
    phone: "9812345678",
    departmentId: "general_medicine",
    status: "waiting",
    registeredAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    token: "MED-041",
    name: "Geeta",
    age: 42,
    gender: "female",
    phone: "9845123456",
    departmentId: "general_medicine",
    status: "waiting",
    registeredAt: new Date(Date.now() - 22 * 60000).toISOString()
  },
  {
    token: "MED-042",
    name: "Sunita",
    age: 62,
    gender: "female",
    phone: "9988776655",
    departmentId: "general_medicine",
    status: "waiting",
    registeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
    assistedMode: true,
    avoidStairs: true
  },
  {
    token: "MED-043",
    name: "Abdul",
    age: 34,
    gender: "male",
    phone: "9711223344",
    departmentId: "general_medicine",
    status: "waiting",
    registeredAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    token: "MED-044",
    name: "Pooja",
    age: 29,
    gender: "female",
    phone: "9899112233",
    departmentId: "general_medicine",
    status: "waiting",
    registeredAt: new Date(Date.now() - 5 * 60000).toISOString()
  },

  // Pediatrics queue (Room 3)
  {
    token: "PED-018",
    name: "Aarav (Mother: Priya)",
    age: 4,
    gender: "male",
    phone: "9811002233",
    departmentId: "pediatrics",
    status: "serving",
    registeredAt: new Date(Date.now() - 25 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 4 * 60000).toISOString()
  },
  {
    token: "PED-019",
    name: "Ananya (Father: Rahul)",
    age: 2,
    gender: "female",
    phone: "9822334455",
    departmentId: "pediatrics",
    status: "waiting",
    registeredAt: new Date(Date.now() - 12 * 60000).toISOString()
  },
  {
    token: "PED-020",
    name: "Vihaan (Mother: Sunita)",
    age: 7,
    gender: "male",
    phone: "9833445566",
    departmentId: "pediatrics",
    status: "waiting",
    registeredAt: new Date(Date.now() - 5 * 60000).toISOString()
  },

  // Women & Pregnancy (Room 4)
  {
    token: "OBS-015",
    name: "Fatima",
    age: 26,
    gender: "female",
    phone: "9944556677",
    departmentId: "obstetrics_gynecology",
    status: "serving",
    registeredAt: new Date(Date.now() - 35 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    token: "OBS-016",
    name: "Kavita",
    age: 31,
    gender: "female",
    phone: "9955667788",
    departmentId: "obstetrics_gynecology",
    status: "waiting",
    registeredAt: new Date(Date.now() - 14 * 60000).toISOString()
  },

  // Bones & Joints (Room 5)
  {
    token: "ORT-012",
    name: "Harish",
    age: 58,
    gender: "male",
    phone: "9966778899",
    departmentId: "orthopedics",
    status: "serving",
    registeredAt: new Date(Date.now() - 20 * 60000).toISOString()
  },
  {
    token: "ORT-013",
    name: "Manju",
    age: 64,
    gender: "female",
    phone: "9977889900",
    departmentId: "orthopedics",
    status: "waiting",
    registeredAt: new Date(Date.now() - 8 * 60000).toISOString()
  },

  // ENT (Room 6)
  {
    token: "ENT-008",
    name: "Devendra",
    age: 39,
    gender: "male",
    phone: "9911223344",
    departmentId: "ent",
    status: "serving",
    registeredAt: new Date(Date.now() - 15 * 60000).toISOString()
  },

  // Eyes (Room 7)
  {
    token: "EYE-011",
    name: "Bhagwan Das",
    age: 70,
    gender: "male",
    phone: "9812309812",
    departmentId: "ophthalmology",
    status: "serving",
    registeredAt: new Date(Date.now() - 18 * 60000).toISOString()
  },

  // Skin (Room 8)
  {
    token: "SKN-009",
    name: "Mohit",
    age: 22,
    gender: "male",
    phone: "9823456781",
    departmentId: "dermatology",
    status: "serving",
    registeredAt: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

export const INITIAL_DOCTOR_STATUS = {
  general_medicine: { status: "available", delayMin: 0, breakUntil: null },
  pediatrics: { status: "available", delayMin: 0, breakUntil: null },
  obstetrics_gynecology: { status: "running_late", delayMin: 15, breakUntil: null },
  orthopedics: { status: "available", delayMin: 0, breakUntil: null },
  ent: { status: "break", delayMin: 0, breakUntil: "11:30" },
  ophthalmology: { status: "available", delayMin: 0, breakUntil: null },
  dermatology: { status: "available", delayMin: 0, breakUntil: null }
};

// Consultation history samples (times in minutes for the last completed consultations)
export const INITIAL_CONSULTATION_HISTORY = {
  general_medicine: [7, 8, 9, 7, 8, 8, 10, 7, 8, 9],
  pediatrics: [9, 10, 11, 10, 8, 12, 10, 9, 10, 11],
  obstetrics_gynecology: [12, 14, 11, 13, 12, 10, 12, 13, 14, 11],
  orthopedics: [9, 8, 10, 9, 9, 8, 10, 9, 8, 10],
  ent: [6, 7, 8, 6, 7, 8, 7, 6, 7, 8],
  ophthalmology: [8, 8, 7, 9, 8, 8, 7, 9, 8, 8],
  dermatology: [5, 6, 7, 6, 6, 5, 7, 6, 6, 5]
};

// Helper to generate 20 demo patients for the staff dashboard demo button
export const generateDemoPatients = () => {
  const sampleNames = [
    { name: "Santosh Kumar", age: 52, gender: "male" },
    { name: "Kusum Lata", age: 60, gender: "female" },
    { name: "Rahul Verma", age: 28, gender: "male" },
    { name: "Rekha Rani", age: 45, gender: "female" },
    { name: "Arjun Singh", age: 19, gender: "male" },
    { name: "Meena Devi", age: 65, gender: "female" },
    { name: "Dinesh Joshi", age: 38, gender: "male" },
    { name: "Shabana Begum", age: 33, gender: "female" },
    { name: "Kishore Kumar", age: 50, gender: "male" },
    { name: "Lalita Bai", age: 57, gender: "female" },
    { name: "Rohan Gupta", age: 8, gender: "male" },
    { name: "Chitra Nair", age: 24, gender: "female" },
    { name: "Balraj Sahni", age: 67, gender: "male" },
    { name: "Urmila", age: 41, gender: "female" },
    { name: "Gopal Prasad", age: 72, gender: "male" },
    { name: "Tara Chand", age: 63, gender: "male" },
    { name: "Vidya Sharma", age: 36, gender: "female" },
    { name: "Manoj Tiwari", age: 44, gender: "male" },
    { name: "Anjali Dubey", age: 27, gender: "female" },
    { name: "Deepak Rawat", age: 31, gender: "male" }
  ];

  const deptIds = [
    "general_medicine", "general_medicine", "general_medicine", "general_medicine",
    "pediatrics", "pediatrics", "obstetrics_gynecology", "obstetrics_gynecology",
    "orthopedics", "orthopedics", "orthopedics", "ent", "ent",
    "ophthalmology", "ophthalmology", "dermatology", "dermatology"
  ];

  const codeMap = {
    general_medicine: "MED",
    pediatrics: "PED",
    obstetrics_gynecology: "OBS",
    orthopedics: "ORT",
    ent: "ENT",
    ophthalmology: "EYE",
    dermatology: "SKN"
  };

  const newPatients = sampleNames.map((p, idx) => {
    const dept = deptIds[idx % deptIds.length];
    const code = codeMap[dept];
    const tokenNum = 50 + idx;
    return {
      token: `${code}-0${tokenNum}`,
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      departmentId: dept,
      status: "waiting",
      registeredAt: new Date(Date.now() - (20 - idx) * 30000).toISOString()
    };
  });

  return newPatients;
};
