'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface PipelineListViewProps {
  candidates: Candidate[];
}

type SortField = 'name' | 'stage' | 'score' | 'date';
type SortOrder = 'asc' | 'desc';

function getScoreBadge(score: number) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
  if (score >= 50) return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';
}

function getStageBadge(stage: string) {
  const map: Record<string, string> = {
    'Applied': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    'Screening': 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    'Assessment': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    'Interview': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
    'Offer': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    'Hired': 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    'Rejected': 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  };
  return map[stage] || 'bg-muted text-muted-foreground';
}

export function PipelineListView({ candidates }: PipelineListViewProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aVal: any = a[sortField as keyof Candidate];
    let bVal: any = b[sortField as keyof Candidate];

    if (sortField === 'score') { aVal = a.aiScore; bVal = b.aiScore; }
    if (sortField === 'date') { aVal = a.appliedDate; bVal = b.appliedDate; }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleSelectAll = () => {
    if (selectedRows.size === candidates.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(candidates.map((c) => c.id)));
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedRows(newSelected);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 pb-6 space-y-4">
      {/* Bulk actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <span className="text-sm font-medium text-foreground">
            {selectedRows.size} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="h-8 text-xs">Move to Stage</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">Send Email</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:text-destructive">Reject</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={selectedRows.size === candidates.length && candidates.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">Candidate <SortIcon field="name" /></div>
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground hidden lg:table-cell">Job</TableHead>
              <TableHead
                className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('stage')}
              >
                <div className="flex items-center gap-1">Stage <SortIcon field="stage" /></div>
              </TableHead>
              <TableHead
                className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-1">Score <SortIcon field="score" /></div>
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">DISC</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground hidden lg:table-cell">Source</TableHead>
              <TableHead
                className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none hidden md:table-cell"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">Applied <SortIcon field="date" /></div>
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCandidates.map((candidate) => (
              <TableRow key={candidate.id} className="border-border hover:bg-muted/30">
                <TableCell className="px-4">
                  <Checkbox
                    checked={selectedRows.has(candidate.id)}
                    onCheckedChange={() => handleSelectRow(candidate.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{candidate.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground hidden lg:table-cell">
                  {candidate.jobTitle || 'Unknown'}
                </TableCell>
                <TableCell>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStageBadge(candidate.stage)}`}>
                    {candidate.stage}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getScoreBadge(candidate.aiScore)}`}>
                    {candidate.aiScore}%
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                    {candidate.discProfile}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                  {candidate.source}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                  {new Date(candidate.appliedDate).toLocaleDateString()}
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
                      <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                      <DropdownMenuItem>Send Email</DropdownMenuItem>
                      <DropdownMenuItem>Move Stage</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Reject</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {candidates.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No candidates found
          </div>
        )}
      </div>
    </div>
  );
}
