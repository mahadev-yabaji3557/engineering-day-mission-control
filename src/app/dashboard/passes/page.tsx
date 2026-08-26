'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Shield, QrCode as QrIcon, ArrowLeft } from 'lucide-react';

export default function PrintablePassesPage() {
  const [eventCode, setEventCode] = useState('EM');
  const [teams, setTeams] = useState<any[]>([]);
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams?eventCode=${eventCode}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.teams) {
          setTeams(data.teams);
          // Generate QR Code data URLs
          const urls: Record<string, string> = {};
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

          for (const team of data.teams) {
            const qrTargetUrl = `${baseUrl}/scan/${team.qrToken}`;
            urls[team.id] = await QRCode.toDataURL(qrTargetUrl, {
              margin: 1,
              width: 180,
              color: {
                dark: '#0f172a',
                light: '#ffffff',
              },
            });
          }
          setQrDataUrls(urls);
        }
        setLoading(false);
      });
  }, [eventCode]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Control Header (Hidden when printing) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">PHYSICAL IDENTIFICATION CARDS</div>
          <h1 className="text-2xl font-black text-white font-sans">Printable CR80 Team Passes Generator</h1>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setEventCode('EM')}
              className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'EM' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              EM PASSES
            </button>
            <button
              onClick={() => setEventCode('UC')}
              className={`px-3 py-1.5 rounded-xl font-bold ${eventCode === 'UC' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              UC PASSES
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT PASS SHEET</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs">Generating QR Team Passes...</div>
      ) : (
        <div className="printable-pass-area space-y-6">
          <div className="hidden print:block text-center py-2 text-xs font-mono font-bold uppercase tracking-wider text-black">
            ENGINEERING DAY 2026 OFFICIAL TEAM PASS SHEET • {eventCode === 'EM' ? "ENGINEER'S MIND" : 'ENGINEERING UNDERCOVER'}
          </div>

          {/* Grid of CR80 Printable Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                className="cr80-card bg-white text-slate-950 border-2 border-slate-900 rounded-2xl p-3.5 shadow-xl flex flex-col justify-between relative overflow-hidden font-sans print:shadow-none print:border-black"
                style={{ width: '85.6mm', height: '53.98mm' }}
              >
                {/* Top Banner */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-blue-700 fill-blue-700" />
                    <span className="font-black text-[11px] tracking-tight uppercase text-blue-900">ENGINEERING DAY</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-600 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">
                    TEAM PASS
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 max-w-[170px]">
                    <div className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                      {eventCode === 'EM' ? "ENGINEER'S MIND" : 'UNDERCOVER'}
                    </div>
                    <div className="text-2xl font-black font-mono tracking-wider text-blue-950">{t.teamCode}</div>
                    <div className="text-[10px] font-bold text-slate-800 truncate">{t.teamName}</div>
                  </div>

                  {/* QR Image */}
                  {qrDataUrls[t.id] && (
                    <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center shrink-0">
                      <img src={qrDataUrls[t.id]} alt={`QR ${t.teamCode}`} className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span>KEEP PHYSICAL PACKET SEALED</span>
                  <span>ID: {t.qrToken.slice(0, 12)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
