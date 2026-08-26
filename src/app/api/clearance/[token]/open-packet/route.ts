import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    await prisma.accessLog.create({
      data: {
        teamId: team.id,
        qrToken: params.token,
        scanType: 'PACKET_UNSEAL',
        status: 'GRANTED',
        details: `Physical packet unsealed by Marshal ${session.name} for mission ${missionId || 'active'}`,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorEmail: session.email,
        actorRole: session.role,
        action: 'PACKET_UNSEALED',
        targetEntity: `TEAM_${team.teamCode}`,
        details: `Physical packet opened by Marshal ${session.name} for mission ${missionId}`,
      },
    });

    return NextResponse.json({
      success: true,
      packetOpened: true,
      packetOpenedAt: new Date().toISOString(),
      marshalName: session.name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
