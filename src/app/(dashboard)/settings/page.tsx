'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Mail,
  Link2,
  Settings,
  Palette,
  Calendar,
  Users,
  Bell,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompanySettings {
  id: string;
  companyId: string;
  googleDriveFolderId?: string;
  googleDriveResumeFolder?: string;
  googleDriveVideoFolder?: string;
  googleCalendarId?: string;
  googleCalendarEmail?: string;
  brandColor?: string;
  accentColor?: string;
  careerPageTitle?: string;
  careerPageDescription?: string;
  careerPageBanner?: string;
  assessmentTimeLimit?: number;
  requireVideoIntro?: boolean;
  requireDISC?: boolean;
  videoMaxDuration?: number;
  autoSendAssessment?: boolean;
  autoRemindDays?: number;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  location?: string;
  logo?: string;
  size?: string;
}

interface TeamMember {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'RECRUITER' | 'VIEWER';
  status: 'ACCEPTED' | 'PENDING' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

const roleDescriptions: Record<string, string> = {
  OWNER: 'Full access to all features and settings',
  ADMIN: 'Can manage team, settings, and integrations',
  RECRUITER: 'Can create jobs, manage candidates, and schedule interviews',
  VIEWER: 'Read-only access to pipelines and candidates',
};

const roleBadgeColor: Record<string, string> = {
  OWNER: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  ADMIN: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  RECRUITER: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  VIEWER: 'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
};

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Company Profile
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('');

