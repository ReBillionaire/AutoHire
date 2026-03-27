import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { seedDefaultRules } from '@/lib/automation-engine';
import { AutomationTrigger, AutomationAction } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/automation
 * Fetch all automation rules for the user's company
 * Returns: { rules: [...], total: number }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's company (assuming single company per user for now)
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

    // Check if company has any rules
    const existingRules = await prisma.automationRule.findMany({
      where: { companyId: company.id },
    });

    // If no rules exist, seed default rules
    if (existingRules.length === 0) {
      await seedDefaultRules(company.id);
    }

    // Fetch all rules
    const rules = await prisma.automationRule.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });

    const rulesWithConfig = rules.map((rule) => ({
      ...rule,
      config: JSON.parse(rule.config),
    }));

    return NextResponse.json({
      rules: rulesWithConfig,
      total: rules.length,
    });
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation
 * Create a new automation rule
 * Body: { trigger, action, config, name? }
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
    const { trigger, action, config, name } = body;

    // Validate trigger and action
    if (!trigger || !action) {
      return NextResponse.json(
        { error: 'Trigger and action are required' },
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

    // Validate trigger/action combination
    const validCombinations: Record<AutomationTrigger, AutomationAction[]> = {
      APPLICATION_RECEIVED: [
        AutomationAction.SEND_EMAIL,
        AutomationAction.SCHEDULE_ASSESSMENT,
        AutomationAction.NOTIFY_TEAM,
      ],
      ASSESSMENT_PENDING: [
        AutomationAction.SEND_REMINDER,
        AutomationAction.SEND_EMAIL,
      ],
      ASSESSMENT_COMPLETED: [
        AutomationAction.SEND_EMAIL,
        AutomationAction.MOVE_STAGE,
        AutomationAction.GENERATE_REPORT,
      ],
      DISC_COMPLETED: [
        AutomationAction.SEND_EMAIL,
        AutomationAction.NOTIFY_TEAM,
      ],
      INTERVIEW_SCHEDULED: [
        AutomationAction.SEND_EMAIL,
        AutomationAction.SEND_REMINDER,
      ],
      INTERVIEW_COMPLETED: [
        AutomationAction.SEND_EMAIL,
        AutomationAction.GENERATE_REPORT,
        AutomationAction.NOTIFY_TEAM,
      ],
      STAGE_CHANGED: [
        AutomationAction.SEND_EMAIL,
        AutomationAction.NOTIFY_TEAM,
      ],
      DEADLINE_APPROACHING: [
        AutomationAction.SEND_REMINDER,
        AutomationAction.SEND_EMAIL,
      ],
      NO_RESPONSE: [
        AutomationAction.SEND_EMAIL,
        AutomationAction.SEND_REMINDER,
      ],
    };

    const allowedActions = validCombinations[trigger as AutomationTrigger];
    if (!allowedActions || !allowedActions.includes(action as AutomationAction)) {
      return NextResponse.json(
        { error: `Invalid trigger/action combination: ${trigger} -> ${action}` },
        { status: 400 }
      );
    }

    const rule = await prisma.automationRule.create({
      data: {
        companyId: company.id,
        name: name || `${trigger} → ${action}`,
        trigger: trigger as AutomationTrigger,
        action: action as AutomationAction,
        config: JSON.stringify(config || {}),
        active: true,
      },
    });

    return NextResponse.json(
      {
        ...rule,
        config: JSON.parse(rule.config),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating automation rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
