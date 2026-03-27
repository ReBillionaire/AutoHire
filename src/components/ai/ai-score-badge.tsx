/**
 * AI Score Badge Component
 * Circular score display with color coding and visual feedback
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AIScoreBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export function AIScoreBadge({
  score,
  size = 'md',
  showLabel = true,
  className,
  animated = true,
}: AIScoreBadgeProps) {
  // Clamp score to 0-100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine color based on score
  const getScoreColor = () => {
    if (normalizedScore >= 80) return 'from-green-400 to-emerald-600';
    if (normalizedScore >= 60) return 'from-blue-400 to-cyan-600';
    if (normalizedScore >= 50) return 'from-yellow-400 to-amber-600';
    if (normalizedScore >= 35) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getScoreTextColor = () => {
    if (normalizedScore >= 80) return 'text-emerald-600';
    if (normalizedScore >= 60) return 'text-cyan-600';
    if (normalizedScore >= 50) return 'text-amber-600';
    if (normalizedScore >= 35) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (normalizedScore >= 85) return 'Excellent';
    if (normalizedScore >= 75) return 'Very Good';
    if (normalizedScore >= 65) return 'Good';
    if (normalizedScore >= 50) return 'Fair';
    if (normalizedScore >= 35) return 'Poor';
    return 'Very Poor';
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-16 w-16',
      text: 'text-lg',
      badge: 'text-xs',
      ring: 'ring-2',
    },
    md: {
      container: 'h-24 w-24',
      text: 'text-2xl',
      badge: 'text-sm',
      ring: 'ring-4',
    },
    lg: {
      container: 'h-32 w-32',
      text: 'text-3xl',
      badge: 'text-base',
      ring: 'ring-4',
    },
    xl: {
      container: 'h-40 w-40',
      text: 'text-5xl',
      badge: 'text-lg',
      ring: 'ring-8',
    },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        config.container,
        className
      )}
    >
      {/* Background circle */}
      <svg
        className="absolute h-full w-full -rotate-90 transform"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-200"
        />

        {/* Progress circle */}
        <defs>
          <linearGradient id={`scoreGradient-${normalizedScore}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              className={getScoreColor().split(' ')[0]}
              stopColor={normalizedScore >= 80 ? '#4ade80' : normalizedScore >= 60 ? '#22d3ee' : normalizedScore >= 50 ? '#facc15' : normalizedScore >= 35 ? '#fb923c' : '#f87171'}
            />
            <stop
              offset="100%"
              className={getScoreColor().split(' ')[1]}
              stopColor={normalizedScore >= 80 ? '#059669' : normalizedScore >= 60 ? '#0891b2' : normalizedScore >= 50 ? '#b45309' : normalizedScore >= 35 ? '#ea580c' : '#dc2626'}
            />
          </linearGradient>
        </defs>

        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={normalizedScore >= 80 ? '#059669' : normalizedScore >= 60 ? '#0891b2' : normalizedScore >= 50 ? '#b45309' : normalizedScore >= 35 ? '#ea580c' : '#dc2626'}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? strokeDashoffset : 0}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-1000 ease-out' : ''}
        />
      </svg>

      {/* Content */}
      <div className="z-10 flex flex-col items-center justify-center">
        <span className={cn('font-bold', config.text, getScoreTextColor())}>
          {normalizedScore}
        </span>
        {size !== 'sm' && (
          <span className={cn('font-medium text-gray-600', config.badge)}>
            {getStatusText()}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Score Badge Container
 * Display multiple scores with labels
 */
interface ScoreBadgeContainerProps {
  scores: Array<{
    label: string;
    value: number;
    icon?: React.ReactNode;
  }>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadgeContainer({
  scores,
  size = 'md',
  className,
}: ScoreBadgeContainerProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {scores.map((score) => (
        <div key={score.label} className="flex flex-col items-center gap-2">
          <AIScoreBadge score={score.value} size={size} showLabel={false} />
          <div className="text-center">
            {score.icon && <div className="mb-1">{score.icon}</div>}
            <p className="text-sm font-medium text-gray-700">{score.label}</p>
            <p className="text-xs text-gray-500">{score.value}/100</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact Score Badge
 * Inline score display with minimal space
 */
interface CompactScoreBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

export function CompactScoreBadge({
  score,
  label,
  className,
}: CompactScoreBadgeProps) {
  const normalizedScore = Math.min(100, Math.max(0, score));

  const getColor = () => {
    if (normalizedScore >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (normalizedScore >= 60) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (normalizedScore >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (normalizedScore >= 35) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold',
        getColor(),
        className
      )}
    >
      <span>{normalizedScore}</span>
      {label && <span className="text-xs opacity-75">{label}</span>}
    </div>
  );
}
