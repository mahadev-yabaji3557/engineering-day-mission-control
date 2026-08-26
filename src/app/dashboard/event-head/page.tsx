'use client';

import React from 'react';
import Link from 'next/link';
import LiveMissionControlPage from '../live/page';

export default function EventHeadDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-950/60 border border-blue-800 text-blue-300 text-xs font-mono rounded-2xl flex items-center justify-between">
        <span className="font-bold">🎯 LOGGED IN AS: EVENT HEAD (MASTER EVENT CONTROL AUTHORIZATION)</span>
        <Link href="/dashboard/clock" className="text-blue-400 font-bold hover:underline">
          Schedule Editor →
        </Link>
      </div>

      <LiveMissionControlPage />
    </div>
  );
}
