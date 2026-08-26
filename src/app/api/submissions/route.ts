import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { evaluateTeamClearance, getEventClock } from '@/lib/clock';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  const missionId = searchParams.get('missionId');

  const submissions = await prisma.submission.findMany({
    where: {
      ...(teamId ? { teamId } : {}),
      ...(missionId ? { missionId } : {}),
    },
    include: {
      team: true,
      mission: true,
      answers: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrToken, missionId, answers, isOverride } = body;

    if (!qrToken || !missionId || !answers) {
      return NextResponse.json({ error: 'Missing required parameters (qrToken, missionId, answers)' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { qrToken },
    });

    if (!team) {
      return NextResponse.json({ error: 'Invalid team pass token' }, { status: 404 });
    }

    // Evaluate clock & clearance
    const clearance = await evaluateTeamClearance(qrToken);
    const { effectiveTime, status: clockStatus } = await getEventClock(team.eventCode);

    if (clockStatus === 'PAUSED' && !isOverride) {
      return NextResponse.json(
        { error: 'Submissions are temporarily blocked while the event is paused.' },
        { status: 403 }
      );
    }

    if (clearance.clearanceStatus === 'DENIED' || clearance.clearanceStatus === 'LOCKED') {
      return NextResponse.json(
        { error: `Cannot submit: ${clearance.message}` },
        { status: 403 }
      );
    }

    // Check existing submission
    const existingSubmission = await prisma.submission.findFirst({
      where: { teamId: team.id, missionId },
    });

    const session = getSession();

    if (existingSubmission && existingSubmission.status === 'LOCKED' && !isOverride) {
      return NextResponse.json(
        { error: 'Final answer has already been submitted and locked for this mission.' },
        { status: 400 }
      );
    }

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    const roundNumber = mission?.roundNumber || 1;

    // Check if late
    const round = await prisma.missionRound.findFirst({
      where: { eventCode: team.eventCode, roundNumber },
    });

    let isLate = false;
    if (round && effectiveTime > new Date(round.scheduledEnd)) {
      isLate = true;
    }

    const submissionStatus = 'SUBMITTED';

    let submission;
    if (existingSubmission) {
      // Delete old answers and update
      await prisma.submissionAnswer.deleteMany({
        where: { submissionId: existingSubmission.id },
      });

      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          submittedAt: effectiveTime,
          status: submissionStatus,
          isLate,
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          teamId: team.id,
          missionId,
          roundNumber,
          submittedAt: effectiveTime,
          status: submissionStatus,
          isLate,
        },
      });
    }

    // Insert answer records
    const answerEntries = Object.entries(answers).map(([key, val]) => ({
      submissionId: submission.id,
      fieldKey: key,
      answerValue: String(val),
    }));

    await prisma.submissionAnswer.createMany({
      data: answerEntries,
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorEmail: session?.email || team.teamCode,
        actorRole: session?.role || 'PARTICIPANT',
        action: 'SUBMISSION_SAVED',
        targetEntity: `TEAM_${team.teamCode}_MISSION_${missionId}`,
        details: `Submitted ${answerEntries.length} answer fields. IsLate: ${isLate}`,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      submittedAt: effectiveTime.toISOString(),
      status: submissionStatus,
      isLate,
      message: isLate ? 'SUBMISSION RECEIVED (MARKED LATE)' : 'SUBMISSION RECEIVED AND LOCKED',
    });
  } catch (error: any) {
    console.error('Submission POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
