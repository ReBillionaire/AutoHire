'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface SessionData {
  session: {
    id: string;
    token: string;
    candidateName: string;
    jobTitle: string;
    status: string;
  };
  timeLimit: number;
  questions: Record<string, any[]>;
}

export default function AssessmentLandingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/assess?token=${token}`);

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load assessment');
          return;
        }

        const data = await response.json();
        setSessionData(data);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [token]);

  const handleBegin = async () => {
    setStarting(true);
    router.push(`/assess/${token}/questions`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-96 shadow-lg">
          <CardContent className="pt-8 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-96 shadow-lg border-red-200 bg-red-50">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mb-4" />
            <p className="text-red-700 font-medium mb-4">{error || 'Assessment not found'}</p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if already completed
  if (sessionData.session.status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="bg-white border-b">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-slate-900">Assessment</h1>
            <p className="text-sm text-slate-600 mt-1">Status Update</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <Card className="shadow-lg border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
            <CardHeader className="text-center border-b border-emerald-200">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-emerald-900">Assessment Complete</CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                You have already completed this assessment
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 text-center">
              <p className="text-slate-700 mb-6">
                Thank you for completing your assessment. Your responses have been submitted and will
                be reviewed by the hiring team. You will be contacted within 3-5 business days with
                next steps.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/">
                  <Button>Return Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalQuestions = Object.values(sessionData.questions).reduce(
    (sum, q) => sum + q.length,
    0
  );
  const estimatedTime = Math.ceil((totalQuestions * 3) / 60 + sessionData.timeLimit * 0.5); // questions + time limit

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Assessment</h1>
              <p className="text-sm text-slate-600 mt-1">Complete the evaluation</p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {sessionData.session.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-2xl">
              Welcome, {sessionData.session.candidateName}!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Assessment for {sessionData.session.jobTitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Assessment Overview */}
            <div className="mb-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">Assessment Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
                  <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-600">Total Questions</p>
                    <p className="font-semibold text-slate-900">{totalQuestions} questions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-600">Estimated Duration</p>
                    <p className="font-semibold text-slate-900">
                      {estimatedTime} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-600">Assessment Sections</p>
                    <p className="font-semibold text-slate-900">4 sections to complete</p>
                  </div>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">Assessment Sections:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-sm text-slate-700">
                      Skill Assessment ({sessionData.questions.SKILL?.length || 0} questions)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-sm text-slate-700">
                      Communication & Experience ({(sessionData.questions.COMMUNICATION?.length || 0) + (sessionData.questions.EXPERIENCE?.length || 0)} questions)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full"></span>
                    <span className="text-sm text-slate-700">
                      Psychometric ({sessionData.questions.PSYCHOMETRIC?.length || 0} questions)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Instructions */}
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Important Instructions
              </h3>
              <ul className="text-sm text-amber-900 space-y-2">
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Ensure a stable internet connection before starting</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Do not close or refresh your browser during the assessment</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>You can navigate between questions, but the timer will continue</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Your answers are automatically saved as you progress</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Please answer honestly and thoughtfully</span>
                </li>
              </ul>
            </div>

            {/* What We Evaluate */}
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-3">What We're Evaluating</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong>Technical Skills:</strong> Knowledge and practical competency in your domain
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>
                    <strong>Communication:</strong> How you articulate ideas and handle professional scenarios
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <strong>Experience:</strong> How you apply past experience to new situations
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>
                    <strong>Personality Fit:</strong> Work style and cultural alignment
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={handleBegin}
                disabled={starting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Begin Assessment
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={starting}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600">
          This assessment is confidential and will only be shared with the hiring team.
        </p>
      </div>
    </div>
  );
}
