'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplyForm } from '@/components/careers/apply-form';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type?: string;
}

export default function ApplyPage({
  params,
}: {
  params: { orgSlug: string; jobSlug: string };
}) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `/api/careers/${params.orgSlug}/${params.jobSlug}`
        );
        const data = await response.json();
        setJob(data.job);
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
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
            <Button variant="outline">Back to Careers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10 shadow-elevation-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href={`/careers/${params.orgSlug}/${params.jobSlug}`}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Posting
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Job Info Card */}
        <div className="mb-10 bg-white border border-border rounded-xl p-6 shadow-elevation-1">
          <h1 className="text-3xl font-bold text-foreground mb-3">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {job.department && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {job.department}
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
            )}
            {job.type && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {job.type}
              </div>
            )}
          </div>
        </div>

        {/* Application Form */}
        <ApplyForm
          jobId={job.id}
          jobTitle={job.title}
          orgSlug={params.orgSlug}
        />
      </div>
    </div>
  );
}
