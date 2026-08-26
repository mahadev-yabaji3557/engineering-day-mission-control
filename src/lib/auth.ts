import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'engineering-day-secret-key-production-2026';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string; // SUPER_ADMIN, EVENT_HEAD, ARENA_HEAD, ACCESS_OFFICER, MISSION_MARSHAL, JUDGE, VOLUNTEER, PARTICIPANT
  arenaId?: string | null;
}

export function signToken(user: UserSession): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function getSession(): UserSession | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('mission_control_token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function hasRole(session: UserSession | null, allowedRoles: string[]): boolean {
  if (!session) return false;
  if (session.role === 'SUPER_ADMIN') return true;
  return allowedRoles.includes(session.role);
}
