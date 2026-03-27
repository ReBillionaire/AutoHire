import Anthropic from '@anthropic-ai/sdk';

interface AnswerData {
  question_id: string;
  question_text: string;
  question_type: string;
  answer: string | number | string[];
}

interface DISCScores {
  dominance: number;
  influence: number;
  steadiness: number;
  conscientiousness: number;
}

interface DISCProfile {
  primary: 'D' | 'I' | 'S' | 'C';
  secondary: 'D' | 'I' | 'S' | 'C';
  scores: DISCScores;
  report: DISCReport;
}

interface DISCReport {
  title: string;
  primaryDescription: string;
  communicationStyle: string;
  workStyle: string;
  strengths: string[];
  blindSpots: string[];
  teamDynamics: string;
  interviewApproach: string;
  compatibilityFactors: {
    bestWith: string[];
    challengesWith: string[];
  };
}

const client = new Anthropic();

export async function analyzeResponses(answers: AnswerData[]): Promise<DISCScores> {
  // Initial scoring based on answer patterns
  const scores: DISCScores = {
    dominance: 0,
    influence: 0,
    steadiness: 0,
    conscientiousness: 0,
  };

  // DISC scoring logic based on typical psychometric patterns
  for (const answer of answers) {
    // Map response patterns to DISC dimensions
    if (answer.question_type === 'likert' || answer.question_type === 'forced_choice') {
      const scoreValue = typeof answer.answer === 'number' ? answer.answer : 0;

      // Scoring heuristics based on common DISC assessment patterns
      if (answer.question_text.toLowerCase().includes('lead') ||
          answer.question_text.toLowerCase().includes('competitive') ||
          answer.question_text.toLowerCase().includes('direct')) {
        scores.dominance += scoreValue * 0.8;
      }

      if (answer.question_text.toLowerCase().includes('social') ||
          answer.question_text.toLowerCase().includes('influence') ||
          answer.question_text.toLowerCase().includes('persuade')) {
        scores.influence += scoreValue * 0.8;
      }

      if (answer.question_text.toLowerCase().includes('stable') ||
          answer.question_text.toLowerCase().includes('team') ||
          answer.question_text.toLowerCase().includes('support')) {
        scores.steadiness += scoreValue * 0.8;
      }

      if (answer.question_text.toLowerCase().includes('detail') ||
          answer.question_text.toLowerCase().includes('accuracy') ||
          answer.question_text.toLowerCase().includes('systematic')) {
        scores.conscientiousness += scoreValue * 0.8;
      }
    }
  }

  // Normalize scores to 0-100 range
  const maxScore = Math.max(...Object.values(scores)) || 1;
  return {
    dominance: Math.round((scores.dominance / maxScore) * 100) || 25,
    influence: Math.round((scores.influence / maxScore) * 100) || 25,
    steadiness: Math.round((scores.steadiness / maxScore) * 100) || 25,
    conscientiousness: Math.round((scores.conscientiousness / maxScore) * 100) || 25,
  };
}

export function calculateDISCScores(scores: DISCScores): DISCScores {
  // Ensure scores sum proportionally if needed
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return {
      dominance: 25,
      influence: 25,
      steadiness: 25,
      conscientiousness: 25,
    };
  }

  // Normalize if needed
  if (total > 100) {
    const factor = 100 / total;
    return {
      dominance: Math.round(scores.dominance * factor),
      influence: Math.round(scores.influence * factor),
      steadiness: Math.round(scores.steadiness * factor),
      conscientiousness: Math.round(scores.conscientiousness * factor),
    };
  }

  return scores;
}

export function determinePrimaryProfile(
  scores: DISCScores
): { primary: 'D' | 'I' | 'S' | 'C'; secondary: 'D' | 'I' | 'S' | 'C' } {
  const entries = [
    { type: 'D' as const, score: scores.dominance },
    { type: 'I' as const, score: scores.influence },
    { type: 'S' as const, score: scores.steadiness },
    { type: 'C' as const, score: scores.conscientiousness },
  ];

  entries.sort((a, b) => b.score - a.score);

  return {
    primary: entries[0].type,
    secondary: entries[1].type,
  };
}

