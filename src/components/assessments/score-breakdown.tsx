'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ScoreData {
  section: string;
  score: number;
  max_score: number;
  correct: number;
  total: number;
}

interface ComparisonData {
  candidate_name: string;
  score: number;
}

interface ScoreBreakdownProps {
  assessmentId: string;
  candidateId: string;
}

export default function ScoreBreakdown({
  assessmentId,
  candidateId,
}: ScoreBreakdownProps) {
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScoreBreakdown() {
      try {
        const response = await fetch(
          `/api/assessments/${assessmentId}/candidates/${candidateId}/breakdown`
        );
        if (!response.ok) throw new Error('Failed to fetch breakdown');
        const data = await response.json();
        setScores(data.scores || []);
        setComparison(data.comparison || []);
      } catch (error) {
        console.error('Error fetching score breakdown:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchScoreBreakdown();
  }, [assessmentId, candidateId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse text-slate-600">Loading score analysis...</div>
        </CardContent>
      </Card>
    );
  }

  const chartData = scores.map((s) => ({
    section: s.section,
    percentage: Math.round((s.correct / s.total) * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score by Section</CardTitle>
          <CardDescription>Performance across different assessment sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="percentage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Breakdown */}
          <div className="mt-6 space-y-3">
            {scores.map((score) => (
              <div key={score.section}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-900">{score.section}</span>
                  <span className="text-sm font-bold text-slate-900">
                    {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(score.correct / score.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      {comparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison with Other Candidates</CardTitle>
            <CardDescription>How this candidate compares to others taking the same assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparison}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="candidate_name" type="category" width={140} />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="score" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900">
          <ul className="space-y-2">
            {scores.length > 0 && (
              <>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Strongest section:{' '}
                    <strong>
                      {
                        scores.reduce((prev, curr) =>
                          (curr.correct / curr.total) * 100 > (prev.correct / prev.total) * 100
                            ? curr
                            : prev
                        ).section
                      }
                    </strong>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Needs improvement:{' '}
                    <strong>
                      {
                        scores.reduce((prev, curr) =>
                          (curr.correct / curr.total) * 100 < (prev.correct / prev.total) * 100
                            ? curr
                            : prev
                        ).section
                      }
                    </strong>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Overall accuracy:{' '}
                    <strong>
                      {Math.round(
                        (scores.reduce((sum, s) => sum + s.correct, 0) /
                          scores.reduce((sum, s) => sum + s.total, 0)) *
                          100
                      )}
                      %
                    </strong>
                  </span>
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
