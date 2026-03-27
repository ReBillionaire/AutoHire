'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Plus,
  XCircle,
} from 'lucide-react';

interface RecentActivityProps {
  isLoading?: boolean;
  activities?: Array<{ id: string; type: string; description: string; details: string; timestamp: string }>;
}

const activityConfig: Record<string, { icon: typeof Plus; color: string; bg: string }> = {
  application: { icon: Plus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  interview: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  offer: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  rejection: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  message: { icon: MessageSquare, color: 'text-violet-500', bg: 'bg-violet-500/10' },
};

export function RecentActivity({ isLoading, activities }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <Skeleton className="h-5 w-28 mb-5" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold text-foreground mb-5">
          Recent Activity
        </h3>
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No recent activity</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Activity will appear here as you use the platform</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-sm font-semibold text-foreground mb-5">
        Recent Activity
      </h3>
      <div className="space-y-1">
        {activities.map((activity) => {
          const config = activityConfig[activity.type] || activityConfig.message;
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 -mx-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground leading-snug">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.details}
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">
                {activity.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
