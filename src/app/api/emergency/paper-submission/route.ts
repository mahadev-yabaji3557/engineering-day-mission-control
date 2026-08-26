import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'VOLUNTEER', 'MISSION_MARSHAL'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized. Staff permissions required.' }, { status: 403 });
  }

  try {
    const { teamCode, missionCode, physicalReceivedTime, paperNotes } = await req.json();

    if (!teamCode || !missionCode || !physicalReceivedTime) {
      return NextResponse.json({ error: 'Missing required paper backup fields' }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: { teamCode },
    });

    if (!team) {
      return NextResponse.json({ error: `Team ${teamCode} not found` }, { status: 404 });
    }

    const mission = await prisma.mission.findFirst({
      where: { eventCode: team.eventCode, title: { contains: missionCode } },
    }) || await prisma.mission.findFirst({
      where: { eventCode: team.eventCode },
    });

    if (!mission) {
      return NextResponse.json({ error: `Mission for ${team.eventCode} not found` }, { status: 404 });
    }

    const receivedDate = new Date(physicalReceivedTime);

    // Create or update paper submission
    const existing = await prisma.submission.findFirst({
      where: { teamId: team.id, missionId: mission.id },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          submittedAt: receivedDate,
          status: 'SUBMITTED',
          isLate: false,
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          teamId: team.id,
          missionId: mission.id,
          roundNumber: mission.roundNumber,
          submittedAt: receivedDate,
          status: 'SUBMITTED',
          isLate: false,
        },
      });
    }

    // Add answer placeholder
    await prisma.submissionAnswer.create({
      data: {
        submissionId: submission.id,
        fieldKey: 'offline_paper_notes',
        answerValue: `[OFFLINE PAPER BACKUP SUBMISSION] Recorded by ${session.name} (${session.role}). Physical Timestamp: ${receivedDate.toLocaleTimeString()}. Notes: ${paperNotes || 'Paper sheet collected.'}`,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorEmail: session.email,
        actorRole: session.role,
        action: 'EMERGENCY_PAPER_SUBMISSION',
        targetEntity: `TEAM_${teamCode}_MISSION_${missionCode}`,
        details: `Physical paper answer sheet collected at ${receivedDate.toISOString()}. Staff: ${session.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: `Emergency paper submission recorded for ${teamCode}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
