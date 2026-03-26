'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign, Clock, Users, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface JobDetail {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  requirements: string | null;
  status: string;
  createdAt: string;
  _count?: { applications: number };
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CLOSED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PAUSED: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  };
  return map[status] || map.DRAFT;
}

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${params.id}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchJob();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Button>
        </Link>
        <Card className="p-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-800 dark:text-red-200">{error || 'Job not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
            {job.department && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.department}</span>}
            {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.type}</span>
          </div>
        </div>
        <Badge className={getStatusBadge(job.status)}>{job.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {job.description && (
            <Card className="p-6 bg-white dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Description</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                {job.description}
              </div>
            </Card>
          )}
          {job.requirements && (
            <Card className="p-6 bg-white dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Requirements</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                {job.requirements}
              </div>
            </Card>
          )}
        </div>
        <Card className="p-6 bg-white dark:bg-slate-900 h-fit">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Job Details</h3>
          <div className="space-y-4">
            {(job.salaryMin || job.salaryMax) && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Salary Range</p>
                <p className="font-medium text-slate-900 dark:text-white mt-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {job.salaryMin?.toLocaleString() || '?'} - {job.salaryMax?.toLocaleString() || '?'}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Applicants</p>
              <p className="font-medium text-slate-900 dark:text-white mt-1 flex items-center gap-1">
                <Users className="w-4 h-4" />
                {job._count?.applications || 0} candidates
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Posted</p>
              <p className="font-medium text-slate-900 dark:text-white mt-1">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
