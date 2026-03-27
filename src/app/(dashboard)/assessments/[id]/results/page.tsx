'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DISCProfileChart from '@/components/assessments/disc-profile-chart';
import DISCReport from '@/components/assessments/disc-report';
import ScoreBreakdown from '@/components/assessments/score-breakdown';

interface CandidateResult {
  id: string;
  candidate_name: string;
  candidate_email: string;
  submitted_at: string;
  score: number;
  status: 'completed' | 'in_progress' | 'abandoned';
  disc_profile?: {
    primary: 'D' | 'I' | 'S' | 'C';
    secondary: 'D' | 'I' | 'S' | 'C';
    scores: {
      dominance: number;
      influence: number;
      steadiness: number;
      conscientiousness: number;
    };
    report: any;
  };
}

interface Assessment {
  id: string;
  title: string;
  type: 'SKILL' | 'PSYCHOMETRIC' | 'ATTITUDE' | 'BACKGROUND';
  question_count: number;
  results: CandidateResult[];
}

export default function ResultsPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}/results`);
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        setAssessment(data);
        if (data.results.length > 0) {
          setSelectedCandidate(data.results[0]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!assessment) {
    return <div className="text-center text-slate-600">Assessment not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{assessment.title} - Results</h1>
        <p className="text-slate-600 mt-1">
          {assessment.results.length} candidates have completed this assessment
        </p>
      </div>

      {assessment.results.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600">No results yet. Candidates will appear here once they complete the assessment.</p>
        </Card>
      ) : (
        <Tabs defaultValue="candidates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidates">All Candidates</TabsTrigger>
            <TabsTrigger value="detail">
              {selectedCandidate ? 'Detailed Analysis' : 'Select a candidate'}
            </TabsTrigger>
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Candidate</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    {assessment.type === 'PSYCHOMETRIC' && <TableHead>DISC Profile</TableHead>}
                    {assessment.type === 'SKILL' && <TableHead className="text-right">Score</TableHead>}
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessment.results.map((result) => (
                    <TableRow
                      key={result.id}
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => setSelectedCandidate(result)}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {result.candidate_name}
                      </TableCell>
                      <TableCell className="text-slate-600">{result.candidate_email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            result.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : result.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </Badge>
                      </TableCell>
                      {assessment.type === 'PSYCHOMETRIC' && (
                        <TableCell>
                          {result.disc_profile ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              {result.disc_profile.primary}
                            </Badge>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </TableCell>
                      )}
                      {assessment.type === 'SKILL' && (
                        <TableCell className="text-right font-medium">
                          {result.score}%
                        </TableCell>
                      )}
                      <TableCell className="text-sm text-slate-600">
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Detail Tab */}
          <TabsContent value="detail" className="space-y-6">
            {selectedCandidate ? (
              <>
                {/* Candidate Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedCandidate.candidate_name}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {selectedCandidate.candidate_email}
                        </CardDescription>
                      </div>
                      <Badge className="text-base px-3 py-1 bg-green-100 text-green-800">
                        {selectedCandidate.status.charAt(0).toUpperCase() +
                          selectedCandidate.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Submitted</span>
                        <p className="font-semibold text-slate-900">
                          {new Date(selectedCandidate.submitted_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {assessment.type === 'SKILL' && (
                        <div>
                          <span className="text-slate-600">Final Score</span>
                          <p className="font-semibold text-slate-900 text-lg">
                            {selectedCandidate.score}%
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* DISC Profile or Score Breakdown */}
                {assessment.type === 'PSYCHOMETRIC' && selectedCandidate.disc_profile ? (
                  <>
                    <DISCProfileChart scores={selectedCandidate.disc_profile.scores} />
                    <DISCReport
                      report={selectedCandidate.disc_profile.report}
                      profileType={selectedCandidate.disc_profile.primary}
                    />
                  </>
                ) : assessment.type === 'SKILL' ? (
                  <ScoreBreakdown assessmentId={assessmentId} candidateId={selectedCandidate.id} />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-slate-600">Detailed analysis available after completion.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-slate-600">Select a candidate to view detailed results</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
