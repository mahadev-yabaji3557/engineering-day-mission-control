'use client';

import React, { useEffect, useState } from 'react';
import { History, Shield, RefreshCw } from 'lucide-react';

export default function SystemAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/logs/audit?limit=100');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(fetchAuditLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">IMMUTABLE SYSTEM LOG</div>
          <h1 className="text-2xl font-black text-white font-sans">Master System Audit Trail</h1>
        </div>
        <a
          href="/api/export/audit-report?eventCode=EM"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700"
        >
          Export CSV Audit →
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        {loading ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">Loading audit trail...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Actor Role</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Details / New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 text-slate-200">
                    <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 font-bold text-purple-400">{log.actorRole}</td>
                    <td className="py-3 font-bold text-white">{log.action}</td>
                    <td className="py-3 text-blue-300">{log.target}</td>
                    <td className="py-3 text-slate-300 truncate max-w-xs">{log.newValue || log.oldValue || '—'}</td>
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
