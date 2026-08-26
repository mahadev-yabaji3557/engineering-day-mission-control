import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session || !['SUPER_ADMIN', 'EVENT_HEAD'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized. Event Head only.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 100);

  const logs = await prisma.auditLog.findMany({
    take: limit,
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      timestamp: l.timestamp.toISOString(),
      actorEmail: l.actorEmail,
      actorRole: l.actorRole,
      action: l.action,
      targetEntity: l.targetEntity,
      details: l.details,
    })),
  });
}
