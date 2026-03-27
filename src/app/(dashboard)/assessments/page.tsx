'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, List, ClipboardList, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AssessmentCard from '@/components/assessments/assessment-card';

interface Assessment {
  id: string;
  title: string;
  type: 'SKILL' | 'PSYCHOMETRIC' | 'ATTITUDE' | 'BACKGROUND';
  question_count: number;
  usage_count: number;
  status: 'draft' | 'active' | 'archived';
  duration: number;
  created_at: string;
  updated_at: string;
}

const typeBadge: Record<string, string> = {
  SKILL: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  PSYCHOMETRIC: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  ATTITUDE: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  BACKGROUND: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
};

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  draft: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  archived: 'bg-muted text-muted-foreground',
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'table'>('table');

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const response = await fetch('/api/assessments');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setAssessments(Array.isArray(data) ? data : (data.assessments || []));
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    });
  }, [assessments, typeFilter, statusFilter]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage assessment templates for your hiring pipeline.
          </p>
        </div>
        <Link href="/assessments/create">
          <Button size="sm" className="gap-1.5 h-9 text-sm">
            <Plus className="w-3.5 h-3.5" />
            Create Template
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-44 h-9 text-sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="SKILL">Skill Assessment</SelectItem>
            <SelectItem value="PSYCHOMETRIC">Psychometric Test</SelectItem>
            <SelectItem value="ATTITUDE">Attitude Assessment</SelectItem>
            <SelectItem value="BACKGROUND">Background Check</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-36 h-9 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex gap-0.5 p-0.5 rounded-lg border border-border bg-muted/50">
          <button
            onClick={() => setView('table')}
            className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredAssessments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredAssessments.length} of {assessments.length} templates
        </p>
      )}

      {/* Content */}
      {loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        )
      ) : assessments.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No assessments yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first template to start evaluating candidates.</p>
          <Link href="/assessments/create">
            <Button size="sm" variant="outline">Create First Template</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Grid view */}
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAssessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}

          {/* Table view */}
          {view === 'table' && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-muted-foreground">Title</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">Questions</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">Usage</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.length > 0 ? (
                    filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id} className="border-border hover:bg-muted/30">
                        <TableCell>
                          <Link href={`/assessments/${assessment.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors">
                            {assessment.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeBadge[assessment.type] || 'bg-muted text-muted-foreground'}`}>
                            {assessment.type.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-[13px] text-muted-foreground">{assessment.question_count}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-[13px] text-muted-foreground flex items-center justify-end gap-1">
                            <Users className="w-3 h-3" /> {assessment.usage_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusBadge[assessment.status] || 'bg-muted text-muted-foreground'}`}>
                            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/assessments/${assessment.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                            </Link>
                            <Link href={`/assessments/${assessment.id}/results`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">Results</Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                        No assessments match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
