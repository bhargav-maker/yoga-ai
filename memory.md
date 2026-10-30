# 🧠 AI Handover & Memory Dossier — Yoga AI (Poddar Yogis)

> **FOR FUTURE AI ASSISTANTS**: Read this file first! This document provides persistent context, complete history, technical specifications of all 7 biomechanical engines, database architecture, and District-Level presentation guides.

---

## 📌 Executive Summary & Project Identity

- **Project Title**: **Yoga AI: Poddar Yogis** 🧘‍♂️
- **Lead Developer**: bhargav-maker
- **Repository**: `bhargav-maker/yoga-ai`
- **Core Purpose**: Real-time AI yoga posture evaluation, joint-level skeleton alignment, hold-time tracking, breathing synchronization, and clinical-grade physical therapy diagnostics running 100% locally in web browsers.
- **Current Competition Status**:
  - 🥇 **Sub-Divisional Level**: **WON / 1st Place** (Successfully cleared and won!)
  - 🎯 **District Level**: **Active Target / Fully Prepared** with balanced pose detection, authentic clean skeleton UI, and 10s auto-closing IndexedDB analytics!
  - 🚀 **State Level**: Future horizon upon winning District.

---

## 🌟 The 7 Dynamic Biomechanical Features & UI Experience

### 1. 🗣️ Real-Time Spoken Feedback (Kinematic Chain Hierarchy)
- **Engine**: [`src/utils/audioCoach.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/audioCoach.js)
- **Technology**: Native browser `window.speechSynthesis` (100% offline, zero server cost).
- **Logic**: Evaluates the whole body and voices the single highest-priority correction first (Spine/Core alignment before wrist/ankle angles).
- **Anti-Overlapping Cooldown**: Enforces an automatic 4.5-second cooldown and duplicate suppression so instructions sound like a calm, thoughtful human instructor.

### 2. ⚖️ Stability & Balance Tracking (Micro-Movement Analysis)
- **Engine**: [`src/utils/stabilityTracker.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/stabilityTracker.js)
- **Logic**: Tracks Center-of-Gravity (CoG) velocity and spatial variance across a 15-frame sliding window.
- **Fair Hold Enforcement**: If the user's coordinates drift or vibrate rapidly (wobbling in Tree or Warrior pose), the system pauses hold time accumulation until stillness returns.

### 3. 📐 Symmetry & Relative Slope Comparison (Postural Compensation)
- **Engine**: [`src/utils/biomechanics.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/biomechanics.js)
- **Logic**: Calculates the vector slope of the shoulders ($\Delta y / \Delta x$) relative to the hips. If angular divergence exceeds $15^\circ$, the system flags lateral pelvic tilt or shoulder hiking.

### 4. 🛑 Hyperextension & Injury Prevention (Biomechanical Boundary)
- **Engine**: [`src/utils/biomechanics.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/biomechanics.js)
- **Logic**: Models the natural range of motion for hinge joints (knees and elbows). Reversing deflection past $178^\circ-180^\circ$ turns the affected joint and limb segment **red** on the canvas and triggers an audio caution.

### 5. 🌬️ Pranayama & Breathing Synchronization
- **Engine**: [`src/utils/breathingEngine.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/breathingEngine.js)
- **Logic**: Coordinates a yogic 4-4-4 rhythm: Inhale (4s) $\to$ Hold / Kumbhaka (4s) $\to$ Exhale (4s).
- **Canvas Chest Aura**: Smooth sinusoidal expansion and contraction using a crisp neon ring with zero dark center artifacts, centered over the chest keypoints.

### 6. 📋 10-Second Auto-Closing Diagnostic Scorecard & IndexedDB Analytics
- **Engines**: 
  - [`src/utils/scorecard.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/scorecard.js) (Rating math & clinical prescriptions)
  - [`src/utils/db.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/db.js) (Browser IndexedDB client-side database)
  - [`src/DiagnosticModal.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/DiagnosticModal.js) (10s auto-closing popup, touch/click to pause, fully scrollable)
  - [`src/Progress.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/Progress.js) (Dedicated analytics page with JSON export, naturally scrollable)
- **Auto-Dismiss**: When you stop a pose, the scorecard displays for 10 seconds. If untouched, it automatically dismisses and saves to IndexedDB. If clicked/touched, it pauses the countdown and lets the user scroll freely.

### 7. 🛡️ Balanced Detection (Not Overly Strict, Not Fake)
- **Engine**: [`src/utils/biomechanics.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/utils/biomechanics.js) & [`src/Yoga.js`](./frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/src/Yoga.js)
- **Balanced Sweet Spot**:
  - Rejects obvious false postures (e.g., in Tree pose, hands separated wide apart or foot kicked behind/in the air will **not** pass).
  - Does NOT demand robotic millimeter perfection (minor height or angle variations are accepted smoothly at $>0.82$ with geometric sanity or $>0.94$ overall).
  - **Full Anatomical Skeleton**: Bone connections are drawn first, joints are drawn on top, ensuring legs connect to hips and hands connect to wrists without broken lines.
  - **Restored Old Clean UI**: The camera practice screen retains the exact original clean layout (original timer boxes, target image on right, Stop Pose button, clean skeleton).

