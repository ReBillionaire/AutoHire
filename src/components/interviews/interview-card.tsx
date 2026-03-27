'use client';

import { Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { format } from 'date-fns';

interface Interview {
  id: string;
  candidateName: string;
  candidateImage?: string;
  jobTitle: string;
  type: 'SCREENING' | 'PHONE' | 'TECHNICAL' | 'BEHAVIORAL' | 'CASE_STUDY' | 'PRESENTATION' | 'FINAL';
  scheduledAt: Date;
  interviewer: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

interface InterviewCardProps {
  interview: Interview;
}

const typeBadge: Record<string, string> = {
  SCREENING: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  PHONE: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  TECHNICAL: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  BEHAVIORAL: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  CASE_STUDY: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  PRESENTATION: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  FINAL: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

const statusBadge: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  CANCELLED: 'bg-muted text-muted-foreground',
  NO_SHOW: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export default function InterviewCard({ interview }: InterviewCardProps) {
  const initials = interview.candidateName
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <Link href={`/interviews/${interview.id}`}>
      <div className="group p-4 rounded-xl border border-border bg-card hover:shadow-elevation-1 hover:border-border/80 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-[13px] font-medium text-foreground truncate">{interview.candidateName}</h3>
              <p className="text-[11px] text-muted-foreground truncate">{interview.jobTitle}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <button className="w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
                  <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="13" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Send Calendar Invite</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(interview.scheduledAt), 'MMM d, yyyy \u00B7 h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{interview.interviewer}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-border">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadge[interview.type] || 'bg-muted text-muted-foreground'}`}>
            {interview.type.charAt(0) + interview.type.slice(1).toLowerCase().replace('_', ' ')}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[interview.status] || 'bg-muted text-muted-foreground'}`}>
            {interview.status.charAt(0) + interview.status.slice(1).toLowerCase().replace('_', ' ')}
          </span>
        </div>
      </div>
    </Link>
  );
}
