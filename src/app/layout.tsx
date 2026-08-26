import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ENGINEERING DAY — MISSION CONTROL',
  description: 'College Engineering Day Competition Command Center for Engineer’s Mind & Engineering Undercover.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
          ENGINEERING DAY — MISSION CONTROL v1.0 • SERVER TIME SYNCHRONIZED • ZERO CLIENT TIME TRUST
        </footer>
      </body>
    </html>
  );
}