---

## 🏗️ Codebase Anatomy & File Map

```text
yoga-ai/
│
├── memory.md                            <-- THIS FILE: Master AI Memory Dossier
├── README.md                            <-- Public GitHub documentation
├── Yoga_AI_Presentation.html            <-- Interactive exhibition slide deck (open in browser)
├── Yoga_AI_Presentation.pptx            <-- Generated 16:9 presentation slides
├── generate_pptx.py                     <-- Python generator for the PPTX deck
├── start.bat / yoga.bat                 <-- One-click Windows launch scripts
├── package.json                         <-- Root package & CLI wrapper
│
├── bin/
│   └── cli.js                           <-- Zero-dependency Node.js production server
│
├── classification model/
│   ├── movenet.py                       <-- Landmark extraction script
│   ├── preprocessing.py                 <-- Keypoint normalization & CSV converter
│   ├── training.py                      <-- Keras neural network training & TF.js exporter
│   ├── train_data.csv / test_data.csv   <-- Landmark feature datasets
│   ├── model/                           <-- Trained TF.js classifier weights
│   └── yoga_poses/                      <-- Raw pose image dataset
│
└── frontend/
    └── Poddar-Yogis-frontend/
        └── Poddar-Yogis-frontend/
            ├── .env                     <-- Windows & port configuration
            ├── build/                   <-- Optimized production build (Verified Clean)
            ├── public/
            │   ├── index.html           <-- Root HTML
            │   └── model/               <-- Offline bundled TF.js model weights
            ├── src/
            │   ├── Yoga.js              <-- Studio: Clean Old UI + Balanced Detection + Full Skeleton
            │   ├── DiagnosticModal.js   <-- 10-Second Auto-Closing Scorecard (Scrollable)
            │   ├── DiagnosticModal.css  <-- Modal styles & scroll containers
            │   ├── Progress.js          <-- Historical analytics & session telemetry page (Scrollable)
            │   ├── Progress.css         <-- Progress page styling
            │   ├── Home.js              <-- Landing screen with Analytics link
            │   ├── Instructions.js      <-- Pose guidelines
            │   ├── Tutorials.js         <-- Visual pose library
            │   ├── About.js             <-- Project & Team details
            │   └── utils/
            │       ├── biomechanics.js  <-- Balanced sanity checks, slope symmetry, hyperextension, EMA
            │       ├── stabilityTracker.js <-- Center-of-gravity velocity & spatial variance
            │       ├── audioCoach.js    <-- Offline Speech Synthesis voice coach
            │       ├── breathingEngine.js <-- Sinusoidal Pranayama rhythm & neon chest aura
            │       ├── db.js            <-- IndexedDB offline client storage
            │       ├── scorecard.js     <-- Multi-factor rating & mobility prescriptions
            │       ├── data/            <-- MoveNet 17 keypoints & connections
            │       ├── helper/          <-- Canvas drawPoint & drawSegment functions
            │       ├── music/           <-- Local chime sound assets
            │       └── pose_images/     <-- Target reference pose graphics
            └── package.json             <-- React dependencies & build scripts
```

---

## 🏛️ District Level Judge Demonstration Script

1. **The Hook (30s)**:
   - *"Over 60% of home yoga practitioners suffer muscle strain or poor form because standard apps lack physical intelligence. We built Yoga AI: Poddar Yogis to deliver clinical-grade, offline biomechanical coaching in the browser."*

2. **Live Demonstration (1–2m)**:
   - Double click [`start.bat`](./start.bat) or [`yoga.bat`](./yoga.bat).
   - Click **Let's Start**, select **Tree Pose**, click **Start Pose**.
   - Note the **Clean Original UI**: clean canvas, timer on top-left, target pose on right.
   - Point out the **Pulsing Neon Breathing Ring** on the chest smoothly expanding on Inhale and contracting on Exhale.
   - Separate hands or kick leg backwards: show that the app **correctly refuses to pass fake poses**.
   - Bring hands together and rest foot against the inner thigh: the skeleton turns **vivid green**, chime plays, and hold time increments.
   - Lock knee: note the **red warning highlight** on the joint.

3. **Auto-Closing Scorecard & IndexedDB (45s)**:
   - Click **Stop Pose**.
   - The **Diagnostic Scorecard** pops up showing the 10-second auto-close countdown.
   - Click the card to pause auto-close and scroll through the metrics and physical therapy advice.
   - Click **View All Progress Reports →** to show the **IndexedDB Analytics Dashboard** (`/progress`).
   - Click **Export JSON Report 📥** to download telemetry for judges.

---

## ⚡ Instructions for Future AI Agents

1. **Keep the Old Skeleton UI clean**: Do not clutter the active webcam screen with unnecessary banners or badges.
2. **Preserve Balanced Detection**: Keep the combination of neural network confidence + geometric sanity checks (wrist proximity, folded leg placement) so poses cannot be faked while remaining accessible.
3. **Build Validation**: Always verify changes by running `npm --prefix frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend run build`. The build must compile with exit code 0.
