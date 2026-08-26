'use client';

import React, { useState } from 'react';
import { AlertTriangle, FileText, CheckCircle2, Send, ShieldAlert, BookOpen } from 'lucide-react';

export default function EmergencyBackupPage() {
  const [teamCode, setTeamCode] = useState('EM-01');
  const [missionCode, setMissionCode] = useState('EM-01');
  const [physicalTime, setPhysicalTime] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);

  const handleSubmitPaperAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/emergency/paper-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamCode,
          missionCode,
          physicalReceivedTime: new Date(physicalTime).toISOString(),
          paperNotes: notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: 'success', text: data.message });
        setNotes('');
      } else {
        setMsg({ type: 'error', text: data.error || 'Recording failed' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error submitting paper record.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Offline Backup Mode Banner */}
      <div className="bg-red-950/80 border-2 border-red-700 rounded-3xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-900 rounded-2xl">
            <ShieldAlert className="w-6 h-6 text-red-200" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest px-2.5 py-0.5 rounded bg-red-900 border border-red-800">
              OFFLINE FALLBACK PROTOCOL ACTIVE
            </span>
            <h1 className="text-2xl font-black text-white font-sans mt-1">Emergency Paper Backup System</h1>
          </div>
        </div>

        <p className="text-xs text-red-200 font-mono leading-relaxed">
          If network or digital infrastructure experiences interruption, event staff initiate paper fallback mode. Participants solve using physical printed paper answer sheets. Volunteers manually log physical receipt timestamps below for retroactive audit scoring.
        </p>
      </div>

      {/* Manual Paper Answer Logger Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Manual Paper Sheet Collector</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">STAFF OVERRIDE PORTAL</span>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-2xl text-xs font-mono border ${
              msg.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-red-950 border-red-800 text-red-300'
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmitPaperAnswer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-semibold">Team Code</label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                placeholder="EM-07 or UC-12"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-semibold">Mission Code</label>
              <input
                type="text"
                value={missionCode}
                onChange={(e) => setMissionCode(e.target.value.toUpperCase())}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                placeholder="EM-02 or UC-03"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-semibold">Physical Received Time</label>
              <input
                type="datetime-local"
                value={physicalTime}
                onChange={(e) => setPhysicalTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 font-semibold">Paper Sheet Collector Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl outline-none"
              placeholder="e.g. Paper answer sheet received by Volunteer Alex at Arena desk 2..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>RECORD MANUAL PAPER SUBMISSION</span>
          </button>
        </form>
      </div>
    </div>
  );
}
