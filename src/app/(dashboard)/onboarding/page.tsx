'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type OnboardingStep = 'company' | 'integrations' | 'career' | 'assessment' | 'team' | 'complete';

interface OnboardingState {
  // Company Profile
  companyName: string;
  companyDescription: string;
  industry: string;
  companySize: string;
  logo?: File;

  // Integrations
  googleDriveFolderId: string;
  googleDriveResumeFolder: string;
  googleDriveVideoFolder: string;
  googleCalendarId: string;

  // Career Page
  brandColor: string;
  accentColor: string;
  careerPageTitle: string;
  careerPageDescription: string;

  // Assessment
  requireVideoIntro: boolean;
  videoMaxDuration: number;
  requireDISC: boolean;
  assessmentTimeLimit: number;
  autoSendAssessment: boolean;
  autoRemindDays: number;

  // Team
  teamEmails: string[];
}

const steps: { key: OnboardingStep; title: string; description: string }[] = [
  { key: 'company', title: 'Company Profile', description: 'Tell us about your company' },
  { key: 'integrations', title: 'Integrations', description: 'Connect Google Drive & Calendar' },
  { key: 'career', title: 'Career Page', description: 'Customize your branding' },
  { key: 'assessment', title: 'Assessment', description: 'Configure candidate assessments' },
  { key: 'team', title: 'Team', description: 'Invite team members (optional)' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<OnboardingState>({
    companyName: '',
    companyDescription: '',
    industry: '',
    companySize: '',
    googleDriveFolderId: '',
    googleDriveResumeFolder: 'Resumes',
    googleDriveVideoFolder: 'Videos',
    googleCalendarId: '',
    brandColor: '#4F46E5',
    accentColor: '#06B6D4',
    careerPageTitle: '',
    careerPageDescription: '',
    requireVideoIntro: true,
    videoMaxDuration: 60,
    requireDISC: true,
    assessmentTimeLimit: 45,
    autoSendAssessment: true,
    autoRemindDays: 3,
    teamEmails: [],
  });

  const stepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 'company') {
      if (!state.companyName.trim()) {
        setError('Company name is required');
        return;
      }
    } else if (currentStep === 'integrations') {
      if (!state.googleDriveFolderId.trim() && !state.googleCalendarId.trim()) {
        setError('Please configure at least one integration');
        return;
      }
    } else if (currentStep === 'career') {
      if (!state.careerPageTitle.trim()) {
        setError('Career page title is required');
        return;
      }
    }

    setError(null);

    // Save data on each step
    await saveStep();

    // Move to next step
    const nextStepIndex = Math.min(stepIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextStepIndex].key);
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setError(null);
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const saveStep = async () => {
    setSaving(true);
    try {
      if (currentStep === 'company') {
        const res = await fetch('/api/company', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: state.companyName,
            description: state.companyDescription,
            industry: state.industry,
            size: state.companySize,
          }),
        });
        if (!res.ok) throw new Error('Failed to save company profile');
      } else if (currentStep === 'integrations') {
        const res = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleDriveFolderId: state.googleDriveFolderId,
            googleDriveResumeFolder: state.googleDriveResumeFolder,
            googleDriveVideoFolder: state.googleDriveVideoFolder,
            googleCalendarId: state.googleCalendarId,
          }),
        });
        if (!res.ok) throw new Error('Failed to save integrations');
      } else if (currentStep === 'career') {
        const res = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandColor: state.brandColor,
            accentColor: state.accentColor,
            careerPageTitle: state.careerPageTitle,
            careerPageDescription: state.careerPageDescription,
          }),
        });
        if (!res.ok) throw new Error('Failed to save career page');
      } else if (currentStep === 'assessment') {
        const res = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requireVideoIntro: state.requireVideoIntro,
            videoMaxDuration: state.videoMaxDuration,
            requireDISC: state.requireDISC,
            assessmentTimeLimit: state.assessmentTimeLimit,
            autoSendAssessment: state.autoSendAssessment,
            autoRemindDays: state.autoRemindDays,
          }),
        });
        if (!res.ok) throw new Error('Failed to save assessment settings');
      } else if (currentStep === 'team') {
        for (const email of state.teamEmails) {
          if (email.trim()) {
            const res = await fetch('/api/settings/team', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: email.trim(),
                role: 'RECRUITER',
              }),
            });
            if (!res.ok) console.error('Failed to invite team member:', email);
          }
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setError(null);
    await saveStep();
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key);
    } else {
      router.push('/dashboard');
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await saveStep();
      // Redirect to dashboard with success
      router.push('/dashboard?onboarding=complete');
    } catch (err) {
      console.error('Complete error:', err);
      setError('Failed to complete onboarding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Welcome to AutoHire
          </h1>
          <p className="text-muted-foreground">
            Let's get your hiring platform set up in 5 minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`flex-1 flex flex-col items-center ${
                  index > stepIndex ? 'opacity-30' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    steps.findIndex(s => s.key === currentStep) > index
                      ? 'bg-green-500 text-white'
                      : steps.findIndex(s => s.key === currentStep) === index
                      ? 'bg-indigo-500 text-white ring-2 ring-indigo-400 ring-offset-2'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {steps.findIndex(s => s.key === currentStep) > index ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-[10px] font-medium text-foreground mt-2 text-center">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="border border-border bg-card p-8">
          {/* Step Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {steps[stepIndex].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {steps[stepIndex].description}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3">
              <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6 mb-8">
            {currentStep === 'company' && (
              <>
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Company Name *
                  </Label>
                  <Input
                    value={state.companyName}
                    onChange={(e) => setState({ ...state, companyName: e.target.value })}
                    placeholder="Your company name"
                    className="mt-2 h-10 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Description
                  </Label>
                  <Textarea
                    value={state.companyDescription}
                    onChange={(e) => setState({ ...state, companyDescription: e.target.value })}
                    placeholder="Tell us about your company..."
                    rows={3}
                    className="mt-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Industry</Label>
                    <Select value={state.industry} onValueChange={(value) => setState({ ...state, industry: value })}>
                      <SelectTrigger className="mt-2 h-10 text-sm">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">Company Size</Label>
                    <Select value={state.companySize} onValueChange={(value) => setState({ ...state, companySize: value })}>
                      <SelectTrigger className="mt-2 h-10 text-sm">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STARTUP">Startup (1-10)</SelectItem>
                        <SelectItem value="SMALL">Small (11-50)</SelectItem>
                        <SelectItem value="MEDIUM">Medium (51-500)</SelectItem>
                        <SelectItem value="LARGE">Large (500+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload company logo (optional)</span>
                  </div>
                </div>
              </>
            )}

            {currentStep === 'integrations' && (
              <>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Both integrations are optional but recommended. You can skip and configure them later in settings.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Google Drive Folder Link
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    Paste the link to your Google Drive folder for storing resumes and videos
                  </p>
                  <Input
                    value={state.googleDriveFolderId}
                    onChange={(e) => setState({ ...state, googleDriveFolderId: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="h-10 text-sm"
                  />
                </div>

                {state.googleDriveFolderId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Resume Subfolder</Label>
                      <Input
                        value={state.googleDriveResumeFolder}
                        onChange={(e) => setState({ ...state, googleDriveResumeFolder: e.target.value })}
                        placeholder="Resumes"
                        className="mt-2 h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Video Subfolder</Label>
                      <Input
                        value={state.googleDriveVideoFolder}
                        onChange={(e) => setState({ ...state, googleDriveVideoFolder: e.target.value })}
                        placeholder="Videos"
                        className="mt-2 h-10 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Google Calendar ID
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    Enter your Google Calendar email to enable interview scheduling
                  </p>
                  <Input
                    value={state.googleCalendarId}
                    onChange={(e) => setState({ ...state, googleCalendarId: e.target.value })}
                    placeholder="your-email@gmail.com"
                    className="h-10 text-sm"
                  />
                </div>
              </>
            )}

            {currentStep === 'career' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Brand Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={state.brandColor}
                        onChange={(e) => setState({ ...state, brandColor: e.target.value })}
                        className="w-12 h-10 rounded-lg cursor-pointer border border-border"
                      />
                      <Input
                        value={state.brandColor}
                        onChange={(e) => setState({ ...state, brandColor: e.target.value })}
                        placeholder="#4F46E5"
                        className="flex-1 h-10 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">Accent Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={state.accentColor}
                        onChange={(e) => setState({ ...state, accentColor: e.target.value })}
                        className="w-12 h-10 rounded-lg cursor-pointer border border-border"
                      />
                      <Input
                        value={state.accentColor}
                        onChange={(e) => setState({ ...state, accentColor: e.target.value })}
                        placeholder="#06B6D4"
                        className="flex-1 h-10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Career Page Title *
                  </Label>
                  <Input
                    value={state.careerPageTitle}
                    onChange={(e) => setState({ ...state, careerPageTitle: e.target.value })}
                    placeholder="Join Our Team"
                    className="mt-2 h-10 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Career Page Description
                  </Label>
                  <Textarea
                    value={state.careerPageDescription}
                    onChange={(e) => setState({ ...state, careerPageDescription: e.target.value })}
                    placeholder="Tell candidates why they should join..."
                    rows={3}
                    className="mt-2 text-sm"
                  />
                </div>

                <div className="p-4 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">Upload banner image (optional)</span>
                  </div>
                </div>
              </>
            )}

            {currentStep === 'assessment' && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Require Video Introduction
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Candidates introduce themselves on video
                      </p>
                    </div>
                    <Switch
                      checked={state.requireVideoIntro}
                      onCheckedChange={(checked) => setState({ ...state, requireVideoIntro: checked })}
                    />
                  </div>

                  {state.requireVideoIntro && (
                    <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <Label className="text-xs text-muted-foreground">
                        Max Duration (seconds)
                      </Label>
                      <Input
                        type="number"
                        min="30"
                        max="120"
                        value={state.videoMaxDuration}
                        onChange={(e) => setState({ ...state, videoMaxDuration: Math.min(120, Math.max(30, parseInt(e.target.value) || 30)) })}
                        className="mt-2 h-10 text-sm"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Require DISC Test
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Include personality assessment
                      </p>
                    </div>
                    <Switch
                      checked={state.requireDISC}
                      onCheckedChange={(checked) => setState({ ...state, requireDISC: checked })}
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <Label className="text-xs text-muted-foreground">
                      Assessment Time Limit (minutes)
                    </Label>
                    <Input
                      type="number"
                      min="15"
                      max="90"
                      value={state.assessmentTimeLimit}
                      onChange={(e) => setState({ ...state, assessmentTimeLimit: Math.min(90, Math.max(15, parseInt(e.target.value) || 45)) })}
                      className="mt-2 h-10 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Auto-Send Assessment
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Send right after application
                      </p>
                    </div>
                    <Switch
                      checked={state.autoSendAssessment}
                      onCheckedChange={(checked) => setState({ ...state, autoSendAssessment: checked })}
                    />
                  </div>

                  {state.autoSendAssessment && (
                    <div className="ml-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <Label className="text-xs text-muted-foreground">
                        Remind After (days)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={state.autoRemindDays}
                        onChange={(e) => setState({ ...state, autoRemindDays: Math.min(7, Math.max(1, parseInt(e.target.value) || 3)) })}
                        className="mt-2 h-10 text-sm"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {currentStep === 'team' && (
              <>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Invite team members to collaborate. You can skip this and add them later.
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Team Member Email(s)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    Add one email per line. All optional.
                  </p>
                  <Textarea
                    value={state.teamEmails.join('\n')}
                    onChange={(e) => setState({ ...state, teamEmails: e.target.value.split('\n').filter(e => e.trim()) })}
                    placeholder="team@example.com&#10;recruiter@example.com"
                    rows={4}
                    className="text-sm"
                  />
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {stepIndex > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={saving}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={saving}
              className="ml-auto"
            >
              Skip
            </Button>

            {stepIndex < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={saving}
                className="gap-2 flex-1"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={saving}
                className="gap-2 flex-1"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Complete Setup
              </Button>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Step {stepIndex + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}
