'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Users, Mail, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Candidate {
  id: string;
  name: string;
  email: string;
}

const outreachTemplates = [
  {
    id: 'initial',
    name: 'Initial Outreach',
    subject: 'Exciting opportunity at {{company}}',
    body: 'Hi {{candidateName}},\n\nI came across your profile and was impressed by your background. We have an exciting opportunity for a {{jobTitle}} role that I think would be a great fit.\n\nWould you be open to a brief conversation?\n\nBest regards,\n{{senderName}}',
  },
  {
    id: 'followup',
    name: 'Follow-up',
    subject: 'Following up - {{jobTitle}} at {{company}}',
    body: 'Hi {{candidateName}},\n\nI wanted to follow up on my previous message about the {{jobTitle}} position. Would you have 15 minutes for a quick chat this week?\n\nBest,\n{{senderName}}',
  },
  {
    id: 'interview_invite',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {{jobTitle}} at {{company}}',
    body: 'Hi {{candidateName}},\n\nWe were impressed with your application and would like to invite you for an interview. Please let us know your availability for the coming week.\n\nBest regards,\n{{senderName}}',
  },
  {
    id: 'rejection',
    name: 'Rejection Notice',
    subject: 'Update on your application - {{company}}',
    body: 'Hi {{candidateName}},\n\nThank you for applying for the {{jobTitle}} position. After careful consideration, we have decided to move forward with other candidates. We encourage you to apply for future openings.\n\nBest wishes,\n{{senderName}}',
  },
  { id: 'custom', name: 'Custom Message', subject: '', body: '' },
];

export default function CreateOutreachPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('/api/candidates');
        if (res.ok) {
          const data = await res.json();
          const list = (data.candidates || data || []).map((c: any) => ({
            id: c.id,
            name: c.firstName ? c.firstName + ' ' + c.lastName : c.name || 'Unknown',
            email: c.email,
          }));
          setCandidates(list);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tpl = outreachTemplates.find((t) => t.id === id);
    if (tpl) { setSubject(tpl.subject); setBody(tpl.body); }
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidates.length === 0 || !subject || !body) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: selectedCandidates,
          subject,
          body,
          templateId: templateId || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      if (response.ok) router.push('/outreach');
    } catch (error) {
      console.error('Error creating outreach:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <Link href="/outreach">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Outreach Campaign</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Send personalized messages to candidates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Recipients
            </h2>
            {selectedCandidates.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCandidates.map((id) => {
                  const c = candidates.find((x) => x.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 py-1 px-3">
                      {c?.name || 'Unknown'}
                      <button type="button" onClick={() => toggleCandidate(id)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <Input placeholder="Search candidates..." value={candidateSearch} onChange={(e) => setCandidateSearch(e.target.value)} className="mb-3" />
            {loadingCandidates ? (
              <div className="flex items-center gap-2 p-4 text-slate-600 dark:text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800">
                {filteredCandidates.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">No candidates found</p>
                ) : filteredCandidates.slice(0, 20).map((candidate) => (
                  <button key={candidate.id} type="button" onClick={() => toggleCandidate(candidate.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${selectedCandidates.includes(candidate.id) ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedCandidates.includes(candidate.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                      {selectedCandidates.includes(candidate.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{candidate.name}</p>
                      <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" /> Message
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Template</Label>
                <Select value={templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Choose a template..." /></SelectTrigger>
                  <SelectContent>
                    {outreachTemplates.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input id="subject" placeholder="Enter email subject..." value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="body">Message Body</Label>
                <Textarea id="body" placeholder="Write your message..." value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="mt-2 font-mono text-sm" />
              </div>
              <div>
                <Label htmlFor="schedule">Schedule Send (Optional)</Label>
                <Input id="schedule" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-2" />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={selectedCandidates.length === 0 || !subject || !body || isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {scheduledAt ? 'Schedule Campaign' : 'Send Now'}
            </Button>
            <Link href="/outreach" className="flex-1"><Button type="button" variant="outline" className="w-full">Cancel</Button></Link>
          </div>
        </form>

        <div className="lg:col-span-1 space-y-4 h-fit sticky top-6">
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Campaign Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Recipients</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedCandidates.length}</p>
              </div>
              {subject && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Subject</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{subject}</p>
                </div>
              )}
              {templateId && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Template</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{outreachTemplates.find((t) => t.id === templateId)?.name}</p>
                </div>
              )}
            </div>
          </Card>
          {body && (
            <Card className="p-6 bg-white dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Preview</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{body}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
