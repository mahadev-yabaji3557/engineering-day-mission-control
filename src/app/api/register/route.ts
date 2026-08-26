import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventCode, teamName, leaderName, memberNames, contactEmail, contactPhone } = body;

    if (!eventCode || !teamName || !leaderName) {
      return NextResponse.json({ error: 'Event selection, Team Name, and Team Leader Name are required.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
    });

    if (!event) {
      return NextResponse.json({ error: 'Invalid event selected.' }, { status: 404 });
    }

    const existingTeams = await prisma.team.findMany({
      where: { eventCode },
    });

    // Auto-generate next teamCode (e.g. EM-26, UC-26)
    const nextNum = existingTeams.length + 1;
    const codeNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    const teamCode = `${eventCode}-${codeNum}`;

    // Generate secure random QR token
    const qrToken = `tok_${eventCode.toLowerCase()}${codeNum}_` + Math.random().toString(36).substring(2, 10);

    const membersArray: string[] = [];
    if (Array.isArray(memberNames)) {
      memberNames.forEach((m) => {
        if (m && String(m).trim()) membersArray.push(String(m).trim());
      });
    }

    const newTeam = await prisma.team.create({
      data: {
        eventCode,
        teamCode,
        teamName: teamName.trim(),
        leaderName: leaderName.trim(),
        memberNames: JSON.stringify(membersArray),
        contactEmail: contactEmail ? String(contactEmail).trim() : null,
        contactPhone: contactPhone ? String(contactPhone).trim() : null,
        qrToken,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorEmail: contactEmail || 'public_registration',
        actorRole: 'PARTICIPANT',
        action: 'PUBLIC_TEAM_REGISTERED',
        targetEntity: `TEAM_${newTeam.teamCode}`,
        details: `Team ${newTeam.teamName} (${newTeam.teamCode}) self-registered. Leader: ${leaderName}. Contact: ${contactEmail || contactPhone || 'N/A'}`,
      },
    });

    return NextResponse.json({
      success: true,
      team: {
        id: newTeam.id,
        teamCode: newTeam.teamCode,
        teamName: newTeam.teamName,
        members: [leaderName, ...membersArray],
        qrToken: newTeam.qrToken,
        eventTitle: event.title,
        scanUrl: `/scan/${newTeam.qrToken}`,
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
