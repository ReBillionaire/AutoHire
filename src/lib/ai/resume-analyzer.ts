/**
 * Resume Analyzer - Detailed analysis of candidate resumes
 * Uses OpenAI GPT-4 for intelligent extraction and scoring
 */

import { openai } from '../ai-clients';
import {
  ResumeAnalysis,
  ContactInfo,
  ExperienceEntry,
  EducationEntry,
  SkillsBreakdown,
  SkillMatch,
  AIAnalysisError,
} from '@/types/ai';

const RESUME_ANALYSIS_PROMPT = `You are an expert HR analyst and recruiter with 20+ years of experience. Your task is to analyze a candidate's resume against a job description and provide a detailed, structured analysis.

Analyze the resume thoroughly and extract:
1. Contact information (name, email, phone, LinkedIn)
2. Professional experience with company, title, duration, description, highlights, achievements, and technologies
3. Education history with institution, degree, field, year, and any honors
4. Skills broken down into technical, soft, and language skills
5. Years of total professional experience
6. Industries the candidate has worked in
7. Career trajectory and progression

Then evaluate fit against the job description:
1. Calculate a fit score (0-100) based on skill match, experience level, and industry relevance
2. Identify 3-5 key strengths
3. Identify 3-5 skill gaps relative to the job
4. Flag any red flags (employment gaps, frequent job changes, etc.)
5. Create a skill match matrix comparing required skills to found evidence
6. Provide a compelling 3-4 sentence summary

Return ONLY valid JSON with no additional text or markdown code blocks.

JSON Schema:
{
  "contactInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "location": "string or null"
  },
  "experience": [
    {
      "company": "string",
      "title": "string",
      "duration": "string (e.g., 'Jan 2020 - Present')",
      "startDate": "string or null",
      "endDate": "string or null",
      "description": "string",
      "highlights": ["string"],
      "achievements": ["string"],
      "technologies": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string or null",
      "year": "string",
      "gpa": "string or null",
      "honors": "string or null"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "languages": ["string"],
    "certifications": ["string"]
  },
  "fitScore": number,
  "yearsOfExperience": number,
  "industryExperience": ["string"],
  "careerTrajectory": "string (brief description of career path)",
  "strengths": ["string", "string", "string", "string", "string"],
  "gaps": ["string", "string", "string"],
  "redFlags": ["string"],
  "summary": "string (3-4 sentences)",
  "skillMatchMatrix": [
    {
      "required": "string (skill name)",
      "found": boolean,
      "evidence": "string (where it was found or why it's missing)",
      "confidence": number (0-100)
    }
  ]
}`;

/**
 * Extract JSON from response that might be wrapped in markdown
 */
function extractJSON(response: string): string {
  let cleaned = response.trim();

  // Remove markdown code blocks if present
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  return cleaned;
}

/**
 * Validate and normalize extracted data
 */
function validateAndNormalizeAnalysis(data: any): ResumeAnalysis {
  // Ensure all required fields exist with defaults
  const analysis: ResumeAnalysis = {
    contactInfo: {
      name: data.contactInfo?.name || 'Unknown',
      email: data.contactInfo?.email || '',
      phone: data.contactInfo?.phone || '',
      linkedin: data.contactInfo?.linkedin || '',
      location: data.contactInfo?.location,
    },
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp: any) => ({
          company: exp.company || 'Unknown',
          title: exp.title || 'Unknown',
          duration: exp.duration || '',
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description || '',
          highlights: Array.isArray(exp.highlights) ? exp.highlights : [],
          achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
          technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
        }))
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((edu: any) => ({
          institution: edu.institution || 'Unknown',
          degree: edu.degree || 'Unknown',
          field: edu.field,
          year: edu.year || '',
          gpa: edu.gpa,
          honors: edu.honors,
        }))
      : [],
    skills: {
      technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
      soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
      languages: Array.isArray(data.skills?.languages) ? data.skills.languages : [],
      certifications: Array.isArray(data.skills?.certifications) ? data.skills.certifications : [],
    },
    fitScore: Math.min(100, Math.max(0, Number(data.fitScore) || 0)),
    yearsOfExperience: Math.max(0, Number(data.yearsOfExperience) || 0),
    industryExperience: Array.isArray(data.industryExperience) ? data.industryExperience : [],
    careerTrajectory: data.careerTrajectory || 'Career progression not available',
    strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 5) : [],
    gaps: Array.isArray(data.gaps) ? data.gaps.slice(0, 5) : [],
    redFlags: Array.isArray(data.redFlags) ? data.redFlags : [],
    summary: data.summary || 'No summary available',
    skillMatchMatrix: Array.isArray(data.skillMatchMatrix)
      ? data.skillMatchMatrix.map((match: any) => ({
          required: match.required || 'Unknown',
          found: Boolean(match.found),
          evidence: match.evidence || '',
          confidence: Math.min(100, Math.max(0, Number(match.confidence) || 50)),
        }))
      : [],
  };

  return analysis;
}

