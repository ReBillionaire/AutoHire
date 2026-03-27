import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AutomationTrigger } from '@prisma/client';
import { executeAutomation } from '@/lib/automation-engine';

interface ExecutionContext {
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  stageFrom?: string;
  stageTo?: string;
  interviewType?: string;
  [key: string]: any;
}

interface ExecutionResult {
  trigger: string;
  ruleId: string;
  ruleName: string;
  action: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * POST /api/automation/execute
 * Execute automation rules for a given trigger
 * Body: { trigger, context }
 * Returns: { results: ExecutionResult[], totalExecuted: number, successful: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { trigger, context } = body;

    if (!trigger) {
      return NextResponse.json(
        { error: 'Trigger is required' },
        { status: 400 }
      );
    }

    // Get user's company
    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    // Execute automation
    const results = await executeAutomation(
      trigger as AutomationTrigger,
      context || {},
      company.id
    );

    const successful = results.filter((r) => r.success).length;

    return NextResponse.json({
      results,
      totalExecuted: results.length,
      successful,
    });
  } catch (error) {
    console.error('Error executing automation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
