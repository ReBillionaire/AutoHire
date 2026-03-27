import { NextRequest, NextResponse } from 'next/server';

// Placeholder database
const applicationsDB: any = {
  '1': [
    {
      id: 'app-1',
      jobId: '1',
      candidateName: 'John Doe',
      email: 'john@example.com',
      status: 'new',
      submittedAt: new Date().toISOString(),
      rating: 4.5,
    },
    {
      id: 'app-2',
      jobId: '1',
      candidateName: 'Jane Smith',
      email: 'jane@example.com',
      status: 'reviewing',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      rating: 3.8,
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Fetch from database
    const applications = applicationsDB[id] || [];

    return NextResponse.json({
      applications,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
