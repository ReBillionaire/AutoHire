import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Placeholder data for demonstration
const careerPagesDB: any = {
  'acme-corp': {
    id: '1',
    title: 'Join ACME Corp',
    description: 'We\'re building the future of recruitment technology.',
    logo: 'https://via.placeholder.com/100',
    banner: 'https://via.placeholder.com/1200x400',
    theme: 'light',
    orgSlug: 'acme-corp',
    published: true,
  },
};

const jobsDB: any = {
  'acme-corp': [
    {
      id: '1',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      slug: 'senior-frontend-engineer',
      type: 'full-time',
      workMode: 'hybrid',
      postedAt: new Date().toISOString(),
      salary: { min: 150000, max: 200000 },
      description:
        'We\'re looking for a talented Senior Frontend Engineer to join our team...',
      requirements: [
        '5+ years of experience with React',
        'Strong TypeScript skills',
        'Experience with Next.js and modern tooling',
      ],
      responsibilities: [
        'Lead frontend development for new features',
        'Mentor junior engineers',
      ],
      qualifications: ['BS in Computer Science or equivalent'],
      benefits: ['Health insurance', '401k', 'Remote work options'],
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      experienceLevel: 'Senior',
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      slug: 'product-manager',
      type: 'full-time',
      workMode: 'remote',
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Help us shape the future of our product...',
      requirements: ['3+ years PM experience'],
      responsibilities: ['Define product vision and roadmap'],
      qualifications: [],
      benefits: ['Competitive salary', 'Stock options'],
      skills: ['Product Strategy', 'Analytics'],
      experienceLevel: 'Mid-level',
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const { orgSlug } = params;

    // TODO: Fetch from database with proper query
    const careerPage = careerPagesDB[orgSlug];

    if (!careerPage) {
      return NextResponse.json(
        { error: 'Career page not found' },
        { status: 404 }
      );
    }

    const jobs = jobsDB[orgSlug] || [];

    return NextResponse.json({
      careerPage,
      jobs,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch career data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orgSlug: string } }
)  {
  try {
    const { orgSlug } = params;
    const data = await request.json();

    // TODO: Update in database
    if (careerPagesDB[orgSlug]) {
      careerPagesDB[orgSlug] = { ...careerPagesDB[orgSlug], ...data };
    }

    return NextResponse.json({
      careerPage: careerPagesDB[orgSlug],
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update career page' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const { orgSlug } = params;

    // TODO: Delete from database
    delete careerPagesDB[orgSlug];
    delete jobsDB[orgSlug];

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete career page' },
      { status: 500 }
    );
  }
}
