'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface DISCProfileChartProps {
  scores: DISCScores;
}

export default function DISCProfileChart({ scores }: DISCProfileChartProps) {
  const data = [
    {
      dimension: 'D: Dominance',
      value: scores.D,
      fullMark: 100,
    },
    {
      dimension: 'I: Influence',
      value: scores.I,
      fullMark: 100,
    },
    {
      dimension: 'S: Steadiness',
      value: scores.S,
      fullMark: 100,
    },
    {
      dimension: 'C: Conscientiousness',
      value: scores.C,
      fullMark: 100,
    },
  ];

  const dimensionColors = {
    D: { color: '#ef4444', label: 'Dominance' },
    I: { color: '#eab308', label: 'Influence' },
    S: { color: '#22c55e', label: 'Steadiness' },
    C: { color: '#3b82f6', label: 'Conscientiousness' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DISC Profile Visualization</CardTitle>
        <CardDescription>
          Personality profile across four behavioral dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#475569', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                isAnimationActive
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${value}/100`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { key: 'D', label: 'Dominance', value: scores.D, color: 'bg-red-100 text-red-900' },
            { key: 'I', label: 'Influence', value: scores.I, color: 'bg-yellow-100 text-yellow-900' },
            { key: 'S', label: 'Steadiness', value: scores.S, color: 'bg-green-100 text-green-900' },
            { key: 'C', label: 'Conscientiousness', value: scores.C, color: 'bg-blue-100 text-blue-900' },
          ].map((item) => (
            <div
              key={item.key}
              className={`p-4 rounded-lg ${item.color} text-center`}
            >
              <p className="text-sm font-medium opacity-75">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
              <div className="w-full bg-black/10 rounded-full h-1 mt-2">
                <div
                  className="bg-current h-1 rounded-full transition-all"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-900 mb-3">Dimension Meanings</p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              <span className="font-medium text-red-700">D - Dominance:</span> Drive, decisiveness, results-orientation
            </li>
            <li>
              <span className="font-medium text-yellow-700">I - Influence:</span> Enthusiasm, persuasion, social interaction
            </li>
            <li>
              <span className="font-medium text-green-700">S - Steadiness:</span> Reliability, patience, team support
            </li>
            <li>
              <span className="font-medium text-blue-700">C - Conscientiousness:</span> Accuracy, analysis, quality focus
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
