'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Briefcase, Calendar, Plus, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/dashboard/stats-card';
import { PipelineChart } from '@/components/dashboard/pipeline-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';

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

const quickActions = [
  { title: 'New Job', href: '/jobs/create', icon: Plus, description: 'Post a new position' },
  { title: 'Add Candidate', href: '/candidates', icon: Users, description: 'Import or add manually' },
  { title: 'Schedule Interview', href: '/interviews/schedule', icon: Calendar, description: 'Book a time slot' },
  { title: 'View Pipeline', href: '/pipeline', icon: BarChart3, description: 'Track candidate progress' },
];

const interviewTypeBadgeStyles = {
  phone: 'bg-muted text-muted-foreground',
  video: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'in-person': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
};

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
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your recruitment activity.
          </p>
        </div>
        <Link href="/jobs/create">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-sm text-destructive">
          Unable to load dashboard data. Please try refreshing.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Briefcase}
          label="Open Jobs"
          value={dashboardData?.stats.activeJobs ?? 0}
          trend={{ direction: 'up', percentage: 5, period: 'last month' }}
          isLoading={isLoading}
        />
        <StatsCard
          icon={Users}
          label="Candidates"
          value={dashboardData?.stats.totalCandidates ?? 0}
          trend={{ direction: 'up', percentage: 12, period: 'last month' }}
          isLoading={isLoading}
        />
        <StatsCard
          icon={Calendar}
          label="Interviews"
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline chart */}
        <div className="lg:col-span-2">
          <PipelineChart
            isLoading={isLoading}
            data={dashboardData?.pipeline}
          />
        </div>

        {/* Upcoming interviews */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">
              Upcoming Interviews
            </h3>
            <Link href="/interviews" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : dashboardData?.upcomingInterviews && dashboardData.upcomingInterviews.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {interview.candidateName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {interview.position}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {interview.time}
                      </p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      interviewTypeBadgeStyles[interview.type]
                    }`}>
                      {interview.type === 'in-person' ? 'In-Person' : interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No upcoming interviews</p>
              <Link href="/interviews/schedule">
                <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule One
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity
        isLoading={isLoading}
        activities={dashboardData?.recentActivity}
      />

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-elevation-1 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-[18px] h-[18px] text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
