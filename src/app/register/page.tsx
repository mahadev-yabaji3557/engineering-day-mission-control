'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Shield, QrCode as QrIcon, Users, CheckCircle2, ArrowRight, Printer, Download, Sparkles } from 'lucide-react';

export default function PublicTeamRegistrationPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [member2, setMember2] = useState('');
  const [member3, setMember3] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredTeam, setRegisteredTeam] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventCode,
          teamName,
          leaderName,
          memberNames: [member2, member3],
          contactEmail,
          contactPhone,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegisteredTeam(data.team);

        // Generate high resolution QR Code data URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const fullScanUrl = `${baseUrl}${data.team.scanUrl}`;

        const dataUrl = await QRCode.toDataURL(fullScanUrl, {
          margin: 1,
          width: 300,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        setQrDataUrl(dataUrl);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Direct PNG Image Downloader
  const handleDownloadPNG = () => {
    if (!registeredTeam || !qrDataUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 378; // CR80 aspect ratio (1.586)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Top Header Banner
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(10, 10, canvas.width - 20, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ENGINEERING DAY 2026', 30, 42);

    ctx.font = 'bold 14px monospace';
    ctx.fillText('OFFICIAL TEAM PASS', canvas.width - 190, 42);

    // Event Title
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(registeredTeam.eventTitle.toUpperCase(), 35, 95);

    // Team Code
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 48px monospace';
    ctx.fillText(registeredTeam.teamCode, 35, 150);

    // Team Name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(registeredTeam.teamName, 35, 195);

    // Members
    ctx.fillStyle = '#64748b';
    ctx.font = '14px monospace';
    const membersStr = `Members: ${registeredTeam.members.join(', ')}`;
    ctx.fillText(membersStr.slice(0, 38), 35, 235);

    // Security Notice
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('KEEP PHYSICAL MISSION PACKET SEALED UNTIL DIGITAL CLEARANCE', 35, 340);

    // Draw QR Code Image onto Canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, canvas.width - 200, 90, 170, 170);

      // Trigger Download
      const a = document.createElement('a');
      a.download = `${registeredTeam.teamCode}-Team-Pass.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = qrDataUrl;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 print:hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL COMPETITION REGISTRATION PORTAL</span>
        </div>
        <h1 className="text-3xl font-black text-white font-sans uppercase">PUBLIC TEAM REGISTRATION</h1>
        <p className="text-xs text-slate-400 font-mono">
          Register your team for Engineer’s Mind or Engineering Undercover to instantly receive your permanent QR Team Pass.
        </p>
      </div>

      {registeredTeam ? (
        /* Instant Registration Pass Receipt Display */
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-700 rounded-2xl flex items-center justify-center mx-auto print:hidden">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>

          <div className="space-y-1 print:hidden">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-950 rounded-full border border-emerald-800">
              REGISTRATION CONFIRMED & PASS ISSUED
            </span>
            <h2 className="text-3xl font-black text-white font-mono pt-2">{registeredTeam.teamCode}</h2>
            <p className="text-base font-bold text-blue-300">{registeredTeam.teamName}</p>
            <p className="text-xs text-slate-400 font-mono">{registeredTeam.eventTitle}</p>
          </div>

          {/* Printable CR80 Team Pass Card */}
          <div className="cr80-card bg-white text-slate-950 border-2 border-slate-900 rounded-2xl p-4 mx-auto shadow-2xl flex items-center justify-between space-x-4 max-w-sm text-left">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-blue-700 fill-blue-700" />
                <span className="font-black text-xs text-blue-900">ENGINEERING DAY</span>
              </div>
              <div className="text-2xl font-black font-mono text-blue-950">{registeredTeam.teamCode}</div>
              <div className="text-xs font-bold text-slate-800">{registeredTeam.teamName}</div>
              <div className="text-[9px] font-mono text-slate-500">Members: {registeredTeam.members.join(', ')}</div>
            </div>

            {qrDataUrl && (
              <img src={qrDataUrl} alt="Team QR Pass" className="w-20 h-20 object-contain rounded-lg border border-slate-300 shrink-0" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
            <Link
              href={registeredTeam.scanUrl}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Access Digital Team Clearance →</span>
            </Link>

            <button
              onClick={handleDownloadPNG}
              className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs font-mono shadow-lg flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Pass Image (PNG)</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs font-mono border border-slate-700 flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-950 border border-red-800 text-red-300 text-xs font-mono rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Choice */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">1. Select Competition Event</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setEventCode('EM')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    eventCode === 'EM'
                      ? 'bg-blue-950 border-blue-600 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-black text-sm text-blue-400">ENGINEER'S MIND</div>
                  <div className="text-[11px] text-slate-400 mt-1">Logic circuits, load diagnostics & data pipelines.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEventCode('UC')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    eventCode === 'UC'
                      ? 'bg-indigo-950 border-indigo-600 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-black text-sm text-indigo-400">ENGINEERING UNDERCOVER</div>
                  <div className="text-[11px] text-slate-400 mt-1">Cipher decryption, covert robotics & threat matrix.</div>
                </button>
              </div>
            </div>

            {/* Team Info */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300">2. Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  placeholder="e.g. Apex Innovators"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Leader Name *</label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    required
                    placeholder="Leader Full Name"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Member 2 Name</label>
                  <input
                    type="text"
                    value={member2}
                    onChange={(e) => setMember2(e.target.value)}
                    placeholder="Member 2 Full Name"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Member 3 Name</label>
                  <input
                    type="text"
                    value={member3}
                    onChange={(e) => setMember3(e.target.value)}
                    placeholder="Member 3 Full Name"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="leader@college.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 font-mono text-xs rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm font-mono uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-950/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'REGISTERING TEAM & ISSUING PASS...' : 'REGISTER TEAM & GENERATE QR PASS'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
