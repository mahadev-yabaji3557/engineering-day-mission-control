'use client';

import React from 'react';
import Link from 'next/link';
import LiveMissionControlPage from '../live/page';

export default function ArenaHeadDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono rounded-2xl flex items-center justify-between">
        <span className="font-bold">⚡ LOGGED IN AS: ARENA HEAD (ARENA FLOOR MANAGEMENT)</span>
        <Link href="/dashboard/access-logs" className="text-cyan-400 font-bold hover:underline">
          View Arena Clearance Logs →
        </Link>
      </div>

      <LiveMissionControlPage />
    </div>
  );
}
