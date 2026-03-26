'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, User, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const jobSlug = params.jobSlug as string;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('linkedin', linkedin);
      formData.append('coverLetter', coverLetter);
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await fetch(`/api/careers/${orgSlug}/${jobSlug}/apply`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push(`/careers/${orgSlug}/${jobSlug}/apply/success`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit application');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href={`/careers/${orgSlug}/${jobSlug}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to job details
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for this Position</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Fill out the form below to submit your application.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Personal Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="mt-1" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Application Materials
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume">Resume / CV</Label>
                <div className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {resumeFile ? resumeFile.name : 'Drag and drop or click to upload'}
                  </p>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('resume')?.click()}>
                    Choose File
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
              <div>
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell us why you're interested in this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {error && (
            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={!firstName || !lastName || !email || isSubmitting} className="flex-1">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                'Submit Application'
              )}
            </Button>
            <Link href={`/careers/${orgSlug}/${jobSlug}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">Cancel</Button>
            </Link>
          </div>

          <p className="text-xs text-center text-slate-500">
            By submitting this application, you agree to the processing of your personal data for recruitment purposes.
          </p>
        </form>
      </div>
    </div>
  );
}