export async function generateDISCReport(
  answers: AnswerData[],
  scores: DISCScores,
  profile: { primary: 'D' | 'I' | 'S' | 'C'; secondary: 'D' | 'I' | 'S' | 'C' }
): Promise<DISCReport> {
  const answersText = answers
    .map(
      (a) =>
        `Q: ${a.question_text}\nA: ${typeof a.answer === 'string' ? a.answer : a.answer}`
    )
    .join('\n\n');

  const prompt = `You are an expert in DISC personality profiling and behavioral psychology.

Analyze these assessment responses and generate a comprehensive DISC personality report.

ASSESSMENT RESPONSES:
${answersText}

CALCULATED DISC SCORES:
- Dominance (D): ${scores.dominance}
- Influence (I): ${scores.influence}
- Steadiness (S): ${scores.steadiness}
- Conscientiousness (C): ${scores.conscientiousness}

PRIMARY PROFILE: ${profile.primary}
SECONDARY PROFILE: ${profile.secondary}

Generate a JSON response with this structure:
{
  "title": "Brief title like 'The Visionary Leader' or 'The Steady Team Player'",
  "primaryDescription": "2-3 sentence description of the primary DISC type and how it manifests in work",
  "communicationStyle": "How this person communicates with others, preferred channels, tone",
  "workStyle": "How they approach tasks, decision-making, and collaboration",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "blindSpots": ["potential blind spot 1", "potential blind spot 2", "potential blind spot 3"],
  "teamDynamics": "How they interact in teams, roles they gravitate toward, relationships",
  "interviewApproach": "Recommended approach for interviewing this candidate",
  "compatibilityFactors": {
    "bestWith": ["Type that works well with them", "Another compatible type"],
    "challengesWith": ["Type that may clash", "Another challenging combination"]
  }
}

Ensure the report is insightful, specific to the profile combination, and actionable for hiring teams.`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const report = JSON.parse(jsonText);
    return report as DISCReport;
  } catch (error) {
    console.error('Failed to parse DISC report:', error);

    // Return fallback report
    return generateFallbackReport(profile);
  }
}

function generateFallbackReport(profile: {
  primary: 'D' | 'I' | 'S' | 'C';
  secondary: 'D' | 'I' | 'S' | 'C';
}): DISCReport {
  const profileDescriptions = {
    D: {
      title: 'The Visionary Leader',
      description:
        'Dominance types are driven, results-oriented, and naturally take charge. They excel in competitive environments and are not afraid to make tough decisions quickly.',
      communication: 'Direct, concise, and results-focused. Prefers efficiency over pleasantries.',
      work: 'Task-oriented, competitive, and motivated by challenges. Seeks control and impact.',
    },
    I: {
      title: 'The Influencer',
      description:
        'Influence types are enthusiastic, persuasive, and thrive on connection. They excel at inspiring others and building relationships.',
      communication:
        'Warm, engaging, and persuasive. Uses storytelling and enthusiasm to connect.',
      work: 'People-oriented, creative, and energized by collaboration. Seeks recognition and approval.',
    },
    S: {
      title: 'The Steady Team Player',
      description:
        'Steadiness types are reliable, supportive, and patient. They excel at maintaining stability and building strong team cohesion.',
      communication:
        'Warm, patient, and supportive. Listens well and values harmony in communication.',
      work: 'Team-oriented, consistent, and motivated by helping others. Seeks stability and belonging.',
    },
    C: {
      title: 'The Analytical Perfectionist',
      description:
        'Conscientiousness types are detail-oriented, systematic, and accuracy-focused. They excel in complex analytical work and quality assurance.',
      communication:
        'Precise, thoughtful, and systematic. Prefers data and documented evidence.',
      work: 'Quality-focused, methodical, and motivated by accuracy. Seeks excellence and correctness.',
    },
  };

  const primary = profileDescriptions[profile.primary];

  return {
    title: primary.title,
    primaryDescription: primary.description,
    communicationStyle: primary.communication,
    workStyle: primary.work,
    strengths: getStrengthsForProfile(profile.primary),
    blindSpots: getBlindSpotsForProfile(profile.primary),
    teamDynamics: getTeamDynamicsForProfile(profile.primary),
    interviewApproach: getInterviewApproachForProfile(profile.primary),
    compatibilityFactors: getCompatibilityFactors(profile.primary),
  };
}

