import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Engineering Day — Mission Control database seed...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.accessLog.deleteMany();
  await prisma.scoreItem.deleteMany();
  await prisma.score.deleteMany();
  await prisma.submissionAnswer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.missionField.deleteMany();
  await prisma.rubric.deleteMany();
  await prisma.missionRound.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.team.deleteMany();
  await prisma.eventClockState.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tieBreakConfig.deleteMany();

  const hashedDefaultPassword = await bcrypt.hash('admin123', 10);
  const hashedStaffPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  console.log('👤 Seeding default role-based users...');
  const usersData = [
    { name: 'Super Admin', email: 'admin@missioncontrol.org', passwordHash: hashedDefaultPassword, role: 'SUPER_ADMIN' },
    { name: 'Dr. Sarah Connor (Event Head)', email: 'eventhead@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'EVENT_HEAD' },
    { name: 'Prof. Alan Turing (Arena Head A)', email: 'arenahead@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'ARENA_HEAD' },
    { name: 'Officer Marcus Vance (Access Officer)', email: 'access@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'ACCESS_OFFICER' },
    { name: 'Marshal Elena Rostova (Mission Marshal)', email: 'marshal@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'MISSION_MARSHAL' },
    { name: 'Dr. Viktor Vance (Chief Judge)', email: 'judge1@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'JUDGE' },
    { name: 'Prof. Evelyn Reed (Evaluator Judge)', email: 'judge2@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'JUDGE' },
    { name: 'Alex Rivera (Volunteer Officer)', email: 'volunteer@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'VOLUNTEER' },
    { name: 'Team EM-01 Lead (Participant)', email: 'participant@missioncontrol.org', passwordHash: hashedStaffPassword, role: 'PARTICIPANT' },
  ];

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }

  // 2. Create Events
  console.log('🏆 Seeding events...');
  const emEvent = await prisma.event.create({
    data: {
      code: 'EM',
      title: "ENGINEER'S MIND",
      description: "Premier analytical engineering competition testing algorithmic logic, structural resilience, and system diagnostics.",
      status: 'NOT_STARTED',
    },
  });

  const ucEvent = await prisma.event.create({
    data: {
      code: 'UC',
      title: 'ENGINEERING UNDERCOVER',
      description: 'High-stakes covert tactical engineering challenge involving reverse engineering, signal decryption, and threat matrix mitigation.',
      status: 'NOT_STARTED',
    },
  });

  // 3. Create Event Clock States
  await prisma.eventClockState.create({
    data: {
      eventId: emEvent.id,
      status: 'NOT_STARTED',
      totalPausedSeconds: 0,
      simulatedTimeOffsetSeconds: 0,
    },
  });

  await prisma.eventClockState.create({
    data: {
      eventId: ucEvent.id,
      status: 'NOT_STARTED',
      totalPausedSeconds: 0,
      simulatedTimeOffsetSeconds: 0,
    },
  });

  // Tie-Break Config
  await prisma.tieBreakConfig.create({
    data: {
      eventId: emEvent.id,
      priorityRule: 'FINAL_ROUND_FIRST,REASONING_SCORE_SECOND,EARLIEST_SUBMISSION_THIRD,EVENT_HEAD_DECISION',
    },
  });

  await prisma.tieBreakConfig.create({
    data: {
      eventId: ucEvent.id,
      priorityRule: 'FINAL_ROUND_FIRST,REASONING_SCORE_SECOND,EARLIEST_SUBMISSION_THIRD,EVENT_HEAD_DECISION',
    },
  });

  // 4. Create Teams (EM-01 to EM-25, UC-01 to UC-25)
  console.log('👥 Seeding Teams (EM-01 to EM-25 & UC-01 to UC-25)...');
  
  const sampleTeamNamesEM = [
    'Apex Innovators', 'Quantum Mechanics', 'Cyber Dynamics', 'Titan Structures', 'Neural Nets',
    'Vector Operations', 'Entropy Destroyers', 'Pulse Engineers', 'Prisma Core', 'Kinetic Force',
    'Aero Dynamics', 'Circuit Breakers', 'Logic Bomb Squad', 'Byte Crafters', 'Synapse Guild',
    'Hyperion Tech', 'Stellar Mechanics', 'Vortex Systems', 'Binary Pioneers', 'Omega Lab',
    'Helix Forge', 'Nexus Guild', 'Ignition Point', 'Zenith Engineers', 'Matrix Coders'
  ];

  for (let i = 1; i <= 25; i++) {
    const codeNum = i < 10 ? `0${i}` : `${i}`;
    const teamCode = `EM-${codeNum}`;
    const token = `tok_em${codeNum}_` + Math.random().toString(36).substring(2, 10);
    
    await prisma.team.create({
      data: {
        eventId: emEvent.id,
        teamCode,
        teamName: sampleTeamNamesEM[i - 1] || `Team ${teamCode}`,
        members: JSON.stringify([`Leader ${teamCode}`, `Engineer B`, `Engineer C`]),
        qrToken: token,
        status: 'ACTIVE',
      },
    });
  }

  const sampleTeamNamesUC = [
    'Shadow Protocols', 'Cipher Ops', 'Phantom Signals', 'Stealth Grid', 'Zero Day Squad',
    'Black Hat Breach', 'Spectre Engineers', 'Covert Tech', 'Vanguard Unit', 'Echo Command',
    'Dark Fiber', 'Ghost Systems', 'Oblivion Ops', 'Nightfall Cyber', 'Viper Tactical',
    'Ironclad Unit', 'Rogue Code', 'Sentinel Shield', 'Aegis Intel', 'Null Pointer',
    'Eclipse Tactics', 'Vector Stealth', 'Mirage Labs', 'Apex Surveillance', 'Omega Contingency'
  ];

  for (let i = 1; i <= 25; i++) {
    const codeNum = i < 10 ? `0${i}` : `${i}`;
    const teamCode = `UC-${codeNum}`;
    const token = `tok_uc${codeNum}_` + Math.random().toString(36).substring(2, 10);
    
    await prisma.team.create({
      data: {
        eventId: ucEvent.id,
        teamCode,
        teamName: sampleTeamNamesUC[i - 1] || `Team ${teamCode}`,
        members: JSON.stringify([`Agent ${teamCode}`, `Tactical B`, `Tactical C`]),
        qrToken: token,
        status: 'ACTIVE',
      },
    });
  }

  // 5. Create Missions & Structured Fields & Rubrics for Engineer's Mind
  console.log("🎯 Seeding Missions, Structured Fields, and Rubrics for ENGINEER'S MIND...");
  
  const emMissionsData = [
    { code: 'EM-01', title: 'Logic Architecture & Circuit Analysis', pts: 20 },
    { code: 'EM-02', title: 'Structural Diagnostics & Load Balancing', pts: 20 },
    { code: 'EM-03', title: 'Algorithmic Efficiency & Data Pipelines', pts: 20 },
    { code: 'EM-04', title: 'Cyber-Physical Systems Security', pts: 20 },
    { code: 'EM-F', title: 'Grand Mission: Autonomous Smart Grid Design', pts: 25 },
  ];

  // Base reference date for timing (Today 10:15 AM)
  const baseDate = new Date();
  baseDate.setHours(10, 15, 0, 0);

  let roundOffsetMinutes = 0;

  for (let idx = 0; idx < emMissionsData.length; idx++) {
    const mData = emMissionsData[idx];
    const mission = await prisma.mission.create({
      data: {
        eventId: emEvent.id,
        missionCode: mData.code,
        title: mData.title,
        description: `Official problem set for ${mData.code}. Refer to your physical sealed packet.`,
        instructions: 'Open your physical sealed packet after clearance is granted. Submit final answers below before time expires.',
        totalPoints: mData.pts,
      },
    });

    // Structured fields
    await prisma.missionField.createMany({
      data: [
        {
          missionId: mission.id,
          fieldKey: 'problem_statement',
          label: 'Primary Engineering Failure / Bottleneck Identification',
          fieldType: 'SHORT_TEXT',
          required: true,
          order: 1,
        },
        {
          missionId: mission.id,
          fieldKey: 'technical_strategy',
          label: 'Detailed Technical Methodology & Step-by-Step Resolution',
          fieldType: 'LONG_TEXT',
          required: true,
          order: 2,
        },
        {
          missionId: mission.id,
          fieldKey: 'subsystem_selection',
          label: 'Recommended Mitigation Architecture Strategy',
          fieldType: 'MCQ',
          options: JSON.stringify(['Redundant Parallel Topology', 'Cascading Feedback Suppression', 'Fail-Safe Isolation Barrier', 'Dynamic Frequency Scaling']),
          required: true,
          order: 3,
        },
        {
          missionId: mission.id,
          fieldKey: 'evidence_calculation',
          label: 'Diagnostic Calculations / Equation Evidence Summary',
          fieldType: 'EVIDENCE',
          required: true,
          order: 4,
        },
        {
          missionId: mission.id,
          fieldKey: 'risk_justification',
          label: 'Safety, Margin of Error & Failure Mode Justification',
          fieldType: 'JUSTIFICATION',
          required: true,
          order: 5,
        },
        {
          missionId: mission.id,
          fieldKey: 'confidence_rating',
          label: 'Team Solution Confidence Level (1 = Low, 5 = Maximum)',
          fieldType: 'CONFIDENCE',
          options: JSON.stringify(['1', '2', '3', '4', '5']),
          required: true,
          order: 6,
        },
      ],
    });

    // Rubrics (Total 20 marks: 4 + 5 + 4 + 4 + 3)
    await prisma.rubric.createMany({
      data: [
        { missionId: mission.id, criteria: 'Problem Identification', maxMarks: 4, weight: 1.0 },
        { missionId: mission.id, criteria: 'Technical Reasoning & Logic', maxMarks: 5, weight: 1.0 },
        { missionId: mission.id, criteria: 'Calculations & Evidence', maxMarks: 4, weight: 1.0 },
        { missionId: mission.id, criteria: 'Decision Strategy & Safety Margin', maxMarks: 4, weight: 1.0 },
        { missionId: mission.id, criteria: 'Clarity & Engineering Rigor', maxMarks: 3, weight: 1.0 },
      ],
    });

    // Schedule Rounds: 20 mins each
    const startTime = new Date(baseDate.getTime() + roundOffsetMinutes * 60 * 1000);
    const duration = mData.code.includes('-F') ? 25 : 20;
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    await prisma.missionRound.create({
      data: {
        eventId: emEvent.id,
        missionId: mission.id,
        roundNumber: idx + 1,
        startTime,
        endTime,
        durationMinutes: duration,
        status: 'SCHEDULED',
      },
    });

    roundOffsetMinutes += duration;
  }

  // 6. Create Missions for Engineering Undercover
  console.log('🕵️ Seeding Missions for ENGINEERING UNDERCOVER...');
  
  const ucMissionsData = [
    { code: 'UC-01', title: 'Infiltration: Cipher Decryption & Forensic Analysis', pts: 20 },
    { code: 'UC-02', title: 'Covert Protocol: Signal Triangulation & RF Analysis', pts: 20 },
    { code: 'UC-03', title: 'Stealth Operations: Micro-Robotics Navigation', pts: 20 },
    { code: 'UC-04', title: 'Counter-Intelligence: Reverse Engineering Threat Matrix', pts: 20 },
    { code: 'UC-F', title: 'Final Showdown: Breach Containment & Quantum Extraction', pts: 25 },
  ];

  roundOffsetMinutes = 0;

  for (let idx = 0; idx < ucMissionsData.length; idx++) {
    const mData = ucMissionsData[idx];
    const mission = await prisma.mission.create({
      data: {
        eventId: ucEvent.id,
        missionCode: mData.code,
        title: mData.title,
        description: `Covert operative task brief for ${mData.code}. Consult physical encrypted file.`,
        instructions: 'Open your physical sealed packet once clearance is confirmed. Submit mission debrief answers below.',
        totalPoints: mData.pts,
      },
    });

    // Structured fields
    await prisma.missionField.createMany({
      data: [
        {
          missionId: mission.id,
          fieldKey: 'threat_vector',
          label: 'Primary Threat Vector / Anomalous Signature Discovered',
          fieldType: 'SHORT_TEXT',
          required: true,
          order: 1,
        },
        {
          missionId: mission.id,
          fieldKey: 'countermeasure_plan',
          label: 'Operational Countermeasure Strategy & Protocol Execution',
          fieldType: 'LONG_TEXT',
          required: true,
          order: 2,
        },
        {
          missionId: mission.id,
          fieldKey: 'containment_mode',
          label: 'Selected Breach Containment Protocol',
          fieldType: 'MCQ',
          options: JSON.stringify(['Air-Gapped Isolation', 'Cryptographic Jamming Vector', 'Electromagnetic Shielding', 'Sub-Node Reset Sequence']),
          required: true,
          order: 3,
        },
        {
          missionId: mission.id,
          fieldKey: 'forensic_evidence',
          label: 'Decrypted Key / Mathematical Hash Evidence',
          fieldType: 'EVIDENCE',
          required: true,
          order: 4,
        },
        {
          missionId: mission.id,
          fieldKey: 'tactical_justification',
          label: 'Operational Risk & Collateral Mitigation Rationale',
          fieldType: 'JUSTIFICATION',
          required: true,
          order: 5,
        },
        {
          missionId: mission.id,
          fieldKey: 'confidence_rating',
          label: 'Operative Confidence Rating (1-5)',
          fieldType: 'CONFIDENCE',
          options: JSON.stringify(['1', '2', '3', '4', '5']),
          required: true,
          order: 6,
        },
      ],
    });

    // Rubrics
    await prisma.rubric.createMany({
      data: [
        { missionId: mission.id, criteria: 'Threat Identification', maxMarks: 4, weight: 1.0 },
        { missionId: mission.id, criteria: 'Technical Reasoning & Logic', maxMarks: 5, weight: 1.0 },
        { missionId: mission.id, criteria: 'Forensic Evidence & Hash Accuracy', maxMarks: 4, weight: 1.0 },
        { missionId: mission.id, criteria: 'Containment Strategy', maxMarks: 4, weight: 1.0 },
        { missionId: mission.id, criteria: 'Debrief Precision & Rigor', maxMarks: 3, weight: 1.0 },
      ],
    });

    // Schedule Rounds
    const startTime = new Date(baseDate.getTime() + roundOffsetMinutes * 60 * 1000);
    const duration = mData.code.includes('-F') ? 25 : 20;
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    await prisma.missionRound.create({
      data: {
        eventId: ucEvent.id,
        missionId: mission.id,
        roundNumber: idx + 1,
        startTime,
        endTime,
        durationMinutes: duration,
        status: 'SCHEDULED',
      },
    });

    roundOffsetMinutes += duration;
  }

  // 7. Seed initial audit log
  await prisma.auditLog.create({
    data: {
      actorId: 'system',
      actorRole: 'SUPER_ADMIN',
      action: 'SYSTEM_INITIALIZED',
      target: 'DATABASE',
      newValue: 'Seeded 50 teams (EM-01..25, UC-01..25), 10 missions, 10 rounds, rubrics, and structured fields.',
    },
  });

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
