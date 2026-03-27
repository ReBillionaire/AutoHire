/**
 * Video/Transcript Analyzer - Analyzes candidate communication from video transcripts
 * Uses OpenAI GPT-4 for detailed behavioral and communication assessment
 */

import { openai } from '../ai-clients';
import {
  VideoAnalysis,
  VideoAnalysisMetrics,
  KeyQuote,
  AIAnalysisError,
} from '@/types/ai';

const VIDEO_ANALYSIS_PROMPT = `You are an expert communication coach and HR interviewer with 15+ years of experience evaluating candidates through video interviews. Analyze the provided transcript to assess the candidate's communication effectiveness.

Score each dimension on a 0-100 scale:
1. Communication: Clarity of expression, articulation, grammatical accuracy
2. Confidence: Conviction in responses, minimal hedging, steady tone
3. Enthusiasm: Passion for the role/company, energy level, engagement
4. Professionalism: Appropriate tone, respect, business etiquette
5. Clarity: Directness of answers, absence of rambling, focus
6. Pacing: Speaking speed, appropriate pauses, rhythm
7. Body Language: Posture, gestures, movement (if visible in transcript)
8. Eye Contact: Direct engagement with camera (if visible in transcript)

Also calculate:
1. Overall score (weighted average of above)
2. Speaking pace assessment
3. Vocabulary level assessment
4. Emotional intelligence score
5. Count filler words (um, uh, like, you know, etc.)
6. Identify key quotes that reveal strengths or weaknesses
7. Provide actionable recommendations

Return ONLY valid JSON with no additional text or markdown code blocks:

{
  "metrics": {
    "communication": number,
    "confidence": number,
    "enthusiasm": number,
    "professionalism": number,
    "clarity": number,
    "pacing": number,
    "bodyLanguage": number,
    "eyeContact": number
  },
  "overallScore": number,
  "summary": "string (2-3 sentences capturing overall impression)",
  "strengths": ["string", "string", "string", "string"],
  "areasForImprovement": ["string", "string", "string"],
  "keyQuotes": [
    {
      "quote": "string (actual quote from transcript)",
      "significance": "string (why this quote matters)",
      "metric": "string (which metric it relates to)"
    }
  ],
  "recommendations": ["string (actionable feedback)"],
  "speakingPace": "string (slow/moderate/fast)",
  "vocabularyLevel": "string (basic/conversational/advanced/technical)",
  "emotionalIntelligence": number,
  "umCount": number,
  "fillerWords": {
    "um": number,
    "uh": number,
    "like": number,
    "you know": number,
    "actually": number,
    "basically": number
  }
}`;

/**
 * Extract JSON from response that might be wrapped in markdown
 */
function extractJSON(response: string): string {
  let cleaned = response.trim();

  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  return cleaned;
}

/**
 * Count occurrences of filler words in transcript
 */
function countFillerWords(transcript: string): Record<string, number> {
  const fillers: Record<string, number> = {
    um: 0,
    uh: 0,
    like: 0,
    'you know': 0,
    actually: 0,
    basically: 0,
  };

  const lowerTranscript = transcript.toLowerCase();
  const words = lowerTranscript.split(/\s+/);

  for (const word of words) {
    if (word === 'um' || word === 'um,') fillers.um++;
    if (word === 'uh' || word === 'uh,') fillers.uh++;
    if (word === 'like' || word === 'like,') fillers.like++;
    if (word === 'actually' || word === 'actually,') fillers.actually++;
    if (word === 'basically' || word === 'basically,') fillers.basically++;
  }

  // Check for "you know" phrase
  fillers['you know'] = (lowerTranscript.match(/you\s+know/g) || []).length;

  return fillers;
}

/**
 * Calculate word count from transcript
 */
function calculateWordCount(transcript: string): number {
  return transcript.trim().split(/\s+/).length;
}

/**
 * Validate and normalize video analysis
 */
