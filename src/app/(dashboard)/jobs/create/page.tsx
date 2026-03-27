'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Facebook,
  FileText,
  Linkedin,
  Loader2,
  PenLine,
  Share2,
  Sparkles,
  Twitter,
  Upload,
  Wand2,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Step = 'method' | 'generation' | 'details' | 'review' | 'share';

interface JDData {
  mode: 'prompt' | 'reference' | 'manual';
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  summary: string;
  keywords: string[];
  salary_suggestion?: string;
  department: string;
  level: string;
  type: 'full-time' | 'part-time' | 'contract';
  workMode: 'remote' | 'hybrid' | 'on-site';
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  companyName: string;
  industry: string;
  tone: 'professional' | 'casual' | 'startup' | 'corporate';
}

interface SnippetData {
  linkedin: { content: string; hashtags: string[] };
  twitter: { content: string; hashtags: string[] };
  facebook: { content: string; hashtags: string[] };
}

interface GenerationInput {
  prompt?: string;
  referenceJd?: string;
  feedback?: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'ai' | 'reference' | 'manual' | null>(null);
  const [generationInput, setGenerationInput] = useState<GenerationInput>({});
  const [loading, setLoading] = useState(false);
  const [jdData, setJdData] = useState<JDData>({
    mode: 'prompt',
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    summary: '',
    keywords: [],
    department: '',
    level: 'mid-level',
    type: 'full-time',
    workMode: 'hybrid',
    location: '',
    companyName: '',
    industry: '',
    tone: 'professional',
  });

  const [snippets, setSnippets] = useState<SnippetData | null>(null);
  const [generatingSnippets, setGeneratingSnippets] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // ============================================================================
  // STEP 1: METHOD SELECTION
  // ============================================================================

  const handleMethodSelection = (selectedMethod: 'ai' | 'reference' | 'manual') => {
    setMethod(selectedMethod);
    const mode: 'prompt' | 'reference' | 'manual' = selectedMethod === 'ai' ? 'prompt' : selectedMethod === 'reference' ? 'reference' : 'manual';
    setJdData((prev) => ({ ...prev, mode }));

    if (selectedMethod === 'manual') {
      setStep('details');
    } else {
      setStep('generation');
    }
  };

  // ============================================================================
  // STEP 2: AI GENERATION
  // ============================================================================

  const handleGenerateJD = async () => {
    if (method === 'ai' && !generationInput.prompt) {
      alert('Please enter a job description or prompt');
      return;
    }
    if (method === 'reference' && !generationInput.referenceJd) {
      alert('Please paste an existing job description');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mode: jdData.mode,
        prompt: generationInput.prompt,
        referenceJd: generationInput.referenceJd,
        feedback: generationInput.feedback,
        jobTitle: jdData.title || undefined,
        department: jdData.department || undefined,
        level: jdData.level || undefined,
        companyName: jdData.companyName || undefined,
        industry: jdData.industry || undefined,
        tone: jdData.tone || 'professional',
      };

      const response = await fetch('/api/ai/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate JD');
      }

      const generated = await response.json();
      setJdData((prev) => ({
        ...prev,
        title: generated.title,
        description: generated.description,
        requirements: generated.requirements,
        benefits: generated.benefits,
        keywords: generated.keywords || [],
        summary: generated.summary,
        salary_suggestion: generated.salary_suggestion,
      }));

