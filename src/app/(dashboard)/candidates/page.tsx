'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Plus, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar: string;
  latestApplication: string;
  applicationCount: number;
  tags: string[];
  stage: string;
  score: number | null;
  joinedDate: string;
}

function getScoreBadge(score: number | null) {
  if (score === null) return { text: 'N/A', cls: 'bg-muted text-muted-foreground' };
  if (score >= 80) return { text: `${score}%`, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' };
  if (score >= 50) return { text: `${score}%`, cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' };
  return { text: `${score}%`, cls: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' };
}

function getStageBadge(stage: string) {
  const map: Record<string, string> = {
    'Applied': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    'Screening': 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    'Interview': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
    'Offer': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    'Hired': 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    'Rejected': 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    'Withdrawn': 'bg-muted text-muted-foreground',
  };
  return map[stage] || 'bg-muted text-muted-foreground';
}

function stageDisplayName(status: string): string {
  const stageMap: Record<string, string> = {
    APPLIED: 'Applied', SCREENING: 'Screening', INTERVIEW: 'Interview',
    OFFER: 'Offer', HIRED: 'Hired', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn',
  };
  return stageMap[status] || status;
}

function parseAiTags(aiTagsJson: string | null): string[] {
  if (!aiTagsJson) return [];
  try {
    const parsed = JSON.parse(aiTagsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/candidates?include=applications');
        if (!response.ok) throw new Error('Failed to fetch candidates');
        const data = await response.json();
        const transformedCandidates: Candidate[] = (data.candidates || []).map((c: any) => {
          const fullName = `${c.firstName} ${c.lastName}`;
          return {
            id: c.id,
            name: fullName,
            email: c.email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
            latestApplication: c.applications?.[0]?.jobPosting?.title || 'No application',
            applicationCount: c.applications?.length || 0,
            tags: parseAiTags(c.aiTags),
            stage: stageDisplayName(c.status),
            score: c.aiScore ? Math.round(c.aiScore) : null,
            joinedDate: c.createdAt,
          };
        });
        setCandidates(transformedCandidates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    candidates.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.latestApplication.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
      const matchesTags = selectedTags.size === 0 || c.tags.some((t) => selectedTags.has(t));
      return matchesSearch && matchesStage && matchesTags;
    });
  }, [candidates, searchQuery, stageFilter, selectedTags]);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) newTags.delete(tag);
    else newTags.add(tag);
    setSelectedTags(newTags);
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {candidates.length} candidates in your database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/50 border-transparent hover:border-border focus:border-primary"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full md:w-40 h-9 text-sm">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn'].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mr-1">Skills:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                selectedTags.has(tag)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {error ? (
        <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <p className="text-sm text-destructive font-medium">Error loading candidates</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No candidates yet</p>
            <p className="text-xs text-muted-foreground">Add your first candidate to get started.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">Candidate</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Application</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Stage</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Score</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground hidden lg:table-cell">Skills</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => {
                const scoreBadge = getScoreBadge(candidate.score);
                return (
                  <TableRow key={candidate.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{candidate.latestApplication}</TableCell>
                    <TableCell>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStageBadge(candidate.stage)}`}>
                        {candidate.stage}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${scoreBadge.cls}`}>
                        {scoreBadge.text}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {candidate.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                        ))}
                        {candidate.tags.length > 2 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{candidate.tags.length - 2}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(candidate.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                            <span className="sr-only">Actions</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
                              <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                              <circle cx="8" cy="13" r="1.5" fill="currentColor" />
                            </svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem>Add Notes</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredCandidates.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No candidates match your filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}
