import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getEventClock } from '@/lib/clock';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventCode = searchParams.get('eventCode') || 'EM';

  const event = await prisma.event.findUnique({
    where: { code: eventCode },
    include: {
      rounds: {
        orderBy: { roundNumber: 'asc' },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const clockData = await getEventClock(eventCode);

  return NextResponse.json({
    event: {
      id: event.id,
      code: event.code,
      title: event.title,
      status: event.status,
    },
    clockState: clockData.clockState,
    effectiveServerTime: clockData.effectiveTime.toISOString(),
    simulatedOffsetSeconds: clockData.simulatedOffsetSeconds,
    status: clockData.status,
    emergencyNotice: clockData.emergencyNotice,
    rounds: event.rounds.map((r) => ({
      id: r.id,
      roundNumber: r.roundNumber,
      title: r.title,
      startTime: r.scheduledStart.toISOString(),
      endTime: r.scheduledEnd.toISOString(),
      durationMinutes: r.durationMinutes,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized. Requires Event Head permissions.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { eventCode = 'EM', action, timeOffsetSeconds, emergencyNotice } = body;

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const clockState = await prisma.eventClockState.findUnique({
      where: { eventCode },
    });

    let oldStatus = clockState?.status || 'NOT_STARTED';
    let newStatus = oldStatus;
    let updateData: any = {};

    if (action === 'START' || action === 'RESUME') {
      newStatus = 'ACTIVE';
      updateData = { status: 'ACTIVE' };
    } else if (action === 'PAUSE') {
      newStatus = 'PAUSED';
      updateData = { status: 'PAUSED' };
    } else if (action === 'EMERGENCY_HOLD') {
      newStatus = 'EMERGENCY_HOLD';
      updateData = {
        status: 'EMERGENCY_HOLD',
      };
    } else if (action === 'WARP_TIME') {
      const offset = Number(timeOffsetSeconds) || 0;
      updateData = { simulatedTimeOffsetSeconds: offset };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update event clock state
    const updatedClock = await prisma.eventClockState.upsert({
      where: { eventCode },
      create: {
        eventCode,
        status: newStatus,
        ...updateData,
      },
      update: updateData,
    });

    // Update main Event status if changed
    if (newStatus !== oldStatus) {
      await prisma.event.update({
        where: { code: eventCode },
        data: { status: newStatus },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorEmail: session.email,
        actorRole: session.role,
        action: `CLOCK_${action}`,
        targetEntity: `EVENT_${eventCode}`,
        details: `Clock status changed from ${oldStatus} to ${newStatus}.`,
      },
    });

    return NextResponse.json({ success: true, clockState: updatedClock });
  } catch (error: any) {
    console.error('Clock POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
