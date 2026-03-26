'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClipboardCheck, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AssessmentInfo {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questionCount: number;
  candidateName: string;
  jobTitle: string;
  status: string;
}

export default function AssessTokenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [assessment, setAssessment] = useState<AssessmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/assess/${token}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Assessment not found or link has expired.');
          throw new Error('Failed to load assessment.');
        }
        const data = await res.json();
        setAssessment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [token]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/assess/${token}/start`, { method: 'POST' });
      if (res.ok) {
        router.push(`/assess/${token}/questions`);
      }
    } catch {
      setError('Failed to start assessment. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-lg">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Assessment Unavailable
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {error || 'This assessment could not be found.'}
          </p>
        </Card>
      </div>
    );
  }

  if (assessment.status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900">
          <ClipboardCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Assessment Already Completed
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You have already submitted this assessment. Thank you!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full p-8 bg-white dark:bg-slate-900">
        <div className="text-center mb-8">
          <ClipboardCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {assessment.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {assessment.jobTitle}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {assessment.description || 'Complete this assessment as part of your application process.'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {assessment.questionCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">Questions</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-slate-500" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {assessment.timeLimit}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">Minutes</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-2">
            Before you begin:
          </h3>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <li>• Ensure you have a stable internet connection</li>
            <li>• The timer starts once you click Begin</li>
            <li>• You cannot pause once started</li>
            <li>• Answer all questions to the best of your ability</li>
          </ul>
        </div>

        <Button onClick={handleStart} disabled={starting} className="w-full" size="lg">
          {starting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            'Begin Assessment'
          )}
        </Button>

        <p className="text-xs text-center text-slate-500 mt-4">
          Welcome, {assessment.candidateName}
        </p>
      </Card>
    </div>
  );
}
