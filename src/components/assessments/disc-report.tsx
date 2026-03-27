'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Users, Briefcase, MessageSquare, Target, Lightbulb } from 'lucide-react';

interface DISCReport {
  title: string;
  primaryDescription: string;
  communicationStyle: string;
  workStyle: string;
  strengths: string[];
  blindSpots: string[];
  teamDynamics: string;
  interviewApproach: string;
  compatibilityFactors: {
    bestWith: string[];
    challengesWith: string[];
  };
}

interface DISCReportProps {
  report: DISCReport;
  profileType: 'D' | 'I' | 'S' | 'C';
}

const PROFILE_COLORS = {
  D: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', badge: 'bg-red-100 text-red-800' },
  I: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' },
  S: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-100 text-green-800' },
  C: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
};

const PROFILE_EMOJIS = {
  D: '🎯',
  I: '⭐',
  S: '🤝',
  C: '🔍',
};

const PROFILE_FULL_NAMES = {
  D: 'Dominance - The Driver',
  I: 'Influence - The Influencer',
  S: 'Steadiness - The Supporter',
  C: 'Conscientiousness - The Analyst',
};

export default function DISCReport({ report, profileType }: DISCReportProps) {
  const colors = PROFILE_COLORS[profileType];
  const emoji = PROFILE_EMOJIS[profileType];
  const fullName = PROFILE_FULL_NAMES[profileType];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className={`${colors.bg} border-2 ${colors.border}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl mb-3">{emoji}</div>
              <CardTitle className={`text-2xl ${colors.text}`}>{report.title}</CardTitle>
              <CardDescription className={`mt-2 ${colors.text} opacity-75`}>
                DISC Profile: {fullName}
              </CardDescription>
            </div>
            <Badge className={`${colors.badge} text-base px-4 py-2`}>{profileType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`${colors.text} leading-relaxed`}>
            {report.primaryDescription}
          </p>
        </CardContent>
      </Card>

      {/* Communication & Work Style */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Communication Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{report.communicationStyle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Work Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{report.workStyle}</p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Key Strengths
          </CardTitle>
          <CardDescription>
            Natural abilities and competitive advantages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                <span className="text-slate-700">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Blind Spots / Areas for Growth */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Areas for Growth
          </CardTitle>
          <CardDescription className="text-yellow-800">
            Potential development opportunities and growth areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {report.blindSpots.map((spot, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                <span className="text-yellow-900">{spot}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Team Dynamics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Team Dynamics & Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">{report.teamDynamics}</p>
        </CardContent>
      </Card>

      {/* Compatibility Matrix for Team Building */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Synergistic With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.compatibilityFactors.bestWith.map((factor, idx) => (
                <li key={idx} className="flex gap-2 items-start text-green-900">
                  <span className="text-lg font-bold">✓</span>
                  <span className="text-sm">{factor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-orange-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Potential Friction With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.compatibilityFactors.challengesWith.map((factor, idx) => (
                <li key={idx} className="flex gap-2 items-start text-orange-900">
                  <span className="text-lg font-bold">⚠</span>
                  <span className="text-sm">{factor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Interview Strategy for Recruiters */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Interview Strategy
          </CardTitle>
          <CardDescription className="text-blue-800">
            Recommended approach for effective candidate engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-900 leading-relaxed">{report.interviewApproach}</p>
        </CardContent>
      </Card>

      {/* Assessment Note */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-600">
            This DISC profile assessment provides behavioral insights based on personality dimensions.
            Use this profile alongside technical assessments, experience evaluation, and interview feedback
            to make comprehensive hiring decisions. Individual performance depends on skills, experience,
            motivation, role fit, and organizational context.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
