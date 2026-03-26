'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    period: string;
  };
  isLoading?: boolean;
}

export function StatsCard({ icon: Icon, label, value, trend, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-20 mt-4" />
        <Skeleton className="h-4 w-32 mt-2" />
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend.direction === 'up'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {trend.direction === 'up' ? '+' : '-'}{trend.percentage}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {label}
        </p>
      </div>
      {trend && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          vs {trend.period}
        </p>
      )}
    </Card>
  );
}
