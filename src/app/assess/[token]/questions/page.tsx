'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Flag,
  RotateCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

export const dynamic = 'force-dynamic';

interface Question {
  id: string;
  text: string;
  category: string;
  options: string[] | null;
  difficulty: string;
}

interface SessionData {
  session: {
    id: string;
    token: string;
    candidateName: string;
    jobTitle: string;
    status: string;
  };
  timeLimit: number;
  questions: Record<string, Question[]>;
}

interface Answer {
  questionId: string;
  questionText: string;
  category: string;
  answer: string | number;
  timeSpent: number;
}

export default function AssessmentQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assessment state
  const [currentCategory, setCurrentCategory] = useState<string>('SKILL');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Question timing
  const questionStartTime = useRef<Record<string, number>>({});

  // Fetch session on mount
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
        setTimeRemaining(data.timeLimit * 60); // Convert to seconds
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [token]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        const newTime = prev - 1;

        // Warning at 5 minutes
        if (newTime === 300 && !showTimeWarning) {
          setShowTimeWarning(true);
        }

        // Auto-submit at 0
        if (newTime <= 0) {
          handleSubmit();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, showTimeWarning]);

  // Track question view time
  useEffect(() => {
    if (currentCategory && sessionData?.questions) {
      const questions = sessionData.questions[currentCategory];
      if (questions && currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        const questionKey = `${currentCategory}-${currentQuestionIndex}`;
        questionStartTime.current[questionKey] = Date.now();
      }
    }
  }, [currentCategory, currentQuestionIndex, sessionData]);

  const handleAnswer = useCallback(
    (answer: string | number) => {
      if (!sessionData) return;

      const questions = sessionData.questions[currentCategory];
      if (!questions || currentQuestionIndex >= questions.length) return;

      const question = questions[currentQuestionIndex];
      const questionKey = `${currentCategory}-${currentQuestionIndex}`;

      // Calculate time spent on this question
      const timeSpent = Math.round(
        (Date.now() - (questionStartTime.current[questionKey] || Date.now())) /
          1000
      );

      setAnswers((prev) => ({
        ...prev,
        [questionKey]: {
          questionId: question.id,
          questionText: question.text,
          category: currentCategory,
          answer,
          timeSpent: Math.max(1, timeSpent),
        },
      }));

      // Auto-save answer
      saveAnswer(questionKey);
    },
    [currentCategory, currentQuestionIndex, sessionData]
  );

  const saveAnswer = async (questionKey: string) => {
    const answer = answers[questionKey];
    if (answer) {
      try {
        // Debounced auto-save - just log for now, batch on submit
      } catch (err) {
        console.error('Failed to save answer:', err);
      }
    }
  };

  const toggleFlag = () => {
    if (!sessionData) return;
    const questions = sessionData.questions[currentCategory];
    if (!questions) return;

    const questionKey = `${currentCategory}-${currentQuestionIndex}`;
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionKey)) {
        newSet.delete(questionKey);
      } else {
        newSet.add(questionKey);
      }
      return newSet;
    });
  };

  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (!sessionData) return;
    const questions = sessionData.questions[currentCategory];
    if (!questions) return;

    const newIndex = currentQuestionIndex + (direction === 'next' ? 1 : -1);
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Prepare response data
      const responseData = Object.values(answers);

      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          responses: responseData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      // Redirect to completion page
      router.push(`/assess/${token}/complete`);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading assessment...</p>
        </Card>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4 border-red-200 bg-red-50 max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-red-700 font-medium text-center">{error}</p>
          <Button onClick={() => router.back()} className="w-full">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const categories = Object.keys(sessionData.questions).filter(
    (cat) => sessionData.questions[cat].length > 0
  );
  const currentQuestions = sessionData.questions[currentCategory] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const questionKey = `${currentCategory}-${currentQuestionIndex}`;
  const currentAnswer = answers[questionKey];
  const isFlagged = flaggedQuestions.has(questionKey);

  // Calculate total progress
  const totalQuestions = Object.values(sessionData.questions).reduce(
    (sum, q) => sum + q.length,
    0
  );
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  // Check if all questions answered
  const allAnswered = answeredCount === totalQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header with Timer */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Assessment</h1>
              <p className="text-sm text-slate-600">
                {currentCategory} • Question {currentQuestionIndex + 1} of{' '}
                {currentQuestions.length}
              </p>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                timeRemaining && timeRemaining < 300
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Clock className="w-5 h-5" />
              {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{Math.round(progress)}% Complete</span>
              <span>{answeredCount} of {totalQuestions} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Time Warning */}
      {showTimeWarning && timeRemaining && timeRemaining < 300 && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              You have {formatTime(timeRemaining)} remaining. Complete your responses.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const catQuestions = sessionData.questions[cat] || [];
              const catAnswers = Object.keys(answers).filter(
                (k) => k.startsWith(cat)
              );
              const catProgress = Math.round(
                (catAnswers.length / catQuestions.length) * 100
              );

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCurrentCategory(cat);
                    setCurrentQuestionIndex(0);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    currentCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                  <span
                    className={`text-xs ml-2 ${
                      currentCategory === cat
                        ? 'text-blue-100'
                        : 'text-slate-600'
                    }`}
                  >
                    {catProgress}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <Card className="p-8 shadow-lg mb-8">
            {/* Question Text */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex-1">
                  {currentQuestion?.text}
                </h2>
                <button
                  onClick={toggleFlag}
                  className={`ml-4 flex-shrink-0 p-2 rounded-lg transition-colors ${
                    isFlagged
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Flag for review"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              {/* Difficulty Badge */}
              <div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    currentQuestion?.difficulty === 'EASY'
                      ? 'bg-green-100 text-green-700'
                      : currentQuestion?.difficulty === 'HARD'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {currentQuestion?.difficulty} Level
                </span>
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-8">
              {currentCategory === 'SKILL' &&
                currentQuestion?.options &&
                currentQuestion.options.length > 0 && (
                  <RadioGroup
                    value={String(currentAnswer?.answer || '')}
                    onValueChange={handleAnswer}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <RadioGroupItem
                            value={option}
                            id={`option-${idx}`}
                          />
                          <label
                            htmlFor={`option-${idx}`}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-medium text-slate-700">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="ml-3 text-slate-900">
                              {option}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

              {(currentCategory === 'COMMUNICATION' ||
                currentCategory === 'EXPERIENCE') && (
                <Textarea
                  value={currentAnswer?.answer || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Please provide a detailed response (50-500 characters)..."
                  className="min-h-48 p-4 border border-slate-200 rounded-lg"
                />
              )}

              {currentCategory === 'PSYCHOMETRIC' &&
                currentQuestion?.options &&
                currentQuestion.options.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Strongly Disagree</span>
                      <span>Strongly Agree</span>
                    </div>
                    <RadioGroup
                      value={String(currentAnswer?.answer || '')}
                      onValueChange={(val) => handleAnswer(parseInt(val))}
                    >
                      <div className="flex gap-2 justify-between">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div
                            key={value}
                            className="flex-1 flex justify-center"
                          >
                            <label className="flex flex-col items-center cursor-pointer gap-2">
                              <div
                                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  currentAnswer?.answer === value
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                                }`}
                              >
                                <RadioGroupItem
                                  value={String(value)}
                                  id={`likert-${value}`}
                                  className="sr-only"
                                />
                                <span className="font-bold">{value}</span>
                              </div>
                              <span className="text-xs text-slate-600 text-center">
                                {value === 1 && 'Strongly\nDisagree'}
                                {value === 2 && 'Disagree'}
                                {value === 3 && 'Neutral'}
                                {value === 4 && 'Agree'}
                                {value === 5 && 'Strongly\nAgree'}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}

              {/* Character count for open-ended */}
              {(currentCategory === 'COMMUNICATION' ||
                currentCategory === 'EXPERIENCE') && (
                <div className="mt-3 text-xs text-slate-600 text-right">
                  {currentAnswer?.answer
                    ? `${String(currentAnswer.answer).length} characters`
                    : '0 characters'}
                  {' '} (50-500 recommended)
                </div>
              )}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3 mb-8">
            <Button
              onClick={() => navigateQuestion('prev')}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex-1" />

            {currentQuestionIndex === currentQuestions.length - 1 &&
            currentCategory === categories[categories.length - 1] ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting || !allAnswered}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </Button>
            ) : currentQuestionIndex < currentQuestions.length - 1 ? (
              <Button onClick={() => navigateQuestion('next')} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const nextCatIndex =
                    categories.indexOf(currentCategory) + 1;
                  if (nextCatIndex < categories.length) {
                    setCurrentCategory(categories[nextCatIndex]);
                    setCurrentQuestionIndex(0);
                  }
                }}
                className="gap-2"
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <Card className="p-4 bg-white border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Question Navigator
            </p>
            <div className="grid grid-cols-10 gap-2">
              {currentQuestions.map((_, idx) => {
                const qKey = `${currentCategory}-${idx}`;
                const isAnswered = answers[qKey] !== undefined;
                const isCurrentQuestion = idx === currentQuestionIndex;
                const isFlaggedQuestion = flaggedQuestions.has(qKey);

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-full h-10 rounded-lg font-medium text-sm transition-all ${
                      isCurrentQuestion
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : isAnswered
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : isFlaggedQuestion
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                    title={`Question ${idx + 1}${isAnswered ? ' (answered)' : ''}${isFlaggedQuestion ? ' (flagged)' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You have answered {answeredCount} of {totalQuestions} questions.
              </p>
              {!allAnswered && (
                <p className="text-yellow-700 bg-yellow-50 p-2 rounded">
                  Some questions are unanswered. They will be submitted as blank.
                </p>
              )}
              <p>This action cannot be undone. Are you sure?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
