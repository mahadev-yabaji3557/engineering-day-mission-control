import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateLeaderboard } from '@/lib/tiebreaker';

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
      where: { eventId: event.id },
      orderBy: { teamCode: 'asc' },
    });

    const headers = ['Team Code', 'Team Name', 'Members', 'QR Token', 'Status', 'Created At'];
    const rows = teams.map((t) => [
      t.teamCode,
      `"${t.teamName.replace(/"/g, '""')}"`,
      `"${JSON.parse(t.members || '[]').join('; ')}"`,
      t.qrToken,
      t.status,
      t.createdAt.toISOString(),
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'access-logs') {
    const logs = await prisma.accessLog.findMany({
      where: { eventId: event.id },
      include: { team: true, mission: true },
      orderBy: { timestamp: 'desc' },
    });

    const headers = ['Timestamp', 'Team Code', 'Team Name', 'Mission Code', 'QR Status', 'Clearance Status', 'Packet Opened', 'Packet Opened At'];
    const rows = logs.map((l) => [
      l.timestamp.toISOString(),
      l.team.teamCode,
      `"${l.team.teamName.replace(/"/g, '""')}"`,
      l.mission?.missionCode || 'N/A',
      l.qrStatus,
      l.clearanceStatus,
      l.packetOpened ? 'YES' : 'NO',
      l.packetOpenedAt?.toISOString() || '',
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'submissions') {
    const subs = await prisma.submission.findMany({
      where: { eventId: event.id },
      include: { team: true, mission: true, answers: true },
      orderBy: { submittedAt: 'desc' },
    });

    const headers = ['Submission ID', 'Team Code', 'Team Name', 'Mission Code', 'Submitted At', 'Status', 'Is Late', 'Answers JSON'];
    const rows = subs.map((s) => [
      s.id,
      s.team.teamCode,
      `"${s.team.teamName.replace(/"/g, '""')}"`,
      s.mission.missionCode,
      s.submittedAt.toISOString(),
      s.status,
      s.isLate ? 'YES' : 'NO',
      `"${JSON.stringify(s.answers.reduce((acc: any, a) => { acc[a.fieldKey] = a.answerValue; return acc; }, {})).replace(/"/g, '""')}"`,
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'scores') {
    const scores = await prisma.score.findMany({
      where: { mission: { eventId: event.id } },
      include: { team: true, mission: true, scoreItems: { include: { rubric: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Score ID', 'Team Code', 'Team Name', 'Mission Code', 'Total Score', 'Status', 'Finalized At', 'Comments'];
    const rows = scores.map((s) => [
      s.id,
      s.team.teamCode,
      `"${s.team.teamName.replace(/"/g, '""')}"`,
      s.mission.missionCode,
      s.totalScore,
      s.status,
      s.finalizedAt?.toISOString() || '',
      `"${(s.comments || '').replace(/"/g, '""')}"`,
    ]);

    csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (exportType === 'final-results') {
    const leaderboard = await calculateLeaderboard(event.id, true);

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

    const headers = ['Timestamp', 'Actor ID', 'Actor Role', 'Action', 'Target', 'Old Value', 'New Value', 'IP Address'];
    const rows = logs.map((l) => [
      l.timestamp.toISOString(),
      l.actorId,
      l.actorRole,
      l.action,
      l.target,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      l.ipAddress || '',
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
