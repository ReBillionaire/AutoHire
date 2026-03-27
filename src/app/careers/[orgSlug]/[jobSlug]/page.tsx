'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Share2, ArrowLeft, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  type: 'full-time' | 'part-time' | 'contract';
  workMode: 'remote' | 'hybrid' | 'on-site';
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  postedAt: string;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  logo: string;
  website?: string;
  size?: string;
}

export default function JobPage({
  params,
}: {
  params: { orgSlug: string; jobSlug: string };
}) {
  const [job, setJob] = useState<Job | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await fetch(
          `/api/careers/${params.orgSlug}/${params.jobSlug}`
        );
        const data = await response.json();
        setJob(data.job);
        setOrganization(data.organization);
        setSimilarJobs(data.similarJobs);
      } catch (error) {
        console.error('Failed to fetch job data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [params.orgSlug, params.jobSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <Link href={`/careers/${params.orgSlug}`}>
            <Button variant="outline">Back to Career Page</Button>
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-elevation-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/careers/${params.orgSlug}`}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center text-muted-foreground">
              <Briefcase className="w-5 h-5 mr-2" />
              {job.department}
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-5 h-5 mr-2" />
              {job.location}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-5 h-5 mr-2" />
              {job.type.replace('-', ' ')} • {job.workMode}
            </div>
            {job.salary && (
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="w-5 h-5 mr-2" />
                {job.salary.currency} {job.salary.min.toLocaleString()} -{' '}
                {job.salary.max.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">About This Role</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>
            </section>

            <Separator className="my-8 bg-border" />

            {/* Responsibilities */}
            {job.responsibilities.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-primary font-bold flex-shrink-0">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Separator className="my-8 bg-border" />

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-primary font-bold flex-shrink-0">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Separator className="my-8 bg-border" />

            {/* Qualifications */}
            {job.qualifications.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Qualifications</h2>
                <ul className="space-y-3">
                  {job.qualifications.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-primary font-bold flex-shrink-0">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Separator className="my-8 bg-border" />

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">What We Offer</h2>
                <ul className="space-y-3">
                  {job.benefits.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply CTA */}
            <div className="sticky top-6 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-1">
                <Link href={`/careers/${params.orgSlug}/${params.jobSlug}/apply`}>
                  <Button className="w-full" size="lg">
                    Apply Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: job.title,
                        text: `Check out this ${job.title} position at ${organization?.name}`,
                        url: shareUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Link copied to clipboard!');
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Company Card */}
              {organization && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-1">
                  <h3 className="font-bold text-lg text-foreground mb-2">{organization.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {organization.description}
                  </p>
                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm font-medium hover:underline transition-colors"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              )}

              {/* Key Info */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Experience Level</p>
                    <p className="text-base font-medium capitalize text-foreground mt-2">
                      {job.experienceLevel}
                    </p>
                  </div>
                  <Separator className="bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Posted</p>
                    <p className="text-base font-medium text-foreground mt-2">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-8">Similar Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarJobs.map((j) => (
                <Link
                  key={j.id}
                  href={`/careers/${params.orgSlug}/${j.id}`}
                  className="group bg-card border border-border rounded-xl p-6 hover:shadow-elevation-2 hover:border-primary transition-all"
                >
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {j.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{j.department}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {j.location}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