      setStep('details');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate JD');
    } finally {
      setLoading(false);
    }
  };

  const handleRefineJD = async () => {
    if (!generationInput.feedback) {
      alert('Please provide feedback for refinement');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mode: 'refine',
        currentJd: jdData.description,
        feedback: generationInput.feedback,
        companyName: jdData.companyName || undefined,
        tone: jdData.tone || 'professional',
      };

      const response = await fetch('/api/ai/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to refine JD');
      }

      const refined = await response.json();
      setJdData((prev) => ({
        ...prev,
        description: refined.description,
        requirements: refined.requirements,
        benefits: refined.benefits,
        keywords: refined.keywords || [],
      }));

      setGenerationInput({});
      alert('JD refined successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to refine JD');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // STEP 3: JOB DETAILS
  // ============================================================================

  const handleDetailsChange = (field: keyof JDData, value: any) => {
    setJdData((prev) => ({ ...prev, [field]: value }));
  };

  const validateDetails = (): boolean => {
    if (!jdData.title) {
      alert('Job title is required');
      return false;
    }
    if (!jdData.department) {
      alert('Department is required');
      return false;
    }
    if (!jdData.location && jdData.workMode !== 'remote') {
      alert('Location is required');
      return false;
    }
    if (!jdData.companyName) {
      alert('Company name is required');
      return false;
    }
    return true;
  };

  const proceedToReview = () => {
    if (validateDetails()) {
      setStep('review');
    }
  };

  // ============================================================================
  // STEP 4: REVIEW & SAVE
  // ============================================================================

  const handleSaveJob = async () => {
    setLoading(true);
    try {
      const jobPayload = {
        title: jdData.title,
        department: jdData.department,
        location: jdData.location || 'Remote',
        description: jdData.description,
        requirements: jdData.requirements.split('\n').filter((r) => r.trim()),
        benefits: jdData.benefits.split('\n').filter((b) => b.trim()),
        type: jdData.type,
        workMode: jdData.workMode,
        experienceLevel: jdData.level,
        salary: jdData.salaryMin
          ? {
              min: jdData.salaryMin,
              max: jdData.salaryMax || jdData.salaryMin,
              currency: 'USD',
            }
          : undefined,
        skills: jdData.keywords,
        status: 'draft',
        customQuestions: [],
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save job');
      }

      const saved = await response.json();
      setStep('share');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // STEP 5: SHARE
  // ============================================================================

  const handleGenerateSnippets = async () => {
    setGeneratingSnippets(true);
    try {
      const response = await fetch('/api/ai/generate-snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jdData.title,
          description: jdData.description,
          companyName: jdData.companyName,
          location: jdData.location || 'Remote',
          applyUrl: `${window.location.origin}/careers/${jdData.companyName.toLowerCase().replace(/\s+/g, '-')}/${jdData.title.toLowerCase().replace(/\s+/g, '-')}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate snippets');
      }

      const generated = await response.json();
      setSnippets(generated);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate snippets');
    } finally {
      setGeneratingSnippets(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const openShareWindow = (platform: 'linkedin' | 'twitter' | 'facebook', content: string) => {
    let url = '';
    const encodedText = encodeURIComponent(content);
    const appUrl = `${window.location.origin}/careers/${jdData.companyName.toLowerCase().replace(/\s+/g, '-')}/${jdData.title.toLowerCase().replace(/\s+/g, '-')}`;

    if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(appUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  // ============================================================================
  // RENDER STEPS
  // ============================================================================

  const renderMethodStep = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Write with AI */}
        <button
          onClick={() => handleMethodSelection('ai')}
          className="relative rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-elevation-1 active:scale-95"
        >
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Write with AI</h3>
            <p className="text-sm text-muted-foreground">Describe the role in your own words and let AI generate a professional JD</p>
          </div>
          {method === 'ai' && (
            <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </button>

        {/* Import Reference */}
        <button
          onClick={() => handleMethodSelection('reference')}
          className="relative rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-elevation-1 active:scale-95"
        >
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Import Reference JD</h3>
            <p className="text-sm text-muted-foreground">Paste an existing JD and we'll restructure it to be more professional</p>
          </div>
          {method === 'reference' && (
            <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </button>

        {/* Start from Scratch */}
        <button
          onClick={() => handleMethodSelection('manual')}
          className="relative rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-elevation-1 active:scale-95"
        >
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <PenLine className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Start from Scratch</h3>
            <p className="text-sm text-muted-foreground">Manually fill out the job description form</p>
          </div>
          {method === 'manual' && (
            <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => method && (method === 'manual' ? setStep('details') : setStep('generation'))} disabled={!method}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderGenerationStep = () => (
    <div className="max-w-2xl space-y-6">
      <Card className="border border-border bg-card p-6">
        <div className="space-y-4">
          {method === 'ai' && (
            <>
              <div>
                <label className="text-sm font-semibold text-foreground">Job Title (Optional)</label>
                <Input
                  placeholder="e.g., Senior Product Manager"
                  value={jdData.title}
                  onChange={(e) => handleDetailsChange('title', e.target.value)}
                  className="mt-2 h-9 text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-foreground">Department</label>
                  <Input
                    placeholder="e.g., Product"
                    value={jdData.department}
                    onChange={(e) => handleDetailsChange('department', e.target.value)}
                    className="mt-2 h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Experience Level</label>
                  <Select value={jdData.level} onValueChange={(val) => handleDetailsChange('level', val)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level</SelectItem>
                      <SelectItem value="mid-level">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead/Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Describe the Role</label>
                <Textarea
                  placeholder="What does this role do? What problems do they solve? What's the team like? What skills are important?"
                  value={generationInput.prompt || ''}
                  onChange={(e) => setGenerationInput({ ...generationInput, prompt: e.target.value })}
                  className="mt-2 min-h-32 text-sm"
                />
              </div>

              <Button onClick={handleGenerateJD} disabled={loading || !generationInput.prompt} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate JD
                  </>
                )}
              </Button>
            </>
          )}

          {method === 'reference' && (
            <>
              <div>
                <label className="text-sm font-semibold text-foreground">Paste Existing Job Description</label>
                <Textarea
                  placeholder="Paste the entire job description here..."
                  value={generationInput.referenceJd || ''}
                  onChange={(e) => setGenerationInput({ ...generationInput, referenceJd: e.target.value })}
                  className="mt-2 min-h-40 text-sm"
                />
              </div>

              <Button onClick={handleGenerateJD} disabled={loading || !generationInput.referenceJd} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restructuring...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Improve & Restructure
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Live Preview */}
      {jdData.description && (
        <div className="space-y-6">
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Title</h4>
                  <p className="text-foreground">{jdData.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Summary</h4>
                  <p className="text-sm text-foreground">{jdData.summary}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Description</h4>
                  <div className="prose prose-sm text-foreground whitespace-pre-wrap text-sm">{jdData.description}</div>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-2">
                <div className="whitespace-pre-wrap text-sm text-foreground">{jdData.requirements}</div>
              </TabsContent>

              <TabsContent value="benefits" className="space-y-2">
                <div className="whitespace-pre-wrap text-sm text-foreground">{jdData.benefits}</div>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {jdData.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Refine Options */}
          <Card className="border border-border bg-card/50 p-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Refine Your JD</label>
              <Textarea
                placeholder="Any feedback? E.g., 'Make it more startup-y', 'Add more detail about team size', etc."
                value={generationInput.feedback || ''}
                onChange={(e) => setGenerationInput({ ...generationInput, feedback: e.target.value })}
                className="min-h-20 text-sm"
              />
              <Button onClick={handleRefineJD} disabled={loading || !generationInput.feedback} variant="outline" className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Apply Feedback
                  </>
                )}
              </Button>
            </div>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => setStep('method')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep('details')} className="flex-1">
              Continue to Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="max-w-2xl space-y-6">
      <Card className="border border-border bg-card p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Job Title *</label>
                <Input
                  placeholder="e.g., Senior Product Manager"
                  value={jdData.title}
                  onChange={(e) => handleDetailsChange('title', e.target.value)}
                  className="mt-2 h-9 text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-foreground">Department *</label>
                  <Input
                    placeholder="e.g., Engineering, Product, Sales"
                    value={jdData.department}
                    onChange={(e) => handleDetailsChange('department', e.target.value)}
                    className="mt-2 h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Experience Level</label>
                  <Select value={jdData.level} onValueChange={(val) => handleDetailsChange('level', val)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level</SelectItem>
                      <SelectItem value="mid-level">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead/Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-foreground">Job Type</label>
                  <Select value={jdData.type} onValueChange={(val: any) => handleDetailsChange('type', val)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Work Mode</label>
                  <Select value={jdData.workMode} onValueChange={(val: any) => handleDetailsChange('workMode', val)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="on-site">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Location</label>
                <Input
                  placeholder="e.g., San Francisco, CA or Remote"
                  value={jdData.location}
                  onChange={(e) => handleDetailsChange('location', e.target.value)}
                  className="mt-2 h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Company & Industry */}
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Company Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Company Name *</label>
                <Input
                  placeholder="Your company name"
                  value={jdData.companyName}
                  onChange={(e) => handleDetailsChange('companyName', e.target.value)}
                  className="mt-2 h-9 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Industry</label>
                <Input
                  placeholder="e.g., SaaS, Financial Services, Healthcare"
                  value={jdData.industry}
                  onChange={(e) => handleDetailsChange('industry', e.target.value)}
                  className="mt-2 h-9 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Tone</label>
                <Select value={jdData.tone} onValueChange={(val: any) => handleDetailsChange('tone', val)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Compensation (Optional)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-foreground">Salary Min</label>
                <Input
                  type="number"
                  placeholder="e.g., 80000"
                  value={jdData.salaryMin || ''}
                  onChange={(e) => handleDetailsChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-2 h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Salary Max</label>
                <Input
                  type="number"
                  placeholder="e.g., 120000"
                  value={jdData.salaryMax || ''}
                  onChange={(e) => handleDetailsChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-2 h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => setStep('generation')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={proceedToReview} className="flex-1">
          Continue to Review <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="max-w-3xl space-y-6">
      <Card className="border border-border bg-card overflow-hidden">
        <div className="bg-primary/10 border-b border-border p-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{jdData.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{jdData.department}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{jdData.level}</Badge>
            <Badge variant="outline">{jdData.type}</Badge>
            <Badge variant="outline">{jdData.workMode}</Badge>
            <Badge variant="outline">{jdData.location || 'Remote'}</Badge>
            {jdData.salaryMin && <Badge variant="outline">${jdData.salaryMin.toLocaleString()} - ${jdData.salaryMax?.toLocaleString()}</Badge>}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">About This Role</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{jdData.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Required Qualifications</h3>
            <div className="text-sm text-foreground whitespace-pre-wrap">{jdData.requirements}</div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">What We Offer</h3>
            <div className="text-sm text-foreground whitespace-pre-wrap">{jdData.benefits}</div>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Key Skills</h3>
            <div className="flex flex-wrap gap-2">
              {jdData.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => setStep('details')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Edit Details
        </Button>
        <Button onClick={handleSaveJob} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save as Draft
            </>
          )}
        </Button>
        <Button onClick={handleSaveJob} disabled={loading} variant="default" className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderShareStep = () => (
    <div className="max-w-3xl space-y-6">
      <Card className="border border-border bg-card/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Job Published Successfully!</h3>
            <p className="text-sm text-muted-foreground">Now share your job posting to attract more candidates</p>
          </div>
        </div>
      </Card>

      {/* Snippets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Social Media Snippets</h3>
          <Button onClick={handleGenerateSnippets} disabled={generatingSnippets || !!snippets} variant="outline" size="sm">
            {generatingSnippets ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : snippets ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Generated
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Snippets
              </>
            )}
          </Button>
        </div>

        {generatingSnippets && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {snippets && (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {/* LinkedIn */}
            <Card className="border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Linkedin className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold text-foreground">LinkedIn</h4>
              </div>
              <div className="bg-muted/50 rounded p-3 mb-3 min-h-24">
                <p className="text-xs text-foreground whitespace-pre-wrap">{snippets.linkedin.content}</p>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {snippets.linkedin.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(snippets.linkedin.content, 'linkedin')}
                >
                  {copiedSnippet === 'linkedin' ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openShareWindow('linkedin', snippets.linkedin.content)}>
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            {/* Twitter */}
            <Card className="border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Twitter className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-foreground">Twitter/X</h4>
              </div>
              <div className="bg-muted/50 rounded p-3 mb-3 min-h-24">
                <p className="text-xs text-foreground whitespace-pre-wrap">{snippets.twitter.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{snippets.twitter.content.length}/280 characters</p>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {snippets.twitter.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(snippets.twitter.content, 'twitter')}
                >
                  {copiedSnippet === 'twitter' ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openShareWindow('twitter', snippets.twitter.content)}>
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            {/* Facebook */}
            <Card className="border border-border bg-card p-4 lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Facebook className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-foreground">Facebook</h4>
              </div>
              <div className="bg-muted/50 rounded p-3 mb-3 min-h-24">
                <p className="text-xs text-foreground whitespace-pre-wrap">{snippets.facebook.content}</p>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {snippets.facebook.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(snippets.facebook.content, 'facebook')}
                >
                  {copiedSnippet === 'facebook' ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openShareWindow('facebook', snippets.facebook.content)}>
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/jobs" className="flex-1">
          <Button className="w-full" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View All Jobs
          </Button>
        </Link>
        <Button className="flex-1" onClick={() => setStep('method')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Another Job
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Job Posting</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 'method' && 'Choose how you want to create your job description'}
              {step === 'generation' && 'Generate your job description with AI'}
              {step === 'details' && 'Fill in additional job details'}
              {step === 'review' && 'Review and publish your job'}
              {step === 'share' && 'Share your job on social media'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['method', 'generation', 'details', 'review', 'share'] as const).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : (['method', 'generation', 'details', 'review', 'share'].indexOf(step) > idx
                        ? 'bg-green-100 text-green-700'
                        : 'bg-muted text-muted-foreground')
                }`}
              >
                {['method', 'generation', 'details', 'review', 'share'].indexOf(step) > idx ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              {idx < 4 && <div className="w-8 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        {step === 'method' && renderMethodStep()}
        {step === 'generation' && renderGenerationStep()}
        {step === 'details' && renderDetailsStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'share' && renderShareStep()}
      </div>
    </div>
  );
}
