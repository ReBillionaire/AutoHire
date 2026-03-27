/**
 * Video Analysis View Component
 * Displays communication and behavioral assessment from video transcript
 */

'use client';

import React from 'react';
import { VideoAnalysis } from '@/types/ai';
import { AIScoreBadge, ScoreBadgeContainer, CompactScoreBadge } from './ai-score-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CheckCircle2, AlertCircle, Lightbulb, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoAnalysisViewProps {
  analysis: VideoAnalysis;
  className?: string;
}

export function VideoAnalysisView({ analysis, className }: VideoAnalysisViewProps) {
  // Prepare chart data
  const metricsData = [
    { name: 'Communication', value: analysis.metrics.communication },
    { name: 'Confidence', value: analysis.metrics.confidence },
    { name: 'Enthusiasm', value: analysis.metrics.enthusiasm },
    { name: 'Professionalism', value: analysis.metrics.professionalism },
    { name: 'Clarity', value: analysis.metrics.clarity },
    { name: 'Pacing', value: analysis.metrics.pacing },
  ];

  const radarData = [
    { name: 'Communication', value: analysis.metrics.communication },
    { name: 'Confidence', value: analysis.metrics.confidence },
    { name: 'Enthusiasm', value: analysis.metrics.enthusiasm },
    { name: 'Professionalism', value: analysis.metrics.professionalism },
    { name: 'Clarity', value: analysis.metrics.clarity },
    { name: 'Pacing', value: analysis.metrics.pacing },
  ];

  const scores = [
    { label: 'Overall', value: analysis.overallScore },
    { label: 'Emotional\nIntelligence', value: analysis.emotionalIntelligence },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Video Assessment</CardTitle>
              <p className="mt-2 text-sm text-gray-600">{analysis.summary}</p>
            </div>
            <AIScoreBadge score={analysis.overallScore} size="lg" />
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Bar Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}/100`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                  <Tooltip formatter={(value) => `${value}/100`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600">Speaking Pace</p>
                <p className="mt-1 text-lg font-semibold capitalize text-gray-900">
                  {analysis.speakingPace}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600">Vocabulary Level</p>
                <p className="mt-1 text-lg font-semibold capitalize text-gray-900">
                  {analysis.vocabularyLevel}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600">Word Count</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {analysis.transcriptLength.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filler Words Analysis */}
      {analysis.filler_words && Object.values(analysis.filler_words).some((v) => v > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filler Word Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analysis.filler_words)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([word, count]) => (
                  <div key={word} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{word}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${Math.min(100, (count / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              {Object.values(analysis.filler_words).every((v) => v === 0) && (
                <p className="text-sm text-gray-500">No filler words detected - excellent!</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Quotes */}
      {analysis.keyQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Quotes & Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.keyQuotes.map((quote, idx) => (
                <div key={idx} className="border-l-4 border-blue-400 bg-blue-50 p-4">
                  <div className="flex gap-2">
                    <Quote className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="italic text-gray-900">"{quote.quote}"</p>
                      <p className="mt-2 text-sm text-gray-700">{quote.significance}</p>
                      <Badge className="mt-2">{quote.metric}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths and Areas for Improvement */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500 mt-1.5" />
                    {strength}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No strengths identified</p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.areasForImprovement.length > 0 ? (
                analysis.areasForImprovement.map((area, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500 mt-1.5" />
                    {area}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No areas identified</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                    {idx + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Emotional Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emotional Intelligence Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            <AIScoreBadge score={analysis.emotionalIntelligence} size="xl" />
            <div className="flex-1 space-y-2">
              <p className="text-sm text-gray-700">
                This score measures the candidate's ability to understand, manage, and express
                emotions effectively in communication and interpersonal interactions.
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">What this means:</p>
                {analysis.emotionalIntelligence >= 80 && (
                  <p className="text-gray-700">
                    Exceptional emotional awareness. Strong ability to connect with others and navigate
                    complex social situations.
                  </p>
                )}
                {analysis.emotionalIntelligence >= 60 &&
                  analysis.emotionalIntelligence < 80 && (
                    <p className="text-gray-700">
                      Good emotional awareness and interpersonal skills. Can effectively manage
                      professional interactions.
                    </p>
                  )}
                {analysis.emotionalIntelligence >= 40 &&
                  analysis.emotionalIntelligence < 60 && (
                    <p className="text-gray-700">
                      Moderate emotional awareness. Could benefit from developing empathy and
                      communication skills.
                    </p>
                  )}
                {analysis.emotionalIntelligence < 40 && (
                  <p className="text-gray-700">
                    May benefit from development in emotional awareness and interpersonal
                    communication.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
