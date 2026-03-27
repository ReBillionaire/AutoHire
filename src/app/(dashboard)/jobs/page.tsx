'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobsTable } from '@/components/jobs/jobs-table';
import { Skeleton } from '@/components/ui/skeleton';

interface Job {
  id: string;
  title: string;
  department: string;
  status: 'active' | 'draft' | 'archived';
  postedAt: string;
  applicationCount: number;
}

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === 'all' || job.status === selectedStatus;
      const matchesDept =
        selectedDepartment === 'all' || job.department === selectedDepartment;
      return matchesSearch && matchesStatus && matchesDept;
    });
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedStatus, selectedDepartment]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/duplicate`, { method: 'POST' });
      if (response.ok) await fetchJobs();
    } catch (error) {
      console.error('Failed to duplicate job:', error);
    }
  };

  const handleArchive = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (response.ok) await fetchJobs();
    } catch (error) {
      console.error('Failed to archive job:', error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure? This will delete all associated applications.')) return;
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (response.ok) await fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const departments = Array.from(new Set(jobs.map((j) => j.department)));

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage job postings and track applications.
          </p>
        </div>
        <Link href="/jobs/create">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/50 border-transparent hover:border-border focus:border-primary"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-40 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full md:w-44 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center text-xs text-muted-foreground md:pl-2">
          {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <JobsTable
          jobs={filteredJobs}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {jobs.length === 0 ? 'No jobs yet' : 'No jobs match your filters'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {jobs.length === 0 ? 'Create your first job posting to get started.' : 'Try adjusting your search or filters.'}
            </p>
            {jobs.length === 0 && (
              <Link href="/jobs/create">
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Create Job
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
