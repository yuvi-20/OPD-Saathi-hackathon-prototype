# OPD Saathi (ओपीडी साथी / ஓபிடி சாதி)
### Smart Hospital Queue Management & Accessible Navigation for Government Hospitals

> **The Problem in Two Lines:**
> Patients at government hospitals spend hours waiting in confusing queues, struggling with language barriers and complex forms, and cannot find assigned rooms or wards. Overcrowded corridors, lack of real-time wait information, and missed emergency signs cause dangerous delays and distress.

---

## 👥 Who This App Is For
- **Primary Persona:** *Kamla Devi*, 62 years old, visiting a district hospital alone. She reads only basic Hindi, owns an entry-level smartphone, walks slowly, and must avoid stairs due to knee pain.
- **Inclusive Audience:** Elderly patients, semi-literate or illiterate individuals, regional language speakers (Hindi, Tamil, English), persons with mobility or visual impairments, and busy government hospital staff managing crowded OPD halls.

---

## 📱 What the App Does (Screen by Screen)
1. **Home Screen (`/`):** Four large high-contrast touch buttons (*New OPD Slip*, *I Have My Slip*, *Find a Place*, *Emergency*) with audio read-aloud and native script language picker.
2. **Registration (`/register`):** 5-step guided wizard (1 question per screen) with emergency checklist, voice mic typing, assisted mode toggle, and illustrated symptom cards.
3. **OPD Slip (`/opd-slip`):** Digital token slip with QR code, assigned doctor, room number, floor, people ahead, estimated wait time, print/share, and large staff-facing flashcard.
4. **My Turn (`/my-turn`):** Live queue tracker showing current serving token, proactive alert when 3 patients are ahead (vibration, chime, simulated SMS, web notification), and arrival call screen.
5. **I Have My Slip (`/have-slip`):** Search by token number or scan QR code via camera to resume live queue tracking and directions.
6. **Find a Place (`/find-place`):** Multi-floor interactive SVG hospital map with Dijkstra shortest path routing, step-by-step landmark directions, stair-free toggle, audio guidance, and an *"I'm Lost"* staff card.
7. **Emergency (`/emergency`):** 24x7 Casualty access guide, 112/108 dialers, critical red-flag checklist, and an instant *"I Need Urgent Help"* SOS alert button.
8. **Settings (`/settings`):** Language selection (English, हिंदी, தமிழ்), 3-step font sizing, high-contrast dark mode, automated TTS read-aloud, and stair avoidance preferences.
9. **Staff Dashboard (`/staff`):** Real-time queue controller for doctors and clerks: call next, mark no-show, send to end, move departments, doctor break/delay toggles, overcrowding heat meters, and pinned urgent emergency flags with audio alerts.
10. **Registration Counter (`/counter`):** Rapid walk-in registration desk for hospital staff to generate and print slips for patients without mobile phones in under 15 seconds.
11. **Waiting-Room TV Board (`/board`):** Fullscreen display for waiting hall TVs, rotating between English, Hindi, and Tamil every 8 seconds with spoken audio token announcements.

---

## 🚨 Emergencies Come First (Clinical Safety Design)
- **Universal Red Emergency Bar:** Fixed at the top of every screen.
- **Triage Checklist on Step 1:** Lists critical emergency signs (chest pain, heavy bleeding, breathing distress, stroke symptoms, unconsciousness, obstetric crisis).
- **Zero Digital Gatekeeping:** The app **never decides** clinical urgency, never tells anyone they can wait, and never requires an urgent patient to obtain a token or register.
- **"I Need Urgent Help" SOS Button:** Instantly broadcasts an alert to the staff dashboard with an audible alarm siren, pinned at the top until attended by medical staff.
- **Qualified Medical Assessment:** Clinical emergency decisions are strictly reserved for qualified doctors and nurses in Casualty.

---

## 🎨 Accessible & Inclusive Design Decisions
- **Assisted Mode ("Someone is helping me"):** Enforces extra-large 24px typography, turns on automatic Text-to-Speech (TTS), and enables stair avoidance.
- **Visual Picture Cards:** Every medical department features clear everyday icons and plain vernacular symptom words (e.g., General Medicine: *"fever, cough, BP, sugar"*).
- **"Avoid Stairs" Dijkstra Routing:** Routes elderly and wheelchair patients exclusively through elevators and ramps, completely filtering out staircases.
- **Multi-Language Parity:** Complete translations across English, Hindi (हिंदी), and Tamil (தமிழ்), including UI, landmarks, directions, audio speech, and TV ticker.
- **Web Speech & Audio Synthesis:** Built-in TTS reading for low-literacy users, accompanied by Web Audio API synthesizers for ding-dong chimes and emergency sirens.

