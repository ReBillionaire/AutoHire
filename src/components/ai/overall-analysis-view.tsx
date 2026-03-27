/**
 * Overall Analysis View Component
 * Displays comprehensive candidate evaluation across all dimensions
 */

'use client';

import React from 'react';
import { OverallScore } from '@/types/ai';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  Users,
  ArrowRight,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverallAnalysisViewProps {
  score: OverallScore;
  className?: string;
}

export function OverallAnalysisView({ score, className }: OverallAnalysisViewProps) {
  const scoreData = [
    {
      name: 'Score',
      'Resume (30%)': score.scoring.componentScores.resume * 0.3,
      'Assessment (35%)': score.scoring.componentScores.assessment * 0.35,
      'Video (15%)': score.scoring.componentScores.video * 0.15,
      'DISC (20%)': score.scoring.componentScores.disc * 0.2,
    },
  ];

  const recommendationColors = {
    strong_yes: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    yes: 'bg-green-100 border-green-300 text-green-900',
    maybe: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    no: 'bg-orange-100 border-orange-300 text-orange-900',
    strong_no: 'bg-red-100 border-red-300 text-red-900',
  };

  const recommendationText = {
    strong_yes: 'Highly Recommended',
    yes: 'Recommended',
    maybe: 'Consider Further',
    no: 'Not Recommended',
    strong_no: 'Not Suitable',
  };

  const performanceData = [
    { name: 'Technical', value: score.estimatedPerformance.technicalCapability },
    { name: 'Team Integration', value: score.estimatedPerformance.teamIntegration },
    { name: 'Growth', value: score.estimatedPerformance.growthTrajectory },
    { name: 'Retention', value: score.estimatedPerformance.retentionLikelihood },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Recommendation */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="text-2xl">Candidate Assessment Summary</CardTitle>
              <p className="mt-2 text-gray-700">{score.reasoning}</p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <AIScoreBadge score={score.scoring.overallScore} size="xl" />
              <div
                className={cn(
                  'rounded-lg border px-4 py-2 text-center font-semibold',
                  recommendationColors[score.recommendation]
                )}
              >
                <p className="text-sm">{recommendationText[score.recommendation]}</p>
                <p className="text-xs mt-1 opacity-75">{score.confidence}% confidence</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Component Scores Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown by Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Weighted Visualization */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Resume (30%)" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Assessment (35%)" stackId="a" fill="#10b981" />
                  <Bar dataKey="Video (15%)" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="DISC (20%)" stackId="a" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Individual Component Scores */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <p className="text-sm font-medium text-blue-900">Resume</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {score.scoring.componentScores.resume}
                </p>
                <p className="text-xs text-blue-700 mt-1">30% weight</p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-sm font-medium text-green-900">Assessment</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {score.scoring.componentScores.assessment}
                </p>
                <p className="text-xs text-green-700 mt-1">35% weight</p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-sm font-medium text-amber-900">Video</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {score.scoring.componentScores.video}
                </p>
                <p className="text-xs text-amber-700 mt-1">15% weight</p>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
                <p className="text-sm font-medium text-purple-900">DISC</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {score.scoring.componentScores.disc}
                </p>
                <p className="text-xs text-purple-700 mt-1">20% weight</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {score.comparison.strengths.length > 0 ? (
                  score.comparison.strengths.map((strength, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500 mt-1" />
                      {strength}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No strengths identified</p>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Weaknesses
              </h4>
              <ul className="space-y-2">
                {score.comparison.weaknesses.length > 0 ? (
                  score.comparison.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 mt-1" />
                      {weakness}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No weaknesses identified</p>
                )}
              </ul>
            </div>

            {/* Unique Qualities */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Unique Qualities
              </h4>
              <ul className="space-y-2">
                {score.comparison.uniqueQualities.length > 0 ? (
                  score.comparison.uniqueQualities.map((quality, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 mt-1" />
                      {quality}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No unique qualities identified</p>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fit Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Fit Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Role Alignment</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {score.comparison.roleAlignment}%
                </p>
                <p className="text-xs text-gray-500 mt-1">How well they fit the job</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Users className="h-8 w-8 text-emerald-600" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Culture Fit</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {score.comparison.cultureFitScore}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Values & work style alignment</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Growth Potential</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {score.comparison.growthPotential}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Ability to grow into role</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Performance Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}/100`} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-600">Technical</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {score.estimatedPerformance.technicalCapability}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-600">Team Integration</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {score.estimatedPerformance.teamIntegration}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-600">Growth Trajectory</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {score.estimatedPerformance.growthTrajectory}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-600">Retention Likelihood</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {score.estimatedPerformance.retentionLikelihood}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Red and Green Flags */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Green Flags */}
        {score.greenFlags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Green Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {score.greenFlags.map((flag, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500 mt-1.5" />
                    {flag}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Red Flags */}
        {score.redFlags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {score.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500 mt-1.5" />
                    {flag}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Interview Focus Areas */}
      {score.interviewFocusAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Interview Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.interviewFocusAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700 pt-0.5">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {score.nextSteps.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {score.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
