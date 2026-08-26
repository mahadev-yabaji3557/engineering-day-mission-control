'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Clock,
  Users,
  Printer,
  FileText,
  Award,
  Trophy,
  ShieldCheck,
  History,
  AlertTriangle,
  Zap,
  BookOpen,
  Lock,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSession(data.user);

          // STRICT ACCESS GUARD FOR PARTICIPANTS:
          // If role is PARTICIPANT and trying to access administrative routes, redirect to participant dashboard!
          const adminRoutes = [
            '/dashboard/live',
            '/dashboard/clock',
            '/dashboard/teams',
            '/dashboard/passes',
            '/dashboard/submissions',
            '/dashboard/judging',
            '/dashboard/access-logs',
            '/dashboard/audit-logs',
            '/dashboard/super-admin',
            '/dashboard/event-head',
            '/dashboard/arena-head',
            '/dashboard/test-mode',
          ];

          if (data.user.role === 'PARTICIPANT' && adminRoutes.includes(pathname)) {
            router.replace('/dashboard/participant');
          }
        } else {
          setSession(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname, router]);

  const navItems = [
    { href: '/dashboard/live', label: '1. Live Mission Control', icon: Activity, roles: ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD'] },
    { href: '/dashboard/clock', label: '2. Master Clock & Schedule', icon: Clock, roles: ['SUPER_ADMIN', 'EVENT_HEAD'] },
    { href: '/dashboard/teams', label: '3. Teams & QR Passes', icon: Users, roles: ['SUPER_ADMIN', 'EVENT_HEAD'] },
    { href: '/dashboard/passes', label: '4. Printable CR80 Passes', icon: Printer, roles: ['SUPER_ADMIN', 'EVENT_HEAD'] },
    { href: '/dashboard/submissions', label: '5. Submissions Manager', icon: FileText, roles: ['SUPER_ADMIN', 'EVENT_HEAD', 'JUDGE'] },
    { href: '/dashboard/judging', label: '6. Rubric Judging Portal', icon: Award, roles: ['SUPER_ADMIN', 'EVENT_HEAD', 'JUDGE'] },
    { href: '/dashboard/leaderboard', label: '7. Leaderboard Standings', icon: Trophy, roles: ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'JUDGE', 'VOLUNTEER', 'PARTICIPANT'] },
    { href: '/dashboard/access-logs', label: '8. Access & Packet Logs', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'ACCESS_OFFICER', 'MISSION_MARSHAL'] },
    { href: '/dashboard/audit-logs', label: '9. System Audit Log', icon: History, roles: ['SUPER_ADMIN', 'EVENT_HEAD'] },
    { href: '/dashboard/emergency', label: '10. Emergency Backup', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'VOLUNTEER', 'MISSION_MARSHAL'] },
    { href: '/dashboard/test-mode', label: '11. Test Mode (Time Warp)', icon: Zap, roles: ['SUPER_ADMIN', 'EVENT_HEAD'] },
    { href: '/dashboard/guide', label: '12. Day-of-Event Quick Guide', icon: BookOpen, roles: ['SUPER_ADMIN', 'EVENT_HEAD', 'ARENA_HEAD', 'ACCESS_OFFICER', 'MISSION_MARSHAL', 'JUDGE', 'VOLUNTEER'] },
  ];

  // Filter navigation items by user role
  const userRole = session?.role || 'GUEST';
  const filteredNavItems = navItems.filter((item) => userRole === 'SUPER_ADMIN' || item.roles.includes(userRole));

  // IF USER IS A PARTICIPANT: DO NOT SHOW ADMIN SIDEBAR! Render clean single column.
  if (userRole === 'PARTICIPANT') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-3 bg-slate-900 border border-slate-800 text-rose-300 text-xs font-mono rounded-2xl flex items-center justify-between mb-6">
          <span className="font-bold flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>PARTICIPANT ISOLATED SESSION — UNAUTHORIZED DATA HIDDEN</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">TEAM CLEARANCE ONLY</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation for Staff Roles */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl sticky top-20">
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
              STAFF COMMAND NAVIGATION ({userRole})
            </div>
            <nav className="space-y-1 pt-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-blue-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
