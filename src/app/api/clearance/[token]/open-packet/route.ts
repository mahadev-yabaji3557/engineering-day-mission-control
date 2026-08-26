import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'MISSION_MARSHAL'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized. Requires Mission Marshal permissions.' }, { status: 403 });
  }

  try {
    const { missionId } = await req.json();

    const team = await prisma.team.findUnique({
      where: { qrToken: params.token },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const now = new Date();

    const accessLog = await prisma.accessLog.create({
      data: {
        teamId: team.id,
        eventId: team.eventId,
        missionId: missionId || null,
        qrStatus: 'VALID',
        clearanceStatus: 'GRANTED',
        packetOpened: true,
        packetOpenedAt: now,
        marshalId: session.id,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: session.role,
        action: 'PACKET_OPENED',
        target: `TEAM_${team.teamCode}`,
        newValue: `Physical packet opened by Marshal ${session.name} for mission ${missionId}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'local',
      },
    });

    return NextResponse.json({
      success: true,
      packetOpened: true,
      packetOpenedAt: now.toISOString(),
      marshalName: session.name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
