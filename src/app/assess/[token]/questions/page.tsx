'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE';
  options?: string[];
  order: number;
}

interface AssessmentData {
  id: string;
  title: string;
  timeLimit: number;
  questions: Question[];
  startedAt: string;
}

export default function AssessQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/assess/${token}/questions`);
        if (!res.ok) throw new Error('Failed to load questions.');
        const data = await res.json();
        setAssessment(data);
        const startTime = new Date(data.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeLeft(Math.max(0, data.timeLimit * 60 - elapsed));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [token]);

  useEffect(() => {
    if (timeLeft <= 0 && assessment) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, assessment]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assess/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        router.push(`/assess/${token}/complete`);
      }
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  }, [token, answers, submitting, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </Card>
      </div>
    );
  }

  const questions = assessment.questions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isTimeWarning = timeLeft < 300 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white text-sm">{assessment.title}</h1>
            <p className="text-xs text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{answeredCount}/{questions.length} answered</Badge>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${isTimeWarning ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 bg-white dark:bg-slate-900">
          <div className="mb-6">
            <Badge variant="outline" className="mb-3">
              {currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : currentQuestion.type === 'CODE' ? 'Code' : 'Written Response'}
            </Badge>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options ? (
              currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[currentQuestion.id] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {answers[currentQuestion.id] === option && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm text-slate-900 dark:text-white">{option}</span>
                  </div>
                </button>
              ))
            ) : (
              <Textarea
                placeholder={currentQuestion.type === 'CODE' ? 'Write your code here...' : 'Type your answer here...'}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                rows={currentQuestion.type === 'CODE' ? 12 : 6}
                className={currentQuestion.type === 'CODE' ? 'font-mono text-sm' : ''}
              />
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentIndex
                    ? 'bg-blue-600'
                    : answers[questions[i].id]
                      ? 'bg-green-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit Assessment
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
