/**
 * POST /api/ai/analyze-video
 * Analyze a video transcript for communication effectiveness
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeVideoTranscript } from '@/lib/ai/video-analyzer';
import { AnalyzeVideoRequest, AIAnalysisResponse, VideoAnalysis } from '@/types/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeVideoRequest = await request.json();
    const startTime = Date.now();

    // Validate input
    if (!body.transcript?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transcript is required',
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        } as AIAnalysisResponse<VideoAnalysis>,
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
        } as AIAnalysisResponse<VideoAnalysis>,
        { status: 400 }
      );
    }

    // Analyze video transcript
    const analysis = await analyzeVideoTranscript(
      body.transcript,
      body.jobDescription,
      body.videoUrl,
      body.duration
    );

    return NextResponse.json(
      {
        success: true,
        data: analysis,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      } as AIAnalysisResponse<VideoAnalysis>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Video analysis error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to analyze video transcript';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        processingTime: 0,
      } as AIAnalysisResponse<VideoAnalysis>,
      { status: 500 }
    );
  }
}
