'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'];
const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance'];

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'FULL_TIME',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        }),
      });
      if (res.ok) router.push('/jobs');
    } catch (err) {
      console.error('Error creating job:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Job Posting</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Fill in the details for a new position</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card className="p-6 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => update('title', e.target.value)} required className="mt-1" placeholder="e.g. Senior Software Engineer" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(v) => update('department', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={(e) => update('location', e.target.value)} className="mt-1" placeholder="e.g. San Francisco, CA" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Job Type</Label>
                <Select value={formData.type} onValueChange={(v) => update('type', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((t) => (<SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salaryMin">Min Salary</Label>
                <Input id="salaryMin" type="number" value={formData.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} className="mt-1" placeholder="50000" />
              </div>
              <div>
                <Label htmlFor="salaryMax">Max Salary</Label>
                <Input id="salaryMax" type="number" value={formData.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} className="mt-1" placeholder="120000" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => update('description', e.target.value)} rows={8} className="mt-1" placeholder="Describe the role, responsibilities, and what the team does..." />
            </div>
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" value={formData.requirements} onChange={(e) => update('requirements', e.target.value)} rows={6} className="mt-1" placeholder="List the required skills, experience, and qualifications..." />
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={!formData.title || isLoading} className="flex-1">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Job Posting
          </Button>
          <Link href="/jobs" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
