import { NextRequest, NextResponse } from 'next/server';

// Placeholder data
const jobsDB: any = {
  'acme-corp': {
    'senior-frontend-engineer': {
      id: '1',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      slug: 'senior-frontend-engineer',
      type: 'full-time',
      workMode: 'hybrid',
      postedAt: new Date().toISOString(),
      salary: { min: 150000, max: 200000, currency: 'USD' },
      description: `We're looking for a talented Senior Frontend Engineer to join our growing team.

You'll be responsible for building delightful user experiences and leading the charge on our frontend architecture. We use modern tech like React, TypeScript, and Next.js, and we're always looking to improve our tooling and processes.

This is a unique opportunity to:
- Build products that millions of users interact with
- Work alongside a talented team of engineers and designers
- Have significant input on product direction and technical decisions
- Grow your skills and mentor junior engineers`,
      requirements: [
        '5+ years of professional experience with React or similar frameworks',
        'Expert-level TypeScript and JavaScript knowledge',
        'Strong foundation in HTML, CSS, and modern tooling (webpack, vite, etc.)',
        'Experience with state management solutions (Redux, Zustand, etc.)',
        'Familiarity with testing frameworks (Jest, React Testing Library)',
        'Experience working in agile/fast-paced environments',
      ],
      responsibilities: [
        'Design and implement new user-facing features using React and TypeScript',
        'Improve application performance and user experience',
        'Mentor junior engineers and conduct code reviews',
        'Collaborate with product managers and designers to deliver polished features',
        'Maintain high code quality and test coverage standards',
        'Lead technical discussions and architecture decisions',
      ],
      qualifications: [
        'Bachelor\'s degree in Computer Science or related field (or equivalent experience)',
        'Strong problem-solving skills and attention to detail',
        'Excellent communication and collaboration abilities',
        'Passion for building great products and learning new technologies',
      ],
      benefits: [
        'Competitive salary: $150,000 - $200,000 per year',
        'Comprehensive health insurance (medical, dental, vision)',
        '401(k) with company matching',
        'Unlimited PTO',
        'Flexible work arrangements (hybrid)',
        'Professional development budget',
        'Equity options',
        'Catered lunches and snacks',
        'Modern office in SF with great commute access',
      ],
      skills: [
        'React',
        'TypeScript',
        'Next.js',
        'Tailwind CSS',
        'Node.js',
        'GraphQL',
        'Jest',
      ],
      experienceLevel: 'Senior',
      customQuestions: [
        {
          id: '1',
          question: 'Tell us about a project you\'re proud of and why',
          type: 'long',
          required: true,
        },
        {
          id: '2',
          question: 'How do you approach code reviews?',
          type: 'long',
          required: false,
        },
      ],
    },
  },
};

const organizationsDB: any = {
  'acme-corp': {
    id: 'org-1',
    name: 'ACME Corp',
    description:
      'ACME Corp is a leading recruitment technology platform helping companies hire better, faster.',
    logo: 'https://via.placeholder.com/100',
    website: 'https://acme-corp.example.com',
    size: '50-100 employees',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string; jobSlug: string } }
) {
  try {
    const { orgSlug, jobSlug } = params;

    // TODO: Fetch from database
    const job = jobsDB[orgSlug]?.[jobSlug];
    const organization = organizationsDB[orgSlug];

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get similar jobs in same department
    const similarJobs = Object.values(jobsDB[orgSlug] || {})
      .filter(
        (j: any) => j.department === job.department && j.id !== job.id
      )
      .slice(0, 3);

    return NextResponse.json({
      job,
      organization,
      similarJobs,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
}
