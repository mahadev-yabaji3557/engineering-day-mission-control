import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';

const ROLE_DASHBOARDS: Record<string, string> = {
  SUPER_ADMIN: '/dashboard/super-admin',
  EVENT_HEAD: '/dashboard/event-head',
  ARENA_HEAD: '/dashboard/arena-head',
  ACCESS_OFFICER: '/dashboard/access-officer',
  MISSION_MARSHAL: '/dashboard/mission-marshal',
  JUDGE: '/dashboard/judge',
  VOLUNTEER: '/dashboard/volunteer',
  PARTICIPANT: '/dashboard/participant',
};

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    const user = await prisma.user.findFirst({
      where: { role },
    });

    if (!user) {
      return NextResponse.json({ error: `No demo account found for role ${role}` }, { status: 404 });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      arenaId: user.arenaId,
    };

    const token = signToken(sessionPayload);
    const redirectUrl = ROLE_DASHBOARDS[user.role] || '/dashboard/live';

    const res = NextResponse.json({ success: true, user: sessionPayload, redirectUrl });
    res.cookies.set('mission_control_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
