'use client';

import React from 'react';
import JudgingDashboardPage from '../judging/page';

export default function JudgeRoleDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-yellow-950/60 border border-yellow-800 text-yellow-300 text-xs font-mono rounded-2xl flex items-center justify-between">
        <span className="font-bold">⚖️ LOGGED IN AS: EVALUATION JUDGE (RUBRIC SCORING AUTHORIZATION)</span>
      </div>

      <JudgingDashboardPage />
    </div>
  );
}
