import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { randomBytes } from 'crypto';

/**
 * GET /api/settings/team
 * List team members for the company
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

    // Get all team members
    const members = await prisma.companyMember.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('GET /api/settings/team error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/team
 * Invite a new team member
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
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
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

    // Check if member already exists
    const existingMember = await prisma.companyMember.findUnique({
      where: {
        companyId_email: {
          companyId: company.id,
          email,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member already invited' },
        { status: 400 }
      );
    }

    // Create invite token
    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const member = await prisma.companyMember.create({
      data: {
        companyId: company.id,
        email,
        role,
        inviteToken,
        inviteExpires,
        status: 'PENDING',
      },
    });

    // TODO: Send invite email with inviteToken

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('POST /api/settings/team error:', error);
    return NextResponse.json(
      { error: 'Failed to invite team member' },
      { status: 500 }
    );
  }
}
