'use client';

import Link from 'next/link';
import { Clock, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface AssessmentCardProps {
  assessment: Assessment;
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

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-elevation-1 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadge[assessment.type] || 'bg-muted text-muted-foreground'}`}>
            {assessment.type.replace('_', ' ')}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[assessment.status] || 'bg-muted text-muted-foreground'}`}>
            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
          </span>
        </div>
      </div>

      <Link href={`/assessments/${assessment.id}`}>
        <h3 className="text-[15px] font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {assessment.title}
        </h3>
      </Link>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {assessment.question_count} questions
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {assessment.duration} min
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="w-3 h-3" />
          {assessment.usage_count} used
        </span>
      </div>

      <div className="flex gap-1.5">
        <Link href={`/assessments/${assessment.id}/edit`}>
          <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
        </Link>
        <Link href={`/assessments/${assessment.id}/results`}>
          <Button variant="outline" size="sm" className="h-7 text-xs">Results</Button>
        </Link>
      </div>
    </div>
  );
}
