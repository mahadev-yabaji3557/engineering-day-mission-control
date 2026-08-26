import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateTeamClearance } from '@/lib/clock';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    const result = await evaluateTeamClearance(token);

    // Record Access Log for tracking
    if (result.teamId) {
      await prisma.accessLog.create({
        data: {
          teamId: result.teamId,
          qrToken: token,
          scanType: 'MISSION_CLEARANCE',
          status: result.clearanceStatus,
          details: result.message,
        },
      });
    }

    // Include structured mission fields if clearance is GRANTED
    let fields: any[] = [];
    let submissionData: any = null;

    if (result.clearanceStatus === 'GRANTED' && result.missionId) {
      fields = await prisma.missionField.findMany({
        where: { missionId: result.missionId },
        orderBy: { orderIndex: 'asc' },
      });

      if (result.teamId) {
        const sub = await prisma.submission.findFirst({
          where: {
            teamId: result.teamId,
            missionId: result.missionId,
          },
          include: { answers: true },
        });

        if (sub) {
          submissionData = {
            id: sub.id,
            status: sub.status,
            submittedAt: sub.submittedAt.toISOString(),
            isLate: sub.isLate,
            answers: sub.answers.reduce((acc: Record<string, string>, ans) => {
              acc[ans.fieldKey] = ans.answerValue;
              return acc;
            }, {}),
          };
        }
      }
    }

    return NextResponse.json({
      ...result,
      fields: fields.map((f) => ({
        id: f.id,
        fieldKey: f.fieldKey,
        label: f.label,
        fieldType: f.fieldType,
        options: f.optionsJson ? JSON.parse(f.optionsJson) : null,
        required: f.isRequired,
      })),
      existingSubmission: submissionData,
    });
  } catch (error: any) {
    console.error('Clearance evaluation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
