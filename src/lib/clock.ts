import { prisma } from './db';

export interface ClearanceResult {
  qrStatus: 'VALID' | 'REVOKED' | 'INVALID';
  clearanceStatus: 'GRANTED' | 'LOCKED' | 'PAUSED' | 'CLOSED' | 'DENIED' | 'NOT_STARTED';
  eventTitle?: string;
  teamId?: string;
  teamCode?: string;
  teamName?: string;
  members?: string[];
  missionId?: string;
  missionCode?: string;
  missionTitle?: string;
  unlockTime?: string;
  roundEndTime?: string;
  timeRemainingSeconds?: number;
  message?: string;
  emergencyNotice?: string | null;
  packetOpened?: boolean;
  packetOpenedAt?: string | null;
  submissionStatus?: 'NOT_SUBMITTED' | 'DRAFT' | 'SUBMITTED' | 'LATE' | 'LOCKED';
  submittedAt?: string | null;
}

export async function getEventClock(eventId: string) {
  let clockState = await prisma.eventClockState.findUnique({
    where: { eventId },
  });

  if (!clockState) {
    clockState = await prisma.eventClockState.create({
      data: {
        eventId,
        status: 'NOT_STARTED',
        totalPausedSeconds: 0,
        simulatedTimeOffsetSeconds: 0,
      },
    });
  }

  const now = new Date();
  // Effective event time incorporates simulated time warp offset (in seconds)
  const effectiveTimeMs = now.getTime() + (clockState.simulatedTimeOffsetSeconds * 1000);
  const effectiveTime = new Date(effectiveTimeMs);

  return {
    clockState,
    effectiveTime,
    simulatedOffsetSeconds: clockState.simulatedTimeOffsetSeconds,
    status: clockState.status,
    emergencyNotice: clockState.emergencyNotice,
    allowSubmissionsDuringPause: clockState.allowSubmissionsDuringPause,
  };
}

export async function evaluateTeamClearance(qrToken: string): Promise<ClearanceResult> {
  const team = await prisma.team.findUnique({
    where: { qrToken },
    include: { event: true },
  });

  if (!team) {
    return {
      qrStatus: 'INVALID',
      clearanceStatus: 'DENIED',
      message: 'INVALID TEAM ACCESS: Unrecognized QR token.',
    };
  }

  if (team.status === 'REVOKED') {
    return {
      qrStatus: 'REVOKED',
      clearanceStatus: 'DENIED',
      teamCode: team.teamCode,
      message: 'REVOKED PASS: This QR Team Pass has been deactivated by Event Head.',
    };
  }

  const { effectiveTime, status: clockStatus, emergencyNotice } = await getEventClock(team.eventId);

  let membersList: string[] = [];
  try {
    membersList = JSON.parse(team.members);
  } catch {
    membersList = [team.members];
  }

  if (clockStatus === 'PAUSED' || clockStatus === 'EMERGENCY_HOLD') {
    return {
      qrStatus: 'VALID',
      clearanceStatus: 'PAUSED',
      eventTitle: team.event.title,
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      members: membersList,
      message: clockStatus === 'EMERGENCY_HOLD' 
        ? 'EMERGENCY HOLD IN PROGRESS. Follow instructions from Arena Head.' 
        : 'EVENT TEMPORARILY PAUSED. Mission clock is stopped.',
      emergencyNotice,
    };
  }

  if (clockStatus === 'NOT_STARTED') {
    return {
      qrStatus: 'VALID',
      clearanceStatus: 'NOT_STARTED',
      eventTitle: team.event.title,
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      members: membersList,
      message: 'EVENT NOT STARTED. Please stand by for official opening.',
    };
  }

  // Find rounds for event
  const rounds = await prisma.missionRound.findMany({
    where: { eventId: team.eventId },
    include: { mission: true },
    orderBy: { roundNumber: 'asc' },
  });

  if (rounds.length === 0) {
    return {
      qrStatus: 'VALID',
      clearanceStatus: 'LOCKED',
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      message: 'No mission rounds configured for this event.',
    };
  }

  // Evaluate current round based strictly on effective server time
  let activeRound = rounds.find(
    (r) => effectiveTime >= new Date(r.startTime) && effectiveTime <= new Date(r.endTime)
  );

  // If no active round, find the upcoming locked round or completed round
  let upcomingRound = rounds.find((r) => effectiveTime < new Date(r.startTime));

  if (upcomingRound) {
    // Current time is before upcoming round
    const unlockTimeStr = new Date(upcomingRound.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      qrStatus: 'VALID',
      clearanceStatus: 'LOCKED',
      eventTitle: team.event.title,
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      members: membersList,
      missionCode: upcomingRound.mission.missionCode,
      unlockTime: unlockTimeStr,
      message: `MISSION LOCKED: ${upcomingRound.mission.missionCode} opens at ${unlockTimeStr}.`,
    };
  }

  if (!activeRound) {
    // All rounds finished
    const lastRound = rounds[rounds.length - 1];
    return {
      qrStatus: 'VALID',
      clearanceStatus: 'CLOSED',
      eventTitle: team.event.title,
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      members: membersList,
      missionCode: lastRound.mission.missionCode,
      message: 'ALL EVENT MISSIONS HAVE BEEN COMPLETED.',
    };
  }

  // Active round found!
  const timeRemainingSeconds = Math.max(
    0,
    Math.floor((new Date(activeRound.endTime).getTime() - effectiveTime.getTime()) / 1000)
  );

  // Check packet opening status from access log
  const accessLog = await prisma.accessLog.findFirst({
    where: {
      teamId: team.id,
      missionId: activeRound.missionId,
      clearanceStatus: 'GRANTED',
    },
    orderBy: { timestamp: 'desc' },
  });

  // Check existing submission
  const submission = await prisma.submission.findFirst({
    where: {
      teamId: team.id,
      missionId: activeRound.missionId,
    },
  });

  return {
    qrStatus: 'VALID',
    clearanceStatus: 'GRANTED',
    eventTitle: team.event.title,
    teamId: team.id,
    teamCode: team.teamCode,
    teamName: team.teamName,
    members: membersList,
    missionId: activeRound.missionId,
    missionCode: activeRound.mission.missionCode,
    missionTitle: activeRound.mission.title,
    roundEndTime: activeRound.endTime.toISOString(),
    timeRemainingSeconds,
    packetOpened: accessLog?.packetOpened ?? false,
    packetOpenedAt: accessLog?.packetOpenedAt?.toISOString() ?? null,
    submissionStatus: submission
      ? (submission.status as ClearanceResult['submissionStatus'])
      : 'NOT_SUBMITTED',
    submittedAt: submission?.submittedAt.toISOString() ?? null,
    message: 'CLEARANCE GRANTED: Proceeds to your physical mission packet.',
  };
}
