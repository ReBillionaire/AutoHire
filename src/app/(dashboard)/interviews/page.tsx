'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Calendar, List, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import CalendarView from '@/components/interviews/calendar-view';
import InterviewCard from '@/components/interviews/interview-card';

interface Interview {
  id: string;
  candidateName: string;
  candidateImage?: string;
  jobTitle: string;
  type: 'SCREENING' | 'PHONE' | 'TECHNICAL' | 'BEHAVIORAL' | 'CASE_STUDY' | 'PRESENTATION' | 'FINAL';
  scheduledAt: Date;
  interviewer: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/interviews');
        if (!response.ok) throw new Error('Failed to fetch interviews');
        const data = await response.json();

        const interviewsList = Array.isArray(data) ? data : (data.interviews || []);

        const transformedInterviews = interviewsList.map((interview: any) => ({
          id: interview.id,
          candidateName: interview.candidate?.name || 'Unknown',
          candidateImage: interview.candidate?.name
            ?.split(' ')
            .map((n: string) => n[0])
            .join(''),
          jobTitle: interview.jobPosting?.title || 'Unknown',
          type: interview.type,
          scheduledAt: new Date(interview.scheduledAt),
          interviewer: interview.interviewer || 'Unassigned',
          status: interview.status,
        }));

        setInterviews(transformedInterviews);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const matchesSearch =
        !searchTerm ||
        interview.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
      const matchesType = typeFilter === 'all' || interview.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [interviews, searchTerm, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      total: interviews.length,
      scheduled: interviews.filter((i) => i.status === 'SCHEDULED').length,
      completed: interviews.filter((i) => i.status === 'COMPLETED').length,
      thisWeek: interviews.filter((i) => i.scheduledAt >= now && i.scheduledAt <= weekFromNow).length,
    };
  }, [interviews]);

  const interviewTypes = ['SCREENING', 'PHONE', 'TECHNICAL', 'BEHAVIORAL', 'CASE_STUDY', 'PRESENTATION', 'FINAL'];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[1400px]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and manage candidate interviews.
          </p>
        </div>
        <Link href="/interviews/schedule">
          <Button size="sm" className="gap-1.5 h-9 text-sm">
            <Plus className="w-3.5 h-3.5" />
            Schedule Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, style: 'text-foreground' },
            { label: 'Scheduled', value: stats.scheduled, style: 'text-blue-600 dark:text-blue-400' },
            { label: 'Completed', value: stats.completed, style: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'This Week', value: stats.thisWeek, style: 'text-foreground' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.style}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm text-destructive">Error loading interviews: {error}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="bg-muted/50 p-0.5 rounded-lg h-auto w-auto inline-flex">
          <TabsTrigger value="calendar" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5 gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5 gap-1.5">
            <List className="w-3.5 h-3.5" />
            List
          </TabsTrigger>
          <TabsTrigger value="my-interviews" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5 gap-1.5">
            <User className="w-3.5 h-3.5" />
            My Interviews
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-5">
          {loading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <CalendarView interviews={filteredInterviews} />
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-5 space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search candidates or jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm bg-muted/50 border-transparent hover:border-border focus:border-primary"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 h-9 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40 h-9 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {interviewTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : filteredInterviews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {interviews.length === 0 ? 'No interviews scheduled' : 'No interviews match your filters'}
              </p>
              <p className="text-xs text-muted-foreground">
                {interviews.length === 0 ? 'Schedule your first interview to get started.' : 'Try adjusting your search or filters.'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* My Interviews */}
        <TabsContent value="my-interviews" className="mt-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search your interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 border-transparent hover:border-border focus:border-primary"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : filteredInterviews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No interviews scheduled for you.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
