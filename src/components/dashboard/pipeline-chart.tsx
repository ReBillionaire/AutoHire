'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface PipelineChartProps {
  isLoading?: boolean;
  data?: Array<{ stage: string; count: number; color: string }>;
}

export function PipelineChart({ isLoading, data }: PipelineChartProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <Skeleton className="h-5 w-36 mb-6" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold text-foreground mb-6">
          Candidate Pipeline
        </h3>
        <div className="h-[280px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">No pipeline data yet</p>
            <p className="text-xs text-muted-foreground/70">Create a job to start seeing pipeline metrics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-sm font-semibold text-foreground mb-6">
        Candidate Pipeline
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="stage"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
