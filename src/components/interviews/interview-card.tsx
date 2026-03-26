'use client';

import { MoreHorizontal, Clock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

const typeColors: Record<string, { badge: string; icon: string }> = {
  SCREENING: { badge: 'outline', icon: '🔍' },
  PHONE: { badge: 'secondary', icon: '📞' },
  TECHNICAL: { badge: 'default', icon: '💻' },
  BEHAVIORAL: { badge: 'outline', icon: '💭' },
  CASE_STUDY: { badge: 'secondary', icon: '📊' },
  PRESENTATION: { badge: 'default', icon: '📽️' },
  FINAL: { badge: 'destructive', icon: '🎯' },
};

const statusColors = {
  SCHEDULED: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  COMPLETED: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  CANCELLED: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800',
  NO_SHOW: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
};

export default function InterviewCard({ interview }: InterviewCardProps) {
  const initials = interview.candidateName
    .split(' ')
    .map((n) => n[0])
    .join('');

  const typeInfo = typeColors[interview.type];
  const statusClass = statusColors[interview.status];

  return (
    <Link href={`/interviews/${interview.id}`}>
      <Card className={`p-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${statusClass}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-10 h-10">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {interview.candidateName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {interview.jobTitle}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Send Calendar Invite</DropdownMenuItem>
              <DropdownMenuItem>Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">
              {format(new Date(interview.scheduledAt), 'MMM d, yyyy • h:mm a')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">
              {interview.interviewer}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Badge
              variant={typeInfo.badge as any}
              className="text-xs"
            >
              {interview.type.charAt(0) + interview.type.slice(1).toLowerCase()}
            </Badge>
            <Badge
              variant={
                interview.status === 'SCHEDULED'
                  ? 'secondary'
                  : interview.status === 'COMPLETED'
                    ? 'default'
                    : 'outline'
              }
              className="text-xs"
            >
              {interview.status.charAt(0) + interview.status.slice(1).toLowerCase()}
            </Badge>
          </div>
          <span className="text-lg">{typeInfo.icon}</span>
        </div>
      </Card>
    </Link>
  );
}
