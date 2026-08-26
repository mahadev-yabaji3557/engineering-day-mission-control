'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Clock, Users, QrCode, LogOut, AlertTriangle, Play, Pause, Zap, UserPlus, Lock, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [clockInfo, setClockInfo] = useState<any>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated) {
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    }
  };

  const fetchClock = async () => {
    try {
      const res = await fetch('/api/clock?eventCode=EM');
      const data = await res.json();
      setClockInfo(data);
    } catch {}
  };

  useEffect(() => {
    fetchSession();
    fetchClock();
    const interval = setInterval(fetchClock, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    router.push('/login');
  };

  const handleRoleSwitch = async (role: string) => {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (res.ok && data.redirectUrl) {
      await fetchSession();
      router.push(data.redirectUrl);
    }
  };

  const isParticipantSession = session?.role === 'PARTICIPANT';

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Mission Status */}
        <div className="flex items-center space-x-3">
          <Link href={isParticipantSession ? '/dashboard/participant' : '/'} className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-wider text-white font-sans uppercase">ENGINEERING DAY</span>
              <span className="ml-2 text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800/80 rounded-md">
                {isParticipantSession ? 'TEAM PORTAL' : 'MISSION CONTROL'}
              </span>
            </div>
          </Link>

          {/* Synchronized Server Clock Indicator */}
          {!isParticipantSession && clockInfo && (
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800 font-mono text-xs">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200 font-bold">
                  {new Date(clockInfo.effectiveServerTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {clockInfo.status === 'ACTIVE' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  <Play className="w-3 h-3 mr-1.5 fill-emerald-400" /> LIVE ACTIVE
                </span>
              )}

              {clockInfo.status === 'PAUSED' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800/80">
                  <Pause className="w-3 h-3 mr-1.5 fill-amber-400" /> PAUSED
                </span>
              )}

              {clockInfo.status === 'EMERGENCY_HOLD' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-950 text-red-400 border border-red-800/80 animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1.5" /> EMERGENCY HOLD
                </span>
              )}
            </div>
          )}
        </div>

        {/* Navigation Action Area */}
        <div className="flex items-center space-x-2.5 font-mono text-xs">
          {isParticipantSession ? (
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800 font-bold flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Isolated Team Session</span>
              </span>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all flex items-center space-x-1 font-bold border border-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="flex items-center space-x-1.5 px-3 py-1.5 font-bold rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/80 transition-all shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Self-Register Team</span>
              </Link>

              <Link
                href="/scan-camera"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                <span>QR Scanner</span>
              </Link>

              {/* Staff Roles Switcher */}
              <div className="relative group">
                <button className="px-3 py-1.5 font-bold bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-xl flex items-center space-x-1.5 transition-all">
                  <Users className="w-3.5 h-3.5" />
                  <span>{session ? `Role: ${session.role}` : 'Staff Roles'}</span>
                </button>
                <div className="absolute right-0 mt-1 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 hidden group-hover:block z-50">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 mb-1">
                    Staff Role Dashboards
                  </div>
                  {[
                    { r: 'SUPER_ADMIN', l: '👑 Super Admin Dashboard' },
                    { r: 'EVENT_HEAD', l: '🎯 Event Head Dashboard' },
                    { r: 'ARENA_HEAD', l: '⚡ Arena Head Dashboard' },
                    { r: 'ACCESS_OFFICER', l: '🔐 Access Officer Dashboard' },
                    { r: 'MISSION_MARSHAL', l: '📋 Mission Marshal Dashboard' },
                    { r: 'JUDGE', l: '⚖️ Judge Scoring Dashboard' },
                    { r: 'VOLUNTEER', l: '🤝 Volunteer Support Dashboard' },
                    { r: 'PARTICIPANT', l: '📱 Participant Clearance Portal' },
                  ].map((roleItem) => (
                    <button
                      key={roleItem.r}
                      onClick={() => handleRoleSwitch(roleItem.r)}
                      className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                        session?.role === roleItem.r
                          ? 'bg-blue-950/80 text-blue-200 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{roleItem.l}</span>
                      {session?.role === roleItem.r && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {session ? (
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-800"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/40 transition-all"
                >
                  Staff Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
