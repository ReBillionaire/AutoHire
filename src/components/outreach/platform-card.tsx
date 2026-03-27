import { FC } from 'react';
import { PLATFORM_PROFILES } from '@/lib/ai/outreach-agent';
import { Check } from 'lucide-react';

interface PlatformCardProps {
  platform: string;
  score: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  selected: boolean;
  onSelect: (platform: string) => void;
}

const priorityColors = {
  high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  low: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' },
};

const priorityLabels = {
  high: 'Highly Recommended',
  medium: 'Recommended',
  low: 'Optional',
};

export const PlatformCard: FC<PlatformCardProps> = ({
  platform,
  score,
  reasoning,
  priority,
  selected,
  onSelect,
}) => {
  const profile = PLATFORM_PROFILES[platform as keyof typeof PLATFORM_PROFILES];
  const colors = priorityColors[priority];

  if (!profile) {
    return null;
  }

  return (
    <div
      onClick={() => onSelect(platform)}
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : `${colors.border} ${colors.bg} hover:border-gray-300`
      }`}
    >
      {/* Header with platform name and checkbox */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile.name}</h3>
          </div>
        </div>
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
            selected
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Priority badge */}
      <div className="mb-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors.badge}`}
        >
          {priorityLabels[priority]}
        </span>
      </div>

      {/* Score and reasoning */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Match Score</span>
          <span className="text-lg font-bold text-blue-600">{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{reasoning}</p>

      {/* Platform specs */}
      <div className="border-t pt-3 space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span className="font-medium">Character Limit:</span>
          <span>{profile.maxCharacters.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Tone:</span>
          <span>{profile.tone}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Best Time:</span>
          <span>{profile.bestPostingTimes[0]}</span>
        </div>
      </div>
    </div>
  );
};
