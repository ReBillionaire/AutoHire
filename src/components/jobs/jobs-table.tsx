'use client';

import Link from 'next/link';
import { MoreHorizontal, Copy, Archive, Trash2, ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Job {
  id: string;
  title: string;
  department: string;
  status: 'active' | 'draft' | 'archived';
  postedAt: string;
  applicationCount: number;
}

interface JobsTableProps {
  jobs: Job[];
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  draft: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  archived: 'bg-muted text-muted-foreground',
};

export function JobsTable({ jobs, onDuplicate, onArchive, onDelete }: JobsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs font-medium text-muted-foreground">Title</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Department</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Applications</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Posted</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} className="border-border hover:bg-muted/30">
              <TableCell>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-[13px] font-medium text-foreground hover:text-primary transition-colors"
                >
                  {job.title}
                </Link>
              </TableCell>
              <TableCell className="text-[13px] text-muted-foreground">{job.department}</TableCell>
              <TableCell>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[job.status] || 'bg-muted text-muted-foreground'}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-[13px] text-muted-foreground inline-flex items-center gap-1 justify-end">
                  <Users className="w-3 h-3" />
                  {job.applicationCount}
                </span>
              </TableCell>
              <TableCell className="text-[13px] text-muted-foreground">
                {job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '\u2014'}
              </TableCell>
              <TableCell className="text-right pr-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild>
                      <Link href={`/jobs/${job.id}`} className="gap-2 text-xs">
                        <ExternalLink className="w-3 h-3" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(job.id)} className="gap-2 text-xs">
                      <Copy className="w-3 h-3" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onArchive(job.id)} className="gap-2 text-xs">
                      <Archive className="w-3 h-3" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(job.id)} className="gap-2 text-xs text-destructive focus:text-destructive">
                      <Trash2 className="w-3 h-3" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
