import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/settings
 * Fetch company settings (create default if none exist)
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

    // Get user's primary company
    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    // Get or create settings
    let settings = await prisma.companySettings.findUnique({
      where: { companyId: company.id },
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyId: company.id,
          brandColor: '#4F46E5',
          accentColor: '#06B6D4',
          assessmentTimeLimit: 45,
          requireVideoIntro: true,
          requireDISC: true,
          videoMaxDuration: 60,
          autoSendAssessment: true,
          autoRemindDays: 3,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings
 * Update company settings (partial update)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get user's primary company
    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    // Get or create settings
    let settings = await prisma.companySettings.findUnique({
      where: { companyId: company.id },
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyId: company.id,
          ...body,
        },
      });
    } else {
      settings = await prisma.companySettings.update({
        where: { companyId: company.id },
        data: body,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('PATCH /api/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
