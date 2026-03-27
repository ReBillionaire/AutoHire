import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AutomationTrigger, AutomationAction } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/automation/[id]
 * Fetch a single automation rule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const rule = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        companyId: company.id,
      },
    });

    if (!rule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...rule,
      config: JSON.parse(rule.config),
    });
  } catch (error) {
    console.error('Error fetching automation rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/automation/[id]
 * Update an automation rule
 * Body: { name?, trigger?, action?, config?, active? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const { name, trigger, action, config, active } = body;

    const existingRule = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        companyId: company.id,
      },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;
    if (trigger !== undefined) updateData.trigger = trigger as AutomationTrigger;
    if (action !== undefined) updateData.action = action as AutomationAction;
    if (config !== undefined) updateData.config = JSON.stringify(config);

    const updatedRule = await prisma.automationRule.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      ...updatedRule,
      config: JSON.parse(updatedRule.config),
    });
  } catch (error) {
    console.error('Error updating automation rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/automation/[id]
 * Delete an automation rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const rule = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        companyId: company.id,
      },
    });

    if (!rule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    await prisma.automationRule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
