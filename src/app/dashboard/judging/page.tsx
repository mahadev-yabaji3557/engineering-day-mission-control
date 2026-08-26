'use client';

import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Lock, Save, Send, AlertCircle, RefreshCw, FileText } from 'lucide-react';

export default function JudgingDashboardPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);

  const fetchJudgingData = async () => {
    try {
      const res = await fetch(`/api/judging?eventCode=${eventCode}`);
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
        if (data.submissions.length > 0 && !selectedSub) {
          selectSubmission(data.submissions[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudgingData();
  }, [eventCode]);

  const selectSubmission = (sub: any) => {
    setSelectedSub(sub);
    setMsg(null);
    if (sub.score) {
      setComments(sub.score.comments || '');
      const initial: Record<string, number> = {};
      sub.score.items?.forEach((item: any) => {
        initial[item.rubricId] = item.marksGiven;
      });
      setRubricScores(initial);
    } else {
      setComments('');
      setRubricScores({});
    }
  };

  const handleScoreChange = (rubricId: string, value: number) => {
    setRubricScores((prev) => ({ ...prev, [rubricId]: value }));
  };

  const calculateTotal = () => {
    if (!selectedSub?.rubrics) return 0;
    return selectedSub.rubrics.reduce((acc: number, r: any) => acc + (Number(rubricScores[r.id]) || 0), 0);
  };

  const handleSaveScore = async (isFinalized: boolean) => {
    if (!selectedSub) return;
    if (isFinalized && !confirm('Are you sure you want to FINALIZE this score? Finalized scores cannot be changed by normal judges.')) {
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch('/api/judging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedSub.teamId,
          missionId: selectedSub.missionId,
          rubricScores,
          comments,
          isFinalized,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: 'success', text: isFinalized ? 'Score finalized and locked successfully!' : 'Draft score saved successfully.' });
        await fetchJudgingData();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to save score.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error saving score.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono text-slate-400">Loading Judging Portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">EVALUATION & MARKING PORTAL</div>
          <h1 className="text-2xl font-black text-white font-sans">Rubric Judging Dashboard</h1>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => { setEventCode('EM'); setSelectedSub(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'EM' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            EM JUDGING
          </button>
          <button
            onClick={() => { setEventCode('UC'); setSelectedSub(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'UC' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            UC JUDGING
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            Submissions Queue ({submissions.length})
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-mono text-xs">No pending submissions for evaluation.</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const isFinalized = sub.score?.status === 'FINALIZED';

                return (
                  <div
                    key={sub.id}
                    onClick={() => selectSubmission(sub)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all space-y-1 ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-600 text-white shadow-md'
                        : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-400">{sub.teamCode}</span>
                      {isFinalized ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-bold">
                          SCORE FINALIZED
                        </span>
                      ) : sub.score ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 text-[10px] font-mono font-bold">
                          DRAFT SCORE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-mono">
                          UNMARKED
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{sub.teamName}</div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span>Mission {sub.missionCode}</span>
                      <span>{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Judging Evaluation Sheet */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          {selectedSub ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold text-blue-400 uppercase">EVALUATING SUBMISSION</div>
                  <h2 className="text-xl font-black text-white font-mono">
                    {selectedSub.teamCode} — {selectedSub.teamName}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Mission: {selectedSub.missionCode} ({selectedSub.missionTitle})
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center min-w-[130px]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">TOTAL SCORE</div>
                  <div className="text-3xl font-black font-mono text-emerald-400">{calculateTotal()} / 20</div>
                </div>
              </div>

              {msg && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-mono border ${
                    msg.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-red-950 border-red-800 text-red-300'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* Display Team Answer Submission */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                <div className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>TEAM ANSWER SUBMISSION DATA</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {selectedSub.answers?.map((ans: any) => (
                    <div key={ans.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-blue-400 font-bold uppercase block mb-1">{ans.fieldKey}</span>
                      <span className="text-slate-200 font-light">{ans.answerValue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Rubric Marking Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span>Configured Rubric Assessment Criteria</span>
                </h3>

                <div className="space-y-3">
                  {selectedSub.rubrics?.map((rubric: any) => (
                    <div key={rubric.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-xs">{rubric.criteria}</div>
                        <div className="text-[10px] font-mono text-slate-400">Maximum Marks: {rubric.maxMarks}</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          max={rubric.maxMarks}
                          step={0.5}
                          value={rubricScores[rubric.id] ?? ''}
                          onChange={(e) => handleScoreChange(rubric.id, parseFloat(e.target.value) || 0)}
                          disabled={selectedSub.score?.status === 'FINALIZED'}
                          className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-sm font-bold rounded-xl text-center outline-none disabled:opacity-60"
                        />
                        <span className="text-xs font-mono text-slate-400">/ {rubric.maxMarks}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Judge Comments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold">Judge Evaluator Comments</label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    disabled={selectedSub.score?.status === 'FINALIZED'}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl text-xs outline-none disabled:opacity-60"
                    placeholder="Enter constructive technical comments and observations for audit record..."
                  />
                </div>

                {/* Action Buttons */}
                {selectedSub.score?.status !== 'FINALIZED' ? (
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveScore(false)}
                      disabled={submitting}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>SAVE DRAFT SCORE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveScore(true)}
                      disabled={submitting}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-black uppercase rounded-xl shadow-lg flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>FINALIZE & LOCK SCORE</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-center space-y-1">
                    <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
                      <Lock className="w-4 h-4" />
                      <span>SCORE IS FINALIZED & LOCKED</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Finalized at {new Date(selectedSub.score.finalizedAt).toLocaleTimeString()} • Requires Event Head override to modify.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              Select a team submission from the queue to start rubric evaluation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
