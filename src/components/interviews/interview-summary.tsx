'use client';

import { Lightbulb, AlertCircle, BookOpen, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InterviewSummaryProps {
  candidateName: string;
  jobTitle: string;
  resumeText?: string;
}

// Mock AI insights
const mockAiInsights = {
  strengths: [
    'Strong technical background with 8+ years of experience',
    'Proven leadership experience with team management',
    'Open source contributions show initiative and community engagement',
  ],
  keyGaps: [
    'Limited experience with newer React patterns',
    'No mention of cloud deployment experience',
    'Limited project management background',
  ],
  suggestedQuestions: [
    'Can you walk us through your most recent project and the technical challenges you faced?',
    'How do you approach learning new technologies and frameworks?',
    'Tell us about a time you had to lead a team through a significant change.',
    'What experience do you have with cloud infrastructure or DevOps?',
    'How do you stay current with industry trends and new technologies?',
  ],
  keyPointsToProbe: [
    'Leadership style and team management approach',
    'Adaptability to new technologies and frameworks',
    'Problem-solving methodology and technical decision-making',
    'Collaboration and communication in team settings',
    'Career goals and alignment with company values',
  ],
};

export default function InterviewSummary({
  candidateName,
  jobTitle,
  resumeText,
}: InterviewSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Key Highlights */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Candidate Highlights
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
              Experience & Background
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {resumeText ||
                'Experienced professional with a strong background in the required domain.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
              Strengths
            </p>
            <div className="space-y-1">
              {mockAiInsights.strengths.map((strength, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Experience Gaps */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Areas to Explore
        </h3>
        <div className="space-y-2">
          {mockAiInsights.keyGaps.map((gap, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-amber-600 flex-shrink-0">→</span>
              <span>{gap}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Suggested Questions */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          AI-Suggested Interview Questions
        </h3>
        <div className="space-y-3">
          {mockAiInsights.suggestedQuestions.map((question, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{question}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Points to Probe */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Key Points to Probe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mockAiInsights.keyPointsToProbe.map((point, i) => (
            <div
              key={i}
              className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800"
            >
              <Badge variant="secondary" className="mb-2">
                {['Behavioral', 'Technical', 'Growth', 'Team', 'Alignment'][i % 5]}
              </Badge>
              <p className="text-sm text-slate-700 dark:text-slate-300">{point}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Interview Preparation Tips */}
      <Card className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
          Interview Preparation Tips
        </h3>
        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Start with open-ended questions to understand their thought process</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Ask follow-up questions to dig deeper into specific experiences</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Share information about the role and team to assess cultural fit</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Allow time for the candidate to ask questions about the role</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>Take notes during the interview to reference when completing the scorecard</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
