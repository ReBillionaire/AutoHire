'use client';

import { Badge } from '@/components/ui/badge';
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

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
}

function getSourceColor(source: string) {
  switch (source) {
    case 'LinkedIn':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Career Page':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Referral':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
  }
}

function getDISCColor(profile: string) {
  return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
      {/* Header with Avatar and Name */}
      <div className="flex gap-3 mb-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={candidate.avatar} alt={candidate.name} />
          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {candidate.name}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
            {candidate.title}
          </p>
        </div>
      </div>

      {/* Company */}
      <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 truncate">
        {candidate.company}
      </p>

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* AI Score Badge */}
        <Badge
          variant="outline"
          className={`text-xs px-2 py-1 ${getScoreColor(candidate.aiScore)}`}
        >
          Score: {candidate.aiScore}%
        </Badge>

        {/* DISC Profile Badge */}
        <Badge
          variant="outline"
          className={`text-xs px-2 py-1 ${getDISCColor(candidate.discProfile)}`}
        >
          {candidate.discProfile}
        </Badge>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        {/* Source Tag */}
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 ${getSourceColor(candidate.source)}`}
        >
          {candidate.source}
        </Badge>

        {/* Time in Stage */}
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {candidate.timeInStage}
        </span>
      </div>
    </div>
  );
}
