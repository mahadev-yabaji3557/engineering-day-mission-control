import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateLeaderboard } from '@/lib/tiebreaker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventCode = searchParams.get('eventCode') || 'EM';
  const mode = searchParams.get('mode') || 'live'; // 'live' | 'final'

  const event = await prisma.event.findUnique({
    where: { code: eventCode },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const isFinal = mode === 'final';
  const leaderboard = await calculateLeaderboard(eventCode, isFinal);

  return NextResponse.json({
    event: { id: event.id, code: event.code, title: event.title, status: event.status },
    mode,
    leaderboard,
  });
}
