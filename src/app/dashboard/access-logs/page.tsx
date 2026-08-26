'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Lock, RefreshCw } from 'lucide-react';

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs/access?limit=100');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">PHYSICAL & DIGITAL ACCESS TELEMETRY</div>
          <h1 className="text-2xl font-black text-white font-sans">Access Control & Packet Clearance Feed</h1>
        </div>
        <a
          href="/api/export/access-logs?eventCode=EM"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700"
        >
          Export CSV Log →
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        {loading ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">Loading access logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Team Code</th>
                  <th className="pb-2">Team Name</th>
                  <th className="pb-2">Mission</th>
                  <th className="pb-2">QR Status</th>
                  <th className="pb-2">Clearance</th>
                  <th className="pb-2">Packet Sealed/Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 text-slate-200">
                    <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 font-bold text-blue-400">{log.teamCode}</td>
                    <td className="py-3 font-bold text-white">{log.teamName}</td>
                    <td className="py-3 text-slate-300">{log.missionCode}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                        {log.qrStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      {log.clearanceStatus === 'GRANTED' && (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                          GRANTED
                        </span>
                      )}
                      {log.clearanceStatus === 'LOCKED' && (
                        <span className="px-2.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 text-[10px]">
                          LOCKED
                        </span>
                      )}
                      {log.clearanceStatus === 'DENIED' && (
                        <span className="px-2.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 text-[10px]">
                          DENIED
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {log.packetOpened ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                          ✓ OPENED ({new Date(log.packetOpenedAt).toLocaleTimeString()})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-850 text-[10px]">
                          SEALED
                        </span>
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
