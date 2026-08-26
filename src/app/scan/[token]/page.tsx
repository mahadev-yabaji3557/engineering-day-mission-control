'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield,
  Clock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileText,
  HelpCircle,
  Sparkles,
  Users,
  ChevronRight,
  Info,
  RefreshCw,
  Ban,
} from 'lucide-react';

export default function ParticipantClearancePage() {
  const params = useParams();
  const token = params.token as string;

  const [clearance, setClearance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<any>(null);

  const fetchClearance = async () => {
    try {
      const res = await fetch(`/api/clearance/${token}`);
      const data = await res.json();
      if (res.ok) {
        setClearance(data);
        if (data.existingSubmission?.answers) {
          setAnswers(data.existingSubmission.answers);
        }
      } else {
        setError(data.error || 'Clearance check failed');
      }
    } catch {
      setError('Connection error evaluating server clearance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearance();
    const interval = setInterval(fetchClearance, 3000); // Live countdown refresh from server
    return () => clearInterval(interval);
  }, [token]);

  const handleInputChange = (fieldKey: string, value: string) => {
    if (clearance?.existingSubmission?.status === 'LOCKED' || clearance?.existingSubmission?.status === 'LATE') {
      return; // Locked
    }
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSubmitFinalAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clearance?.missionId) return;

    if (!confirm('Are you sure you want to SUBMIT YOUR FINAL ANSWER? Once submitted, your response will be locked.')) {
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: token,
          missionId: clearance.missionId,
          answers,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitMessage({ type: 'success', text: data.message, timestamp: data.submittedAt });
        await fetchClearance();
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Submission failed' });
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Network error submitting answer.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3 font-mono">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">EVALUATING SERVER CLEARANCE PROTOCOL...</p>
        </div>
      </div>
    );
  }

  if (error || clearance?.clearanceStatus === 'DENIED') {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="p-6 bg-red-950/80 border-2 border-red-800 rounded-3xl text-center space-y-4 shadow-2xl">
          <Ban className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">INVALID TEAM ACCESS</h2>
          <p className="text-xs text-red-300 font-mono">
            {clearance?.message || error || 'This QR pass token is invalid or has been revoked by Event Head.'}
          </p>
          <div className="pt-2 text-[10px] text-slate-400 font-mono">INCIDENT LOGGED TO ACCESS CONTROL ENGINE</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header: Team & Event Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-widest">
            {clearance.eventTitle || 'ENGINEERING DAY'}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-black text-white tracking-wider font-mono">{clearance.teamCode}</span>
            <span className="text-slate-400 text-sm font-medium">• {clearance.teamName}</span>
          </div>
          {clearance.members && clearance.members.length > 0 && (
            <div className="text-xs text-slate-500 font-mono mt-1">
              Members: {clearance.members.join(', ')}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            SERVER SYNC OK
          </span>
        </div>
      </div>

      {/* Dynamic Status Display Box */}

      {/* STATUS 1: LOCKED */}
      {clearance.clearanceStatus === 'LOCKED' && (
        <div className="bg-slate-900 border-2 border-amber-900/60 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-950/80 rounded-2xl border border-amber-800/80 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-extrabold text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-950/60 rounded-full border border-amber-800/60">
              STATUS: MISSION LOCKED
            </span>
            <h2 className="text-2xl font-black text-white pt-2 font-mono">{clearance.missionCode}</h2>
            <p className="text-sm font-mono text-slate-300">{clearance.message}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 max-w-sm mx-auto text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-amber-300 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>SECURITY PROTOCOL ENFORCED</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Future mission titles, instructions, clues, and answers remain cryptographically sealed until official server release time ({clearance.unlockTime}).
            </p>
          </div>
        </div>
      )}

      {/* STATUS 2: PAUSED */}
      {clearance.clearanceStatus === 'PAUSED' && (
        <div className="bg-slate-900 border-2 border-amber-600 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-amber-950 rounded-2xl border border-amber-700 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-950 rounded-full border border-amber-800">
              EVENT TEMPORARILY PAUSED
            </span>
            <p className="text-sm text-slate-300 font-mono">{clearance.message}</p>
            {clearance.emergencyNotice && (
              <p className="text-xs text-red-400 font-mono font-bold pt-2">{clearance.emergencyNotice}</p>
            )}
          </div>
        </div>
      )}

      {/* STATUS 3: CLEARANCE GRANTED (ACTIVE) */}
      {clearance.clearanceStatus === 'GRANTED' && (
        <div className="space-y-6">
          {/* Active Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-950 border border-emerald-700 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    CLEARANCE GRANTED
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    ACTIVE MISSION: <span className="font-mono text-blue-400">{clearance.missionCode}</span>
                  </h2>
                  <p className="text-xs text-slate-300">{clearance.missionTitle}</p>
                </div>
              </div>

              {/* Timer */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center min-w-[140px]">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">TIME REMAINING</div>
                <div className="text-3xl font-black font-mono text-blue-400 tracking-wider">
                  {formatCountdown(clearance.timeRemainingSeconds || 0)}
                </div>
              </div>
            </div>

            {/* Physical Packet Prompt */}
            <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-2xl flex items-start space-x-3 text-xs text-blue-200">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold text-white block">ACTION REQUIRED:</strong>
                <p>
                  Proceed to your physical sealed mission packet for <strong className="text-white">{clearance.missionCode}</strong>. Solve the problem set and submit your structured answers below before time expires.
                </p>
                {clearance.packetOpened ? (
                  <span className="inline-flex items-center text-[10px] font-mono text-emerald-400 font-bold pt-1">
                    ✓ Physical packet verified opened by Mission Marshal
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-mono text-amber-400 font-bold pt-1">
                    ! Present pass to Mission Marshal to verify packet unsealing
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submission Status Alert */}
          {submitMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-mono border ${
                submitMessage.type === 'success'
                  ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                  : 'bg-red-950 border-red-800 text-red-300'
              }`}
            >
              <div className="font-bold">{submitMessage.text}</div>
              {submitMessage.timestamp && <div>Server Receipt: {new Date(submitMessage.timestamp).toLocaleTimeString()}</div>}
            </div>
          )}

          {/* Online Submission Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>ONLINE ANSWER SUBMISSION FORM</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Complete all structured fields. Click "SUBMIT FINAL ANSWER" when finished.
                </p>
              </div>
              {clearance.submissionStatus === 'LOCKED' || clearance.submissionStatus === 'SUBMITTED' ? (
                <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold rounded-lg flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SUBMISSION LOCKED</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-blue-950 border border-blue-800 text-blue-400 text-xs font-mono font-bold rounded-lg">
                  READY FOR SUBMISSION
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitFinalAnswer} className="space-y-6">
              {clearance.fields && clearance.fields.length > 0 ? (
                clearance.fields.map((field: any, idx: number) => (
                  <div key={field.id} className="space-y-2 p-4 bg-slate-950 rounded-2xl border border-slate-850">
                    <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                      <span>
                        <span className="font-mono text-blue-400 mr-2">FIELD 0{idx + 1}.</span>
                        {field.label}
                      </span>
                      {field.required && <span className="text-[10px] font-mono text-red-400 font-bold">*REQUIRED</span>}
                    </label>

                    {/* SHORT_TEXT */}
                    {field.fieldType === 'SHORT_TEXT' && (
                      <input
                        type="text"
                        value={answers[field.fieldKey] || ''}
                        onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                        disabled={clearance.submissionStatus === 'LOCKED' || clearance.submissionStatus === 'SUBMITTED'}
                        required={field.required}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-xl text-xs outline-none transition-colors disabled:opacity-60"
                        placeholder="Enter concise summary answer..."
                      />
                    )}

                    {/* LONG_TEXT or JUSTIFICATION or EVIDENCE */}
                    {['LONG_TEXT', 'JUSTIFICATION', 'EVIDENCE'].includes(field.fieldType) && (
                      <textarea
                        rows={3}
                        value={answers[field.fieldKey] || ''}
                        onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                        disabled={clearance.submissionStatus === 'LOCKED' || clearance.submissionStatus === 'SUBMITTED'}
                        required={field.required}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-blue-500 text-slate-100 rounded-xl text-xs outline-none transition-colors disabled:opacity-60 resize-y"
                        placeholder="Detail your engineering reasoning, equations, or evidence step-by-step..."
                      />
                    )}

                    {/* MCQ */}
                    {field.fieldType === 'MCQ' && field.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {field.options.map((opt: string) => (
                          <label
                            key={opt}
                            className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center space-x-2 ${
                              answers[field.fieldKey] === opt
                                ? 'bg-blue-950 border-blue-600 text-blue-200 shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.fieldKey}
                              value={opt}
                              checked={answers[field.fieldKey] === opt}
                              onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                              disabled={clearance.submissionStatus === 'LOCKED' || clearance.submissionStatus === 'SUBMITTED'}
                              className="accent-blue-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* CONFIDENCE */}
                    {field.fieldType === 'CONFIDENCE' && field.options && (
                      <div className="flex items-center space-x-2 pt-1">
                        {field.options.map((opt: string) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => handleInputChange(field.fieldKey, opt)}
                            disabled={clearance.submissionStatus === 'LOCKED' || clearance.submissionStatus === 'SUBMITTED'}
                            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                              answers[field.fieldKey] === opt
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            Level {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">
                  No online submission fields required for this mission.
                </div>
              )}

              {/* Submit Button */}
              {clearance.submissionStatus !== 'LOCKED' && clearance.submissionStatus !== 'SUBMITTED' ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wider uppercase rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  <span>{submitting ? 'RECORDING SERVER TIMESTAMP...' : 'SUBMIT FINAL ANSWER'}</span>
                </button>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-center space-y-1">
                  <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>FINAL ANSWER SUBMITTED & LOCKED</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Submitted at {new Date(clearance.submittedAt).toLocaleTimeString()} • Server Timestamp Locked
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* STATUS 4: COMPLETED / ALL CLOSED */}
      {clearance.clearanceStatus === 'CLOSED' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-blue-950 border border-blue-800 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">ALL MISSIONS COMPLETED</h2>
          <p className="text-xs text-slate-400 font-mono">{clearance.message}</p>
        </div>
      )}
    </div>
  );
}
