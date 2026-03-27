'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Copy, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import QuestionBuilder from '@/components/assessments/question-builder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'likert' | 'open_text' | 'scenario' | 'forced_choice';
  options?: Array<{ id: string; text: string }>;
  scale?: number;
  correct_answer?: string;
  weight?: number;
  order: number;
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'SKILL' | 'PSYCHOMETRIC' | 'ATTITUDE' | 'BACKGROUND' | ''>('');
  const [duration, setDuration] = useState('30');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobRole, setJobRole] = useState('');
  const [saving, setSaving] = useState(false);

  const addQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'multiple_choice',
      order: questions.length,
      options: [
        { id: 'opt_1', text: 'Option 1' },
        { id: 'opt_2', text: 'Option 2' },
      ],
    };
    setQuestions([...questions, newQuestion]);
  }, [questions]);

  const updateQuestion = useCallback((id: string, updated: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updated } : q)));
  }, [questions]);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  }, [questions]);

  const duplicateQuestion = useCallback((id: string) => {
    const original = questions.find((q) => q.id === id);
    if (!original) return;

    const duplicate: Question = {
      ...original,
      id: `q_${Date.now()}`,
      order: questions.length,
    };
    setQuestions([...questions, duplicate]);
  }, [questions]);

  const handleGenerateQuestions = async () => {
    if (!jobRole.trim() || !type) {
      alert('Please enter a job role and select assessment type');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/assessments/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_role: jobRole,
          assessment_type: type,
          count: 10,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');
      const { questions: generatedQuestions } = await response.json();

      const newQuestions = generatedQuestions.map((q: any, idx: number) => ({
        id: `q_${Date.now()}_${idx}`,
        text: q.text,
        type: q.type,
        options: q.options || [],
        scale: q.scale,
        weight: q.weight,
        order: questions.length + idx,
      }));

      setQuestions([...questions, ...newQuestions]);
      setJobRole('');
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !type) {
      alert('Please fill in title and type');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        type,
        duration: parseInt(duration),
        passing_score: parseInt(passingScore),
        question_count: questions.length,
        questions: questions.map((q) => ({
          ...q,
          order: undefined,
        })),
      };

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create assessment');
      const created = await response.json();

      router.push(`/assessments/${created.id}`);
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Assessment Template</h1>
        <p className="text-slate-600 mt-1">
          Build a new assessment by adding questions and configuring settings
        </p>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Config */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior React Developer Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-sm font-medium">
                  Assessment Type
                </Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SKILL">Skill Assessment</SelectItem>
                    <SelectItem value="PSYCHOMETRIC">Psychometric Test</SelectItem>
                    <SelectItem value="ATTITUDE">Attitude Assessment</SelectItem>
                    <SelectItem value="BACKGROUND">Background Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-2"
                />
              </div>

              {type === 'SKILL' && (
                <div>
                  <Label htmlFor="passingScore" className="text-sm font-medium">
                    Passing Score (%)
                  </Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="What will candidates learn or be tested on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 resize-none"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Generate */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Question Generator
              </CardTitle>
              <CardDescription>Auto-generate questions using AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobRole" className="text-sm font-medium">
                  Job Role
                </Label>
                <Input
                  id="jobRole"
                  placeholder="e.g., Senior Product Manager"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !type}
                className="w-full bg-purple-600 hover:bg-purple-700"
                variant={isGenerating ? 'default' : undefined}
              >
                {isGenerating ? 'Generating...' : 'Generate Questions'}
              </Button>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="text-slate-600">Questions Added</div>
                <div className="text-2xl font-bold text-slate-900">{questions.length}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Questions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>
                  Build your assessment by adding and ordering questions
                </CardDescription>
              </div>
              <Button onClick={addQuestion} className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No questions added yet</p>
                  <Button onClick={addQuestion} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Question
                  </Button>
                </div>
              ) : (
                questions.map((question, idx) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg bg-white hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-600">
                          Question {idx + 1}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => duplicateQuestion(question.id)}
                          variant="ghost"
                          size="sm"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteQuestion(question.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Enter question text"
                      className="mb-3 resize-none"
                      rows={2}
                    />

                    <div className="flex gap-2">
                      <Select
                        value={question.type}
                        onValueChange={(value: any) =>
                          updateQuestion(question.id, { type: value })
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="likert">Likert Scale</SelectItem>
                          <SelectItem value="open_text">Open Text</SelectItem>
                          <SelectItem value="scenario">Scenario</SelectItem>
                          <SelectItem value="forced_choice">Forced Choice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {question.type === 'multiple_choice' && question.options && (
                      <div className="mt-3 space-y-2 pt-3 border-t">
                        {question.options.map((opt, optIdx) => (
                          <Input
                            key={opt.id}
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...question.options!];
                              updated[optIdx].text = e.target.value;
                              updateQuestion(question.id, { options: updated });
                            }}
                            className="text-sm"
                          />
                        ))}
                        <Button
                          onClick={() => {
                            const newOptions = [
                              ...(question.options || []),
                              {
                                id: `opt_${Date.now()}`,
                                text: `Option ${(question.options || []).length + 1}`,
                              },
                            ];
                            updateQuestion(question.id, { options: newOptions });
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    )}

                    {question.type === 'likert' && (
                      <div className="mt-3 pt-3 border-t">
                        <Select
                          value={question.scale?.toString() || '5'}
                          onValueChange={(value) =>
                            updateQuestion(question.id, { scale: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5-point Scale</SelectItem>
                            <SelectItem value="7">7-point Scale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assessment Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">{title || 'Untitled Assessment'}</h3>
              <p className="text-sm text-slate-600 mt-1">{description}</p>
              <div className="flex gap-4 mt-4 text-sm">
                <span>Type: {type || 'Not selected'}</span>
                <span>Duration: {duration} min</span>
                <span>Questions: {questions.length}</span>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">
                    {idx + 1}. {q.text || '(Untitled question)'}
                  </p>
                  <p className="text-xs text-slate-600 mb-2">Type: {q.type}</p>
                  {q.options && q.options.length > 0 && (
                    <ul className="text-sm text-slate-700 space-y-1 ml-4">
                      {q.options.map((opt) => (
                        <li key={opt.id}>• {opt.text || '(Empty option)'}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
