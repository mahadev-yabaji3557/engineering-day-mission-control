'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, Mail, Lock, AlertCircle, ArrowRight, QrCode, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'PARTICIPANT' | 'STAFF'>('PARTICIPANT');

  // Staff login state
  const [email, setEmail] = useState('eventhead@missioncontrol.org');
  const [password, setPassword] = useState('password123');

  // Participant login state
  const [teamPassToken, setTeamPassToken] = useState('tok_em01_xvas9ha5');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push(data.redirectUrl || '/dashboard/live');
      } else {
        setError(data.error || 'Staff authentication failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamPassToken.trim()) {
      setError('Please enter your Team QR Pass token or Team Code.');
      return;
    }
    // Set participant session role
    fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'PARTICIPANT' }),
    }).then(() => {
      router.push(`/scan/${teamPassToken.trim()}`);
    });
  };

  const setRoleAccount = (e: string, p: string = 'password123') => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">AUTHENTICATION PORTAL</h2>
          <p className="text-xs text-slate-400 font-mono">ENGINEERING DAY — MISSION CONTROL SECURITY</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => { setTab('PARTICIPANT'); setError(''); }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'PARTICIPANT' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Participant Login</span>
          </button>

          <button
            onClick={() => { setTab('STAFF'); setError(''); }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'STAFF' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Login</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* PARTICIPANT LOGIN FORM */}
        {tab === 'PARTICIPANT' ? (
          <form onSubmit={handleParticipantLogin} className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                ISOLATED TEAM ACCESS
              </span>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Enter your Team Pass QR token below to access your team clearance and online answer submission form. No admin data will be visible.
              </p>

              <div className="space-y-1 pt-1">
                <label className="text-xs font-mono font-medium text-slate-300">Team QR Pass Token</label>
                <input
                  type="text"
                  value={teamPassToken}
                  onChange={(e) => setTeamPassToken(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-rose-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                  placeholder="e.g. tok_em01_xvas9ha5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center space-x-2"
            >
              <span>ACCESS TEAM CLEARANCE PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STAFF LOGIN FORM */
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-300">Staff Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-xl text-xs outline-none transition-colors"
                  placeholder="staff@missioncontrol.org"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-xl text-xs outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Staff Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Accounts */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block text-center">
            Quick Select Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            <button
              onClick={() => { setTab('PARTICIPANT'); setTeamPassToken('tok_em01_xvas9ha5'); }}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-rose-300 border border-slate-800 rounded text-left truncate font-bold"
            >
              📱 Participant Pass
            </button>
            <button
              onClick={() => { setTab('STAFF'); setRoleAccount('eventhead@missioncontrol.org'); }}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-800 rounded text-left truncate"
            >
              🎯 Event Head
            </button>
            <button
              onClick={() => { setTab('STAFF'); setRoleAccount('judge1@missioncontrol.org'); }}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-yellow-300 border border-slate-800 rounded text-left truncate"
            >
              ⚖️ Judge
            </button>
            <button
              onClick={() => { setTab('STAFF'); setRoleAccount('admin@missioncontrol.org', 'admin123'); }}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-slate-800 rounded text-left truncate"
            >
              👑 Super Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
