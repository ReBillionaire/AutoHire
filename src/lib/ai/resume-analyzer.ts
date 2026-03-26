import type { ResumeAnalysisResult, AIServiceResponse } from '@/types/ai';

const RESUME_ANALYSIS_PROMPT = `You are an expert resume analyzer for a hiring platform. Analyze the following resume text and extract structured information.

Return a JSON object with these fields:
- candidateInfo: { name, email, phone, location, linkedIn, portfolio }
- summary: A 2-3 sentence professional summary
- skills: Array of technical and soft skills
- experience: Array of { title, company, startDate, endDate, current, description, highlights }
- education: Array of { degree, institution, field, graduationDate, gpa }
- certifications: Array of certification names
- languages: Array of spoken languages
- overallScore: 0-100 score based on resume quality
- strengths: Array of key strengths
- gaps: Array of potential gaps or concerns
- aiTags: Array of categorization tags (e.g., "Senior Engineer", "React", "Leadership")`;

/**
 * Analyze a resume and extract structured candidate information
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription?: string
): Promise<AIServiceResponse<ResumeAnalysisResult>> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
        processingTime: Date.now() - startTime,
      };
    }

    const contextPrompt = jobDescription
      ? `\n\nEvaluate this resume against the following job description:\n${jobDescription}`
      : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: RESUME_ANALYSIS_PROMPT + contextPrompt },
          { role: 'user', content: `Analyze this resume:\n\n${resumeText}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`,
        processingTime: Date.now() - startTime,
      };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content) as ResumeAnalysisResult;

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
      error: error instanceof Error ? error.message : 'Failed to analyze resume',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Extract text from a PDF resume buffer
 */
export async function extractResumeText(fileBuffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'text/plain') {
    return fileBuffer.toString('utf-8');
  }

  // For PDF extraction, use a simple text extraction approach
  // In production, integrate pdf-parse or similar library
  if (mimeType === 'application/pdf') {
    try {
      const pdfParse = await import('pdf-parse').then(m => m.default || m);
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch {
      // Fallback: return raw text extraction
      const text = fileBuffer.toString('utf-8');
      return text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
    }
  }

  // For DOCX, extract plain text
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } catch {
      return fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
    }
  }

  return fileBuffer.toString('utf-8');
}
