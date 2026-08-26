import { prisma } from './db';

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamCode: string;
  teamName: string;
  eventName: string;
  totalScore: number;
  completedMissions: number;
  finalRoundScore: number;
  reasoningScore: number;
  lastSubmissionTimestamp: number;
  tieBreakerApplied: boolean;
  tieBreakerReason?: string;
}

export async function calculateLeaderboard(eventId: string, isFinalMode: boolean = false): Promise<LeaderboardEntry[]> {
  const teams = await prisma.team.findMany({
    where: { eventId, status: 'ACTIVE' },
    include: { event: true },
  });

  const missions = await prisma.mission.findMany({
    where: { eventId },
    orderBy: { missionCode: 'asc' },
  });

  const finalMission = missions.find((m) => m.missionCode.includes('-F')) || missions[missions.length - 1];

  const scores = await prisma.score.findMany({
    where: {
      team: { eventId },
      ...(isFinalMode ? { status: 'FINALIZED' } : {}),
    },
    include: {
      scoreItems: {
        include: { rubric: true },
      },
      mission: true,
    },
  });

  const submissions = await prisma.submission.findMany({
    where: { team: { eventId } },
    orderBy: { submittedAt: 'asc' },
  });

  const entries: Omit<LeaderboardEntry, 'rank'>[] = teams.map((team) => {
    const teamScores = scores.filter((s) => s.teamId === team.id);
    const teamSubmissions = submissions.filter((s) => s.teamId === team.id);

    const totalScore = teamScores.reduce((acc, s) => acc + s.totalScore, 0);
    const completedMissions = new Set(teamScores.map((s) => s.missionId)).size;

    // Final round score
    const finalRoundScoreObj = teamScores.find((s) => s.missionId === finalMission?.id);
    const finalRoundScore = finalRoundScoreObj ? finalRoundScoreObj.totalScore : 0;

    // Reasoning score (sum of rubric items matching 'Reasoning' or 'Problem')
    let reasoningScore = 0;
    teamScores.forEach((score) => {
      score.scoreItems.forEach((item) => {
        if (
          item.rubric.criteria.toLowerCase().includes('reasoning') ||
          item.rubric.criteria.toLowerCase().includes('problem')
        ) {
          reasoningScore += item.marksGiven;
        }
      });
    });

    // Last valid submission timestamp
    const lastSub = teamSubmissions[teamSubmissions.length - 1];
    const lastSubmissionTimestamp = lastSub ? new Date(lastSub.submittedAt).getTime() : Infinity;

    return {
      teamId: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      eventName: team.event.title,
      totalScore: Number(totalScore.toFixed(2)),
      completedMissions,
      finalRoundScore: Number(finalRoundScore.toFixed(2)),
      reasoningScore: Number(reasoningScore.toFixed(2)),
      lastSubmissionTimestamp,
      tieBreakerApplied: false,
    };
  });

  // Sort with multi-tier tie breaker:
  // 1. Total score (descending)
  // 2. Final-round score (descending)
  // 3. Reasoning score (descending)
  // 4. Earlier valid final submission timestamp (ascending)
  entries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    // Tie-break Level 1: Final round score
    if (b.finalRoundScore !== a.finalRoundScore) {
      a.tieBreakerApplied = true;
      b.tieBreakerApplied = true;
      a.tieBreakerReason = `Tie broken by higher Final Round Score (${a.finalRoundScore} vs ${b.finalRoundScore})`;
      b.tieBreakerReason = `Tie broken by higher Final Round Score (${b.finalRoundScore} vs ${a.finalRoundScore})`;
      return b.finalRoundScore - a.finalRoundScore;
    }

    // Tie-break Level 2: Reasoning score
    if (b.reasoningScore !== a.reasoningScore) {
      a.tieBreakerApplied = true;
      b.tieBreakerApplied = true;
      a.tieBreakerReason = `Tie broken by higher Reasoning Rubric Score (${a.reasoningScore} vs ${b.reasoningScore})`;
      b.tieBreakerReason = `Tie broken by higher Reasoning Rubric Score (${b.reasoningScore} vs ${a.reasoningScore})`;
      return b.reasoningScore - a.reasoningScore;
    }

    // Tie-break Level 3: Submission timestamp (earlier is better)
    if (a.lastSubmissionTimestamp !== b.lastSubmissionTimestamp) {
      a.tieBreakerApplied = true;
      b.tieBreakerApplied = true;
      a.tieBreakerReason = `Tie broken by earlier submission time`;
      b.tieBreakerReason = `Tie broken by earlier submission time`;
      return a.lastSubmissionTimestamp - b.lastSubmissionTimestamp;
    }

    return 0;
  });

  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}
