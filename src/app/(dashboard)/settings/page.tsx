'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Recruiter' | 'Hiring Manager' | 'Interviewer';
  joinedDate: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface NotificationSettings {
  newApplication: boolean;
  interviewScheduled: boolean;
  assessmentCompleted: boolean;
  candidateRejected: boolean;
  offerExtended: boolean;
  feedbackSubmitted: boolean;
}

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [loadingOrg, setLoadingOrg] = useState(true);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Recruiter');

  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loadingPipeline, setLoadingPipeline] = useState(true);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newApplication: true,
    interviewScheduled: true,
    assessmentCompleted: true,
    candidateRejected: false,
    offerExtended: true,
    feedbackSubmitted: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/organization');
        if (res.ok) {
          const data = await res.json();
          setOrgName(data.name || '');
          setOrgDescription(data.description || '');
          setIndustry(data.industry || '');
          setTeamSize(data.teamSize || '');
        }
      } catch {} finally { setLoadingOrg(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/team');
        if (res.ok) { const data = await res.json(); setTeamMembers(Array.isArray(data) ? data : []); }
      } catch {} finally { setLoadingTeam(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pipeline-stages');
        if (res.ok) { const data = await res.json(); setStages(Array.isArray(data) ? data : []); }
      } catch {} finally { setLoadingPipeline(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try { await fetch('/api/integrations/status'); } catch {} finally { setLoadingIntegrations(false); }
    })();
  }, []);

  const handleAddTeamMember = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const res = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, role: inviteRole }) });
      if (res.ok) { const m = await res.json(); setTeamMembers([...teamMembers, m]); }
    } catch {
      const m: TeamMember = { id: String(Date.now()), name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole as any, joinedDate: new Date().toLocaleDateString() };
      setTeamMembers([...teamMembers, m]);
    }
    setInviteEmail('');
    setInviteRole('Recruiter');
  };

  const handleRemoveTeamMember = async (id: string) => {
    try { await fetch(`/api/team/${id}`, { method: 'DELETE' }); } catch {}
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleAddStage = () => {
    setStages([...stages, { id: String(Math.random()), name: 'New Stage', color: '#6366f1', order: (stages.length > 0 ? Math.max(...stages.map(s => s.order)) : 0) + 1 }]);
  };

  const handleRemoveStage = (id: string) => setStages(stages.filter(s => s.id !== id));
  const handleUpdateStage = (id: string, field: string, value: string) => setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleMoveStage = (id: string, direction: 'up' | 'down') => {
    const index = stages.findIndex(s => s.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < stages.length - 1)) {
      const newStages = [...stages];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newStages[index].order, newStages[swapIndex].order] = [newStages[swapIndex].order, newStages[index].order];
      setStages(newStages.sort((a, b) => a.order - b.order));
    }
  };

  const roleBadge: Record<string, string> = {
    Admin: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    Recruiter: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    'Hiring Manager': 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    Interviewer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[900px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organization, team, and integrations.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/50 p-0.5 rounded-lg h-auto w-auto inline-flex">
          <TabsTrigger value="general" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">General</TabsTrigger>
          <TabsTrigger value="team" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Team</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Pipeline</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Integrations</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">Notifications</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-5 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Organization Details</h3>

            {loadingOrg ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : (
              <>
                <div className="p-6 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload organization logo</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Organization Name</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Enter organization name" className="mt-1.5 h-9 text-sm" />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Textarea value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} placeholder="Enter description" rows={3} className="mt-1.5 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="mt-1.5 h-9 text-sm"><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Team Size</Label>
                    <Select value={teamSize} onValueChange={setTeamSize}>
                      <SelectTrigger className="mt-1.5 h-9 text-sm"><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1–10</SelectItem>
                        <SelectItem value="11-50">11–50</SelectItem>
                        <SelectItem value="50-100">50–100</SelectItem>
                        <SelectItem value="100-500">100–500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button size="sm" className="w-full">Save Changes</Button>
              </>
            )}
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="mt-5 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Invite Team Member</h3>
            <div className="flex gap-2">
              <Input placeholder="email@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1 h-9 text-sm" />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Recruiter">Recruiter</SelectItem>
                  <SelectItem value="Hiring Manager">Hiring Manager</SelectItem>
                  <SelectItem value="Interviewer">Interviewer</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddTeamMember} className="gap-1 h-9">
                <Plus className="w-3.5 h-3.5" /> Invite
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Team Members</h3>
            {loadingTeam ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            ) : teamMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No team members yet. Invite your first member above.</p>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadge[member.role] || 'bg-muted text-muted-foreground'}`}>{member.role}</span>
                        <span className="text-[10px] text-muted-foreground">Joined {member.joinedDate}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveTeamMember(member.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Pipeline */}
        <TabsContent value="pipeline" className="mt-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Pipeline Stages</h3>
              <Button size="sm" variant="outline" onClick={handleAddStage} className="gap-1 h-8 text-xs">
                <Plus className="w-3 h-3" /> Add Stage
              </Button>
            </div>

            {loadingPipeline ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : stages.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No pipeline stages configured.</p>
            ) : (
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <Input value={stage.name} onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)} className="flex-1 h-8 text-sm" />
                    <input type="color" value={stage.color} onChange={(e) => handleUpdateStage(stage.id, 'color', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <div className="flex gap-0.5">
                      <button onClick={() => handleMoveStage(stage.id, 'up')} disabled={index === 0} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors text-xs">↑</button>
                      <button onClick={() => handleMoveStage(stage.id, 'down')} disabled={index === stages.length - 1} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors text-xs">↓</button>
                    </div>
                    <button onClick={() => handleRemoveStage(stage.id)} disabled={stages.length <= 2} className="w-7 h-7 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button size="sm" className="w-full mt-4">Save Pipeline</Button>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-5 space-y-4">
          {loadingIntegrations ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <>
              {['OpenAI', 'Anthropic'].map((name) => (
                <div key={name} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">{name} Integration</h3>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 mb-3">
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      API keys are managed through environment variables. Configure via <code className="bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 rounded text-[11px] font-mono">{name.toUpperCase().replace(' ', '_')}_API_KEY</code>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Not Configured</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Email Notifications</h3>
            <div className="space-y-1">
              {([
                { key: 'newApplication' as const, label: 'New Application', desc: 'When a new candidate applies' },
                { key: 'interviewScheduled' as const, label: 'Interview Scheduled', desc: 'When an interview is scheduled' },
                { key: 'assessmentCompleted' as const, label: 'Assessment Completed', desc: 'When a candidate completes an assessment' },
                { key: 'candidateRejected' as const, label: 'Candidate Rejected', desc: 'When a candidate is rejected' },
                { key: 'offerExtended' as const, label: 'Offer Extended', desc: 'When an offer is extended' },
                { key: 'feedbackSubmitted' as const, label: 'Feedback Submitted', desc: 'When interview feedback is submitted' },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch checked={notifications[key]} onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })} />
                </div>
              ))}
            </div>
            <Button size="sm" className="w-full mt-4">Save Preferences</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
