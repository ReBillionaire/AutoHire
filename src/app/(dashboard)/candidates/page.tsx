'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Plus, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

function getScoreBadgeColor(score: number | null) {
  if (score === null) return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

function getStageColor(stage: string) {
  switch (stage) {
    case 'Applied':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Screening':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Interview':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    case 'Offer':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'Hired':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Withdrawn':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
  }
}

function CandidateTableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      ))}
    </div>
  );
}

function stageDisplayName(status: string): string {
  const stageMap: Record<string, string> = {
    APPLIED: 'Applied',
    SCREENING: 'Screening',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    HIRED: 'Hired',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
  };
  return stageMap[status] || status;
}

function parseAiTags(aiTagsJson: string | null): string[] {
  if (!aiTagsJson) return [];
  try {
    const parsed = JSON.parse(aiTagsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }

        const data = await response.json();

        const transformedCandidates: Candidate[] = (data.candidates || []).map(
          (apiCandidate: any) => {
            const fullName = `${apiCandidate.firstName} ${apiCandidate.lastName}`;
            const tags = parseAiTags(apiCandidate.aiTags);

            return {
              id: apiCandidate.id,
              name: fullName,
              email: apiCandidate.email,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
              latestApplication:
                apiCandidate.applications?.[0]?.jobPosting?.title || 'No application',
              applicationCount: apiCandidate.applications?.length || 0,
              tags: tags,
              stage: stageDisplayName(apiCandidate.status),
              score: apiCandidate.aiScore ? Math.round(apiCandidate.aiScore) : null,
              joinedDate: apiCandidate.createdAt,
            };
          }
        );

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
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.latestApplication.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'all' || candidate.stage === stageFilter;
      const matchesTags =
        selectedTags.size === 0 ||
        candidate.tags.some((tag) => selectedTags.has(tag));
      return matchesSearch && matchesStage && matchesTags;
    });
  }, [candidates, searchQuery, stageFilter, selectedTags]);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                All Candidates
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Master database of {candidates.length} candidates
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-white dark:bg-slate-800">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Screening">Screening</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Hired">Hired</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase my-1">
                Skills:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    selectedTags.has(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
          {error && (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">Error loading candidates</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{error}</p>
            </div>
          )}

          {loading && !error && <CandidateTableSkeleton />}

          {!loading && !error && candidates.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 font-medium">No candidates yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Add your first candidate to get started.</p>
              </div>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Latest Application</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-b border-slate-200 dark:border-slate-800 last:border-b-0"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{candidate.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{candidate.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">{candidate.latestApplication}</TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">{candidate.applicationCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreBadgeColor(candidate.score)}>
                        {candidate.score !== null ? `${candidate.score}%` : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {candidate.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                        {candidate.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{candidate.tags.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">
                      {new Date(candidate.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Actions</span>
                            <div className="w-4 h-4 flex items-center justify-center gap-0.5">
                              <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-slate-400" />
                              <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-slate-400" />
                              <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-slate-400" />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View All Applications</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem>Add Notes</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && !error && candidates.length > 0 && filteredCandidates.length === 0 && (
            <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
              <p>No candidates found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
