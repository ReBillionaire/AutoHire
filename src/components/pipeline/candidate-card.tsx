'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    title: string;
    company: string;
    aiScore: number;
    discProfile: string;
    source: string;
    avatar: string;
    timeInStage: string;
  };
}

function getScoreStyle(score: number) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
  if (score >= 50) return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';
}

function getSourceStyle(source: string) {
  switch (source) {
    case 'LinkedIn': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
    case 'Career Page': return 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400';
    case 'Referral': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div className="group bg-card rounded-xl border border-border p-3.5 shadow-sm hover:shadow-elevation-1 hover:border-border/80 transition-all duration-200">
      {/* Header */}
      <div className="flex gap-2.5 mb-2.5">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={candidate.avatar} alt={candidate.name} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {candidate.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-medium text-foreground truncate leading-tight">
            {candidate.name}
          </h4>
          <p className="text-[11px] text-muted-foreground truncate">
            {candidate.title}
          </p>
        </div>
      </div>

      {/* Company */}
      {candidate.company && (
        <p className="text-[11px] text-muted-foreground/70 mb-2.5 truncate">
          {candidate.company}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${getScoreStyle(candidate.aiScore)}`}>
          {candidate.aiScore}%
        </span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
          {candidate.discProfile}
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${getSourceStyle(candidate.source)}`}>
          {candidate.source}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60">
          {candidate.timeInStage}
        </span>
      </div>
    </div>
  );
}
