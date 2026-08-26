'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, QrCode, Ban, RefreshCw, Plus, Upload, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TeamsManagerPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newTeamCode, setNewTeamCode] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const fetchTeams = async () => {
    try {
      const res = await fetch(`/api/teams?eventCode=${eventCode}`);
      const data = await res.json();
      if (data.teams) setTeams(data.teams);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [eventCode]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamCode || !newTeamName) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          eventCode,
          teamCode: newTeamCode,
          teamName: newTeamName,
        }),
      });
      if (res.ok) {
        setNewTeamCode('');
        setNewTeamName('');
        await fetchTeams();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokePass = async (teamId: string) => {
    if (!confirm('Are you sure you want to REVOKE this team QR pass? The pass will immediately be deactivated.')) return;
    await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REVOKE', eventCode, teamId }),
    });
    fetchTeams();
  };

  const handleReissuePass = async (teamId: string) => {
    if (!confirm('Reissue fresh QR token for this team? Old QR token will be deactivated.')) return;
    await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REISSUE', eventCode, teamId }),
    });
    fetchTeams();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">TEAM & QR PASS REGISTRY</div>
          <h1 className="text-2xl font-black text-white font-sans">Team Management & Access Control</h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setEventCode('EM')}
            className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'EM' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            EM TEAMS ({teams.length})
          </button>
          <button
            onClick={() => setEventCode('UC')}
            className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'UC' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            UC TEAMS
          </button>
        </div>
      </div>

      {/* Add New Team Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-blue-400" />
          <span>Add New Team Pass</span>
        </h2>

        <form onSubmit={handleCreateTeam} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Team Code (e.g. EM-26)"
            value={newTeamCode}
            onChange={(e) => setNewTeamCode(e.target.value)}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-xl text-xs font-mono outline-none"
            required
          />
          <input
            type="text"
            placeholder="Team Name (e.g. Quantum Engineers)"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-xl text-xs font-mono outline-none"
            required
          />
          <button
            type="submit"
            disabled={actionLoading}
            className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs font-mono uppercase transition-all shadow-md"
          >
            {actionLoading ? 'Creating...' : '+ Issue Team Pass'}
          </button>
        </form>
      </div>

      {/* Team Pass Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Registered Teams ({teams.length})</span>
          </h2>
          <Link href="/dashboard/passes" className="text-xs font-mono text-blue-400 hover:underline">
            Printable Pass Sheets →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">Loading teams...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Team Name</th>
                  <th className="pb-2">QR Token (Secure)</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/50 text-slate-200">
                    <td className="py-3 font-bold text-blue-400">{t.teamCode}</td>
                    <td className="py-3 font-bold text-white">{t.teamName}</td>
                    <td className="py-3 text-slate-400 truncate max-w-[150px]">{t.qrToken}</td>
                    <td className="py-3">
                      {t.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px]">
                          REVOKED
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <Link
                        href={`/scan/${t.qrToken}`}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px]"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleReissuePass(t.id)}
                        className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded-lg text-[10px]"
                      >
                        Reissue QR
                      </button>
                      <button
                        onClick={() => handleRevokePass(t.id)}
                        className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-[10px]"
                      >
                        Revoke Pass
                      </button>
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
