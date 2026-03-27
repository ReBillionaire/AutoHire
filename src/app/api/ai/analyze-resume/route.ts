/**
 * POST /api/ai/analyze-resume
 * Analyze a resume against a job description
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume, extractAchievements } from '@/lib/ai/resume-analyzer';
import { AnalyzeResumeRequest, AIAnalysisResponse, ResumeAnalysis } from '@/types/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeResumeRequest = await request.json();
    const startTime = Date.now();

    // Validate input
    if (!body.resumeText?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<ResumeAnalysis>,
        { status: 400 }
      );
    }

    if (!body.jobDescription?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job description is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<ResumeAnalysis>,
        { status: 400 }
      );
    }

    // Analyze resume
    const analysis = await analyzeResume(body.resumeText, body.jobDescription);

    // Extract achievements for additional context
    const achievements = await extractAchievements(body.resumeText);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...analysis,
          // Include top achievements in summary if space
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      } as AIAnalysisResponse<ResumeAnalysis>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Resume analysis error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to analyze resume';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        processingTime: 0,
      } as AIAnalysisResponse<ResumeAnalysis>,
      { status: 500 }
    );
  }
}
