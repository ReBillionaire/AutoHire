'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Download, Share2, Edit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock candidate data
const MOCK_CANDIDATE = {
  id: 'c1',
  name: 'Sarah Johnson',
  title: 'Senior Frontend Engineer',
  company: 'Tech Corp',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  aiScore: 85,
  discProfile: 'D/I',
  source: 'LinkedIn',
  joinedDate: '2026-03-23',
  summary: 'Experienced senior frontend engineer with 8 years of experience in building scalable web applications. Proven expertise in React, TypeScript, and cloud technologies.',
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
  applications: [
    { id: 'a1', jobTitle: 'Senior Frontend Engineer', stage: 'Assessment', appliedDate: '2026-03-23' },
    { id: 'a2', jobTitle: 'Full Stack Engineer', stage: 'Applied', appliedDate: '2026-03-10' },
  ],
  experience: [
    {
      title: 'Senior Frontend Engineer',
      company: 'Tech Corp',
      duration: '2022 - Present',
      description: 'Led team of 5 engineers on critical features. Improved performance by 40%.',
    },
    {
      title: 'Frontend Engineer',
      company: 'StartupXYZ',
      duration: '2020 - 2022',
      description: 'Built core platform features from scratch. Established frontend best practices.',
    },
    {
      title: 'Junior Developer',
      company: 'WebAgency',
      duration: '2018 - 2020',
      description: 'Developed responsive web applications for various clients.',
    },
  ],
  education: [
    { degree: 'B.S. Computer Science', school: 'University of California', year: '2018' },
  ],
};

const STAGES = ['Applied', 'Screening', 'Assessment', 'Interview', 'Offer', 'Hired', 'Rejected'];

function getScoreBadgeColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const [currentStage, setCurrentStage] = useState(MOCK_CANDIDATE.applications[0].stage);
  const [notes, setNotes] = useState('');

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/candidates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {MOCK_CANDIDATE.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {MOCK_CANDIDATE.title} at {MOCK_CANDIDATE.company}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
              AI Score
            </p>
            <Badge className={`${getScoreBadgeColor(MOCK_CANDIDATE.aiScore)}`}>
              {MOCK_CANDIDATE.aiScore}%
            </Badge>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
              DISC
            </p>
            <Badge variant="outline">{MOCK_CANDIDATE.discProfile}</Badge>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
              Source
            </p>
            <Badge variant="secondary">{MOCK_CANDIDATE.source}</Badge>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
              Joined
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {new Date(MOCK_CANDIDATE.joinedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 items-end">
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-3 gap-6 p-6 max-w-7xl mx-auto w-full">
          {/* Main Content - 2 columns */}
          <div className="col-span-3 lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <a
                    href={`mailto:${MOCK_CANDIDATE.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {MOCK_CANDIDATE.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <a
                    href={`tel:${MOCK_CANDIDATE.phone}`}
                    className="text-slate-700 dark:text-slate-300"
                  >
                    {MOCK_CANDIDATE.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {MOCK_CANDIDATE.location}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Joined {new Date(MOCK_CANDIDATE.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {MOCK_CANDIDATE.summary}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_CANDIDATE.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Resume
                  </h3>
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
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-6">
                {MOCK_CANDIDATE.experience.map((exp, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {exp.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {exp.company} • {exp.duration}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                      {exp.description}
                    </p>
                    {idx < MOCK_CANDIDATE.experience.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Education
                  </h3>
                  {MOCK_CANDIDATE.education.map((edu, idx) => (
                    <div key={idx}>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {edu.degree}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {edu.school} • {edu.year}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications" className="space-y-4">
                {MOCK_CANDIDATE.applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {app.jobTitle}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Applied {new Date(app.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{app.stage}</Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                    Internal Notes
                  </label>
                  <Textarea
                    placeholder="Add notes about this candidate..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-32"
                  />
                  <Button size="sm" className="mt-3">
                    Save Notes
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Activity Timeline
                  </h3>
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
                          <p className="text-sm text-slate-900 dark:text-white">
                            {activity.action}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1 column */}
          <div className="col-span-3 lg:col-span-1 space-y-4">
            {/* Application Status */}
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Application Status
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">
                    Current Stage
                  </label>
                  <Select value={currentStage} onValueChange={setCurrentStage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Update Stage
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="destructive" className="w-full">
                Reject Candidate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
