import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'ACCESS_OFFICER', 'MISSION_MARSHAL'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 100);

  const accessLogs = await prisma.accessLog.findMany({
    take: limit,
    orderBy: { timestamp: 'desc' },
    include: {
      team: true,
    },
  });

  return NextResponse.json({
    logs: accessLogs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      teamCode: log.team?.teamCode || 'N/A',
      teamName: log.team?.teamName || 'N/A',
      scanType: log.scanType,
      status: log.status,
      details: log.details || '',
    })),
  });
}
