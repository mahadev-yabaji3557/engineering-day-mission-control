'use client';

import React from 'react';
import Link from 'next/link';
import AccessLogsPage from '../access-logs/page';

export default function MissionMarshalDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono rounded-2xl flex items-center justify-between">
        <span className="font-bold">Checkmark LOGGED IN AS: MISSION MARSHAL (SEALED PACKET VERIFICATION)</span>
        <Link href="/scan-camera" className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500">
          Verify & Log Packet Unsealing →
        </Link>
      </div>

      <AccessLogsPage />
    </div>
  );
}
