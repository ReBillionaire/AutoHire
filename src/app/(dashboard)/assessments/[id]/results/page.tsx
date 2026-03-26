'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface AssessmentResult {
  id: string;
  candidateName: string;
  assessmentTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: string;
  status: string;
  answers: Array<{
    questionText: string;
    answer: string;
    isCorrect: boolean;
    score: number;
  }>;
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/assessments/${params.id}/results`);
        if (!res.ok) throw new Error('Results not found');
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchResults();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
        <Link href="/assessments"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>
        <Card className="p-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-800 dark:text-red-200">{error || 'Results not found'}</p>
        </Card>
      </div>
    );
  }

  const scoreColor = result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <Link href="/assessments"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Assessment Results</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{result.assessmentTitle} — {result.candidateName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 text-center">
          <Award className={`w-8 h-8 mx-auto ${scoreColor}`} />
          <p className={`text-3xl font-bold mt-2 ${scoreColor}`}>{result.score}%</p>
          <p className="text-sm text-slate-500">Overall Score</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 text-center">
          <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
          <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{result.correctAnswers}/{result.totalQuestions}</p>
          <p className="text-sm text-slate-500">Correct Answers</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 text-center">
          <Clock className="w-8 h-8 mx-auto text-blue-600" />
          <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{result.timeTaken}m</p>
          <p className="text-sm text-slate-500">Time Taken</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 text-center">
          <p className="text-sm text-slate-500 mt-2">Completed</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">{new Date(result.completedAt).toLocaleDateString()}</p>
        </Card>
      </div>

      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Detailed Results</h3>
        <div className="space-y-4">
          {result.answers.map((answer, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Q{idx + 1}: {answer.questionText}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Answer: {answer.answer}</p>
                </div>
                {answer.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
