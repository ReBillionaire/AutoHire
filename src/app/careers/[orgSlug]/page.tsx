'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Briefcase, MapPin, Clock, Search, Building2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';ck
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface JobListing {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  postedAt: string;
}

interface OrgInfo {
  name: string;
  logo?: string;
  description: string;
  website?: string;
}

export default function CareersOrgPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await fetch(`/api/careers/${orgSlug}`);
        if (!res.ok) throw new Error('Company not found');
        const data = await res.json();
        setOrg(data.organization);
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, [orgSlug]);

  const departments = [...new Set(jobs.map((j) => j.department))].sort();

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || job.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h1>
          <p className="text-slate-500">{error || 'This careers page does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-6">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="w-16 h-16 rounded-xl bg-white p-2" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{org.name}</h1>
              <p className="text-blue-100 mt-1">Careers</p>
            </div>
          </div>
          <p className="text-blue-100 max-w-2xl leading-relaxed">{org.description}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-5xl mx-auto px-6 -mt-6">
        <Card className="p-4 bg-white dark:bg-slate-900 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search positions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {departments.length > 1 && (
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
          </div>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-sm text-slate-500 mb-6">
          {filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''}
        </p>

        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No positions found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or check back later.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/careers/${orgSlug}/${job.slug}`}>
                <Card className="p-5 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow cursor-pointer border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.type}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="self-start">{job.type}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          Powered by AutoHire
        </div>
      </div>
    </div>
  );
}
