import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'JUDGE'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const eventCode = searchParams.get('eventCode') || 'EM';

  const event = await prisma.event.findUnique({
    where: { code: eventCode },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Get submissions
  const submissions = await prisma.submission.findMany({
    where: { team: { eventCode } },
    include: {
      team: true,
      mission: {
        include: {
          rubrics: true,
          fields: true,
        },
      },
      answers: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  // Get existing scores
  const scores = await prisma.score.findMany({
    where: { team: { eventCode } },
    include: { scoreItems: true },
  });

  return NextResponse.json({
    event: { id: event.id, code: event.code, title: event.title },
    submissions: submissions.map((sub) => {
      const existingScore = scores.find(
        (s) => s.teamId === sub.teamId && s.missionId === sub.missionId
      );
      return {
        id: sub.id,
        teamId: sub.teamId,
        teamCode: sub.team.teamCode,
        teamName: sub.team.teamName,
        missionId: sub.missionId,
        missionTitle: sub.mission.title,
        submittedAt: sub.submittedAt.toISOString(),
        status: sub.status,
        isLate: sub.isLate,
        answers: sub.answers,
        rubrics: sub.mission.rubrics,
        score: existingScore
          ? {
              id: existingScore.id,
              totalScore: existingScore.totalScore,
              comments: existingScore.comments,
              isFinalized: existingScore.isFinalized,
              scoredAt: existingScore.scoredAt.toISOString(),
              items: existingScore.scoreItems.map((item) => ({
                rubricId: item.rubricId,
                marksGiven: item.marksAwarded,
              })),
            }
          : null,
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'JUDGE'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { teamId, missionId, rubricScores, comments, isFinalized, unlockOverride } = body;

    if (!teamId || !missionId || !rubricScores) {
      return NextResponse.json({ error: 'Missing required scoring fields' }, { status: 400 });
    }

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { rubrics: true },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Check existing score
    const existingScore = await prisma.score.findFirst({
      where: { teamId, missionId },
    });

    if (existingScore && existingScore.isFinalized && session.role === 'JUDGE' && !unlockOverride) {
      return NextResponse.json(
        { error: 'Score is finalized and locked. Only Event Head can unlock finalized scores.' },
        { status: 403 }
      );
    }

    // Validate marks against rubric maxMarks
    let calculatedTotal = 0;
    const validatedItems: { rubricId: string; marksAwarded: number }[] = [];

    for (const rubric of mission.rubrics) {
      const markInput = Number(rubricScores[rubric.id] ?? 0);
      if (markInput < 0 || markInput > rubric.maxMarks) {
        return NextResponse.json(
          { error: `Marks for ${rubric.criterion} must be between 0 and ${rubric.maxMarks}` },
          { status: 400 }
        );
      }
      calculatedTotal += markInput;
      validatedItems.push({ rubricId: rubric.id, marksAwarded: markInput });
    }

    const submission = await prisma.submission.findFirst({
      where: { teamId, missionId },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found for scoring' }, { status: 404 });
    }

    let score;
    if (existingScore) {
      await prisma.scoreItem.deleteMany({ where: { scoreId: existingScore.id } });
      score = await prisma.score.update({
        where: { id: existingScore.id },
        data: {
          judgeId: session.id,
          totalScore: Number(calculatedTotal.toFixed(2)),
          comments: comments || '',
          isFinalized: Boolean(isFinalized),
        },
      });
    } else {
      score = await prisma.score.create({
        data: {
          submissionId: submission.id,
          judgeId: session.id,
          teamId,
          missionId,
          totalScore: Number(calculatedTotal.toFixed(2)),
          comments: comments || '',
          isFinalized: Boolean(isFinalized),
        },
      });
    }

    await prisma.scoreItem.createMany({
      data: validatedItems.map((item) => ({
        scoreId: score.id,
        rubricId: item.rubricId,
        marksAwarded: item.marksAwarded,
      })),
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorEmail: session.email,
        actorRole: session.role,
        action: isFinalized ? 'SCORE_FINALIZED' : 'SCORE_DRAFT_SAVED',
        targetEntity: `TEAM_${teamId}_MISSION_${missionId}`,
        details: `Total: ${calculatedTotal}/${mission.maxScore}. Finalized: ${Boolean(isFinalized)}`,
      },
    });

    return NextResponse.json({
      success: true,
      scoreId: score.id,
      totalScore: calculatedTotal,
      isFinalized: Boolean(isFinalized),
    });
  } catch (error: any) {
    console.error('Judging POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
