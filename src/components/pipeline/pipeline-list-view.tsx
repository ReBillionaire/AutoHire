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
import { Badge } from '@/components/ui/badge';
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

function getScoreBadgeColor(score: number) {
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
    case 'Assessment':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'Interview':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    case 'Offer':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'Hired':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
  }
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

    if (sortField === 'score') {
      aVal = a.aiScore;
      bVal = b.aiScore;
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleSelectAll = () => {
    if (selectedRows.size === candidates.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(candidates.map((c) => c.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="p-6 space-y-4">
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {selectedRows.size} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline">
            Move to Stage
          </Button>
          <Button size="sm" variant="outline">
            Send Email
          </Button>
          <Button size="sm" variant="destructive">
            Reject
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <TableRow>
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={selectedRows.size === candidates.length && candidates.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Candidate
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead>Job</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleSort('stage')}
              >
                <div className="flex items-center gap-2">
                  Stage
                  <SortIcon field="stage" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-2">
                  Score
                  <SortIcon field="score" />
                </div>
              </TableHead>
              <TableHead>DISC</TableHead>
              <TableHead>Source</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Applied
                  <SortIcon field="date" />
                </div>
              </TableHead>
              <TableHead className="w-12 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCandidates.map((candidate) => (
              <TableRow
                key={candidate.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-b border-slate-200 dark:border-slate-800 last:border-b-0"
              >
                <TableCell className="px-4">
                  <Checkbox
                    checked={selectedRows.has(candidate.id)}
                    onCheckedChange={() => handleSelectRow(candidate.id)}
                    className="rounded"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {candidate.title}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-300">
                  {candidate.jobTitle || 'Unknown Position'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStageColor(candidate.stage)}`}>
                    {candidate.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${getScoreBadgeColor(candidate.aiScore)}`}>
                    {candidate.aiScore}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{candidate.discProfile}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {candidate.source}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-700 dark:text-slate-300">
                  {new Date(candidate.appliedDate).toLocaleDateString()}
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
                      <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                      <DropdownMenuItem>Send Email</DropdownMenuItem>
                      <DropdownMenuItem>Move Stage</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {candidates.length === 0 && (
          <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
            <p>No candidates found</p>
          </div>
        )}
      </div>
    </div>
  );
}
