'use client';

import Link from 'next/link';
import { MoreVertical, Edit, BarChart3, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Assessment {
  id: string;
  title: string;
  type: 'SKILL' | 'PSYCHOMETRIC' | 'ATTITUDE' | 'BACKGROUND';
  question_count: number;
  usage_count: number;
  status: 'draft' | 'active' | 'archived';
  duration: number;
}

const TYPE_CONFIG = {
  SKILL: { emoji: '🎯', color: 'bg-red-100 text-red-800' },
  PSYCHOMETRIC: { emoji: '🧠', color: 'bg-purple-100 text-purple-800' },
  ATTITUDE: { emoji: '⭐', color: 'bg-yellow-100 text-yellow-800' },
  BACKGROUND: { emoji: '✓', color: 'bg-green-100 text-green-800' },
};

export default function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const config = TYPE_CONFIG[assessment.type];

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-300',
    draft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    archived: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3 flex-1 min-w-0">
            <div className={`text-2xl flex-shrink-0`}>{config.emoji}</div>
            <div className="min-w-0 flex-1">
              <Link href={`/assessments/${assessment.id}`}>
                <CardTitle className="text-lg hover:text-blue-600 truncate">
                  {assessment.title}
                </CardTitle>
              </Link>
              <CardDescription className="text-sm mt-1">
                {assessment.question_count} questions • {assessment.duration} min
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/assessments/${assessment.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/assessments/${assessment.id}/results`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Results
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Badge className={config.color}>
              {assessment.type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={statusColors[assessment.status]}>
              {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Candidates Assessed</span>
            <span className="font-semibold text-slate-900">{assessment.usage_count}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Link href={`/assessments/${assessment.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View
            </Button>
          </Link>
          <Link href={`/assessments/${assessment.id}/edit`} className="flex-1">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
