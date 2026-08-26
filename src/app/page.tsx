'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  QrCode,
  Clock,
  Award,
  Users,
  Lock,
  Play,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  Sliders,
  Printer,
  ChevronRight,
  Cpu,
  Radio,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teams?eventCode=EM')
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) setTeams(data.teams);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRoleLaunch = async (role: string, targetPath: string = '/dashboard/live') => {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (res.ok && data.redirectUrl) {
      router.push(data.redirectUrl);
    } else {
      router.push(targetPath);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Telemetry Showcase Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950 border border-slate-800/80 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl glow-blue">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-mono font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COLLEGE ENGINEERING DAY 2026 • OFFICIAL COMMAND CENTER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
            MISSION CONTROL
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Real-time competition execution system for <strong className="text-blue-400 font-semibold">ENGINEER'S MIND</strong> & <strong className="text-indigo-400 font-semibold">ENGINEERING UNDERCOVER</strong>. Engineered with server-side time validation, sealed physical packet clearance, structured online answer submissions, and live rubric judging.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 font-mono text-xs">
            <Link
              href="/dashboard/live"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-950/60 flex items-center space-x-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Live Telemetry Dashboard</span>
            </Link>

            <Link
              href="/register"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-blue-300 font-bold rounded-2xl border border-slate-700 flex items-center space-x-2.5 transition-all"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Self-Register Team →</span>
            </Link>

            <Link
              href="/scan-camera"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center space-x-2.5 transition-all"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>Camera QR Scanner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2 Competition Event Showcases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event 1: Engineer's Mind */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-700/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-950 border border-blue-800 rounded-2xl">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full">
              CODE: EM (25 TEAMS)
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-white font-sans uppercase group-hover:text-blue-300 transition-colors">
              ENGINEER'S MIND
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
              Analytical engineering challenges testing circuit logic, structural load balancing, algorithmic pipelines, and smart grid design.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span>Missions Configured:</span>
              <strong className="text-white">EM-01 to EM-04 + EM-F</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Points Possible:</span>
              <strong className="text-emerald-400 font-bold">105 Marks</strong>
            </div>
          </div>
        </div>

        {/* Event 2: Engineering Undercover */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-700/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl transition-all group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-2xl">
              <Radio className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-full">
              CODE: UC (25 TEAMS)
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-white font-sans uppercase group-hover:text-indigo-300 transition-colors">
              ENGINEERING UNDERCOVER
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
              Covert tactical engineering tasks involving cipher decryption, signal triangulation, micro-robotics, and breach containment.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span>Missions Configured:</span>
              <strong className="text-white">UC-01 to UC-04 + UC-F</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Points Possible:</span>
              <strong className="text-emerald-400 font-bold">105 Marks</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Team Pass Tester Simulator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 font-sans">
              <QrCode className="w-5 h-5 text-blue-400" />
              <span>Interactive Participant Pass Simulator (Instant Scan)</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Click any team pass to test server clearance and mission lock/unlock behavior as a participant.
            </p>
          </div>
          <Link href="/dashboard/passes" className="text-xs font-mono text-blue-400 hover:underline flex items-center space-x-1">
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Printable Pass Sheets →</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs bg-slate-900 rounded-2xl border border-slate-800">
            Loading team passes...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {teams.slice(0, 12).map((t) => (
              <Link
                key={t.id}
                href={`/scan/${t.qrToken}`}
                className="group p-3.5 bg-slate-900/80 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-700/60 rounded-2xl transition-all flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-blue-400 group-hover:text-blue-300">{t.teamCode}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">{t.teamName}</div>
                <div className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-850">
                  <span>Scan Pass</span>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 8 Role Portals Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2 font-sans">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Dedicated Role Portals (One-Click Launch)</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Instantly switch context to inspect role-specific workflow tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              role: 'SUPER_ADMIN',
              title: '1. Super Admin',
              desc: 'Full system health, database management & audit logs.',
              icon: Shield,
              color: 'text-purple-400',
              border: 'border-purple-800/40',
              bg: 'bg-purple-950/20',
              target: '/dashboard/super-admin',
            },
            {
              role: 'EVENT_HEAD',
              title: '2. Event Head',
              desc: 'Master clock (Start/Pause/Resume), schedule & pass manager.',
              icon: Sliders,
              color: 'text-blue-400',
              border: 'border-blue-800/40',
              bg: 'bg-blue-950/20',
              target: '/dashboard/event-head',
            },
            {
              role: 'ARENA_HEAD',
              title: '3. Arena Head',
              desc: 'Arena floor telemetry, real-time team status & hold overrides.',
              icon: Zap,
              color: 'text-cyan-400',
              border: 'border-cyan-800/40',
              bg: 'bg-cyan-950/20',
              target: '/dashboard/arena-head',
            },
            {
              role: 'ACCESS_OFFICER',
              title: '4. Access Officer',
              desc: 'QR verification scanner, entrance log stream & clearance.',
              icon: Lock,
              color: 'text-emerald-400',
              border: 'border-emerald-800/40',
              bg: 'bg-emerald-950/20',
              target: '/dashboard/access-officer',
            },
            {
              role: 'MISSION_MARSHAL',
              title: '5. Mission Marshal',
              desc: 'Sealed packet unsealing verification & audit recording.',
              icon: CheckCircle2,
              color: 'text-amber-400',
              border: 'border-amber-800/40',
              bg: 'bg-amber-950/20',
              target: '/dashboard/mission-marshal',
            },
            {
              role: 'JUDGE',
              title: '6. Judge',
              desc: 'Rubric scoring dashboard, total calculation & score lock.',
              icon: Award,
              color: 'text-yellow-400',
              border: 'border-yellow-800/40',
              bg: 'bg-yellow-950/20',
              target: '/dashboard/judge',
            },
            {
              role: 'VOLUNTEER',
              title: '7. Volunteer',
              desc: 'Operational quick guide & emergency paper backup logger.',
              icon: FileCheck,
              color: 'text-teal-400',
              border: 'border-teal-800/40',
              bg: 'bg-teal-950/20',
              target: '/dashboard/volunteer',
            },
            {
              role: 'PARTICIPANT',
              title: '8. Participant',
              desc: 'Mobile team clearance, active timer & structured submission.',
              icon: Eye,
              color: 'text-rose-400',
              border: 'border-rose-800/40',
              bg: 'bg-rose-950/20',
              target: '/dashboard/participant',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                onClick={() => handleRoleLaunch(item.role, item.target)}
                className={`p-5 ${item.bg} border ${item.border} rounded-2xl cursor-pointer hover:border-slate-600 transition-all flex flex-col justify-between space-y-3 group shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 group-hover:text-white border border-slate-800">
                      LAUNCH →
                    </span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors text-base font-sans">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed font-mono">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Rules & Architecture Safeguards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2 font-sans">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>Core Security Rules & Architecture Safeguards</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 font-mono">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="font-bold text-blue-400 flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>1. SERVER-SIDE EVENT CLOCK</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              System NEVER trusts client/phone time. Round timing, clearances, countdowns, and late locks are evaluated strictly by server timestamp.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <QrCode className="w-4 h-4" />
              <span>2. ONE QR PERMANENT PASS</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              QR contains ONLY a secure random team identifier token. NO answers, titles, or scores are embedded.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="font-bold text-purple-400 flex items-center space-x-1.5">
              <Lock className="w-4 h-4" />
              <span>3. SEALED PACKETS & LOCKS</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Physical mission packets remain sealed until clearance is GRANTED. Future missions remain locked with zero clue leakage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
