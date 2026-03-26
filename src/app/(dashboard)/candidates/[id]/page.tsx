'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface CandidateDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  status: string;
  aiScore: number | null;
  aiTags: string | null;
  resumeUrl: string | null;
  createdAt: string;
  applications: Array<{
    id: string;
    status: string;
    jobPosting: { id: string; title: string };
    createdAt: string;
  }>;
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    SCREENING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    INTERVIEW: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    OFFER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    HIRED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    WITHDRAWN: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  };
  return colors[status] || colors.APPLIED;
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/candidates/${params.id}`);
        if (!res.ok) throw new Error('Candidate not found');
        const data = await res.json();
        setCandidate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidate');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchCandidate();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
        <Link href="/candidates">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Candidates
          </Button>
        </Link>
        <Card className="p-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-800 dark:text-red-200">{error || 'Candidate not found'}</p>
        </Card>
      </div>
    );
  }

  const tags = candidate.aiTags ? JSON.parse(candidate.aiTags) : [];

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <Link href="/candidates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{candidate.email}</p>
        </div>
        <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-900">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact Info</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{candidate.phone}</span>
              </div>
            )}
            {candidate.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{candidate.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                Joined {new Date(candidate.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          {candidate.aiScore !== null && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">AI Score</p>
              <p className="text-3xl font-bold text-blue-600">{Math.round(candidate.aiScore)}%</p>
            </div>
          )}
          {tags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Applications</h3>
            {candidate.applications.length > 0 ? (
              <div className="space-y-3">
                {candidate.applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <p className="font-medium text-slate-900 dark:text-white">
                            {app.jobPosting.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-sm">No applications yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
