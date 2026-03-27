import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/company
 * Fetch user's primary company
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

    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('GET /api/company error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/company
 * Update company details
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
    const { name, description, website, industry, location, size } = body;

    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: name !== undefined ? name : company.name,
        description: description !== undefined ? description : company.description,
        website: website !== undefined ? website : company.website,
        industry: industry !== undefined ? industry : company.industry,
        location: location !== undefined ? location : company.location,
        size: size !== undefined ? size : company.size,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/company error:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
