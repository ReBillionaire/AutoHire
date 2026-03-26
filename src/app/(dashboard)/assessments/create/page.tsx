'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE' | 'VIDEO';
  options: string[];
  timeLimit: number;
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: crypto.randomUUID(),
      text: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      timeLimit: 60,
    }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, timeLimit: parseInt(timeLimit), questions }),
      });
      if (res.ok) router.push('/assessments');
    } catch (err) {
      console.error('Error creating assessment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <Link href="/assessments">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Assessment</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Design a new candidate assessment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card className="p-6 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Assessment Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" placeholder="e.g. Frontend Developer Technical Assessment" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1" placeholder="Describe what this assessment evaluates..." />
            </div>
            <div>
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input id="timeLimit" type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="mt-1 w-32" />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Questions ({questions.length})</h2>
            <Button type="button" onClick={addQuestion} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </div>

          {questions.map((q, idx) => (
            <Card key={q.id} className="p-6 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-slate-900 dark:text-white">Question {idx + 1}</h3>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Question Text</Label>
                  <Textarea value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} rows={2} className="mt-1" placeholder="Enter your question..." />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={q.type} onValueChange={(v) => updateQuestion(q.id, 'type', v)}>
                    <SelectTrigger className="mt-1 w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      <SelectItem value="TEXT">Text Response</SelectItem>
                      <SelectItem value="CODE">Code Challenge</SelectItem>
                      <SelectItem value="VIDEO">Video Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}

          {questions.length === 0 && (
            <Card className="p-8 bg-white dark:bg-slate-900 text-center">
              <p className="text-slate-500 dark:text-slate-400">No questions added yet. Click "Add Question" to start building your assessment.</p>
            </Card>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={!title || isLoading} className="flex-1">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Assessment
          </Button>
          <Link href="/assessments" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
