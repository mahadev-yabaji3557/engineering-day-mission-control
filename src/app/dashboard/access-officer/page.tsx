'use client';

import React from 'react';
import Link from 'next/link';
import AccessLogsPage from '../access-logs/page';

export default function AccessOfficerDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono rounded-2xl flex items-center justify-between">
        <span className="font-bold">🔐 LOGGED IN AS: ACCESS CONTROL OFFICER</span>
        <Link href="/scan-camera" className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500">
          Open Camera Scanner →
        </Link>
      </div>

      <AccessLogsPage />
    </div>
  );
}
