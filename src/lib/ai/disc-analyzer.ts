import type { DISCProfile, AIServiceResponse } from '@/types/ai';

const DISC_ANALYSIS_PROMPT = `You are an expert behavioral psychologist specializing in DISC personality assessments. Analyze the candidate's responses and determine their DISC profile.

DISC Model:
- D (Dominance): Direct, results-oriented, decisive, competitive
- I (Influence): Enthusiastic, optimistic, collaborative, persuasive
- S (Steadiness): Patient, reliable, team player, supportive
- C (Conscientiousness): Analytical, detail-oriented, systematic, quality-focused

Return a JSON object with:
- dominance: score 0-100
- influence: score 0-100
- steadiness: score 0-100
- conscientiousness: score 0-100
- primaryType: the highest scoring type ("D", "I", "S", or "C")
- secondaryType: the second highest scoring type
- summary: 2-3 sentence personality summary
- workStyle: description of their work approach
- communicationTips: array of tips for communicating with this person
- strengths: array of workplace strengths
- challenges: array of potential challenges
- idealRoles: array of role types that suit this profile
- teamDynamics: how they interact in team settings`;

/**
 * Analyze DISC personality profile from assessment responses
 */
export async function analyzeDISCProfile(
  responses: { question: string; answer: string }[]
): Promise<AIServiceResponse<DISCProfile>> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback: generate a basic profile from keyword analysis
      return {
        success: true,
        data: generateFallbackProfile(responses),
        processingTime: Date.now() - startTime,
      };
    }

    const responsesText = responses
      .map((r, i) => `Q${i + 1}: ${r.question}\nA: ${r.answer}`)
      .join('\n\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: DISC_ANALYSIS_PROMPT },
          { role: 'user', content: `Analyze these responses:\n\n${responsesText}` },
        ],
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `OpenAI API error: ${response.status}`,
        processingTime: Date.now() - startTime,
      };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content) as DISCProfile;

    return {
      success: true,
      data: result,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze DISC profile',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Generate a basic DISC profile without AI when API key is not available
 */
function generateFallbackProfile(
  responses: { question: string; answer: string }[]
): DISCProfile {
  const text = responses.map((r) => r.answer).join(' ').toLowerCase();

  // Simple keyword-based scoring
  const dKeywords = ['lead', 'results', 'decisive', 'challenge', 'win', 'direct', 'control', 'goal'];
  const iKeywords = ['team', 'fun', 'collaborate', 'enthusiasm', 'creative', 'people', 'social', 'inspire'];
  const sKeywords = ['support', 'patient', 'reliable', 'stable', 'help', 'consistent', 'loyal', 'harmony'];
  const cKeywords = ['detail', 'accurate', 'quality', 'analyze', 'data', 'process', 'standard', 'precise'];

  const countKeywords = (keywords: string[]) =>
    keywords.reduce((count, kw) => count + (text.includes(kw) ? 1 : 0), 0);

  const dRaw = countKeywords(dKeywords);
  const iRaw = countKeywords(iKeywords);
  const sRaw = countKeywords(sKeywords);
  const cRaw = countKeywords(cKeywords);
  const total = Math.max(dRaw + iRaw + sRaw + cRaw, 1);

  const dominance = Math.round((dRaw / total) * 100) || 25;
  const influence = Math.round((iRaw / total) * 100) || 25;
  const steadiness = Math.round((sRaw / total) * 100) || 25;
  const conscientiousness = Math.round((cRaw / total) * 100) || 25;

  const scores = { D: dominance, I: influence, S: steadiness, C: conscientiousness };
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryType = sorted[0][0] as 'D' | 'I' | 'S' | 'C';
  const secondaryType = sorted[1][0] as 'D' | 'I' | 'S' | 'C';

  const profiles: Record<string, Partial<DISCProfile>> = {
    D: {
      summary: 'Results-driven individual who thrives on challenges and making quick decisions.',
      workStyle: 'Direct and decisive, prefers autonomy and control over projects.',
      communicationTips: ['Be direct and to the point', 'Focus on results and outcomes', 'Avoid unnecessary details'],
      strengths: ['Leadership', 'Decision-making', 'Goal-oriented', 'Problem-solving'],
      challenges: ['May overlook details', 'Can be impatient', 'May dominate discussions'],
      idealRoles: ['Team Lead', 'Project Manager', 'Entrepreneur', 'Executive'],
      teamDynamics: 'Natural leader who drives the team toward results, may need to practice active listening.',
    },
    I: {
      summary: 'Enthusiastic communicator who builds relationships and inspires others.',
      workStyle: 'Collaborative and creative, energized by brainstorming and team interaction.',
      communicationTips: ['Be enthusiastic and positive', 'Allow time for discussion', 'Recognize their contributions'],
      strengths: ['Communication', 'Creativity', 'Motivation', 'Networking'],
      challenges: ['May lack follow-through', 'Can be disorganized', 'May avoid conflict'],
      idealRoles: ['Sales', 'Marketing', 'Public Relations', 'Customer Success'],
      teamDynamics: 'Energizes the team and fosters collaboration, may need help with structure.',
    },
    S: {
      summary: 'Reliable team player who values stability and supports colleagues consistently.',
      workStyle: 'Patient and methodical, prefers a stable environment with clear expectations.',
      communicationTips: ['Be patient and supportive', 'Provide clear expectations', 'Give advance notice of changes'],
      strengths: ['Reliability', 'Teamwork', 'Patience', 'Consistency'],
      challenges: ['May resist change', 'Can be indecisive', 'May avoid confrontation'],
      idealRoles: ['Support Specialist', 'HR', 'Operations', 'Quality Assurance'],
      teamDynamics: 'Stabilizing force in the team, builds trust and maintains harmony.',
    },
    C: {
      summary: 'Analytical thinker who ensures accuracy and maintains high quality standards.',
      workStyle: 'Systematic and detail-oriented, driven by data and precise methodology.',
      communicationTips: ['Provide data and evidence', 'Be precise and accurate', 'Allow time for analysis'],
      strengths: ['Attention to detail', 'Analysis', 'Quality focus', 'Systematic thinking'],
      challenges: ['May over-analyze', 'Can be critical', 'May struggle with ambiguity'],
      idealRoles: ['Data Analyst', 'Engineer', 'Accountant', 'Research Scientist'],
      teamDynamics: 'Ensures quality and accuracy, may need encouragement to share ideas early.',
    },
  };

  const profile = profiles[primaryType];

  return {
    dominance,
    influence,
    steadiness,
    conscientiousness,
    primaryType,
    secondaryType,
    summary: profile.summary || '',
    workStyle: profile.workStyle || '',
    communicationTips: profile.communicationTips || [],
    strengths: profile.strengths || [],
    challenges: profile.challenges || [],
    idealRoles: profile.idealRoles || [],
    teamDynamics: profile.teamDynamics || '',
  };
}
