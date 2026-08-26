import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventCode = searchParams.get('eventCode') || 'EM';

  const event = await prisma.event.findUnique({
    where: { code: eventCode },
    include: {
      teams: {
        orderBy: { teamCode: 'asc' },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({
    event: { id: event.id, code: event.code, title: event.title },
    teams: event.teams.map((t) => ({
      id: t.id,
      teamCode: t.teamCode,
      teamName: t.teamName,
      leaderName: t.leaderName,
      members: JSON.parse(t.memberNames || '[]'),
      qrToken: t.qrToken,
      isRevoked: t.isRevoked,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized. Requires Event Head permissions.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action = 'CREATE', eventCode = 'EM', teamCode, teamName, leaderName, members, teamId } = body;

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (action === 'CREATE') {
      if (!teamCode || !teamName) {
        return NextResponse.json({ error: 'Team code and team name are required' }, { status: 400 });
      }

      const existing = await prisma.team.findUnique({
        where: { teamCode },
      });

      if (existing) {
        return NextResponse.json({ error: `Team code ${teamCode} already exists` }, { status: 400 });
      }

      const qrToken = `tok_${eventCode.toLowerCase()}${teamCode.replace(/[^a-zA-Z0-9]/g, '')}_` + Math.random().toString(36).substring(2, 10);

      const newTeam = await prisma.team.create({
        data: {
          eventCode,
          teamCode,
          teamName,
          leaderName: leaderName || 'Team Leader',
          memberNames: JSON.stringify(members || []),
          qrToken,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorEmail: session.email,
          actorRole: session.role,
          action: 'TEAM_CREATED',
          targetEntity: `TEAM_${newTeam.teamCode}`,
          details: `Created team ${teamName} (${teamCode}) with QR Token ${qrToken}`,
        },
      });

      return NextResponse.json({ success: true, team: newTeam });
    }

    if (action === 'REVOKE') {
      if (!teamId) return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
      const updated = await prisma.team.update({
        where: { id: teamId },
        data: { isRevoked: true },
      });

      await prisma.auditLog.create({
        data: {
          actorEmail: session.email,
          actorRole: session.role,
          action: 'QR_REVOKED',
          targetEntity: `TEAM_${updated.teamCode}`,
          details: `QR token ${updated.qrToken} deactivated by ${session.name}`,
        },
      });

      return NextResponse.json({ success: true, team: updated });
    }

    if (action === 'REISSUE') {
      if (!teamId) return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
      const current = await prisma.team.findUnique({ where: { id: teamId } });
      if (!current) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

      const newQrToken = `tok_${eventCode.toLowerCase()}${current.teamCode.replace(/[^a-zA-Z0-9]/g, '')}_` + Math.random().toString(36).substring(2, 10);

      const updated = await prisma.team.update({
        where: { id: teamId },
        data: { qrToken: newQrToken, isRevoked: false },
      });

      await prisma.auditLog.create({
        data: {
          actorEmail: session.email,
          actorRole: session.role,
          action: 'QR_REISSUED',
          targetEntity: `TEAM_${current.teamCode}`,
          details: `Reissued QR Token. Old: ${current.qrToken}, New: ${newQrToken}`,
        },
      });

      return NextResponse.json({ success: true, team: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Teams POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
