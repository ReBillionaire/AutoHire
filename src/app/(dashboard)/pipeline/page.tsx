'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, LayoutGrid, List, GitBranch, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const jobsList = Array.isArray(jobsData) ? jobsData : (jobsData.jobs || []);
        const candidatesList = Array.isArray(candidatesData) ? candidatesData : (candidatesData.candidates || []);

        setJobs(jobsList);

        const enrichedCandidates = candidatesList.map((candidate: any) => {
          const job = jobsList.find((j: Job) => j.id === candidate.jobId);
          return {
            ...candidate,
            jobTitle: job?.title || 'Unknown Position',
          };
        });

        setCandidates(enrichedCandidates);

        if (jobsList.length > 0) {
          setSelectedJobId(jobsList[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesJob = !selectedJobId || candidate.jobId === selectedJobId;
      const matchesSearch =
        !searchQuery ||
        candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.company?.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Page header */}
      <div className="p-4 md:p-6 lg:p-8 pb-0 space-y-4 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track candidates through your hiring stages.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-0.5 rounded-lg border border-border bg-muted/50">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-full md:w-56 h-9 text-sm">
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

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 border-transparent hover:border-border focus:border-primary"
            />
          </div>

          <Select
            value={scoreFilter}
            onValueChange={(v) => setScoreFilter(v as typeof scoreFilter)}
          >
            <SelectTrigger className="w-full md:w-36 h-9 text-sm">
              <SelectValue placeholder="Score range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="high">High (80+)</SelectItem>
              <SelectItem value="medium">Medium (50-79)</SelectItem>
              <SelectItem value="low">Low (&lt;50)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full md:w-36 h-9 text-sm">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Career Page">Career Page</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden mt-4">
        {error ? (
          <div className="p-6 mx-4 md:mx-6 lg:mx-8 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
            <p className="text-sm text-destructive font-medium">Error loading pipeline</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : loading ? (
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 space-y-3">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-1 w-full rounded-full" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 - i % 2 }).map((_, j) => (
                      <Skeleton key={j} className="h-28 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No candidates in pipeline</p>
              <p className="text-xs text-muted-foreground">Candidates will appear here as they apply to your jobs.</p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard candidates={filteredCandidates} jobTitle={selectedJob?.title} />
        ) : (
          <PipelineListView candidates={filteredCandidates} />
        )}
      </div>
    </div>
  );
}
