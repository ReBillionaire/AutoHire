import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/candidates/[id]/notes
 * Retrieve all notes for a candidate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Fetch notes from database
    // const notes = await db.candidateNote.findMany({
    //   where: { candidateId: id },
    //   orderBy: { createdAt: 'desc' }
    // });

    const mockNotes = [
      {
        id: 'n1',
        candidateId: id,
        content: 'Strong technical skills. Passed technical assessment with 92/100.',
        createdBy: 'admin@autohire.ai',
        createdAt: '2026-03-25',
      },
      {
        id: 'n2',
        candidateId: id,
        content: 'Excellent communication during screening call.',
        createdBy: 'admin@autohire.ai',
        createdAt: '2026-03-24',
      },
    ];

    return NextResponse.json({
      candidateId: id,
      notes: mockNotes,
    });
  } catch (error) {
    console.error('Notes GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidates/[id]/notes
 * Create a new note for a candidate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    // TODO: Create note in database
    // const note = await db.candidateNote.create({
    //   data: {
    //     candidateId: id,
    //     content,
    //     createdBy: session.user.email
    //   }
    // });

    return NextResponse.json({
      id: 'n' + Date.now(),
      candidateId: id,
      content,
      createdBy: 'admin@autohire.ai',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Notes POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/candidates/[id]/notes/[noteId]
 * Update an existing note (implemented via individual note route)
 */

/**
 * DELETE /api/candidates/[id]/notes/[noteId]
 * Delete a note (implemented via individual note route)
 */
