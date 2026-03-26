'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Share2, MoreVertical, FileText, Lightbulb, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Scorecard from '@/components/interviews/scorecard';
import InterviewSummary from '@/components/interviews/interview-summary';

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidateImage?: string;
  jobTitle: string;
  type: 'SCREENING' | 'PHONE' | 'TECHNICAL' | 'BEHAVIORAL' | 'CASE_STUDY' | 'PRESENTATION' | 'FINAL';
  scheduledAt: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  interviewer: string;
  resume?: string;
  resumeText?: string;
}

interface ScoreCriteria {
  name: string;
  rating: number;
}

const defaultCriteria: ScoreCriteria[] = [
  { name: 'Communication', rating: 0 },
  { name: 'Technical Skills', rating: 0 },
  { name: 'Problem Solving', rating: 0 },
  { name: 'Culture Fit', rating: 0 },
  { name: 'Leadership', rating: 0 },
  { name: 'Motivation', rating: 0 },
];

export default function InterviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [showScorecardForm, setShowScorecardForm] = useState(false);
  const [criteria, setCriteria] = useState<ScoreCriteria[]>(defaultCriteria);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/interviews/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch interview');
        const data = await response.json();

        const transformedInterview: Interview = {
          id: data.id,
          candidateName: data.candidate?.name || 'Unknown',
          candidateEmail: data.candidate?.email || '',
          candidateImage: data.candidate?.name
            ?.split(' ')
            .map((n: string) => n[0])
            .join(''),
          jobTitle: data.jobPosting?.title || 'Unknown',
          type: data.type,
          scheduledAt: new Date(data.scheduledAt),
          status: data.status,
          interviewer: data.interviewer || 'Unassigned',
          resume: data.candidate?.resume,
          resumeText: data.candidate?.resumeText,
        };

        setInterview(transformedInterview);
        setShowScorecardForm(transformedInterview.status === 'COMPLETED');
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
        <Link href="/interviews">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <Card className="p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-200">
            {error || 'Interview not found'}
          </p>
        </Card>
      </div>
    );
  }

  const isInterviewCompleted = interview.status === 'COMPLETED';
  const isScheduled = interview.status === 'SCHEDULED';
  const isInProgress = interview.status === 'IN_PROGRESS';

  const handleSetCriteriaRating = (index: number, rating: number) => {
    const newCriteria = [...criteria];
    newCriteria[index].rating = rating;
    setCriteria(newCriteria);
  };

  const getOverallScore = () => {
    const ratings = criteria.filter((c) => c.rating > 0).map((c) => c.rating);
    if (ratings.length === 0) return 0;
    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  };

  const handleSubmitFeedback = async () => {
    if (!recommendation) {
      alert('Please select a recommendation');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/interviews/${interview.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria: criteria.map((c) => ({ name: c.name, rating: c.rating })),
          recommendation,
          strengths,
          concerns,
          notes,
        }),
      });

      if (response.ok) {
        alert('Feedback submitted successfully');
        router.push('/interviews');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceCandidate = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/interviews/${interview.id}/advance`, {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/interviews');
      }
    } catch (error) {
      console.error('Error advancing candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectCandidate = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/interviews/${interview.id}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/interviews');
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeBadgeVariant = {
    SCREENING: 'outline',
    PHONE: 'secondary',
    TECHNICAL: 'default',
    BEHAVIORAL: 'outline',
    CASE_STUDY: 'secondary',
    PRESENTATION: 'default',
    FINAL: 'destructive',
  } as const;

  const statusBadgeVariant = {
    SCHEDULED: 'secondary',
    IN_PROGRESS: 'default',
    COMPLETED: 'default',
    CANCELLED: 'outline',
    NO_SHOW: 'destructive',
  } as const;

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/interviews">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Interview Details
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {interview.jobTitle} • {interview.scheduledAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInterviewCompleted && (
            <>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Candidate Info Card */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">
                {interview.candidateImage || 'UN'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {interview.candidateName}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">{interview.candidateEmail}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={typeBadgeVariant[interview.type]}>
                  {interview.type.charAt(0) + interview.type.slice(1).toLowerCase()}
                </Badge>
                <Badge variant={statusBadgeVariant[interview.status]}>
                  {interview.status.charAt(0) + interview.status.slice(1).toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-right space-y-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Interviewer
              </p>
              <p className="font-medium text-slate-900 dark:text-white mt-1">
                {interview.interviewer}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={isInterviewCompleted ? 'feedback' : 'summary'} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6 space-y-6">
          {isScheduled && (
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Get Ready for This Interview
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Review the candidate summary and AI-generated insights below to prepare.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <InterviewSummary
            candidateName={interview.candidateName}
            jobTitle={interview.jobTitle}
            resumeText={interview.resumeText}
          />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-6 space-y-6">
          {isInterviewCompleted || isInProgress ? (
            <>
              {/* Scorecard Section */}
              <Card className="p-6 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Interview Scorecard
                  </h3>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Overall Score
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {getOverallScore().toFixed(1)}
                      <span className="text-sm text-slate-500 dark:text-slate-400">/5.0</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {criteria.map((criterion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-700 dark:text-slate-300">
                          {criterion.name}
                        </Label>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {criterion.rating === 0 ? 'Not rated' : `${criterion.rating}/5`}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleSetCriteriaRating(index, star)}
                            className="transition-all hover:scale-110"
                          >
                            <Star
                              className="w-6 h-6"
                              fill={star <= criterion.rating ? '#fbbf24' : 'none'}
                              stroke={
                                star <= criterion.rating ? '#fbbf24' : '#cbd5e1'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommendation Section */}
              <Card className="p-6 bg-white dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Recommendation
                </h3>
                <Select value={recommendation} onValueChange={setRecommendation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRONG_HIRE">
                      <span className="text-green-600 font-medium">Strong Hire</span>
                    </SelectItem>
                    <SelectItem value="HIRE">
                      <span className="text-blue-600 font-medium">Hire</span>
                    </SelectItem>
                    <SelectItem value="NO_HIRE">
                      <span className="text-amber-600 font-medium">No Hire</span>
                    </SelectItem>
                    <SelectItem value="STRONG_NO_HIRE">
                      <span className="text-red-600 font-medium">Strong No Hire</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Card>

              {/* Detailed Feedback Section */}
              <Card className="p-6 bg-white dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Detailed Feedback
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="strengths" className="text-slate-700 dark:text-slate-300">
                      Strengths
                    </Label>
                    <Textarea
                      id="strengths"
                      placeholder="What did the candidate do well?"
                      rows={3}
                      className="mt-2"
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="concerns" className="text-slate-700 dark:text-slate-300">
                      Concerns & Areas for Growth
                    </Label>
                    <Textarea
                      id="concerns"
                      placeholder="What areas need improvement or clarification?"
                      rows={3}
                      className="mt-2"
                      value={concerns}
                      onChange={(e) => setConcerns(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any other observations or comments..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              {isInterviewCompleted && (
                <>
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Feedback
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAdvanceCandidate}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Advance to Next Round
                    </Button>
                    <Button
                      onClick={handleRejectCandidate}
                      disabled={isSubmitting}
                      variant="outline"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Schedule Follow-up
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <Card className="p-8 text-center bg-white dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-400">
                Feedback will be available after the interview is completed.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Interview Notes
            </h3>
            <Textarea
              placeholder="Add notes about this interview..."
              rows={8}
              className="font-mono text-sm"
              defaultValue={`• Candidate demonstrated strong technical knowledge
• Good communication skills
• Asked thoughtful questions about company culture
• Mentioned interest in mentoring junior developers`}
            />
            <Button className="mt-4">Save Notes</Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resume Section */}
      {interview.resume && (
        <Card className="p-6 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Candidate Resume
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {interview.resumeText}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Full Resume
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
