'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlatformCard } from '@/components/outreach/platform-card';
import { ContentEditor } from '@/components/outreach/content-editor';
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface JobPostingOption {
  id: string;
  title: string;
  company: {
    name: string;
  };
}

interface PlatformRecommendation {
  platform: string;
  score: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

interface PlatformContent {
  platform: string;
  content: string;
  characterCount: number;
  hashtags?: string[];
  bestPostingTime?: string;
}

type Step = 'select-job' | 'platforms' | 'content' | 'preview';

export default function CreateOutreachPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('select-job');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformContents, setPlatformContents] = useState<Record<string, PlatformContent>>({});
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [postImmediately, setPostImmediately] = useState(true);

  // Fetch available jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['available-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs?status=PUBLISHED');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const jobs = jobsData?.jobs || [];
  const selectedJob = jobs.find((j: JobPostingOption) => j.id === selectedJobId);

  // Fetch platform recommendations
  const { data: platformRecsData, isLoading: recsLoading } = useQuery({
    queryKey: ['platform-recommendations', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      const response = await fetch('/api/outreach/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJobId }),
      });
      if (!response.ok) throw new Error('Failed to get recommendations');
      return response.json();
    },
    enabled: !!selectedJobId,
  });

  const platformRecs = platformRecsData?.recommendations || [];

  // Generate content for platforms
  const generateContentMutation = useMutation({
    mutationFn: async (platforms: string[]) => {
      const response = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          platforms,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate content');
      return response.json();
    },
    onSuccess: (data) => {
      const contents: Record<string, PlatformContent> = {};
      data.contents.forEach((content: PlatformContent) => {
        contents[content.platform] = content;
      });
      setPlatformContents(contents);
      setCurrentStep('content');
    },
    onError: () => {
      toast.error('Failed to generate platform-specific content');
    },
  });

  // Save outreach post
  const savePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          platforms: selectedPlatforms,
          platformContents,
          scheduledAt: postImmediately ? null : scheduledAt,
          status: postImmediately ? 'POSTED' : 'SCHEDULED',
        }),
      });
      if (!response.ok) throw new Error('Failed to save post');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Outreach post created successfully!');
      router.push('/outreach');
    },
    onError: () => {
      toast.error('Failed to create outreach post');
    },
  });

  const handleSelectJob = () => {
    if (!selectedJobId) {
      toast.error('Please select a job');
      return;
    }
    setCurrentStep('platforms');
  };

  const handleSelectPlatforms = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    generateContentMutation.mutate(selectedPlatforms);
  };

  const handleSavePost = () => {
    // Validate all platforms have content
    const missingContent = selectedPlatforms.filter(p => !platformContents[p]?.content);
    if (missingContent.length > 0) {
      toast.error(`Missing content for: ${missingContent.join(', ')}`);
      return;
    }

    if (!postImmediately && !scheduledAt) {
      toast.error('Please select a scheduled time');
      return;
    }

    setCurrentStep('preview');
  };

  const handleConfirmPost = () => {
    savePostMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create Outreach Post</h1>
        <p className="text-gray-600 mt-1">
          Distribute your job posting with AI-optimized content for each platform
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {(['select-job', 'platforms', 'content', 'preview'] as Step[]).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                step === currentStep
                  ? 'bg-blue-600 text-white'
                  : ['select-job', 'platforms', 'content'].includes(currentStep) &&
                    ['select-job', 'platforms', 'content', 'preview'].indexOf(step) <
                      ['select-job', 'platforms', 'content', 'preview'].indexOf(currentStep)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {['select-job', 'platforms', 'content'].includes(currentStep) &&
              ['select-job', 'platforms', 'content', 'preview'].indexOf(step) <
                ['select-job', 'platforms', 'content', 'preview'].indexOf(currentStep) ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && <div className="w-12 h-1 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Job */}
      {currentStep === 'select-job' && (
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Step 1: Select Job Posting</h2>
            <p className="text-gray-600 text-sm">
              Choose the job posting you want to distribute across platforms
            </p>
          </div>

          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-gray-600">No published jobs found</p>
              <Button
                variant="outline"
                onClick={() => router.push('/jobs/create')}
                className="mt-4"
              >
                Create a job posting first
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job: JobPostingOption) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedJobId === job.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company.name}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 ${
                        selectedJobId === job.id
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleSelectJob}
            disabled={!selectedJobId || jobsLoading}
            className="w-full gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Select Platforms */}
      {currentStep === 'platforms' && selectedJob && (
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Step 2: Recommended Platforms</h2>
            <p className="text-gray-600 text-sm mb-4">
              AI analyzed your job posting. Select platforms to post on:
            </p>
          </div>

          {recsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platformRecs.map((rec: PlatformRecommendation) => (
                <PlatformCard
                  key={rec.platform}
                  platform={rec.platform}
                  score={rec.score}
                  reasoning={rec.reasoning}
                  priority={rec.priority}
                  selected={selectedPlatforms.includes(rec.platform)}
                  onSelect={(platform) => {
                    if (selectedPlatforms.includes(platform)) {
                      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                    } else {
                      setSelectedPlatforms([...selectedPlatforms, platform]);
                    }
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('select-job')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSelectPlatforms}
              disabled={selectedPlatforms.length === 0 || generateContentMutation.isPending}
              className="flex-1 gap-2"
            >
              {generateContentMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Generate Content
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Edit Content */}
      {currentStep === 'content' && (
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Step 3: Review & Edit Content</h2>
            <p className="text-gray-600 text-sm mb-4">
              AI generated platform-specific content. Edit as needed:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {selectedPlatforms.map(platform => (
              <ContentEditor
                key={platform}
                platform={platform}
                content={platformContents[platform]}
                onChange={(updated) => {
                  setPlatformContents({
                    ...platformContents,
                    [platform]: updated,
                  });
                }}
              />
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <label className="font-semibold block mb-2">Posting Option</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={postImmediately}
                    onChange={() => setPostImmediately(true)}
                    className="w-4 h-4"
                  />
                  <span>Post immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!postImmediately}
                    onChange={() => setPostImmediately(false)}
                    className="w-4 h-4"
                  />
                  <span>Schedule for later</span>
                </label>
              </div>
            </div>

            {!postImmediately && (
              <div>
                <label className="block text-sm font-medium mb-2">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('platforms')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSavePost}
              className="flex-1 gap-2"
            >
              Review <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Confirm */}
      {currentStep === 'preview' && (
        <div className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Step 4: Confirm & Post</h2>
            <p className="text-gray-600 text-sm mb-4">
              Review your outreach post before posting:
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Job</p>
              <p className="font-semibold">{selectedJob?.title}</p>
              <p className="text-sm text-gray-600">{selectedJob?.company.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Platforms ({selectedPlatforms.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlatforms.map(platform => (
                  <div key={platform} className="bg-white px-3 py-1 rounded border text-sm">
                    {platform}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="font-semibold">
                {postImmediately ? 'Post Now' : `Scheduled for ${scheduledAt}`}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('content')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmPost}
              disabled={savePostMutation.isPending}
              className="flex-1 gap-2"
            >
              {savePostMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {postImmediately ? 'Post Now' : 'Schedule'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
