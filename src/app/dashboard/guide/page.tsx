'use client';

import React from 'react';
import { BookOpen, CheckCircle2, Shield, QrCode, Clock, FileText, AlertTriangle, Play } from 'lucide-react';

export default function DayOfEventQuickGuidePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border-2 border-blue-700 rounded-3xl p-6 shadow-2xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-900 rounded-2xl">
            <BookOpen className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-widest px-2.5 py-0.5 rounded bg-blue-900 border border-blue-800">
              VOLUNTEER & STAFF FIELD MANUAL
            </span>
            <h1 className="text-2xl font-black text-white font-sans mt-1">DAY-OF-EVENT 2-MINUTE QUICK GUIDE</h1>
          </div>
        </div>
        <p className="text-xs text-blue-200 font-mono">
          Simple, step-by-step instructions for volunteers, marshals, access officers, and judges on competition day.
        </p>
      </div>

      {/* Guide Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: For Participants & Access Officers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-blue-400 font-mono font-bold text-sm border-b border-slate-800 pb-2">
            <QrCode className="w-5 h-5" />
            <span>STEP 1: TEAM PASS & ACCESS CONTROL</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold shrink-0">1.</span>
              <span>Each team holds ONE physical Team Pass with a unique QR code (e.g. EM-07).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold shrink-0">2.</span>
              <span>Participants scan their QR pass using any smartphone camera.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold shrink-0">3.</span>
              <span>If scanned early, the screen strictly displays <strong>"MISSION LOCKED"</strong> with unlock time. No clues or titles are shown.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 font-bold shrink-0">4.</span>
              <span>At official server release time, the screen changes to <strong>"CLEARANCE GRANTED"</strong> with an active timer.</span>
            </li>
          </ul>
        </div>

        {/* Step 2: For Mission Marshals */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-sm border-b border-slate-800 pb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>STEP 2: PHYSICAL SEALED PACKET UNSEALING</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold shrink-0">1.</span>
              <span>Physical mission packets remain sealed at team tables at all times.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold shrink-0">2.</span>
              <span>When digital clearance changes to <strong>CLEARANCE GRANTED</strong>, the Mission Marshal verifies team pass and unseals physical packet.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold shrink-0">3.</span>
              <span>Marshal clicks <strong>"PACKET OPENED"</strong> on staff scanner to record exact physical unsealing timestamp.</span>
            </li>
          </ul>
        </div>

        {/* Step 3: For Online Submissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-sm border-b border-slate-800 pb-2">
            <FileText className="w-5 h-5" />
            <span>STEP 3: ONLINE ANSWER SUBMISSION</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold shrink-0">1.</span>
              <span>Teams solve physical packet problems and fill structured fields on their phone clearance page.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold shrink-0">2.</span>
              <span>Team MUST explicitly click <strong>"SUBMIT FINAL ANSWER"</strong> before round countdown expires.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold shrink-0">3.</span>
              <span>Once submitted, answers become locked on server. Timestamp uses server time strictly.</span>
            </li>
          </ul>
        </div>

        {/* Step 4: Emergency Offline Fallback */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-sm border-b border-slate-800 pb-2">
            <AlertTriangle className="w-5 h-5" />
            <span>STEP 4: EMERGENCY OFFLINE FALLBACK</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 font-mono leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-red-400 font-bold shrink-0">1.</span>
              <span>If internet fails, Event Head announces <strong>OFFLINE BACKUP MODE</strong>.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 font-bold shrink-0">2.</span>
              <span>Participants fill printed paper answer sheets provided at tables.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 font-bold shrink-0">3.</span>
              <span>Volunteers collect paper sheets and log team code, mission code, and physical time in <strong>Emergency Backup UI</strong>.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
