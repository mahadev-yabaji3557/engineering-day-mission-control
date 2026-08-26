'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Clock, Play, Pause, RefreshCw, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

export default function TestModeTimeWarpPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [clockData, setClockData] = useState<any>(null);
  const [warpOffsetMinutes, setWarpOffsetMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchClock = async () => {
    try {
      const res = await fetch(`/api/clock?eventCode=${eventCode}`);
      const data = await res.json();
      setClockData(data);
      if (data.simulatedOffsetSeconds) {
        setWarpOffsetMinutes(Math.round(data.simulatedOffsetSeconds / 60));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClock();
  }, [eventCode]);

  const handleApplyWarp = async (minutesToAdd: number) => {
    const totalOffsetSeconds = minutesToAdd * 60;
    await fetch('/api/clock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventCode,
        action: 'WARP_TIME',
        timeOffsetSeconds: totalOffsetSeconds,
      }),
    });
    fetchClock();
  };

  const handleResetWarp = async () => {
    await handleApplyWarp(0);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono text-slate-400">Loading Test Mode...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border-2 border-purple-700 rounded-3xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-900 rounded-2xl">
            <Zap className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest px-2.5 py-0.5 rounded bg-purple-900 border border-purple-800">
              SIMULATION ENGINE
            </span>
            <h1 className="text-2xl font-black text-white font-sans mt-1">Test Event Mode & Time Warp Controller</h1>
          </div>
        </div>

        <p className="text-xs text-purple-200 font-mono leading-relaxed">
          Simulate full event progression (10:00 AM → 10:15 AM → 10:35 AM → 10:55 AM) instantly without real waiting. Test server clearance locking, active window unlock, submission timestamps, late locks, and judge scoring aggregation.
        </p>
      </div>

      {/* Time Warp Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">CURRENT EFFECTIVE SERVER TIME</span>
            <div className="text-3xl font-black font-mono text-purple-400">
              {new Date(clockData?.effectiveServerTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs font-mono text-slate-400">
              Simulated Time Warp Offset: <strong className="text-white font-bold">+{warpOffsetMinutes} Minutes</strong>
            </div>
          </div>

          <button
            onClick={handleResetWarp}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-xl border border-slate-700"
          >
            Reset Time Warp to Real Time (0m)
          </button>
        </div>

        {/* Warp Shortcut Buttons */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-slate-300 uppercase">Step Through Event Timeline</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <button
              onClick={() => handleApplyWarp(0)}
              className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1"
            >
              <div className="font-bold text-slate-300">Phase 0: Pre-Start</div>
              <div className="text-[10px] text-slate-500">10:00 AM (0m offset)</div>
            </button>

            <button
              onClick={() => handleApplyWarp(0)}
              className="p-3 bg-slate-950 hover:bg-blue-950 border border-slate-800 hover:border-blue-700 rounded-xl text-left space-y-1"
            >
              <div className="font-bold text-blue-400">Phase 1: Mission 01</div>
              <div className="text-[10px] text-slate-500">10:15 AM (Round 1 Active)</div>
            </button>

            <button
              onClick={() => handleApplyWarp(20)}
              className="p-3 bg-slate-950 hover:bg-blue-950 border border-slate-800 hover:border-blue-700 rounded-xl text-left space-y-1"
            >
              <div className="font-bold text-blue-400">Phase 2: Mission 02</div>
              <div className="text-[10px] text-slate-500">+20m Offset (Round 2 Active)</div>
            </button>

            <button
              onClick={() => handleApplyWarp(40)}
              className="p-3 bg-slate-950 hover:bg-blue-950 border border-slate-800 hover:border-blue-700 rounded-xl text-left space-y-1"
            >
              <div className="font-bold text-blue-400">Phase 3: Mission 03</div>
              <div className="text-[10px] text-slate-500">+40m Offset (Round 3 Active)</div>
            </button>

            <button
              onClick={() => handleApplyWarp(60)}
              className="p-3 bg-slate-950 hover:bg-blue-950 border border-slate-800 hover:border-blue-700 rounded-xl text-left space-y-1"
            >
              <div className="font-bold text-blue-400">Phase 4: Mission 04</div>
              <div className="text-[10px] text-slate-500">+60m Offset (Round 4 Active)</div>
            </button>

            <button
              onClick={() => handleApplyWarp(80)}
              className="p-3 bg-slate-950 hover:bg-purple-950 border border-slate-800 hover:border-purple-700 rounded-xl text-left space-y-1"
            >
              <div className="font-bold text-purple-400">Phase 5: Grand Final</div>
              <div className="text-[10px] text-slate-500">+80m Offset (Final Active)</div>
            </button>
          </div>
        </div>

        {/* Test Verification Quick Links */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
            Verify Simulation Results Across Roles
          </span>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            <Link
              href="/scan/tok_em01_7f8a9b2c3d4e"
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800 rounded-lg flex items-center space-x-1"
            >
              <span>Test EM-01 Participant Pass</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/dashboard/judging"
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-yellow-400 border border-slate-800 rounded-lg flex items-center space-x-1"
            >
              <span>Test Judge Scoring</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/dashboard/leaderboard"
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg flex items-center space-x-1"
            >
              <span>Test Leaderboard & Tie-Breaker</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
