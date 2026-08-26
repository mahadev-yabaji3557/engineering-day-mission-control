import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

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
      members: JSON.parse(t.members || '[]'),
      qrToken: t.qrToken,
      status: t.status,
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
    const { action = 'CREATE', eventCode = 'EM', teamCode, teamName, members, teamId, csvData } = body;

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

      const existing = await prisma.team.findFirst({
        where: { eventId: event.id, teamCode },
      });

      if (existing) {
        return NextResponse.json({ error: `Team code ${teamCode} already exists` }, { status: 400 });
      }

      const qrToken = `tok_${eventCode.toLowerCase()}${teamCode.replace(/[^a-zA-Z0-9]/g, '')}_` + Math.random().toString(36).substring(2, 10);

      const newTeam = await prisma.team.create({
        data: {
          eventId: event.id,
          teamCode,
          teamName,
          members: JSON.stringify(members || []),
          qrToken,
          status: 'ACTIVE',
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorRole: session.role,
          action: 'TEAM_CREATED',
          target: `TEAM_${newTeam.teamCode}`,
          newValue: `Created team ${teamName} (${teamCode}) with QR Token ${qrToken}`,
          ipAddress: req.headers.get('x-forwarded-for') || 'local',
        },
      });

      return NextResponse.json({ success: true, team: newTeam });
    }

    if (action === 'REVOKE') {
      if (!teamId) return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
      const updated = await prisma.team.update({
        where: { id: teamId },
        data: { status: 'REVOKED' },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorRole: session.role,
          action: 'QR_REVOKED',
          target: `TEAM_${updated.teamCode}`,
          newValue: `QR token ${updated.qrToken} deactivated by ${session.name}`,
          ipAddress: req.headers.get('x-forwarded-for') || 'local',
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
        data: { qrToken: newQrToken, status: 'ACTIVE' },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorRole: session.role,
          action: 'QR_REISSUED',
          target: `TEAM_${current.teamCode}`,
          oldValue: current.qrToken,
          newValue: newQrToken,
          ipAddress: req.headers.get('x-forwarded-for') || 'local',
        },
      });

      return NextResponse.json({ success: true, team: updated });
    }

    if (action === 'IMPORT_CSV') {
      if (!Array.isArray(csvData)) {
        return NextResponse.json({ error: 'Invalid CSV data array' }, { status: 400 });
      }

      let importedCount = 0;
      for (const row of csvData) {
        if (!row.teamCode || !row.teamName) continue;
        const qrToken = `tok_${eventCode.toLowerCase()}${row.teamCode.replace(/[^a-zA-Z0-9]/g, '')}_` + Math.random().toString(36).substring(2, 10);
        
        await prisma.team.upsert({
          where: { qrToken },
          create: {
            eventId: event.id,
            teamCode: row.teamCode,
            teamName: row.teamName,
            members: JSON.stringify(row.members ? String(row.members).split(';') : []),
            qrToken,
            status: 'ACTIVE',
          },
          update: {
            teamName: row.teamName,
          },
        });
        importedCount++;
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorRole: session.role,
          action: 'TEAMS_IMPORTED_CSV',
          target: `EVENT_${eventCode}`,
          newValue: `Imported ${importedCount} teams from CSV`,
          ipAddress: req.headers.get('x-forwarded-for') || 'local',
        },
      });

      return NextResponse.json({ success: true, count: importedCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Teams POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
