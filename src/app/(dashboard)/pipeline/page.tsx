'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KanbanBoard } from '@/components/pipeline/kanban-board';
import { PipelineListView } from '@/components/pipeline/pipeline-list-view';

type ViewMode = 'kanban' | 'list';

interface Job {
  id: string;
  title: string;
}

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  stage: string;
  aiScore: number;
  discProfile: string;
  source: string;
  avatar: string;
  timeInStage: string;
  appliedDate: string;
  jobId: string;
  jobTitle?: string;
}

export default function PipelinePage() {
  const [selectedJobId, setSelectedJobId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs and candidates in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [jobsRes, candidatesRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/candidates'),
        ]);

        if (!jobsRes.ok) throw new Error('Failed to fetch jobs');
        if (!candidatesRes.ok) throw new Error('Failed to fetch candidates');

        const jobsData = await jobsRes.json();
        const candidatesData = await candidatesRes.json();

        setJobs(jobsData);

        // Map candidates with job title information
        const enrichedCandidates = candidatesData.map((candidate: Candidate) => {
          const job = jobsData.find((j: Job) => j.id === candidate.jobId);
          return {
            ...candidate,
            jobTitle: job?.title || 'Unknown Position',
          };
        });

        setCandidates(enrichedCandidates);

        // Set first job as default if available
        if (jobsData.length > 0 && !selectedJobId) {
          setSelectedJobId(jobsData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter candidates by job and search
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesJob = candidate.jobId === selectedJobId;
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore =
        scoreFilter === 'all' ||
        (scoreFilter === 'high' && candidate.aiScore >= 80) ||
        (scoreFilter === 'medium' && candidate.aiScore >= 50 && candidate.aiScore < 80) ||
        (scoreFilter === 'low' && candidate.aiScore < 50);
      const matchesSource =
        sourceFilter === 'all' || candidate.source === sourceFilter;

      return matchesJob && matchesSearch && matchesScore && matchesSource;
    });
  }, [selectedJobId, searchQuery, scoreFilter, sourceFilter, candidates]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Loading skeleton
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Candidate Pipeline
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage and track candidates through hiring stages
              </p>
            </div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-64" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full" />
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Candidate Pipeline
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage and track candidates through hiring stages
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="font-semibold">Error loading pipeline</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Candidate Pipeline
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage and track candidates through hiring stages
            </p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Job Selector */}
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full lg:w-64 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="flex-1 lg:flex-initial relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800"
              />
            </div>

            {/* Score Filter */}
            <Select
              value={scoreFilter}
              onValueChange={(v) => setScoreFilter(v as typeof scoreFilter)}
            >
              <SelectTrigger className="w-full lg:w-48 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Score range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80+)</SelectItem>
                <SelectItem value="medium">Medium (50-79)</SelectItem>
                <SelectItem value="low">Low (&lt;50)</SelectItem>
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-white dark:bg-slate-800">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Career Page">Career Page</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                onClick={() => setViewMode('kanban')}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {filteredCandidates.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No candidates in the pipeline yet.
              </p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'kanban' ? (
              <KanbanBoard candidates={filteredCandidates} jobTitle={selectedJob?.title} />
            ) : (
              <PipelineListView candidates={filteredCandidates} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
