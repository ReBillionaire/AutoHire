'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Briefcase, Calendar, TrendingUp, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/dashboard/stats-card';
import { PipelineChart } from '@/components/dashboard/pipeline-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Badge } from '@/components/ui/badge';

interface UpcomingInterview {
  id: string;
  candidateName: string;
  position: string;
  time: string;
  type: 'phone' | 'video' | 'in-person';
}

interface DashboardStats {
  activeJobs: number;
  totalCandidates: number;
  interviewsThisWeek: number;
  hireRate: number;
}

interface PipelineData {
  stage: string;
  count: number;
  color: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  details: string;
  timestamp: string;
}

interface DashboardData {
  stats: DashboardStats;
  pipeline: PipelineData[];
  recentActivity: ActivityItem[];
  upcomingInterviews: UpcomingInterview[];
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/dashboard/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const interviewTypeBadge = {
    phone: { label: 'Phone', variant: 'outline' as const },
    video: { label: 'Video', variant: 'secondary' as const },
    'in-person': { label: 'In-Person', variant: 'default' as const },
  };

  if (error) {
    return (
      <div className="flex-1 space-y-8 p-6 bg-slate-50 dark:bg-slate-950">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Welcome back! Here&apos;s what&apos;s happening with your recruitment today.
          </p>
        </div>
        <Card className="p-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-800 dark:text-red-200">
            Error loading dashboard: {error}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your recruitment today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Briefcase}
          label="Open Jobs"
          value={dashboardData?.stats.activeJobs ?? 0}
          trend={{ direction: 'up', percentage: 5, period: 'last month' }}
          isLoading={isLoading}
        />
        <StatsCard
          icon={Users}
          label="Active Candidates"
          value={dashboardData?.stats.totalCandidates ?? 0}
          trend={{ direction: 'up', percentage: 12, period: 'last month' }}
          isLoading={isLoading}
        />
        <StatsCard
          icon={Calendar}
          label="Interviews This Week"
          value={dashboardData?.stats.interviewsThisWeek ?? 0}
          trend={{ direction: 'down', percentage: 2, period: 'last week' }}
          isLoading={isLoading}
        />
        <StatsCard
          icon={TrendingUp}
          label="Hire Rate"
          value={dashboardData?.stats.hireRate ? `${dashboardData.stats.hireRate}%` : '0%'}
          trend={{ direction: 'up', percentage: 8, period: 'last quarter' }}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <PipelineChart
            isLoading={isLoading}
            data={dashboardData?.pipeline}
          />
        </div>

        {/* Upcoming Interviews */}
        <div>
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Upcoming Interviews
            </h3>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dashboardData?.upcomingInterviews && dashboardData.upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                          {interview.candidateName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {interview.position}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {interview.time}
                        </p>
                      </div>
                      <Badge
                        variant={
                          interviewTypeBadge[interview.type].variant
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {interviewTypeBadge[interview.type].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                No upcoming interviews
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity
          isLoading={isLoading}
          activities={dashboardData?.recentActivity}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'New Job Posting', icon: '➕' },
            { title: 'Add Candidate', icon: '👤' },
            { title: 'Schedule Interview', icon: '📅' },
            { title: 'View Reports', icon: '📊' },
          ].map((action, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
