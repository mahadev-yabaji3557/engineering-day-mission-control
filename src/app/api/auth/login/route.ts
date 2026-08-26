import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

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
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
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

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'USER_LOGIN',
        target: 'AUTH',
        newValue: `User ${user.email} logged in as ${user.role}.`,
        ipAddress: req.headers.get('x-forwarded-for') || 'local',
      },
    });

    const res = NextResponse.json({ success: true, user: sessionPayload, redirectUrl });
    res.cookies.set('mission_control_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
