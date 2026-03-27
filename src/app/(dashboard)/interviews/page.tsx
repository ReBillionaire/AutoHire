'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Filter, Calendar, List, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  const [interviewerFilter, setInterviewerFilter] = useState<string>('all');

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/interviews');
        if (!response.ok) throw new Error('Failed to fetch interviews');
        const data = await response.json();

        // Transform API response to Interview format
        // Defensive: handle both array and object API responses
        const dataArr = Array.isArray(data) ? data : (data?.interviews || data?.data || []);
        const transformedInterviews = dataArr.map((interview: any) => ({
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

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const matchesSearch =
        interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
      const matchesType = typeFilter === 'all' || interview.type === typeFilter;
      const matchesInterviewer =
        interviewerFilter === 'all' || interview.interviewer === interviewerFilter;

      return matchesSearch && matchesStatus && matchesType && matchesInterviewer;
    });
  }, [interviews, searchTerm, statusFilter, typeFilter, interviewerFilter]);

  const uniqueInterviewers = [...new Set(interviews.map((i) => i.interviewer))];
  const interviewTypes = [
    'SCREENING',
    'PHONE',
    'TECHNICAL',
    'BEHAVIORAL',
    'CASE_STUDY',
    'PRESENTATION',
    'FINAL',
  ];

  const statusBadgeVariant = {
    SCHEDULED: 'secondary' as const,
    COMPLETED: 'default' as const,
    CANCELLED: 'outline' as const,
    NO_SHOW: 'destructive' as const,
  };

  const typeBadgeVariant = {
    SCREENING: 'outline' as const,
    PHONE: 'secondary' as const,
    TECHNICAL: 'default' as const,
    BEHAVIORAL: 'outline' as const,
    CASE_STUDY: 'secondary' as const,
    PRESENTATION: 'default' as const,
    FINAL: 'destructive' as const,
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Interviews
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage and conduct interviews with candidates
          </p>
        </div>
        <Link href="/interviews/schedule">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Interview
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-200">
            Error loading interviews: {error}
          </p>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="my-interviews" className="gap-2">
            <User className="w-4 h-4" />
            My Interviews
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          {loading ? (
            <Card className="p-8 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Loading interviews...</p>
            </Card>
          ) : (
            <CalendarView interviews={filteredInterviews} />
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-sm">Filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Search candidates or jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-1 md:col-span-2"
              />

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {interviewTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={interviewerFilter} onValueChange={setInterviewerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Interviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interviewers</SelectItem>
                  {uniqueInterviewers.map((interviewer) => (
                    <SelectItem key={interviewer} value={interviewer}>
                      {interviewer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interviews List */}
          {loading ? (
            <Card className="p-8 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Loading interviews...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    {interviews.length === 0 ? 'No interviews scheduled yet.' : 'No interviews found matching your filters.'}
                  </p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* My Interviews View */}
        <TabsContent value="my-interviews" className="mt-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <Input
              placeholder="Search your interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <Card className="p-8 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Loading interviews...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    No interviews scheduled for you.
                  </p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Interviews</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {interviews.length}
            </p>
          </Card>
          <Card className="p-4 bg-white dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {interviews.filter((i) => i.status === 'SCHEDULED').length}
            </p>
          </Card>
          <Card className="p-4 bg-white dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {interviews.filter((i) => i.status === 'COMPLETED').length}
            </p>
          </Card>
          <Card className="p-4 bg-white dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">This Week</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {interviews.filter((i) => {
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return i.scheduledAt >= now && i.scheduledAt <= weekFromNow;
              }).length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
