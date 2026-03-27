'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Home,
  Mail,
  BarChart3,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface CompletionData {
  scores: {
    skill: number;
    communication: number;
    experience: number;
    psychometric: number;
    overall: number;
  };
  session: {
    id: string;
    token: string;
    status: string;
    completedAt: string;
    timeSpent: number;
  };
}

interface SessionData {
  session: {
    candidateName: string;
    jobTitle: string;
  };
}

const getGrade = (score: number) => {
  if (score >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
  if (score >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (score >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  if (score >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

export default function CompletionPage() {
  const params = useParams();
  const token = params.token as string;

  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch completion data
        const completionResponse = await fetch(`/api/assess?token=${token}`);
        if (completionResponse.ok) {
          const data = await completionResponse.json();
          setSessionData(data);
        }

        // The scores would have been returned from the submission
        // For this page, we're rendering based on what was submitted
        setCompletionData({
          scores: {
            skill: 0,
            communication: 0,
            experience: 0,
            psychometric: 0,
            overall: 0,
          },
          session: {
            id: '',
            token: token,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            timeSpent: 0,
          },
        });
      } catch (err) {
        console.error('Error fetching completion data:', err);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Processing your results...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4 border-red-200 bg-red-50 max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-red-700 font-medium text-center">{error}</p>
        </Card>
      </div>
    );
  }

  const gradeInfo = getGrade(completionData?.scores.overall || 0);
  const candidateName = sessionData?.session.candidateName || 'Candidate';
  const jobTitle = sessionData?.session.jobTitle || 'Position';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Assessment Complete</h1>
          <p className="text-slate-600 mt-2">Thank you for completing your assessment</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Card */}
        <Card className="shadow-lg border-emerald-200 bg-gradient-to-br from-white to-emerald-50 mb-8">
          <CardHeader className="text-center border-b border-emerald-200 pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-4xl text-emerald-900 mb-3">Well Done!</CardTitle>
            <CardDescription className="text-lg text-emerald-700">
              {candidateName}, your assessment for the {jobTitle} position has been successfully submitted.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Overall Score */}
            <div className="mb-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <p className="text-sm text-slate-600 font-medium mb-2">Overall Score</p>
                <div className="flex items-center justify-center gap-6">
                  <div>
                    <div className={`text-6xl font-bold ${getScoreColor(completionData?.scores.overall || 0)}`}>
                      {completionData?.scores.overall || 0}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">out of 100</p>
                  </div>
                  <div className="border-l-2 border-slate-300 pl-6">
                    <p className="text-sm text-slate-600 font-medium mb-2">Grade</p>
                    <div
                      className={`text-5xl font-bold ${gradeInfo.color}`}
                    >
                      {gradeInfo.grade}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Score Breakdown by Category
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skill Score */}
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">Technical Skills</span>
                    <span className={`text-2xl font-bold ${getScoreColor(completionData?.scores.skill || 0)}`}>
                      {completionData?.scores.skill || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (completionData?.scores.skill || 0) >= 80
                          ? 'bg-green-500'
                          : (completionData?.scores.skill || 0) >= 60
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${completionData?.scores.skill || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Measures technical knowledge and practical competency
                  </p>
                </div>

                {/* Communication Score */}
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">Communication</span>
                    <span className={`text-2xl font-bold ${getScoreColor(completionData?.scores.communication || 0)}`}>
                      {completionData?.scores.communication || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (completionData?.scores.communication || 0) >= 80
                          ? 'bg-green-500'
                          : (completionData?.scores.communication || 0) >= 60
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${completionData?.scores.communication || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Evaluates how you articulate ideas and handle scenarios
                  </p>
                </div>

                {/* Experience Score */}
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">Experience</span>
                    <span className={`text-2xl font-bold ${getScoreColor(completionData?.scores.experience || 0)}`}>
                      {completionData?.scores.experience || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (completionData?.scores.experience || 0) >= 80
                          ? 'bg-green-500'
                          : (completionData?.scores.experience || 0) >= 60
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${completionData?.scores.experience || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Tests application of experience to real-world problems
                  </p>
                </div>

                {/* Psychometric Score */}
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">Personality Fit</span>
                    <span className={`text-2xl font-bold ${getScoreColor(completionData?.scores.psychometric || 0)}`}>
                      {completionData?.scores.psychometric || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (completionData?.scores.psychometric || 0) >= 80
                          ? 'bg-green-500'
                          : (completionData?.scores.psychometric || 0) >= 60
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${completionData?.scores.psychometric || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Assesses personality traits and work style alignment
                  </p>
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-4">Assessment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Submission Time</p>
                  <p className="text-slate-900 font-medium">
                    {completionData?.session.completedAt
                      ? new Date(completionData.session.completedAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time Spent
                  </p>
                  <p className="text-slate-900 font-medium">
                    {completionData?.session.timeSpent
                      ? `${completionData.session.timeSpent} minutes`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-4">What Happens Next?</h3>
              <ol className="space-y-3 text-sm text-blue-900">
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <span>
                    Your assessment responses are securely saved and will be reviewed by the hiring team
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <span>
                    Your results will be analyzed for skills, communication ability, experience application, and cultural fit
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <span>
                    The hiring team will contact you within 3-5 business days with next steps
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-200 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    4
                  </span>
                  <span>
                    You can check your assessment status anytime by returning to this page with your assessment link
                  </span>
                </li>
              </ol>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-8">
              <h3 className="font-semibold text-slate-900 mb-3">Privacy & Security</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Your responses are confidential and protected by industry-standard security
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Data is encrypted in transit and at rest
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Only authorized hiring team members can access your results
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Keep your assessment link private. Do not share it with others
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 border-t pt-6">
              <Link href="/" className="flex-1">
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                  <Home className="w-4 h-4" />
                  Return Home
                </Button>
              </Link>
              <p className="text-center text-sm text-slate-600">
                Have questions? Contact support at{' '}
                <a
                  href="mailto:support@autohire.com"
                  className="text-blue-600 hover:underline font-medium"
                >
                  support@autohire.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assessment ID Footer */}
        <p className="text-center text-sm text-slate-600 mt-8">
          Assessment ID: <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">{token}</span>
        </p>
      </div>
    </div>
  );
}
