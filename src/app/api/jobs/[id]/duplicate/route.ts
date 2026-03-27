import { NextRequest, NextResponse } from 'next/server';

// Placeholder database
const jobsDB: any = {};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Fetch original job from database
    const originalJob = jobsDB[id];

    if (!originalJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Create duplicate with new ID
    const duplicatedJob = {
      ...originalJob,
      id: Date.now().toString(),
      title: `${originalJob.title} (Copy)`,
      status: 'draft',
      applicationCount: 0,
      postedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    jobsDB[duplicatedJob.id] = duplicatedJob;

    return NextResponse.json({
      job: duplicatedJob,
      success: true,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to duplicate job' },
      { status: 500 }
    );
  }
}