---

## ⏱️ How Waiting Time Is Calculated
$$\text{Estimated Wait} = (\text{Patients Ahead} \times \text{Avg Consultation Time}) + \text{Doctor Delay} + \text{Break Time}$$
- Average consultation times are dynamically drawn per department (General Medicine: 8 min, Pediatrics: 10 min, Orthopedics: 9 min, etc.).
- Doctor delays (e.g., +15 mins due to emergency case) and scheduled breaks are added.
- The result is rounded to the nearest 5 minutes and displayed reassuringly as *"about X minutes"*, updating live as tokens are called.

---

## 🔄 Real-Time Synchronization (Without Backend)
- State is persisted in `localStorage` and synchronized across open browser tabs using `BroadcastChannel('opd_saathi_channel')`.
- When the staff dashboard calls a token or a doctor updates status, the patient's phone tab and the TV waiting board update **within 100 milliseconds** with sound and visual alerts.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js LTS (v18+)

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

---

## 🌐 How to Deploy to Vercel / Netlify

### Vercel Deployment (Recommended)
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Keep the default settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.
> **Note:** The included `vercel.json` rewrite configuration prevents 404 errors when refreshing routes like `/staff` or `/board`.

### Netlify Deployment
1. Connect your GitHub repository on [Netlify](https://netlify.com).
2. Set Build Command: `npm run build` and Publish Directory: `dist`.
3. The included `public/_redirects` file (`/* /index.html 200`) ensures client-side routing works seamlessly on reload.

---

## 🏆 3-Minute Live Hackathon Demo Script for Judges

1. **Setup (0:00 - 0:30):**
   - Open **Tab 1: Patient Screen** (`/`), **Tab 2: Staff Dashboard** (`/staff`), and **Tab 3: TV Board** (`/board`) side-by-side.
   - *Problem statement:* "Government hospital OPDs suffer from confusing queues and lost patients. Here is OPD Saathi."
2. **Registration in Hindi & Assisted Mode (0:30 - 1:15):**
   - Select **हिंदी**. Click **"नया पर्चा बनाएं"**.
   - Show Step 1 emergency checklist: *"Notice how emergency care is never delayed by a queue."*
   - Toggle **Assisted Mode** (text enlarges, voice guidance active).
   - Tap through with Kamla Devi (62, Female). Select **General Medicine (बुखार, खांसी)** picture card.
   - Click submit: Instant OPD slip generated with Token **MED-042** and QR code.
3. **Stair-Free Navigation (1:15 - 1:50):**
   - Click **"कमरे का रास्ता देखें"**.
   - Show the interactive SVG hospital map with **"Avoid Stairs"** enabled.
   - Point out Dijkstra's routing: *"Notice it routes Kamla to the central elevator and ramp rather than the staircase, providing visual landmarks like 'opposite the blue chairs'."*
   - Click **"सुनें (Listen)"** to demonstrate TTS directions.
4. **Live Turn & Staff Call (1:50 - 2:30):**
   - On the Patient screen, open **"My Turn"** (`/my-turn`).
   - Switch to **Tab 2 (Staff Dashboard)** and click **"Call Next"**.
   - Watch the Patient screen instantly chime, vibrate, and show the simulated SMS alert: *"Only 3 ahead, please move to Room 1."*
   - Click **"Call Next"** again: Patient screen turns bright green *"YOUR TURN NOW - Please go inside Room 1"*.
   - Watch **Tab 3 (TV Board)** announce the token aloud and alternate between Hindi, English, and Tamil.
5. **Urgent Emergency SOS (2:30 - 3:00):**
   - On Patient screen, click **"EMERGENCY"** -> **"I Need Urgent Help Now"**.
   - Within 1 second, the Staff Dashboard sounds an audible alert siren and pins the red emergency flag at the top with patient details.
   - *Conclusion:* "OPD Saathi makes registration effortless, prevents delays, ensures zero patients get lost, and prioritizes human life above all."

---

## 🛡️ Demo Safety Checklist (What Could Go Wrong & Solutions)
- **Browser Audio Muted by Autoplay Policy:** Browsers block audio until the user interacts with the page. Tap any button on the screen before the demo to enable audio.
- **Speech Recognition Browser Restriction:** If voice typing is blocked on certain browser settings, click the convenient one-tap sample name buttons (*"Kamla Devi"*).
- **Tab Sleeping / Throttling:** Keep the demo tabs active in split windows so background tab timer throttling does not pause animations.
- **Accidental State Clutter:** Click the **"Reset Demo Data"** button in Settings or the Staff Dashboard to instantly restore pristine starting state in 1 second.
