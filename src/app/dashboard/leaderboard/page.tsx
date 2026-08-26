'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Award, Clock, HelpCircle, Download, CheckCircle2, Shield, Flame } from 'lucide-react';

export default function LeaderboardDashboardPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [mode, setMode] = useState('live'); // 'live' | 'final'
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?eventCode=${eventCode}&mode=${mode}`);
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, [eventCode, mode]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-yellow-400 font-bold uppercase">COMPETITION RANKING ENGINE</div>
          <h1 className="text-2xl font-black text-white font-sans">Official Leaderboard & Tie-Breaker Standings</h1>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setMode('live')}
              className={`px-3 py-1.5 rounded-xl font-bold ${mode === 'live' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              LIVE UNFINALIZED
            </button>
            <button
              onClick={() => setMode('final')}
              className={`px-3 py-1.5 rounded-xl font-bold ${mode === 'final' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              OFFICIAL FINAL MODE
            </button>
          </div>

          {/* Event Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setEventCode('EM')}
              className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'EM' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              EM
            </button>
            <button
              onClick={() => setEventCode('UC')}
              className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'UC' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              UC
            </button>
          </div>
        </div>
      </div>

      {/* Tie Breaker Rules Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono space-y-2 text-slate-300">
        <div className="font-bold text-yellow-400 flex items-center space-x-1.5">
          <Award className="w-4 h-4" />
          <span>CONFIGURED TIE-BREAKER RESOLUTION PRIORITY</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
            <strong className="text-white block">Priority 1</strong>
            Higher Final-Round Score
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
            <strong className="text-white block">Priority 2</strong>
            Higher Technical Reasoning Score
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
            <strong className="text-white block">Priority 3</strong>
            Earlier Valid Submission Timestamp
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
            <strong className="text-white block">Priority 4</strong>
            Event Head Arbitrated Decision
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Rankings ({leaderboard.length} Teams)</span>
          </h2>
          <a
            href={`/api/export/final-results?eventCode=${eventCode}`}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl border border-slate-700 flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Official CSV Standings</span>
          </a>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">Computing live standings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Team Code</th>
                  <th className="pb-2">Team Name</th>
                  <th className="pb-2">Total Score</th>
                  <th className="pb-2">Missions Completed</th>
                  <th className="pb-2">Final Round Score</th>
                  <th className="pb-2">Reasoning Rubric</th>
                  <th className="pb-2">Tie-Breaker Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {leaderboard.map((t) => (
                  <tr
                    key={t.teamId}
                    className={`hover:bg-slate-850/50 ${
                      t.rank === 1
                        ? 'bg-yellow-950/20 text-yellow-200 font-bold'
                        : t.rank === 2
                        ? 'bg-slate-800/40 text-slate-100 font-bold'
                        : t.rank === 3
                        ? 'bg-amber-950/20 text-amber-200 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    <td className="py-3 font-bold text-sm">
                      {t.rank === 1 ? '🥇 #1' : t.rank === 2 ? '🥈 #2' : t.rank === 3 ? '🥉 #3' : `#${t.rank}`}
                    </td>
                    <td className="py-3 font-bold text-blue-400">{t.teamCode}</td>
                    <td className="py-3 font-bold text-white">{t.teamName}</td>
                    <td className="py-3 font-bold text-emerald-400 text-sm">{t.totalScore} pts</td>
                    <td className="py-3">{t.completedMissions} missions</td>
                    <td className="py-3">{t.finalRoundScore} pts</td>
                    <td className="py-3">{t.reasoningScore} pts</td>
                    <td className="py-3">
                      {t.tieBreakerApplied ? (
                        <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px]" title={t.tieBreakerReason}>
                          ⚡ TIE-BROKEN
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
