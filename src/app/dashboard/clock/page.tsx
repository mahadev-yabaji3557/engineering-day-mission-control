'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Play, Pause, AlertTriangle, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';

export default function MasterClockPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [clockData, setClockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchClock = async () => {
    try {
      const res = await fetch(`/api/clock?eventCode=${eventCode}`);
      const data = await res.json();
      setClockData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClock();
    const interval = setInterval(fetchClock, 3000);
    return () => clearInterval(interval);
  }, [eventCode]);

  const handleAction = async (action: string, notice?: string) => {
    await fetch('/api/clock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventCode, action, emergencyNotice: notice }),
    });
    fetchClock();
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono text-slate-400">Loading Master Clock...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">EVENT TIMING CONTROL</div>
          <h1 className="text-2xl font-black text-white font-sans">Master Clock & Round Scheduler</h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 font-mono text-xs">
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

      {/* Clock Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SERVER TIMESTAMP</span>
            <div className="text-3xl font-black font-mono text-white">
              {new Date(clockData?.effectiveServerTime).toLocaleTimeString()}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction('START')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl flex items-center space-x-1.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START / RESUME</span>
            </button>
            <button
              onClick={() => handleAction('PAUSE')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-xl flex items-center space-x-1.5"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>PAUSE</span>
            </button>
          </div>
        </div>

        {/* Round Schedule Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Configured Round Schedule</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="pb-2">Round #</th>
                  <th className="pb-2">Mission Code</th>
                  <th className="pb-2">Mission Title</th>
                  <th className="pb-2">Start Time</th>
                  <th className="pb-2">End Time</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {clockData?.rounds?.map((r: any) => {
                  const now = new Date(clockData.effectiveServerTime);
                  const start = new Date(r.startTime);
                  const end = new Date(r.endTime);
                  let roundStatus = 'SCHEDULED';
                  if (now >= start && now <= end) roundStatus = 'ACTIVE';
                  if (now > end) roundStatus = 'COMPLETED';

                  return (
                    <tr key={r.id} className="hover:bg-slate-850/50 text-slate-200">
                      <td className="py-3 font-bold text-blue-400">Round 0{r.roundNumber}</td>
                      <td className="py-3 font-bold text-white">{r.missionCode}</td>
                      <td className="py-3 text-slate-300">{r.missionTitle}</td>
                      <td className="py-3">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-3">{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-3">{r.durationMinutes} mins</td>
                      <td className="py-3">
                        {roundStatus === 'ACTIVE' && (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                            ACTIVE NOW
                          </span>
                        )}
                        {roundStatus === 'SCHEDULED' && (
                          <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 text-[10px]">
                            LOCKED UNTIL RELEASE
                          </span>
                        )}
                        {roundStatus === 'COMPLETED' && (
                          <span className="px-2.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400 text-[10px]">
                            COMPLETED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
