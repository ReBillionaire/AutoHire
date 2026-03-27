'use client';

import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
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
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-border bg-card hover:shadow-elevation-1 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              trend.direction === 'up'
                ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.percentage}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
