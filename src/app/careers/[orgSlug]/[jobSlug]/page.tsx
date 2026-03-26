'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Briefcase, DollarSign, Building2, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface JobDetail {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
  orgName: string;
}

export default function CareerJobPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const jobSlug = params.jobSlug as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/careers/${orgSlug}/${jobSlug}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [orgSlug, jobSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Job Not Found</h1>
          <p className="text-slate-500 mb-6">{error || 'This position may have been filled or removed.'}</p>
          <Link href={`/careers/${orgSlug}`}>
            <Button variant="outline">View All Positions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href={`/careers/${orgSlug}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to all positions
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{job.orgName}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.department}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>
                {salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{salary}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/careers/${orgSlug}/${jobSlug}/apply`}>
                <Button size="lg">Apply Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About the Role</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          </section>

          {job.requirements.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-blue-500 flex-shrink-0 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.benefits.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-2 items-start p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-green-600 flex-shrink-0">✓</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Job Details</h3>
            <div className="space-y-3 text-sm">
              <div><p className="text-slate-500">Department</p><p className="font-medium text-slate-900 dark:text-white">{job.department}</p></div>
              <div><p className="text-slate-500">Location</p><p className="font-medium text-slate-900 dark:text-white">{job.location}</p></div>
              <div><p className="text-slate-500">Type</p><p className="font-medium text-slate-900 dark:text-white">{job.type}</p></div>
              {salary && <div><p className="text-slate-500">Salary Range</p><p className="font-medium text-slate-900 dark:text-white">{salary}</p></div>}
              <div><p className="text-slate-500">Posted</p><p className="font-medium text-slate-900 dark:text-white">{new Date(job.postedAt).toLocaleDateString()}</p></div>
            </div>
          </Card>

          <Link href={`/careers/${orgSlug}/${jobSlug}/apply`} className="block">
            <Button className="w-full" size="lg">Apply for this Position</Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          Powered by AutoHire
        </div>
      </div>
    </div>
  );
}
