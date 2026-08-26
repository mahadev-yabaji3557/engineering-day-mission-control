import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

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
      actorId: l.actorId,
      actorRole: l.actorRole,
      action: l.action,
      target: l.target,
      oldValue: l.oldValue,
      newValue: l.newValue,
      ipAddress: l.ipAddress,
    })),
  });
}