function validateAndNormalizeAnalysis(
  data: any,
  wordCount: number,
  fillerWordCounts: Record<string, number>
): VideoAnalysis {
  const metrics: VideoAnalysisMetrics = {
    communication: Math.min(100, Math.max(0, Number(data.metrics?.communication) || 0)),
    confidence: Math.min(100, Math.max(0, Number(data.metrics?.confidence) || 0)),
    enthusiasm: Math.min(100, Math.max(0, Number(data.metrics?.enthusiasm) || 0)),
    professionalism: Math.min(100, Math.max(0, Number(data.metrics?.professionalism) || 0)),
    clarity: Math.min(100, Math.max(0, Number(data.metrics?.clarity) || 0)),
    pacing: Math.min(100, Math.max(0, Number(data.metrics?.pacing) || 0)),
    bodyLanguage: Math.min(100, Math.max(0, Number(data.metrics?.bodyLanguage) || 0)),
    eyeContact: Math.min(100, Math.max(0, Number(data.metrics?.eyeContact) || 0)),
  };

  const keyQuotes: KeyQuote[] = Array.isArray(data.keyQuotes)
    ? data.keyQuotes
        .slice(0, 5)
        .map((kq: any) => ({
          quote: kq.quote || '',
          timestamp: kq.timestamp,
          significance: kq.significance || '',
          metric: kq.metric || 'communication',
        }))
    : [];

  return {
    metrics,
    overallScore: Math.min(100, Math.max(0, Number(data.overallScore) || 0)),
    summary: data.summary || 'Assessment summary not available',
    strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 5) : [],
    areasForImprovement: Array.isArray(data.areasForImprovement)
      ? data.areasForImprovement.slice(0, 5)
      : [],
    keyQuotes,
    recommendations: Array.isArray(data.recommendations) ? data.recommendations.slice(0, 5) : [],
    speakingPace: data.speakingPace || 'moderate',
    vocabularyLevel: data.vocabularyLevel || 'conversational',
    emotionalIntelligence: Math.min(100, Math.max(0, Number(data.emotionalIntelligence) || 0)),
    transcriptLength: wordCount,
    umCount: fillerWordCounts.um || 0,
    filler_words: fillerWordCounts,
  };
}

/**
 * Analyze video transcript for communication effectiveness
 * @param transcript - The transcript text from the video
 * @param jobDescription - The job description for context
 * @param videoUrl - Optional URL to the video
 * @param duration - Optional video duration in seconds
 * @returns Detailed video analysis
 */
export async function analyzeVideoTranscript(
  transcript: string,
  jobDescription: string,
  videoUrl?: string,
  duration?: number
): Promise<VideoAnalysis> {
  if (!transcript || !transcript.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Transcript cannot be empty');
  }

  if (!jobDescription || !jobDescription.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Job description cannot be empty');
  }

  const wordCount = calculateWordCount(transcript);
  const fillerWords = countFillerWords(transcript);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: VIDEO_ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: `JOB DESCRIPTION:\n${jobDescription}\n\nVIDEO TRANSCRIPT:\n${transcript}${
            duration ? `\n\nVideo Duration: ${duration} seconds` : ''
          }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new AIAnalysisError('API_ERROR', 'No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    const parsed = JSON.parse(cleaned);
    const validated = validateAndNormalizeAnalysis(parsed, wordCount, fillerWords);

    return validated;
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new AIAnalysisError(
        'PARSING_ERROR',
        'Failed to parse OpenAI response as JSON',
        error.message
      );
    }

    throw new AIAnalysisError(
      'API_ERROR',
      'Failed to analyze video transcript',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Score specific communication aspects without full analysis
 */
export async function scoreSpecificMetrics(
  transcript: string,
  metricsToScore: Array<
    'communication' | 'confidence' | 'enthusiasm' | 'professionalism' | 'clarity' | 'pacing'
  >
): Promise<Record<string, number>> {
  if (!transcript || !transcript.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Transcript cannot be empty');
  }

  if (!metricsToScore || metricsToScore.length === 0) {
    throw new AIAnalysisError('INVALID_INPUT', 'Must specify at least one metric to score');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Score the following communication metrics on a 0-100 scale based on the transcript:
${metricsToScore.map((m) => `- ${m}: [description]`).join('\n')}

Return ONLY valid JSON with the scores:
{
  "${metricsToScore.join('": number,\n  "')}": number
}`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new AIAnalysisError('API_ERROR', 'No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    const parsed = JSON.parse(cleaned);

    const scores: Record<string, number> = {};
    for (const metric of metricsToScore) {
      scores[metric] = Math.min(100, Math.max(0, Number(parsed[metric]) || 0));
    }

    return scores;
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    throw new AIAnalysisError(
      'METRIC_SCORING_ERROR',
      'Failed to score specific metrics',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Generate targeted feedback for specific areas
 */
export async function generateTargetedFeedback(
  transcript: string,
  focusAreas: string[]
): Promise<Record<string, string>> {
  if (!transcript || !transcript.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Transcript cannot be empty');
  }

  if (!focusAreas || focusAreas.length === 0) {
    throw new AIAnalysisError('INVALID_INPUT', 'Must specify at least one focus area');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Provide specific, actionable feedback on these areas based on the transcript:
${focusAreas.map((area) => `- ${area}`).join('\n')}

Return ONLY valid JSON with feedback for each area:
{
  "${focusAreas.join('": "specific feedback",\n  "')}": "specific feedback"
}`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new AIAnalysisError('API_ERROR', 'No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    return JSON.parse(cleaned);
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    throw new AIAnalysisError(
      'FEEDBACK_GENERATION_ERROR',
      'Failed to generate targeted feedback',
      error instanceof Error ? error.message : String(error)
    );
  }
}
