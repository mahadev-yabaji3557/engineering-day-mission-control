'use client';

import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Clock, RefreshCw, Search } from 'lucide-react';

export default function SubmissionsManagerPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState('');

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/submissions?eventCode=${eventCode}`);
      const data = await res.json();
      if (data.submissions) setSubmissions(data.submissions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [eventCode]);

  const filteredSubs = submissions.filter((s) =>
    filterTeam ? s.team.teamCode.toLowerCase().includes(filterTeam.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">DIGITAL ANSWER AUDIT</div>
          <h1 className="text-2xl font-black text-white font-sans">Online Answer Submissions Manager</h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setEventCode('EM')}
            className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'EM' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            EM SUBMISSIONS
          </button>
          <button
            onClick={() => setEventCode('UC')}
            className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'UC' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            UC SUBMISSIONS
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter by Team Code (e.g. EM-07)"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs font-mono outline-none"
          />
        </div>
        <a
          href={`/api/export/submissions?eventCode=${eventCode}`}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700"
        >
          Export CSV →
        </a>
      </div>

      {/* Submissions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        {loading ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">Loading online submissions...</div>
        ) : filteredSubs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            No answer submissions recorded for this selection yet.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubs.map((sub) => (
              <div key={sub.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-blue-400">{sub.team.teamCode}</span>
                    <span className="text-xs font-bold text-white">{sub.team.teamName}</span>
                    <span className="text-xs font-mono text-slate-400">• Mission {sub.mission.missionCode}</span>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    {sub.isLate && (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                        LATE SUBMISSION
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {sub.status}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Answers key-value list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  {sub.answers?.map((ans: any) => (
                    <div key={ans.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{ans.fieldKey}</div>
                      <div className="text-slate-200 font-light whitespace-pre-wrap">{ans.answerValue}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
