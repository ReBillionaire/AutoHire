'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PipelineChartProps {
  isLoading?: boolean;
  data?: Array<{ stage: string; count: number; color: string }>;
}

export function PipelineChart({ isLoading, data }: PipelineChartProps) {
  const chartData = data;

  if (isLoading) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-80 w-full" />
        </div>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Candidate Pipeline
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-400">
            No pipeline data available
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Candidate Pipeline
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            className="dark:stroke-slate-800"
          />
          <XAxis
            dataKey="stage"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
export default function Component() { return <div>Component</div>; }
