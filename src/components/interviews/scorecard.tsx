'use client';

import { useState, useEffect } from 'react';
import { Star, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CriterionScore {
  id: string;
  name: string;
  description: string;
  score: number | null;
}

interface ScorecardProps {
  onSave?: (scores: Record<string, number>, recommendation: string) => void;
  isAutoSave?: boolean;
}

const defaultCriteria: CriterionScore[] = [
  {
    id: 'communication',
    name: 'Communication Skills',
    description: 'Ability to articulate ideas clearly and listen effectively',
    score: null,
  },
  {
    id: 'technical',
    name: 'Technical Skills',
    description: 'Proficiency with required technologies and problem-solving ability',
    score: null,
  },
  {
    id: 'problemSolving',
    name: 'Problem Solving',
    description: 'Approach to breaking down complex problems',
    score: null,
  },
  {
    id: 'cultureFit',
    name: 'Culture Fit',
    description: 'Alignment with team values and work style',
    score: null,
  },
  {
    id: 'leadership',
    name: 'Leadership Potential',
    description: 'Initiative, influence, and ability to lead others',
    score: null,
  },
  {
    id: 'growth',
    name: 'Growth Mindset',
    description: 'Openness to feedback and desire to improve',
    score: null,
  },
];

const recommendations = [
  { value: 'STRONG_HIRE', label: 'Strong Hire - Definitely move forward' },
  { value: 'HIRE', label: 'Hire - Would be a good addition' },
  { value: 'MAYBE', label: 'Undecided - Need more information' },
  { value: 'NO_HIRE', label: 'No Hire - Not a good fit' },
  { value: 'STRONG_NO', label: 'Strong No Hire - Do not move forward' },
];

export default function Scorecard({ onSave, isAutoSave = true }: ScorecardProps) {
  const [criteria, setCriteria] = useState<CriterionScore[]>(defaultCriteria);
  const [recommendation, setRecommendation] = useState<string>('');
  const [overallScore, setOverallScore] = useState<number>(0);

  // Auto-calculate overall score
  useEffect(() => {
    const scores = criteria
      .filter((c) => c.score !== null)
      .map((c) => c.score as number);

    if (scores.length > 0) {
      const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
      setOverallScore(avg);
    } else {
      setOverallScore(0);
    }
  }, [criteria]);

  // Auto-save functionality
  useEffect(() => {
    if (isAutoSave && overallScore > 0) {
      const scoresObj = criteria.reduce(
        (acc, c) => {
          if (c.score !== null) acc[c.id] = c.score;
          return acc;
        },
        {} as Record<string, number>
      );
      // Could trigger auto-save here via API
    }
  }, [criteria, overallScore, isAutoSave]);

  const handleScoreChange = (id: string, score: number) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, score } : c))
    );
  };

  const handleSave = () => {
    const scoresObj = criteria.reduce(
      (acc, c) => {
        if (c.score !== null) acc[c.id] = c.score;
        return acc;
      },
      {} as Record<string, number>
    );

    if (onSave) {
      onSave(scoresObj, recommendation);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400';
    if (score === 5) return 'text-green-600';
    if (score === 4) return 'text-green-500';
    if (score === 3) return 'text-yellow-500';
    if (score === 2) return 'text-orange-500';
    return 'text-red-600';
  };

  const getRecommendationColor = () => {
    switch (recommendation) {
      case 'STRONG_HIRE':
        return 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800 text-green-900 dark:text-green-100';
      case 'HIRE':
        return 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'MAYBE':
        return 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'NO_HIRE':
        return 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'STRONG_NO':
        return 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100';
      default:
        return 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Overall Score
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Based on evaluation criteria
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {overallScore.toFixed(1)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              out of 5.0
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(overallScore / 5) * 100}%` }}
          />
        </div>
      </Card>

      {/* Scoring Criteria */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Evaluation Criteria
        </h3>

        <div className="space-y-6">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="border-b border-slate-200 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                      {criterion.name}
                    </Label>
                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {criterion.description}
                  </p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleScoreChange(criterion.id, star)}
                      className="transition-transform hover:scale-125"
                      title={`Rate ${star} out of 5`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          criterion.score !== null && star <= criterion.score
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {criterion.score !== null && (
                  <span className={`text-sm font-medium ${getScoreColor(criterion.score)}`}>
                    {criterion.score}/5
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendation */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Overall Recommendation
        </h3>

        <Select value={recommendation} onValueChange={setRecommendation}>
          <SelectTrigger className={`border-2 ${getRecommendationColor()}`}>
            <SelectValue placeholder="Select recommendation..." />
          </SelectTrigger>
          <SelectContent>
            {recommendations.map((rec) => (
              <SelectItem key={rec.value} value={rec.value}>
                {rec.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {recommendation && (
          <div className={`mt-4 p-4 rounded-lg border-2 ${getRecommendationColor()}`}>
            <p className="text-sm font-medium">
              {recommendations.find((r) => r.value === recommendation)?.label}
            </p>
          </div>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          Save Scorecard
        </Button>
        <Button variant="outline" className="flex-1">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}
