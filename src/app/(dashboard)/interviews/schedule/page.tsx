'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AvailabilityPicker from '@/components/interviews/availability-picker';

interface Candidate {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
}

interface JobPosting {
  id: string;
  title: string;
}

interface Interviewer {
  id: string;
  name: string;
  email: string;
}

const interviewTypes = [
  { value: 'SCREENING', label: 'Screening Interview' },
  { value: 'PHONE', label: 'Phone Interview' },
  { value: 'TECHNICAL', label: 'Technical Interview' },
  { value: 'BEHAVIORAL', label: 'Behavioral Interview' },
  { value: 'CASE_STUDY', label: 'Case Study' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'FINAL', label: 'Final Interview' },
];

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [interviewers] = useState<Interviewer[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [sendInvite, setSendInvite] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch candidates and jobs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, jobsRes] = await Promise.all([
          fetch('/api/candidates'),
          fetch('/api/jobs'),
        ]);

        if (candidatesRes.ok) {
          const candidatesData = await candidatesRes.json();
          setCandidates(candidatesData);
        }
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingCandidates(false);
        setLoadingJobs(false);
      }
    };

    fetchData();
  }, []);

  const handleInterviewerToggle = (interviewerId: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(interviewerId)
        ? prev.filter((id) => id !== interviewerId)
        : [...prev, interviewerId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          jobId,
          type: interviewType,
          interviewerIds: selectedInterviewers,
          scheduledAt: new Date(selectedDate),
          duration: parseInt(duration),
          meetingLink: meetingLink || null,
          notes: notes || null,
          sendInvite,
        }),
      });

      if (response.ok) {
        router.push('/interviews');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCandidate = candidates.find((c) => c.id === candidateId);
  const selectedJob = jobs.find((j) => j.id === jobId);

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/interviews">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Schedule Interview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Set up a new interview with a candidate
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Candidate Selection */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Candidate & Position
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="candidate">Select Candidate</Label>
                {loadingCandidates ? (
                  <div className="flex items-center gap-2 p-2 text-slate-600 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading candidates...
                  </div>
                ) : (
                  <Select value={candidateId} onValueChange={setCandidateId}>
                    <SelectTrigger id="candidate">
                      <SelectValue placeholder="Choose a candidate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.name} ({candidate.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="job">Job Position</Label>
                {loadingJobs ? (
                  <div className="flex items-center gap-2 p-2 text-slate-600 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading jobs...
                  </div>
                ) : (
                  <Select value={jobId} onValueChange={setJobId}>
                    <SelectTrigger id="job">
                      <SelectValue placeholder="Choose a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </Card>

          {/* Interview Details */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Interview Details
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Interview Type</Label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select interview type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Interviewers</Label>
                {interviewers.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2 mt-2">
                    {interviewers.map((interviewer) => (
                      <div key={interviewer.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`interviewer-${interviewer.id}`}
                          checked={selectedInterviewers.includes(interviewer.id)}
                          onCheckedChange={() => handleInterviewerToggle(interviewer.id)}
                        />
                        <Label
                          htmlFor={`interviewer-${interviewer.id}`}
                          className="font-normal cursor-pointer flex-1"
                        >
                          <div>
                            <p>{interviewer.name}</p>
                            <p className="text-xs text-slate-500">{interviewer.email}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg mt-2">
                    No team members configured yet
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Date & Time
            </h2>

            {selectedInterviewers.length > 0 ? (
              <AvailabilityPicker
                interviewerIds={selectedInterviewers}
                slots={[]}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
              />
            ) : (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                Select at least one interviewer to see their availability
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Meeting Link & Notes */}
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="link">Meeting Link (Optional)</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="link"
                      placeholder="https://meet.google.com/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="button" variant="outline">
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Agenda & Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes, questions, or agenda items for this interview..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="send-invite"
                  checked={sendInvite}
                  onCheckedChange={(checked) => setSendInvite(Boolean(checked))}
                />
                <Label htmlFor="send-invite" className="font-normal cursor-pointer">
                  Send calendar invite to candidate and interviewers
                </Label>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!candidateId || !jobId || !interviewType || !selectedDate || isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Interview
            </Button>
            <Link href="/interviews" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4 h-fit sticky top-6">
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Interview Summary
            </h3>

            {selectedCandidate && (
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Candidate
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">
                    {selectedCandidate.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedCandidate.email}
                  </p>
                </div>
              </div>
            )}

            {selectedJob && (
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Position
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedJob.title}
                </p>
              </div>
            )}

            {interviewType && (
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Interview Type
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {interviewTypes.find((t) => t.value === interviewType)?.label}
                </p>
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                  <Clock className="w-4 h-4" />
                  {selectedTime}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Duration: {duration} minutes
                </div>
              </div>
            )}

            {selectedInterviewers.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Interviewers ({selectedInterviewers.length})
                </p>
                <div className="space-y-2">
                  {selectedInterviewers.map((id) => {
                    const interviewer = interviewers.find((i) => i.id === id);
                    return (
                      <div key={id} className="text-sm">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {interviewer?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
