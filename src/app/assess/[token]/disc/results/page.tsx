'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, ArrowRight, Download } from 'lucide-react';

interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

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

const PROFILE_INFO = {
  D: {
    name: 'Dominance',
    nickname: 'The Driver',
    color: 'text-red-900',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeColor: 'bg-red-100 text-red-800',
    description: 'Decisive, results-oriented, and competitive. You take charge, push for outcomes, and aren\'t afraid of challenges.',
  },
  I: {
    name: 'Influence',
    nickname: 'The Influencer',
    color: 'text-yellow-900',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    description: 'Enthusiastic, optimistic, and people-focused. You inspire others, build relationships, and thrive on connection.',
  },
  S: {
    name: 'Steadiness',
    nickname: 'The Supporter',
    color: 'text-green-900',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100 text-green-800',
    description: 'Patient, reliable, and team-oriented. You provide stability, support others, and value harmony and consistency.',
  },
  C: {
    name: 'Conscientiousness',
    nickname: 'The Analyst',
    color: 'text-blue-900',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800',
    description: 'Analytical, detail-oriented, and systematic. You focus on accuracy, quality, and following proper procedures.',
  },
};

export default function DISCResultsPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [scores, setScores] = useState<DISCScores | null>(null);
  const [profile, setProfile] = useState<'D' | 'I' | 'S' | 'C' | null>(null);
  const [report, setReport] = useState<DISCReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/assess/disc/results?token=${token}`);
        if (!response.ok) {
          throw new Error('Failed to load results');
        }
        const data = await response.json();
        setScores(data.scores);
        setProfile(data.profile);
        setReport(data.report);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
        setLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-8 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-600">Loading your DISC results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !scores || !profile || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-red-200 bg-red-50">
          <CardContent className="pt-8 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
            <p className="text-red-900 font-medium mb-4">{error || 'Failed to load results'}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileInfo = PROFILE_INFO[profile];
  const radarData = [
    { dimension: 'Dominance', value: scores.D, fullMark: 100 },
    { dimension: 'Influence', value: scores.I, fullMark: 100 },
    { dimension: 'Steadiness', value: scores.S, fullMark: 100 },
    { dimension: 'Conscientiousness', value: scores.C, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Your DISC Profile
          </h1>
          <p className="text-slate-600">
            Understanding your behavioral style and personality traits
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className={`mb-8 border-2 ${profileInfo.borderColor} ${profileInfo.bgColor}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className={`${profileInfo.badgeColor} text-base px-4 py-2 mb-4`}>
                  {profile}
                </Badge>
                <CardTitle className={`text-3xl ${profileInfo.color} mb-2`}>
                  {report.title}
                </CardTitle>
                <CardDescription className={`text-base ${profileInfo.color} opacity-75`}>
                  {profileInfo.nickname} - {profileInfo.name}
                </CardDescription>
              </div>
              <div className="text-5xl">
                {profile === 'D' && '🎯'}
                {profile === 'I' && '⭐'}
                {profile === 'S' && '🤝'}
                {profile === 'C' && '🔍'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`${profileInfo.color} leading-relaxed text-lg`}>
              {report.primaryDescription}
            </p>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your DISC Scores</CardTitle>
            <CardDescription>
              Visual representation of your personality dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
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
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Dominance', value: scores.D, color: 'bg-red-100 text-red-900' },
                { label: 'Influence', value: scores.I, color: 'bg-yellow-100 text-yellow-900' },
                { label: 'Steadiness', value: scores.S, color: 'bg-green-100 text-green-900' },
                { label: 'Conscientiousness', value: scores.C, color: 'bg-blue-100 text-blue-900' },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-lg ${item.color} text-center`}>
                  <p className="text-sm font-medium opacity-75 mb-1">{item.label}</p>
                  <p className="text-3xl font-bold">{item.value}</p>
                  <div className="w-full bg-black/10 rounded-full h-2 mt-2">
                    <div
                      className="bg-current h-2 rounded-full transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Description */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Communication Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                {report.communicationStyle}
              </p>
            </CardContent>
          </Card>

          {/* Work Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                {report.workStyle}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Strengths & Blind Spots */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Key Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2.5 flex-shrink-0" />
                    <span className="text-green-900">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Blind Spots */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-900">Areas for Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.blindSpots.map((spot, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2.5 flex-shrink-0" />
                    <span className="text-yellow-900">{spot}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Dynamics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Team Dynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              {report.teamDynamics}
            </p>
          </CardContent>
        </Card>

        {/* Compatibility Matrix */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Works Well With</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.compatibilityFactors.bestWith.map((factor, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="text-green-900 font-bold text-lg">✓</span>
                    <span className="text-green-900">{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-red-900">May Challenge With</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.compatibilityFactors.challengesWith.map((factor, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="text-red-900 font-bold text-lg">!</span>
                    <span className="text-red-900">{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Interview Tips */}
        <Card className="border-blue-200 bg-blue-50 mb-8">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              Interview Tips for Recruiters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-900 leading-relaxed">
              {report.interviewApproach}
            </p>
          </CardContent>
        </Card>

        {/* Footer & CTA */}
        <Card className="bg-slate-50 border-slate-200 mb-8">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-4">
              This DISC profile is based on psychological personality assessment principles and is
              intended to provide insights for recruitment and team development. Individual
              performance also depends on skills, experience, motivation, and context. Use this
              profile as one of many data points in the hiring process.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Your results have been saved and shared with the hiring team</span>
            </div>
          </CardContent>
        </Card>

        {/* Return to Application Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/assess/${token}`} className="flex-1">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
            >
              Back to Application
            </Button>
          </Link>
          <Button
            size="lg"
            className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Results PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
