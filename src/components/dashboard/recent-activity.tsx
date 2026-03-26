'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Plus,
  User,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'rejection' | 'message';
  description: string;
  details: string;
  timestamp: string;
  actor?: string;
}

interface RecentActivityProps {
  isLoading?: boolean;
  activities?: Array<{ id: string; type: string; description: string; details: string; timestamp: string }>;
}

const activityIcons = {
  application: { icon: Plus, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  interview: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  offer: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  rejection: { icon: MessageSquare, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  message: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
};

export function RecentActivity({ isLoading, activities }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          No recent activity
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.map((activity) => {
          const activityType = activity.type as keyof typeof activityIcons;
          const iconData = activityIcons[activityType] || activityIcons.message;
          const { icon: Icon, color, bg } = iconData;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-white">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {activity.details}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activity.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
export default function Component() { return <div>Component</div>; }
