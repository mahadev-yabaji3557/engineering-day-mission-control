import { NextRequest, NextResponse } from 'next/server';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  arenaId?: string | null;
}

// Edge-compatible JWT Payload Decoder
function parseJwtEdge(token: string): UserSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Strict Role Authorization Matrix
const ROLE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard/live': ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD'],
  '/dashboard/clock': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/dashboard/teams': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/dashboard/passes': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/dashboard/submissions': ['SUPER_ADMIN', 'EVENT_HEAD', 'JUDGE'],
  '/dashboard/judging': ['SUPER_ADMIN', 'EVENT_HEAD', 'JUDGE'],
  '/dashboard/access-logs': ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'ACCESS_OFFICER', 'MISSION_MARSHAL'],
  '/dashboard/audit-logs': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/dashboard/emergency': ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'VOLUNTEER', 'MISSION_MARSHAL'],
  '/dashboard/test-mode': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/dashboard/super-admin': ['SUPER_ADMIN'],
  '/dashboard/event-head': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/dashboard/arena-head': ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD'],
  '/dashboard/access-officer': ['SUPER_ADMIN', 'EVENT_HEAD', 'ACCESS_OFFICER'],
  '/dashboard/mission-marshal': ['SUPER_ADMIN', 'EVENT_HEAD', 'MISSION_MARSHAL'],
  '/dashboard/judge': ['SUPER_ADMIN', 'EVENT_HEAD', 'JUDGE'],
  '/dashboard/volunteer': ['SUPER_ADMIN', 'EVENT_HEAD', 'VOLUNTEER'],
};

const API_ROLE_PERMISSIONS: Record<string, string[]> = {
  '/api/clock': ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD'],
  '/api/teams': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/api/judging': ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'JUDGE'],
  '/api/logs/audit': ['SUPER_ADMIN', 'EVENT_HEAD'],
  '/api/emergency/paper-submission': ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'VOLUNTEER', 'MISSION_MARSHAL'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('mission_control_token')?.value;
  const session = token ? parseJwtEdge(token) : null;

  // 1. SECURITY FOR DASHBOARD ROUTES
  for (const routePrefix in ROLE_PERMISSIONS) {
    if (pathname.startsWith(routePrefix)) {
      if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      const allowedRoles = ROLE_PERMISSIONS[routePrefix];
      if (session.role !== 'SUPER_ADMIN' && !allowedRoles.includes(session.role)) {
        const url = req.nextUrl.clone();
        url.pathname = session.role === 'PARTICIPANT' ? '/dashboard/participant' : '/dashboard/live';
        return NextResponse.redirect(url);
      }
    }
  }

  // 2. SECURITY FOR RESTRICTED API ENDPOINTS (POST/PUT/DELETE)
  if (req.method !== 'GET') {
    for (const apiPrefix in API_ROLE_PERMISSIONS) {
      if (pathname.startsWith(apiPrefix)) {
        if (!session) {
          return NextResponse.json({ error: 'UNAUTHORIZED: Authentication token required.' }, { status: 401 });
        }
        const allowedRoles = API_ROLE_PERMISSIONS[apiPrefix];
        if (session.role !== 'SUPER_ADMIN' && !allowedRoles.includes(session.role)) {
          return NextResponse.json({ error: `FORBIDDEN: Role ${session.role} cannot modify ${apiPrefix}.` }, { status: 403 });
        }
      }
    }
  }

  // 3. SECURITY HEADERS FOR ALL RESPONSES
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
