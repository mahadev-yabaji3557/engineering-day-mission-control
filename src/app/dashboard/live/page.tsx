'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Play,
  Pause,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  FileText,
  Award,
  Download,
  Zap,
  RefreshCw,
} from 'lucide-react';

export default function LiveMissionControlPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [clockData, setClockData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLiveTelemetry = async () => {
    try {
      const [clockRes, lbRes, logsRes] = await Promise.all([
        fetch(`/api/clock?eventCode=${eventCode}`),
        fetch(`/api/leaderboard?eventCode=${eventCode}&mode=live`),
        fetch(`/api/logs/access?limit=5`),
      ]);

      const cData = await clockRes.json();
      const lData = await lbRes.json();
      const logData = await logsRes.json();

      setClockData(cData);
      if (lData.leaderboard) setLeaderboard(lData.leaderboard);
      if (logData.logs) setAccessLogs(logData.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 3000);
    return () => clearInterval(interval);
  }, [eventCode]);

  const handleClockAction = async (action: string, notice?: string) => {
    if (action === 'EMERGENCY_HOLD' && !confirm('WARNING: Initiate EMERGENCY HOLD across the entire arena?')) {
      return;
    }

    setActionLoading(true);
    try {
      await fetch('/api/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventCode,
          action,
          emergencyNotice: notice,
        }),
      });
      await fetchLiveTelemetry();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
        CONNECTING TO LIVE MISSION CONTROL TELEMETRY...
      </div>
    );
  }

  const activeRound = clockData?.rounds?.find((r: any) => r.status === 'ACTIVE' || (new Date(r.startTime) <= new Date(clockData.effectiveServerTime) && new Date(r.endTime) >= new Date(clockData.effectiveServerTime)));

  return (
    <div className="space-y-6">
      {/* Top Bar: Event Selector & Live Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">LIVE EVENT CONTROL</div>
          <h1 className="text-2xl font-black text-white font-sans">{clockData?.event?.title}</h1>
        </div>

        {/* Event Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setEventCode('EM')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              eventCode === 'EM' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ENGINEER'S MIND (EM)
          </button>
          <button
            onClick={() => setEventCode('UC')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              eventCode === 'UC' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            UNDERCOVER (UC)
          </button>
        </div>
      </div>

      {/* Master Event Clock Controls */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-950 border border-blue-800 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">MASTER EVENT CLOCK</span>
              <div className="text-xl font-black font-mono text-white">
                {new Date(clockData?.effectiveServerTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Master Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {clockData?.status !== 'ACTIVE' ? (
              <button
                onClick={() => handleClockAction('START')}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START / RESUME EVENT</span>
              </button>
            ) : (
              <button
                onClick={() => handleClockAction('PAUSE')}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>PAUSE EVENT</span>
              </button>
            )}

            <button
              onClick={() => handleClockAction('EMERGENCY_HOLD', 'ARENA EMERGENCY HOLD IN EFFECT')}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY HOLD</span>
            </button>
          </div>
        </div>

        {/* Current Active Round Info */}
        {activeRound ? (
          <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">CURRENT ACTIVE ROUND</span>
              <div className="text-base font-bold text-white font-mono">
                {activeRound.missionCode}: {activeRound.missionTitle}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Window: {new Date(activeRound.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(activeRound.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({activeRound.durationMinutes} mins)
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold rounded-lg animate-pulse">
              ROUND ACTIVE
            </span>
          </div>
        ) : (
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs font-mono text-slate-400 text-center">
            No active round window at current server timestamp.
          </div>
        )}
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>TOTAL TEAMS</span>
          </div>
          <div className="text-3xl font-black font-mono text-white">{leaderboard.length}</div>
          <div className="text-[10px] font-mono text-emerald-400">100% ACTIVE REGISTERED</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>COMPLETED MISSIONS</span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {leaderboard.reduce((acc, t) => acc + t.completedMissions, 0)}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Across all teams</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <span>AVERAGE SCORE</span>
          </div>
          <div className="text-3xl font-black font-mono text-yellow-400">
            {leaderboard.length > 0
              ? (leaderboard.reduce((acc, t) => acc + t.totalScore, 0) / leaderboard.length).toFixed(1)
              : 0}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Out of max total</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center space-x-1">
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>DATA EXPORTS</span>
          </div>
          <div className="pt-1 flex flex-col space-y-1">
            <a
              href={`/api/export/final-results?eventCode=${eventCode}`}
              className="text-[11px] font-mono font-bold text-blue-400 hover:underline"
            >
              Export Results CSV →
            </a>
            <a
              href={`/api/export/submissions?eventCode=${eventCode}`}
              className="text-[11px] font-mono font-bold text-indigo-400 hover:underline"
            >
              Export Submissions CSV →
            </a>
          </div>
        </div>
      </div>

      {/* Live Leaderboard Standings Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>LIVE LEADERBOARD STANDINGS</span>
          </h2>
          <Link href="/dashboard/leaderboard" className="text-xs font-mono text-blue-400 hover:underline">
            View Full Leaderboard & Tie-Breaker Details →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="pb-2">Rank</th>
                <th className="pb-2">Team</th>
                <th className="pb-2">Total Score</th>
                <th className="pb-2">Completed</th>
                <th className="pb-2">Final Round Score</th>
                <th className="pb-2">Reasoning Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {leaderboard.slice(0, 5).map((entry) => (
                <tr key={entry.teamId} className="hover:bg-slate-850/50 text-slate-200">
                  <td className="py-2.5 font-bold text-blue-400">#{entry.rank}</td>
                  <td className="py-2.5">
                    <span className="font-bold text-white mr-2">{entry.teamCode}</span>
                    <span className="text-slate-400 text-[11px]">{entry.teamName}</span>
                  </td>
                  <td className="py-2.5 font-bold text-emerald-400 text-sm">{entry.totalScore} pts</td>
                  <td className="py-2.5">{entry.completedMissions} missions</td>
                  <td className="py-2.5 text-slate-300">{entry.finalRoundScore} pts</td>
                  <td className="py-2.5 text-slate-300">{entry.reasoningScore} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
