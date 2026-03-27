'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Play,
  Loader,
  AlertCircle,
  Video,
  RotateCcw,
  Square,
  Phone,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
  orgSlug: string;
}

interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  linkedin: string;
  portfolio: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  type: 'short' | 'long' | 'choice';
  required: boolean;
  options?: string[];
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
];

function VideoRecorder({ onVideoRecorded }: { onVideoRecorded: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [maxDuration] = useState(60);
  const [cameraError, setCameraError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    setIsInitializing(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please check your device.');
      } else {
        setCameraError('Unable to access camera. Please check your permissions and try again.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await initializeCamera();
      if (!streamRef.current) return;
    }

    chunksRef.current = [];
    setElapsed(0);
    setRecordedBlob(null);
    setRecordedVideoUrl(null);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const newElapsed = prev + 1;
        if (newElapsed >= maxDuration) {
          mediaRecorder.stop();
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return newElapsed;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const reRecord = () => {
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setElapsed(0);
  };

  const handleSubmitVideo = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], 'introduction.webm', { type: recordedBlob.type });
      onVideoRecorded(file);
    }
  };

  const progressPercent = (elapsed / maxDuration) * 100;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="space-y-4">
      {!recordedVideoUrl ? (
        <>
          {cameraError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{cameraError}</p>
            </div>
          )}

          {!isRecording && !streamRef.current && (
            <Button
              type="button"
              variant="outline"
              onClick={initializeCamera}
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Starting Camera...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Enable Camera
                </>
              )}
            </Button>
          )}

          {streamRef.current && !isRecording && !recordedVideoUrl && (
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Prompt:</span> Tell us about yourself and why you're interested in this role (30-60 seconds)
                </p>

                <Button
                  type="button"
                  onClick={startRecording}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Start Recording
                </Button>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Recording
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Duration</span>
                    <span className="text-sm font-mono">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} / {String(Math.floor(maxDuration / 60)).padStart(2, '0')}:00
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-100"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={stopRecording}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Square className="w-4 h-4 mr-2 fill-current" />
                  Stop Recording
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <video
              src={recordedVideoUrl}
              controls
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={reRecord}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Re-record
            </Button>
            <Button
              type="button"
              onClick={handleSubmitVideo}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Use This Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplyForm({ jobId, jobTitle, orgSlug }: ApplyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    linkedin: '',
    portfolio: '',
  });

  const [resume, setResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [showResumeTextarea, setShowResumeTextarea] = useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
  const [video, setVideo] = useState<File | null>(null);

  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Refs
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Mock custom questions - TODO: Fetch from job data
  const customQuestions: CustomQuestion[] = [
    {
      id: '1',
      question: 'Tell us about a project you\'re proud of',
      type: 'long',
      required: true,
    },
    {
      id: '2',
      question: 'How many years of experience do you have?',
      type: 'choice',
      required: true,
      options: ['0-2 years', '2-5 years', '5-10 years', '10+ years'],
    },
  ];

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setResume(file);
    setResumeUploadProgress(100);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        if (!basicInfo.firstName.trim() || !basicInfo.lastName.trim()) {
          setError('Please enter your first and last name');
          return false;
        }
        if (!basicInfo.email.trim()) {
          setError('Please enter your email');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(basicInfo.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!basicInfo.phone.trim()) {
          setError('Please enter your phone number');
          return false;
        }
        return true;
      }

      case 2:
        if (!resume && !resumeText.trim()) {
          setError('Please upload a resume or paste your resume text');
          return false;
        }
        return true;

      case 3:
        return true; // Video is optional

      case 4:
        if (!agreeToTerms) {
          setError('Please agree to the terms and conditions');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('jobPostingId', jobId);
      formData.append('orgSlug', orgSlug);

      // Personal info
      formData.append('firstName', basicInfo.firstName);
      formData.append('lastName', basicInfo.lastName);
      formData.append('email', basicInfo.email);
      formData.append('phone', `${basicInfo.countryCode} ${basicInfo.phone}`);
      if (basicInfo.linkedin) formData.append('linkedin', basicInfo.linkedin);
      if (basicInfo.portfolio) formData.append('portfolio', basicInfo.portfolio);

      // Resume
      if (resume) {
        formData.append('resume', resume);
      } else if (resumeText) {
        formData.append('resumeText', resumeText);
      }

      // Video (optional)
      if (video) {
        formData.append('video', video);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push(`/careers/${orgSlug}/${jobId}/apply/success`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
                step < currentStep
                  ? 'bg-green-600 text-white'
                  : step === currentStep
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>
        <div className="flex gap-2 text-sm">
          {[
            'Personal Info',
            'Resume',
            'Video Intro',
            'Review & Submit',
          ].map((label, idx) => (
            <div key={idx} className="flex-1 text-center">
              <span
                className={
                  currentStep === idx + 1
                    ? 'font-bold text-gray-900'
                    : 'text-gray-500'
                }
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 shadow-elevation-1">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
              <p className="text-muted-foreground text-sm mt-1">Help us get to know you</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={basicInfo.firstName}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, firstName: e.target.value })
                  }
                  placeholder="John"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={basicInfo.lastName}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, lastName: e.target.value })
                  }
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={basicInfo.email}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, email: e.target.value })
                }
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <div className="flex gap-2">
                <Select value={basicInfo.countryCode} onValueChange={(code) =>
                  setBasicInfo({ ...basicInfo, countryCode: code })
                }>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((cc) => (
                      <SelectItem key={cc.code} value={cc.code}>
                        {cc.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  value={basicInfo.phone}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, phone: e.target.value })
                  }
                  placeholder="555 123 4567"
                  className="flex-1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                LinkedIn Profile
              </label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                  <Globe className="w-4 h-4 text-gray-600" />
                </div>
                <Input
                  type="url"
                  value={basicInfo.linkedin}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/johndoe"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Optional but helpful for your profile</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Portfolio or Website
              </label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                  <Globe className="w-4 h-4 text-gray-600" />
                </div>
                <Input
                  type="url"
                  value={basicInfo.portfolio}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, portfolio: e.target.value })
                  }
                  placeholder="https://johndoe.com"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Optional but helps us learn more about you</p>
            </div>
          </div>
        )}

        {/* Step 2: Resume */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Resume</h2>
              <p className="text-muted-foreground text-sm mt-1">Upload or paste your resume (required)</p>
            </div>

            {/* Upload Zone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Upload Resume *
              </label>
              <div
                onClick={() => resumeInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-accent transition-colors cursor-pointer bg-card"
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                {resume ? (
                  <>
                    <p className="font-medium text-foreground">{resume.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {resumeUploadProgress === 100 && (
                      <p className="text-xs text-green-600 mt-2">✓ Upload complete</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">Click to upload your resume</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF or Word document, max 10MB
                    </p>
                  </>
                )}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Or Paste Text */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <button
                  type="button"
                  onClick={() => setShowResumeTextarea(!showResumeTextarea)}
                  className="px-2 bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showResumeTextarea ? 'Hide' : 'Or paste your resume text'}
                </button>
              </div>
            </div>

            {showResumeTextarea && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Paste Resume Text
                </label>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Video Introduction */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Video Introduction</h2>
              <p className="text-muted-foreground text-sm mt-1">Record a short video about yourself (optional but recommended)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Pro tip:</span> Candidates who include a video are more likely to move forward in our process. Aim for 30-60 seconds.
              </p>
            </div>

            <VideoRecorder
              onVideoRecorded={(file) => {
                setVideo(file);
              }}
            />

            {video && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-900">
                  ✓ <span className="font-medium">Video recorded successfully!</span> You can re-record at any time before submitting.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Review Your Application</h2>
              <p className="text-muted-foreground text-sm mt-1">Double-check everything before submitting</p>
            </div>

            {/* Personal Information Summary */}
            <div className="bg-accent/50 border border-border rounded-xl p-6 space-y-4">
              <div className="mb-4 pb-4 border-b border-border">
                <h3 className="font-bold text-foreground mb-4">Personal Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Name</p>
                  <p className="font-medium text-foreground">
                    {basicInfo.firstName} {basicInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Email</p>
                  <p className="font-medium text-foreground">{basicInfo.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Phone</p>
                  <p className="font-medium text-foreground">
                    {basicInfo.countryCode} {basicInfo.phone}
                  </p>
                </div>
                {basicInfo.linkedin && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">LinkedIn</p>
                    <a
                      href={basicInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline text-sm"
                    >
                      View Profile →
                    </a>
                  </div>
                )}
              </div>

              {basicInfo.portfolio && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Portfolio</p>
                  <a
                    href={basicInfo.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline text-sm"
                  >
                    {basicInfo.portfolio}
                  </a>
                </div>
              )}
            </div>

            {/* Documents Summary */}
            <div className="border border-border rounded-xl p-6 space-y-4">
              <div className="mb-4 pb-4 border-b border-border">
                <h3 className="font-bold text-foreground mb-2">Application Materials</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Resume</p>
                    <p className="font-medium text-foreground text-sm">
                      {resume ? resume.name : 'Pasted text'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </Button>
                </div>

                {video && (
                  <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Video Introduction</p>
                      <p className="font-medium text-foreground text-sm">
                        ✓ Recorded
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(3)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-foreground cursor-pointer leading-relaxed"
                >
                  I agree to the terms and conditions and give permission for this company to contact me about my application
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                By submitting this application, you consent to us storing and processing your personal information.
              </p>
            </div>
          </div>
        )}


        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between mt-8 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </div>

          {currentStep === 4 ? (
            <Button
              type="submit"
              disabled={submitting || !agreeToTerms}
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} size="lg">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
