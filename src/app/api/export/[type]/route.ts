import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateLeaderboard } from '@/lib/tiebreaker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'JUDGE'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const exportType = params.type;
  const { searchParams } = new URL(req.url);
  const eventCode = searchParams.get('eventCode') || 'EM';

  const event = await prisma.event.findUnique({
    where: { code: eventCode },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  let csvContent = '';
  let filename = `${eventCode}_${exportType}_${Date.now()}.csv`;

  if (exportType === 'teams') {
    const teams = await prisma.team.findMany({
      where: { eventCode },
      orderBy: { teamCode: 'asc' },
    });

    const headers = ['Team Code', 'Team Name', 'Leader', 'Members', 'QR Token', 'Created At'];
    const rows = teams.map((t) => [
      t.teamCode,
      `"${t.teamName.replace(/"/g, '""')}"`,
      `"${t.leaderName.replace(/"/g, '""')}"`,
      `"${JSON.parse(t.memberNames || '[]').join('; ')}"`,
      t.qrToken,
      t.createdAt.toISOString(),
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'access-logs') {
    const logs = await prisma.accessLog.findMany({
      where: { team: { eventCode } },
      include: { team: true },
      orderBy: { timestamp: 'desc' },
    });

    const headers = ['Timestamp', 'Team Code', 'Team Name', 'Scan Type', 'Status', 'Details'];
    const rows = logs.map((l) => [
      l.timestamp.toISOString(),
      l.team?.teamCode || 'N/A',
      `"${(l.team?.teamName || '').replace(/"/g, '""')}"`,
      l.scanType,
      l.status,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'submissions') {
    const subs = await prisma.submission.findMany({
      where: { team: { eventCode } },
      include: { team: true, mission: true, answers: true },
      orderBy: { submittedAt: 'desc' },
    });

    const headers = ['Submission ID', 'Team Code', 'Team Name', 'Mission Title', 'Submitted At', 'Status', 'Is Late', 'Answers JSON'];
    const rows = subs.map((s) => [
      s.id,
      s.team.teamCode,
      `"${s.team.teamName.replace(/"/g, '""')}"`,
      `"${s.mission.title.replace(/"/g, '""')}"`,
      s.submittedAt.toISOString(),
      s.status,
      s.isLate ? 'YES' : 'NO',
      `"${JSON.stringify(s.answers.reduce((acc: any, a) => { acc[a.fieldKey] = a.answerValue; return acc; }, {})).replace(/"/g, '""')}"`,
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'scores') {
    const scores = await prisma.score.findMany({
      where: { team: { eventCode } },
      include: { team: true, mission: true },
      orderBy: { scoredAt: 'desc' },
    });

    const headers = ['Score ID', 'Team Code', 'Team Name', 'Mission Title', 'Total Score', 'Is Finalized', 'Scored At', 'Comments'];
    const rows = scores.map((s) => [
      s.id,
      s.team.teamCode,
      `"${s.team.teamName.replace(/"/g, '""')}"`,
      `"${s.mission.title.replace(/"/g, '""')}"`,
      s.totalScore,
      s.isFinalized ? 'YES' : 'NO',
      s.scoredAt.toISOString(),
      `"${(s.comments || '').replace(/"/g, '""')}"`,
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'final-results') {
    const leaderboard = await calculateLeaderboard(eventCode, true);

    const headers = ['Rank', 'Team Code', 'Team Name', 'Total Score', 'Completed Missions', 'Final Round Score', 'Reasoning Score', 'Tie-Breaker Applied', 'Tie-Breaker Reason'];
    const rows = leaderboard.map((l) => [
      l.rank,
      l.teamCode,
      `"${l.teamName.replace(/"/g, '""')}"`,
      l.totalScore,
      l.completedMissions,
      l.finalRoundScore,
      l.reasoningScore,
      l.tieBreakerApplied ? 'YES' : 'NO',
      `"${(l.tieBreakerReason || '').replace(/"/g, '""')}"`,
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'audit-report') {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
    });

    const headers = ['Timestamp', 'Actor Email', 'Actor Role', 'Action', 'Target Entity', 'Details'];
    const rows = logs.map((l) => [
      l.timestamp.toISOString(),
      l.actorEmail,
      l.actorRole,
      l.action,
      l.targetEntity,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else {
    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  }

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
