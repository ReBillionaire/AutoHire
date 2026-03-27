'use client';

import { useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

function getScoreBadge(score: number) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
  if (score >= 50) return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';
}

export function CandidateDetailPanel({ candidate, isOpen, onClose }: CandidateDetailPanelProps) {
  const [currentStage, setCurrentStage] = useState(candidate?.stage || 'Applied');

  if (!candidate) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-xl bg-background border-l border-border shadow-elevation-4 z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3.5">
            <Avatar className="h-11 w-11">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{candidate.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-semibold text-foreground">{candidate.name}</h2>
              <p className="text-xs text-muted-foreground">{candidate.title} at {candidate.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="p-5 border-b border-border bg-muted/30">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">AI Score</p>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getScoreBadge(candidate.aiScore)}`}>
                {candidate.aiScore}%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">DISC</p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                {candidate.discProfile}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Source</p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {candidate.source}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Applied</p>
              <p className="text-xs font-medium text-foreground">
                {new Date(candidate.appliedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="p-5">
            <TabsList className="w-full justify-start bg-muted/50 p-0.5 rounded-lg h-auto">
              <TabsTrigger value="overview" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Overview</TabsTrigger>
              <TabsTrigger value="resume" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Resume</TabsTrigger>
              <TabsTrigger value="assessments" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Assessments</TabsTrigger>
              <TabsTrigger value="interviews" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Interviews</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Activity</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-5 mt-5">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Contact</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[13px]">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{candidate.name.toLowerCase().replace(/\s+/g, '.')}@email.com</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px]">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px]">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">San Francisco, CA</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Summary</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Experienced professional with proven track record in relevant technologies. Strong communication skills and collaborative approach to problem-solving.
                </p>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['Problem Solving', 'Communication', 'Leadership', 'Technical Skills', 'Collaboration'].map((skill) => (
                    <span key={skill} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Resume */}
            <TabsContent value="resume" className="space-y-5 mt-5">
              <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-xl border border-border">
                <div>
                  <p className="text-[13px] font-medium text-foreground">Resume.pdf</p>
                  <p className="text-[11px] text-muted-foreground">Uploaded 2 days ago</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Download className="h-3 w-3" />Download
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Share2 className="h-3 w-3" />Share
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Experience</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border">
                    <p className="text-[13px] font-medium text-foreground">Senior Engineer</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Tech Corp &middot; 2022 – Present</p>
                    <p className="text-xs text-muted-foreground mt-1.5">Led team of 5 engineers on critical features</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <p className="text-[13px] font-medium text-foreground">Software Engineer</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">StartupXYZ &middot; 2020 – 2022</p>
                    <p className="text-xs text-muted-foreground mt-1.5">Built core platform features from scratch</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Education</h4>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-[13px] font-medium text-foreground">B.S. Computer Science</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">University of California &middot; 2018</p>
                </div>
              </div>
            </TabsContent>

            {/* Assessments */}
            <TabsContent value="assessments" className="space-y-3 mt-5">
              <div className="p-3.5 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-medium text-foreground">Technical Assessment</p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Passed</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Score: 92/100 &middot; Completed 3 days ago</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-medium text-foreground">DISC Profile Assessment</p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Completed</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Profile: D/I &middot; Completed 5 days ago</p>
              </div>
            </TabsContent>

            {/* Interviews */}
            <TabsContent value="interviews" className="space-y-3 mt-5">
              <div className="p-3.5 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-medium text-foreground">Phone Screening</p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  March 28, 2026 at 2:00 PM
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-medium text-foreground">Technical Interview</p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Pending</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Waiting for phone screening completion</p>
              </div>
            </TabsContent>

            {/* Activity */}
            <TabsContent value="activity" className="space-y-0 mt-5">
              {[
                { action: 'Moved to Assessment', time: '2 days ago' },
                { action: 'Assessment completed with score 92/100', time: '2 days ago' },
                { action: 'Moved to Screening', time: '3 days ago' },
                { action: 'Applied for Senior Frontend Engineer', time: '3 days ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground">{activity.action}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-5 space-y-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Move to Stage
            </label>
            <Select value={currentStage} onValueChange={setCurrentStage}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">Schedule Interview</Button>
            <Button variant="outline" size="sm" className="text-xs">Send Email</Button>
            <Button variant="outline" size="sm" className="text-xs">Add Notes</Button>
            <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive">Reject</Button>
          </div>

          <Button className="w-full" size="sm">
            Advance to Next Stage
          </Button>
        </div>
      </div>
    </>
  );
}
