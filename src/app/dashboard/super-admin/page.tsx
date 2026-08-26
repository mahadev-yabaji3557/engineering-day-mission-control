'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Users, Activity, History, Server, CheckCircle2, Lock, Download } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/logs/audit?limit=10')
      .then((r) => r.json())
      .then((d) => { if (d.logs) setAuditLogs(d.logs); });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-purple-950/40 border-2 border-purple-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-900 rounded-2xl">
            <Shield className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest px-2.5 py-0.5 rounded bg-purple-900 border border-purple-800">
              ROLE: SUPER ADMIN (FULL PRIVILEGES)
            </span>
            <h1 className="text-2xl font-black text-white font-sans mt-1">Super Admin Control Center</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
            SYSTEM HEALTH: OPTIMAL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/teams" className="p-5 bg-slate-900 border border-slate-800 hover:border-purple-600 rounded-2xl space-y-2 transition-all group">
          <div className="flex items-center justify-between text-purple-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold group-hover:text-white">MANAGE →</span>
          </div>
          <h3 className="font-bold text-white">Team & Pass Registry</h3>
          <p className="text-xs text-slate-400">Manage 50 teams, issue QRs, revoke/reissue tokens.</p>
        </Link>

        <Link href="/dashboard/audit-logs" className="p-5 bg-slate-900 border border-slate-800 hover:border-purple-600 rounded-2xl space-y-2 transition-all group">
          <div className="flex items-center justify-between text-purple-400">
            <History className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold group-hover:text-white">MANAGE →</span>
          </div>
          <h3 className="font-bold text-white">Immutable Audit Trail</h3>
          <p className="text-xs text-slate-400">Inspect full system security and clock modification logs.</p>
        </Link>

        <Link href="/dashboard/live" className="p-5 bg-slate-900 border border-slate-800 hover:border-purple-600 rounded-2xl space-y-2 transition-all group">
          <div className="flex items-center justify-between text-purple-400">
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold group-hover:text-white">MANAGE →</span>
          </div>
          <h3 className="font-bold text-white">Live Event Telemetry</h3>
          <p className="text-xs text-slate-400">Master clock controls and arena hold overrides.</p>
        </Link>
      </div>

      {/* Audit Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
          <History className="w-4 h-4 text-purple-400" />
          <span>Recent Audit Log Feed</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="pb-2">Time</th>
                <th className="pb-2">Actor</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Target</th>
                <th className="pb-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {auditLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-850/50 text-slate-200">
                  <td className="py-2.5 text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 text-purple-400 font-bold">{l.actorRole}</td>
                  <td className="py-2.5 font-bold text-white">{l.action}</td>
                  <td className="py-2.5 text-blue-300">{l.target}</td>
                  <td className="py-2.5 text-slate-400 truncate max-w-xs">{l.newValue || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
