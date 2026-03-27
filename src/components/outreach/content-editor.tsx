'use client';

import { FC, useState } from 'react';
import { PLATFORM_PROFILES } from '@/lib/ai/outreach-agent';
import { AlertCircle, Copy, Check } from 'lucide-react';

interface PlatformContent {
  platform: string;
  content: string;
  characterCount: number;
  hashtags?: string[];
  bestPostingTime?: string;
}

interface ContentEditorProps {
  platform: string;
  content?: PlatformContent;
  onChange: (updated: PlatformContent) => void;
}

export const ContentEditor: FC<ContentEditorProps> = ({ platform, content, onChange }) => {
  const profile = PLATFORM_PROFILES[platform as keyof typeof PLATFORM_PROFILES];
  const [copied, setCopied] = useState(false);
  const [editedContent, setEditedContent] = useState(content?.content || '');

  if (!profile) {
    return null;
  }

  const characterCount = editedContent.length;
  const exceeds = characterCount > profile.maxCharacters;
  const percentUsed = Math.min(100, (characterCount / profile.maxCharacters) * 100);

  const handleChange = (newContent: string) => {
    setEditedContent(newContent);
    onChange({
      platform,
      content: newContent,
      characterCount: newContent.length,
      hashtags: content?.hashtags,
      bestPostingTime: content?.bestPostingTime,
    });
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{profile.name}</h3>
          <p className="text-sm text-gray-600">
            Tone: <span className="font-medium">{profile.tone}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">Best time to post:</p>
          <p className="font-medium">{content?.bestPostingTime || profile.bestPostingTimes[0]}</p>
        </div>
      </div>

      {/* Character count indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Post Content</label>
          <span
            className={`text-sm font-medium ${
              exceeds ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {characterCount.toLocaleString()} / {profile.maxCharacters.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${
              exceeds ? 'bg-red-600' : 'bg-green-600'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>

        {/* Warning if exceeds */}
        {exceeds && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-700">
              Content exceeds {platform} limit by {characterCount - profile.maxCharacters} characters
            </p>
          </div>
        )}
      </div>

      {/* Content textarea */}
      <textarea
        value={editedContent}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Write your ${profile.name} post here...`}
        className={`w-full min-h-48 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
          exceeds
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />

      {/* Hashtags (if applicable) */}
      {profile.hashtags > 0 && content?.hashtags && content.hashtags.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Suggested Hashtags:</p>
          <div className="flex flex-wrap gap-2">
            {content.hashtags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleChange(`${editedContent}\n${tag}`)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition"
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click to add hashtag to your post
          </p>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
        <p className="text-xs font-semibold text-blue-900 mb-2">Platform Guidelines:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          {profile.guidelines.map((guideline, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="flex-shrink-0 mt-0.5">•</span>
              <span>{guideline}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopyContent}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Content
          </>
        )}
      </button>
    </div>
  );
};