/**
 * Analyze a resume against a job description
 * @param resumeText - The raw text content of the resume
 * @param jobDescription - The job description to match against
 * @returns Detailed resume analysis
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysis> {
  if (!resumeText || !resumeText.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Resume text cannot be empty');
  }

  if (!jobDescription || !jobDescription.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Job description cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: RESUME_ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for consistent, accurate extraction
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new AIAnalysisError('API_ERROR', 'No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    const parsed = JSON.parse(cleaned);
    const validated = validateAndNormalizeAnalysis(parsed);

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
      'Failed to analyze resume',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Quick resume scoring without job description
 * Useful for general resume quality assessment
 */
export async function scoreResumeQuality(resumeText: string): Promise<{
  score: number;
  completeness: number;
  clarity: number;
  relevance: number;
  formatting: number;
  feedback: string[];
}> {
  if (!resumeText || !resumeText.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Resume text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume reviewer. Score the resume on these dimensions (0-100 each):
1. Completeness - Are all key sections present? (contact info, experience, education, skills)
2. Clarity - Is the resume clear and easy to read?
3. Relevance - Are the accomplishments and skills relevant and specific?
4. Formatting - Is the layout and structure professional?
5. Overall Score - Overall quality (0-100)

Also provide 3-5 specific feedback items for improvement.

Return ONLY valid JSON:
{
  "score": number,
  "completeness": number,
  "clarity": number,
  "relevance": number,
  "formatting": number,
  "feedback": ["string", "string", "string"]
}`,
        },
        {
          role: 'user',
          content: resumeText,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new AIAnalysisError('API_ERROR', 'No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    const parsed = JSON.parse(cleaned);

    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      completeness: Math.min(100, Math.max(0, Number(parsed.completeness) || 0)),
      clarity: Math.min(100, Math.max(0, Number(parsed.clarity) || 0)),
      relevance: Math.min(100, Math.max(0, Number(parsed.relevance) || 0)),
      formatting: Math.min(100, Math.max(0, Number(parsed.formatting) || 0)),
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    };
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    throw new AIAnalysisError(
      'QUALITY_SCORE_ERROR',
      'Failed to score resume quality',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Extract key achievements from resume
 */
export async function extractAchievements(resumeText: string): Promise<{
  achievements: Array<{ achievement: string; impact: string; skills: string[] }>;
  topThree: string[];
}> {
  if (!resumeText || !resumeText.trim()) {
    throw new AIAnalysisError('INVALID_INPUT', 'Resume text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Extract all measurable achievements from the resume. For each achievement, identify:
1. The achievement itself
2. The impact (quantified if possible)
3. Skills demonstrated

Return ONLY valid JSON:
{
  "achievements": [
    {
      "achievement": "string",
      "impact": "string",
      "skills": ["string"]
    }
  ],
  "topThree": ["string (top 3 achievements)"]
}`,
        },
        {
          role: 'user',
          content: resumeText,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new AIAnalysisError('API_ERROR', 'No response from OpenAI');
    }

    const cleaned = extractJSON(content);
    const parsed = JSON.parse(cleaned);

    return {
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      topThree: Array.isArray(parsed.topThree) ? parsed.topThree : [],
    };
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }

    throw new AIAnalysisError(
      'ACHIEVEMENT_EXTRACTION_ERROR',
      'Failed to extract achievements',
      error instanceof Error ? error.message : String(error)
    );
  }
}
