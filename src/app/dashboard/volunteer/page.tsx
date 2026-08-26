'use client';

import React from 'react';
import Link from 'next/link';
import DayOfEventQuickGuidePage from '../guide/page';

export default function VolunteerDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-teal-950/60 border border-teal-800 text-teal-300 text-xs font-mono rounded-2xl flex items-center justify-between">
        <span className="font-bold">🤝 LOGGED IN AS: VOLUNTEER OPERATIVE</span>
        <Link href="/dashboard/emergency" className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500">
          Emergency Paper Sheet Logger →
        </Link>
      </div>

      <DayOfEventQuickGuidePage />
    </div>
  );
}
