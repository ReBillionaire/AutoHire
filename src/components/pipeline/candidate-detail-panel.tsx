'use client';

import { useState } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, Calendar, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  stage: string;
  aiScore: number;
  discProfile: string;
  source: string;
  avatar: string;
  timeInStage: string;
  appliedDate: string;
  jobId: string;
}

interface CandidateDetailPanelProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

const PIPELINE_STAGES = ['Applied', 'Screening', 'Assessment', 'Interview', 'Offer', 'Hired', 'Rejected'];

function getScoreBadgeColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

export function CandidateDetailPanel({
  candidate,
  isOpen,
  onClose,
}: CandidateDetailPanelProps) {
  const [currentStage, setCurrentStage] = useState(candidate?.stage || 'Applied');

  if (!candidate) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-950 shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {candidate.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {candidate.title} at {candidate.company}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Stats */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
                  AI Score
                </p>
                <Badge className={`${getScoreBadgeColor(candidate.aiScore)} text-sm py-1`}>
                  {candidate.aiScore}%
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
                  DISC Profile
                </p>
                <Badge variant="outline" className="text-sm py-1">
                  {candidate.discProfile}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
                  Source
                </p>
                <Badge variant="secondary" className="text-sm py-1">
                  {candidate.source}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
                  Applied
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(candidate.appliedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="p-6">
            <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-800 rounded-none bg-transparent p-0">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="resume" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Resume
              </TabsTrigger>
              <TabsTrigger value="assessments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Assessments
              </TabsTrigger>
              <TabsTrigger value="interviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Interviews
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {candidate.name.toLowerCase().replace(/\s+/g, '.')}@email.com
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300">San Francisco, CA</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Professional Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Experienced professional with a strong background in the required domain.
                  Demonstrated expertise in relevant technologies and proven track record of delivering results.
                  Strong communication skills and collaborative approach to problem-solving.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Key Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Problem Solving', 'Communication', 'Leadership', 'Technical Skills', 'Team Collaboration'].map(
                    (skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Resume Tab */}
            <TabsContent value="resume" className="space-y-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Resume.pdf</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Uploaded 2 days ago</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Experience</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Senior Engineer</p>
                      <p className="text-slate-600 dark:text-slate-400">Tech Corp - 2022 - Present</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">Led team of 5 engineers on critical features</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Software Engineer</p>
                      <p className="text-slate-600 dark:text-slate-400">StartupXYZ - 2020 - 2022</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">Built core platform features from scratch</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Education</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">B.S. Computer Science</p>
                      <p className="text-slate-600 dark:text-slate-400">University of California - 2018</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-4 mt-6">
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-900 dark:text-white">Technical Assessment</p>
                    <Badge className="bg-green-100 text-green-800">Passed</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Score: 92/100 - Completed 3 days ago</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-900 dark:text-white">DISC Profile Assessment</p>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Profile: D/I - Completed 5 days ago</p>
                </div>
              </div>
            </TabsContent>

            {/* Interviews Tab */}
            <TabsContent value="interviews" className="space-y-4 mt-6">
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-900 dark:text-white">Phone Screening</p>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>March 28, 2026 at 2:00 PM</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-900 dark:text-white">Technical Interview</p>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Waiting for phone screening completion</p>
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-6">
              <div className="space-y-3">
                {[
                  { action: 'Moved to Assessment', time: '2 days ago' },
                  { action: 'Assessment completed with score 92/100', time: '2 days ago' },
                  { action: 'Moved to Screening', time: '3 days ago' },
                  { action: 'Applied for Senior Frontend Engineer', time: '3 days ago' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-6 space-y-3">
          {/* Move Stage */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">
              Move to Stage
            </label>
            <Select value={currentStage} onValueChange={setCurrentStage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              Schedule Interview
            </Button>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
            <Button variant="outline" className="w-full">
              Add Notes
            </Button>
            <Button variant="destructive" className="w-full">
              Reject
            </Button>
          </div>

          {/* Primary Action */}
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Advance to Next Stage
          </Button>
        </div>
      </div>
    </>
  );
}
