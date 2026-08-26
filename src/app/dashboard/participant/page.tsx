'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, ArrowRight, Shield } from 'lucide-react';

export default function ParticipantDashboardPage() {
  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl text-center">
        <div className="w-16 h-16 bg-rose-950 border border-rose-800 rounded-2xl flex items-center justify-center mx-auto">
          <QrCode className="w-8 h-8 text-rose-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest px-3 py-1 bg-rose-950 rounded-full border border-rose-800">
            PARTICIPANT DASHBOARD
          </span>
          <h1 className="text-2xl font-black text-white font-sans">Access Your Digital Team Clearance</h1>
          <p className="text-xs text-slate-400 font-mono">
            Participants access their clearance and submission forms via their unique QR Team Pass.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 text-left">
          <div className="text-xs font-mono font-bold text-white uppercase">Sample Active Team Passes</div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <Link
              href="/scan/tok_em01_xvas9ha5"
              className="p-3 bg-slate-900 hover:bg-blue-950 border border-slate-800 rounded-xl text-blue-300 font-bold flex items-center justify-between"
            >
              <span>EM-01 Pass</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/scan/tok_uc01_2tppntzz"
              className="p-3 bg-slate-900 hover:bg-indigo-950 border border-slate-800 rounded-xl text-indigo-300 font-bold flex items-center justify-between"
            >
              <span>UC-01 Pass</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
