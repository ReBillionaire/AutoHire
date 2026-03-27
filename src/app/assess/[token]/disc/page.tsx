'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Statement {
  id: string;
  text: string;
  dimension: 'D' | 'I' | 'S' | 'C';
}

interface DISCQuestion {
  id: number;
  statements: Statement[];
}

interface Response {
  questionId: number;
  most: string;
  least: string;
}

export default function DISCTestPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [questions, setQuestions] = useState<DISCQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, Response>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/assess/disc?token=${token}`);
        if (!response.ok) {
          throw new Error('Failed to load DISC test');
        }
        const data = await response.json();
        setQuestions(data.questions);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-8 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-600">Loading DISC Assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-red-200 bg-red-50">
          <CardContent className="pt-8 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
            <p className="text-red-900 font-medium">{error}</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses[currentQuestion.id] || {
    questionId: currentQuestion.id,
    most: '',
    least: '',
  };

  const handleSelectMost = (statementId: string) => {
    setAnswerError(null);
    setResponses({
      ...responses,
      [currentQuestion.id]: {
        ...currentResponse,
        most: statementId,
      },
    });
  };

  const handleSelectLeast = (statementId: string) => {
    setAnswerError(null);
    setResponses({
      ...responses,
      [currentQuestion.id]: {
        ...currentResponse,
        least: statementId,
      },
    });
  };

  const handleNext = () => {
    if (!currentResponse.most || !currentResponse.least) {
      setAnswerError('Please select both MOST and LEAST statements');
      return;
    }

    if (currentResponse.most === currentResponse.least) {
      setAnswerError(
        'MOST and LEAST must be different statements'
      );
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswerError(null);
    } else {
      setShowReview(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswerError(null);
    }
  };

  const handleSubmit = async () => {
    // Verify all questions are answered
    const allAnswered = questions.every(
      (q) => responses[q.id]?.most && responses[q.id]?.least
    );

    if (!allAnswered) {
      setAnswerError('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/assess/disc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          responses: Object.values(responses),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      // Redirect to results page
      router.push(`/assess/${token}/disc/results`);
    } catch (err) {
      setAnswerError(
        err instanceof Error ? err.message : 'Failed to submit assessment'
      );
      setSubmitting(false);
    }
  };

  // Review screen
  if (showReview) {
    const allAnswered = questions.every(
      (q) => responses[q.id]?.most && responses[q.id]?.least
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Review Your Answers</h1>
            <p className="text-slate-600 mt-2">
              Please review your responses before submitting
            </p>
          </div>

          {/* Review Cards */}
          <div className="space-y-4 mb-8">
            {questions.map((question, idx) => {
              const response = responses[question.id];
              const mostStatement = question.statements.find(
                (s) => s.id === response?.most
              );
              const leastStatement = question.statements.find(
                (s) => s.id === response?.least
              );

              return (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <p className="font-medium text-slate-900">
                        Question {idx + 1}
                      </p>
                      {response?.most && response?.least && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 font-medium mb-1">
                          MOST like me
                        </p>
                        <p className="text-sm text-green-900">
                          {mostStatement?.text || '(Not selected)'}
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-700 font-medium mb-1">
                          LEAST like me
                        </p>
                        <p className="text-sm text-red-900">
                          {leastStatement?.text || '(Not selected)'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Error message */}
          {answerError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">{answerError}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => setShowReview(false)}
              variant="outline"
              className="flex-1"
            >
              Back to Questions
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !allAnswered}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main test UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">DISC Personality Test</h1>
          <p className="text-slate-600 mt-2">
            Understand your behavioral style and personality traits
          </p>
        </div>

        {/* Introduction (first question only) */}
        {currentQuestionIndex === 0 && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h2 className="font-semibold text-blue-900 mb-3">How DISC Works</h2>
              <p className="text-sm text-blue-800 mb-3">
                The DISC model measures four behavioral dimensions:
              </p>
              <ul className="text-sm text-blue-800 space-y-2 mb-4">
                <li className="flex gap-2">
                  <span className="font-medium text-red-700">D:</span>
                  <span>Dominance - Drive, decisiveness, and results orientation</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-yellow-700">I:</span>
                  <span>Influence - Enthusiasm, persuasion, and social interaction</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-green-700">S:</span>
                  <span>Steadiness - Reliability, patience, and team support</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-blue-700">C:</span>
                  <span>Conscientiousness - Accuracy, analysis, and quality focus</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <Badge variant="outline">
              {Math.round(
                ((currentQuestionIndex + 1) / questions.length) * 100
              )}
              %
            </Badge>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg">
              Select which statements are MOST and LEAST like you
            </CardTitle>
            <CardDescription>
              For each group of four statements, choose one that describes you
              MOST and one that describes you LEAST
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {/* Statements */}
            <div className="space-y-3 mb-6">
              {currentQuestion.statements.map((statement) => (
                <div
                  key={statement.id}
                  className="p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor:
                      currentResponse.most === statement.id ||
                      currentResponse.least === statement.id
                        ? '#3b82f6'
                        : '#e2e8f0',
                    backgroundColor:
                      currentResponse.most === statement.id
                        ? '#f0f9ff'
                        : currentResponse.least === statement.id
                          ? '#fef2f2'
                          : '#fff',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <p className="flex-1 text-slate-900">{statement.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectMost(statement.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentResponse.most === statement.id
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Most
                      </button>
                      <button
                        onClick={() => handleSelectLeast(statement.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentResponse.least === statement.id
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Least
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Error message */}
            {answerError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{answerError}</p>
              </div>
            )}

            {/* Selection indicator */}
            {currentResponse.most && currentResponse.least && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  You have selected both MOST and LEAST for this question
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex gap-4 items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-slate-600">
            {Object.keys(responses).filter((key) => {
              const qId = parseInt(key);
              return responses[qId]?.most && responses[qId]?.least;
            }).length}{' '}
            of {questions.length} answered
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!currentResponse.most || !currentResponse.least}
              size="lg"
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Review & Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!currentResponse.most || !currentResponse.least}
              size="lg"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
