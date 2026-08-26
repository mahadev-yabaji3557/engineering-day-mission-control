'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Camera, ArrowRight, Shield, Search } from 'lucide-react';

export default function CameraScannerPage() {
  const router = useRouter();
  const [manualToken, setManualToken] = useState('');

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    router.push(`/scan/${manualToken.trim()}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-950 border border-blue-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <QrCode className="w-8 h-8 text-blue-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">TEAM PASS SCANNER</h1>
          <p className="text-xs text-slate-400 font-mono">
            Scan physical CR80 Team Pass QR code or manually enter token to evaluate server clearance.
          </p>
        </div>

        {/* Manual Token Entry Form */}
        <form onSubmit={handleScanSubmit} className="space-y-4 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="e.g. tok_em01_7f8a9b2c3d4e"
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-xl font-mono text-xs outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-950/50"
          >
            <span>Evaluate Pass Clearance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Fast Select Demo Tokens */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
            Quick Select Demo Team Passes
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => router.push('/scan/tok_em01_7f8a9b2c3d4e')}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-800 rounded-xl text-left truncate"
            >
              EM-01 Pass
            </button>
            <button
              onClick={() => router.push('/scan/tok_em07_9f8a7b6c5d4e')}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-800 rounded-xl text-left truncate"
            >
              EM-07 Pass
            </button>
            <button
              onClick={() => router.push('/scan/tok_uc01_a9f8b7c6d5e4')}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-800 rounded-xl text-left truncate"
            >
              UC-01 Pass
            </button>
            <button
              onClick={() => router.push('/scan/tok_uc07_b8c7d6e5f4a3')}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-800 rounded-xl text-left truncate"
            >
              UC-07 Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
