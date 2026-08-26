import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventCode, teamName, leaderName, memberNames, contactEmail, contactPhone } = body;

    if (!eventCode || !teamName || !leaderName) {
      return NextResponse.json({ error: 'Event selection, Team Name, and Team Leader Name are required.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { code: eventCode },
      include: { teams: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Invalid event selected.' }, { status: 404 });
    }

    // Auto-generate next teamCode (e.g. EM-26, UC-26)
    const existingCount = event.teams.length;
    const nextNum = existingCount + 1;
    const codeNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    const teamCode = `${eventCode}-${codeNum}`;

    // Generate secure random QR token
    const qrToken = `tok_${eventCode.toLowerCase()}${codeNum}_` + Math.random().toString(36).substring(2, 10);

    const membersArray = [leaderName];
    if (Array.isArray(memberNames)) {
      memberNames.forEach((m) => {
        if (m && String(m).trim()) membersArray.push(String(m).trim());
      });
    }

    const newTeam = await prisma.team.create({
      data: {
        eventId: event.id,
        teamCode,
        teamName: teamName.trim(),
        members: JSON.stringify(membersArray),
        qrToken,
        status: 'ACTIVE',
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: 'public_registration',
        actorRole: 'PARTICIPANT',
        action: 'PUBLIC_TEAM_REGISTERED',
        target: `TEAM_${newTeam.teamCode}`,
        newValue: `Team ${newTeam.teamName} (${newTeam.teamCode}) self-registered. Leader: ${leaderName}. Contact: ${contactEmail || contactPhone || 'N/A'}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'local',
      },
    });

    return NextResponse.json({
      success: true,
      team: {
        id: newTeam.id,
        teamCode: newTeam.teamCode,
        teamName: newTeam.teamName,
        members: membersArray,
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