function getStrengthsForProfile(profile: 'D' | 'I' | 'S' | 'C'): string[] {
  const strengths = {
    D: [
      'Strategic thinking and vision',
      'Quick decision-making under pressure',
      'Strong leadership presence',
      'Drives results and accountability',
    ],
    I: [
      'Excellent communication and persuasion',
      'Natural networking ability',
      'Creative problem-solving',
      'Inspiring team motivation',
    ],
    S: [
      'Reliable and dependable team player',
      'Strong listening and empathy skills',
      'Patient conflict resolution',
      'Consistent follow-through',
    ],
    C: [
      'Attention to detail and accuracy',
      'Systematic analytical thinking',
      'Quality assurance focus',
      'Thorough documentation and planning',
    ],
  };

  return strengths[profile];
}

function getBlindSpotsForProfile(profile: 'D' | 'I' | 'S' | 'C'): string[] {
  const blindSpots = {
    D: [
      'May overlook team feelings in pursuit of goals',
      'Can be overly direct or blunt',
      'Impatience with slower processes',
      'Potential for excessive competitive behavior',
    ],
    I: [
      'May lose focus on details',
      'Over-promises without full follow-through',
      'Can be scattered across multiple projects',
      'May seek approval too much',
    ],
    S: [
      'May avoid necessary confrontation',
      'Can be too accommodating',
      'Resistance to change',
      'May lack assertiveness in own needs',
    ],
    C: [
      'May get stuck in analysis paralysis',
      'Can be overly critical of others',
      'May struggle with delegation',
      'Difficulty with ambiguity or gray areas',
    ],
  };

  return blindSpots[profile];
}

function getTeamDynamicsForProfile(profile: 'D' | 'I' | 'S' | 'C'): string {
  const dynamics = {
    D: 'In teams, D types naturally take leadership roles and drive action. They may clash with S types who move more slowly, but complement I types well through shared decisiveness.',
    I: 'In teams, I types build energy and enthusiasm. They often become natural communicators and relationship bridges. They may need C types to ensure follow-through.',
    S: 'In teams, S types provide stability and support. They excel at maintaining harmony and are the glue that holds teams together, but may need D types to push for change.',
    C: 'In teams, C types provide structure and quality control. They ensure details are not missed and work is accurate, but may slow down fast-paced D or I driven initiatives.',
  };

  return dynamics[profile];
}

function getInterviewApproachForProfile(profile: 'D' | 'I' | 'S' | 'C'): string {
  const approaches = {
    D: 'Be concise and results-focused. Present challenges and opportunities. Respect their time and get straight to the point. Ask about competitive achievements and how they overcame obstacles.',
    I: 'Build rapport and show genuine interest. Discuss team and company culture. Tell stories about the role impact. Ask about their network and how they motivate others.',
    S: 'Create a warm, relaxed environment. Emphasize team stability and support. Discuss company values and longevity. Ask about how they help others and maintain relationships.',
    C: 'Provide detailed job description and expectations. Be thorough and factual. Prepare detailed questions about process and quality. Ask about their systems and how they ensure accuracy.',
  };

  return approaches[profile];
}

function getCompatibilityFactors(profile: 'D' | 'I' | 'S' | 'C'): {
  bestWith: string[];
  challengesWith: string[];
} {
  const compatibility = {
    D: {
      bestWith: ['I (both driven and action-oriented)', 'C (balance urgency with quality)'],
      challengesWith: ['S (pace and pressure conflicts)'],
    },
    I: {
      bestWith: ['D (shared enthusiasm)', 'S (balance optimism with support)'],
      challengesWith: ['C (detail vs. big picture)'],
    },
    S: {
      bestWith: ['C (both process-oriented)', 'I (emotional support)'],
      challengesWith: ['D (fast pace stress)'],
    },
    C: {
      bestWith: ['S (shared thoroughness)', 'D (result clarity)'],
      challengesWith: ['I (spontaneity)'],
    },
  };

  return compatibility[profile];
}

export async function generateCompleteDISCProfile(answers: AnswerData[]): Promise<DISCProfile> {
  const scores = await analyzeResponses(answers);
  const normalizedScores = calculateDISCScores(scores);
  const profile = determinePrimaryProfile(normalizedScores);
  const report = await generateDISCReport(answers, normalizedScores, profile);

  return {
    primary: profile.primary,
    secondary: profile.secondary,
    scores: normalizedScores,
    report,
  };
}
