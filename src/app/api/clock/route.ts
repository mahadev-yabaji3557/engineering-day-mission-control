import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getEventClock } from '@/lib/clock';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventCode = searchParams.get('eventCode') || 'EM';

  const event = await prisma.event.findUnique({
    where: { code: eventCode },
    include: {
      clockState: true,
      rounds: {
        include: { mission: true },
        orderBy: { roundNumber: 'asc' },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const clockData = await getEventClock(event.id);

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
    allowSubmissionsDuringPause: clockData.allowSubmissionsDuringPause,
    rounds: event.rounds.map((r) => ({
      id: r.id,
      roundNumber: r.roundNumber,
      missionCode: r.mission.missionCode,
      missionTitle: r.mission.title,
      startTime: r.startTime.toISOString(),
      endTime: r.endTime.toISOString(),
      durationMinutes: r.durationMinutes,
      status: r.status,
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
    const { eventCode = 'EM', action, timeOffsetSeconds, emergencyNotice, allowSubmissions } = body;

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
      include: { clockState: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let oldStatus = event.clockState?.status || 'NOT_STARTED';
    let newStatus = oldStatus;
    let updateData: any = {};

    if (action === 'START' || action === 'RESUME') {
      newStatus = 'ACTIVE';
      updateData = { status: 'ACTIVE', startTime: event.clockState?.startTime || new Date(), pausedAt: null };
    } else if (action === 'PAUSE') {
      newStatus = 'PAUSED';
      updateData = { status: 'PAUSED', pausedAt: new Date() };
    } else if (action === 'EMERGENCY_HOLD') {
      newStatus = 'EMERGENCY_HOLD';
      updateData = {
        status: 'EMERGENCY_HOLD',
        pausedAt: new Date(),
        emergencyNotice: emergencyNotice || 'EMERGENCY HOLD INITIATED BY EVENT HEAD',
      };
    } else if (action === 'WARP_TIME') {
      const offset = Number(timeOffsetSeconds) || 0;
      updateData = { simulatedTimeOffsetSeconds: offset };
    } else if (action === 'SET_NOTICE') {
      updateData = { emergencyNotice: emergencyNotice || null };
    } else if (action === 'TOGGLE_PAUSE_SUBMISSIONS') {
      updateData = { allowSubmissionsDuringPause: Boolean(allowSubmissions) };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update event clock state
    const updatedClock = await prisma.eventClockState.upsert({
      where: { eventId: event.id },
      create: {
        eventId: event.id,
        status: newStatus,
        ...updateData,
      },
      update: updateData,
    });

    // Also update main Event table status if status changed
    if (newStatus !== oldStatus) {
      await prisma.event.update({
        where: { id: event.id },
        data: { status: newStatus },
      });
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: session.role,
        action: `CLOCK_${action}`,
        target: `EVENT_${eventCode}`,
        oldValue: oldStatus,
        newValue: newStatus,
        ipAddress: req.headers.get('x-forwarded-for') || 'local',
      },
    });

    return NextResponse.json({ success: true, clockState: updatedClock });
  } catch (error: any) {
    console.error('Clock POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
