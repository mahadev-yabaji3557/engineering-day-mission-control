# ENGINEERING DAY — MISSION CONTROL

Production-ready college Engineering Day competition control platform managing two flagship events:
1. **ENGINEER'S MIND** (`EM-01` to `EM-25`)
2. **ENGINEERING UNDERCOVER** (`UC-01` to `UC-25`)

---

## ⚡ Core Operational Features

- **Server-Side Event Clock**: Absolute server timestamp validation. No client, phone, or browser clock reliance.
- **One QR Team Pass System**: High-entropy random QR tokens mapping dynamically to backend team permissions.
- **Sealed Physical Packet Integration**: Digital clearance unlocks prompt to open sealed physical packets; Mission Marshals log unsealing events.
- **Structured Online Answer Submission**: Configurable multi-type fields (Short, Long, MCQ, Evidence, Justification, Confidence).
- **Rubric Judging & Score Finalization**: Max-bound enforced rubric scoring with comments, draft saving, and score locks.
- **Live & Final Leaderboards**: Configurable tie-breakers (Final Round score > Reasoning score > Earliest Submission > Event Head decision).
- **Printable CR80 Pass Generator**: Standard 85.60mm × 53.98mm card pass layouts and printable multi-card sheet generation.
- **Test Mode Time Warp**: Step through event timeline (10:00 AM → 10:15 AM → 10:35 AM → 10:55 AM) to test locks, unlocks, and scoring without waiting.
- **Emergency Fallback System**: Staff UI for logging paper backup answer sheets during internet interruptions.
- **CSV Data Exports**: Export Teams, Access Logs, Submissions, Scores, Final Standings, and System Audit Logs.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ or v20+
- npm v9+ or v10+

### 2. Setup & Database Initialization
```bash
# Push database schema to SQLite (dev.db)
npx prisma db push

# Seed 50 teams, 10 missions, rubrics, and staff accounts
npm run db:seed
```

### 3. Build & Run Production Server
```bash
npm run build
npm run start
```
Access the application at `http://localhost:3000`

---

## 🔐 Default Demo Accounts

- **Super Admin**: `admin@missioncontrol.org` / `admin123`
- **Event Head**: `eventhead@missioncontrol.org` / `password123`
- **Arena Head**: `arenahead@missioncontrol.org` / `password123`
- **Access Officer**: `access@missioncontrol.org` / `password123`
- **Mission Marshal**: `marshal@missioncontrol.org` / `password123`
- **Chief Judge**: `judge1@missioncontrol.org` / `password123`
- **Evaluator Judge**: `judge2@missioncontrol.org` / `password123`
- **Volunteer**: `volunteer@missioncontrol.org` / `password123`
- **Participant Pass**: Scan `/scan/tok_em01_7f8a9b2c3d4e` or click any pass on homepage.