  // Google Drive
  const [driveLink, setDriveLink] = useState('');
  const [resumeFolder, setResumeFolder] = useState('Resumes');
  const [videoFolder, setVideoFolder] = useState('Videos');
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveTesting, setDriveTesting] = useState(false);

  // Google Calendar
  const [calendarId, setCalendarId] = useState('');
  const [calendarConnected, setCalendarConnected] = useState(false);

  // Career Page
  const [brandColor, setBrandColor] = useState('#4F46E5');
  const [accentColor, setAccentColor] = useState('#06B6D4');
  const [careerPageTitle, setCareerPageTitle] = useState('');
  const [careerPageDescription, setCareerPageDescription] = useState('');

  // Assessment Settings
  const [requireVideo, setRequireVideo] = useState(true);
  const [videoMaxDuration, setVideoMaxDuration] = useState(60);
  const [requireDISC, setRequireDISC] = useState(true);
  const [assessmentTimeLimit, setAssessmentTimeLimit] = useState(45);
  const [autoSendAssessment, setAutoSendAssessment] = useState(true);
  const [autoRemindDays, setAutoRemindDays] = useState(3);

  // Team
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'RECRUITER' | 'VIEWER'>('RECRUITER');
  const [inviting, setInviting] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    newApplication: true,
    assessmentCompleted: true,
    discTestCompleted: true,
    interviewScheduled: true,
    candidateStageChanged: true,
  });
  const [digestFrequency, setDigestFrequency] = useState('instant');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, settingsRes, teamRes] = await Promise.all([
          fetch('/api/company'),
          fetch('/api/settings'),
          fetch('/api/settings/team'),
        ]);

        if (companyRes.ok) {
          const companyData = await companyRes.json();
          setCompany(companyData);
          setCompanyName(companyData.name || '');
          setCompanyDescription(companyData.description || '');
          setWebsite(companyData.website || '');
          setIndustry(companyData.industry || '');
          setLocation(companyData.location || '');
          setCompanySize(companyData.size || '');
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
          setDriveLink(settingsData.googleDriveFolderId || '');
          setResumeFolder(settingsData.googleDriveResumeFolder || 'Resumes');
          setVideoFolder(settingsData.googleDriveVideoFolder || 'Videos');
          setDriveConnected(!!settingsData.googleDriveFolderId);
          setCalendarId(settingsData.googleCalendarId || '');
          setCalendarConnected(!!settingsData.googleCalendarId);
          setBrandColor(settingsData.brandColor || '#4F46E5');
          setAccentColor(settingsData.accentColor || '#06B6D4');
          setCareerPageTitle(settingsData.careerPageTitle || '');
          setCareerPageDescription(settingsData.careerPageDescription || '');
          setRequireVideo(settingsData.requireVideoIntro ?? true);
          setVideoMaxDuration(settingsData.videoMaxDuration || 60);
          setRequireDISC(settingsData.requireDISC ?? true);
          setAssessmentTimeLimit(settingsData.assessmentTimeLimit || 45);
          setAutoSendAssessment(settingsData.autoSendAssessment ?? true);
          setAutoRemindDays(settingsData.autoRemindDays || 3);
        }

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeamMembers(Array.isArray(teamData) ? teamData : []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
        setLoadingTeam(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveCompanyProfile = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          description: companyDescription,
          website,
          industry,
          location,
          size: companySize,
        }),
      });
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleDriveFolderId: driveLink,
          googleDriveResumeFolder: resumeFolder,
          googleDriveVideoFolder: videoFolder,
          googleCalendarId: calendarId,
          brandColor,
          accentColor,
          careerPageTitle,
          careerPageDescription,
          requireVideoIntro: requireVideo,
          videoMaxDuration,
          requireDISC,
          assessmentTimeLimit,
          autoSendAssessment,
          autoRemindDays,
        }),
      });
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestDriveConnection = async () => {
    if (!driveLink.trim()) return;
    setDriveTesting(true);
    try {
      const res = await fetch('/api/settings/integrations/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: driveLink }),
      });
      if (res.ok) {
        setDriveConnected(true);
      } else {
        setDriveConnected(false);
      }
    } catch {
      setDriveConnected(false);
    } finally {
      setDriveTesting(false);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch('/api/settings/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        const newMember = await res.json();
        setTeamMembers([...teamMembers, newMember]);
        setInviteEmail('');
        setInviteRole('RECRUITER');
      }
    } catch {
      console.error('Failed to invite team member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
      }
    } catch {
      console.error('Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[900px]">
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your company profile, integrations, and preferences.
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="bg-muted/50 p-0.5 rounded-lg h-auto w-auto inline-flex">
          <TabsTrigger value="company" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            <Settings className="w-3.5 h-3.5 mr-1.5" /> Company
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            <Link2 className="w-3.5 h-3.5 mr-1.5" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="career" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            <Palette className="w-3.5 h-3.5 mr-1.5" /> Career Page
          </TabsTrigger>
          <TabsTrigger value="assessment" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            <Users className="w-3.5 h-3.5 mr-1.5" /> Assessment
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            <Users className="w-3.5 h-3.5 mr-1.5" /> Team
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            <Bell className="w-3.5 h-3.5 mr-1.5" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="mt-5 space-y-5">
          <Card className="border border-border bg-card p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Company Profile</h3>
              <p className="text-xs text-muted-foreground">Manage your company information</p>
            </div>

            <div className="p-6 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <Upload className="w-5 h-5" />
                <span className="text-xs">Upload company logo</span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                className="mt-1.5 h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder="Tell us about your company"
                rows={3}
                className="mt-1.5 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Website</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="mt-1.5 h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-1.5 h-9 text-sm">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="mt-1.5 h-9 text-sm">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTUP">Startup (1-10)</SelectItem>
                    <SelectItem value="SMALL">Small (11-50)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (51-500)</SelectItem>
                    <SelectItem value="LARGE">Large (501-5000)</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise (5000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="mt-1.5 h-9 text-sm"
              />
            </div>

            {saveStatus === 'success' && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-700 dark:text-green-400">Saved successfully</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center gap-2">
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-700 dark:text-red-400">Failed to save</span>
              </div>
            )}

            <Button onClick={handleSaveCompanyProfile} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Profile
            </Button>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-5 space-y-4">
          <Card className="border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <span>Google Drive</span>
                {driveConnected && <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400">Connected</Badge>}
              </h3>
              <p className="text-xs text-muted-foreground">Store candidate resumes and videos</p>
            </div>

            <p className="text-xs text-muted-foreground">Paste the link to your Google Drive folder where candidate resumes and videos will be stored.</p>

            <div>
              <Label className="text-xs text-muted-foreground">Google Drive Folder Link</Label>
              <Input
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="mt-1.5 h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Resume Subfolder</Label>
                <Input
                  value={resumeFolder}
                  onChange={(e) => setResumeFolder(e.target.value)}
                  placeholder="Resumes"
                  className="mt-1.5 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Video Subfolder</Label>
                <Input
                  value={videoFolder}
                  onChange={(e) => setVideoFolder(e.target.value)}
                  placeholder="Videos"
                  className="mt-1.5 h-9 text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleTestDriveConnection}
              disabled={!driveLink.trim() || driveTesting}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {driveTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Test Connection
            </Button>
          </Card>

          <Card className="border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <span>Google Calendar</span>
                {calendarConnected && <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400">Connected</Badge>}
              </h3>
              <p className="text-xs text-muted-foreground">Enable interview scheduling</p>
            </div>

            <p className="text-xs text-muted-foreground">Enter your Google Calendar email or ID to enable interview scheduling.</p>

            <div>
              <Label className="text-xs text-muted-foreground">Google Calendar ID</Label>
              <Input
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                placeholder="your-email@gmail.com or calendar-id"
                className="mt-1.5 h-9 text-sm"
              />
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Connect Calendar
            </Button>
          </Card>

          <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Integrations
          </Button>
        </TabsContent>

        {/* Career Page Tab */}
        <TabsContent value="career" className="mt-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="border border-border bg-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Career Page Branding</h3>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Brand Color</Label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-12 h-9 rounded-lg cursor-pointer border border-border"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#4F46E5"
                    className="flex-1 h-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Accent Color</Label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-9 rounded-lg cursor-pointer border border-border"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#06B6D4"
                    className="flex-1 h-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Career Page Title</Label>
                <Input
                  value={careerPageTitle}
                  onChange={(e) => setCareerPageTitle(e.target.value)}
                  placeholder="Join Our Team"
                  className="mt-1.5 h-9 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Career Page Description</Label>
                <Textarea
                  value={careerPageDescription}
                  onChange={(e) => setCareerPageDescription(e.target.value)}
                  placeholder="Tell candidates why they should join your company..."
                  rows={3}
                  className="mt-1.5 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Banner Image</Label>
                <div className="p-4 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer mt-1.5">
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload banner</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-border bg-card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Preview</h3>
              </div>

              <div
                className="rounded-lg overflow-hidden border border-border"
                style={{
                  backgroundColor: brandColor + '10',
                  borderColor: accentColor,
                }}
              >
                <div
                  className="h-20 flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  {careerPageTitle || 'Career Page'}
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-foreground line-clamp-3">
                    {careerPageDescription || 'Your career page description will appear here'}
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    View Open Positions
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Career Page
          </Button>
        </TabsContent>

        {/* Assessment Settings Tab */}
        <TabsContent value="assessment" className="mt-5">
          <Card className="border border-border bg-card p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Assessment Configuration</h3>
              <p className="text-xs text-muted-foreground mt-1">Customize assessment requirements for candidates</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">Require Video Introduction</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask candidates to introduce themselves on video</p>
                </div>
                <Switch
                  checked={requireVideo}
                  onCheckedChange={setRequireVideo}
                />
              </div>

              {requireVideo && (
                <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                  <Label className="text-xs text-muted-foreground">Video Max Duration (seconds)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="120"
                    value={videoMaxDuration}
                    onChange={(e) => setVideoMaxDuration(Math.min(120, Math.max(30, parseInt(e.target.value) || 30)))}
                    className="h-9 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{videoMaxDuration} seconds</p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">Require DISC Personality Test</p>
                  <p className="text-xs text-muted-foreground mt-1">Include DISC assessment in evaluation</p>
                </div>
                <Switch
                  checked={requireDISC}
                  onCheckedChange={setRequireDISC}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <Label className="text-xs text-muted-foreground">Assessment Time Limit (minutes)</Label>
                <Input
                  type="number"
                  min="15"
                  max="90"
                  value={assessmentTimeLimit}
                  onChange={(e) => setAssessmentTimeLimit(Math.min(90, Math.max(15, parseInt(e.target.value) || 45)))}
                  className="h-9 text-sm"
                />
                <p className="text-xs text-muted-foreground">{assessmentTimeLimit} minutes</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Send Assessment</p>
                  <p className="text-xs text-muted-foreground mt-1">Automatically send assessment after application</p>
                </div>
                <Switch
                  checked={autoSendAssessment}
                  onCheckedChange={setAutoSendAssessment}
                />
              </div>

              {autoSendAssessment && (
                <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                  <Label className="text-xs text-muted-foreground">Auto-Remind After (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={autoRemindDays}
                    onChange={(e) => setAutoRemindDays(Math.min(7, Math.max(1, parseInt(e.target.value) || 3)))}
                    className="h-9 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Remind candidates after {autoRemindDays} day{autoRemindDays !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>

            <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Assessment Settings
            </Button>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-5 space-y-4">
          <Card className="border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Invite Team Member</h3>
              <p className="text-xs text-muted-foreground">Add team members to collaborate on hiring</p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 h-9 text-sm"
              />
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="RECRUITER">Recruiter</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleInviteTeamMember}
                disabled={!inviteEmail.trim() || inviting}
                className="gap-1 h-9"
              >
                {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Invite
              </Button>
            </div>
          </Card>

          <Card className="border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Team Members</h3>

              {loadingTeam ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
              ) : teamMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No team members yet. Invite your first member above.</p>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">{roleDescriptions[member.role]}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={roleBadgeColor[member.role]}>{member.role}</Badge>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            member.status === 'ACCEPTED'
                              ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                              : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeamMember(member.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 space-y-2">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Role Descriptions</p>
              <div className="space-y-1.5 text-[11px]">
                <div><span className="font-medium text-blue-700 dark:text-blue-400">Admin:</span> <span className="text-blue-600 dark:text-blue-300">Can manage team, settings, and integrations</span></div>
                <div><span className="font-medium text-blue-700 dark:text-blue-400">Recruiter:</span> <span className="text-blue-600 dark:text-blue-300">Can create jobs, manage candidates, and schedule interviews</span></div>
                <div><span className="font-medium text-blue-700 dark:text-blue-400">Viewer:</span> <span className="text-blue-600 dark:text-blue-300">Read-only access to pipelines and candidates</span></div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-5">
          <Card className="border border-border bg-card p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Email Notifications</h3>
              <p className="text-xs text-muted-foreground mt-1">Choose which events trigger email notifications</p>
            </div>

            <div className="space-y-1">
              {[
                { key: 'newApplication' as const, label: 'New Application', desc: 'When a new candidate applies' },
                { key: 'assessmentCompleted' as const, label: 'Assessment Completed', desc: 'When a candidate completes an assessment' },
                { key: 'discTestCompleted' as const, label: 'DISC Test Completed', desc: 'When a candidate completes DISC test' },
                { key: 'interviewScheduled' as const, label: 'Interview Scheduled', desc: 'When an interview is scheduled' },
                { key: 'candidateStageChanged' as const, label: 'Candidate Stage Changed', desc: 'When a candidate moves to a new stage' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [key]: checked })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
              <Label className="text-sm font-medium text-foreground">Digest Frequency</Label>
              <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">Save Notification Preferences</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
