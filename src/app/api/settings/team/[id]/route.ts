import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * DELETE /api/settings/team/[id]
 * Remove a team member from the company
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

    const { id } = params;

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

    // Verify member belongs to this company
    const member = await prisma.companyMember.findUnique({
      where: { id },
    });

    if (!member || member.companyId !== company.id) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of owner
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove the owner' },
        { status: 400 }
      );
    }

    // Delete the member
    await prisma.companyMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/settings/team/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
