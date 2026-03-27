'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'likert' | 'open_text' | 'scenario' | 'forced_choice';
  options?: QuestionOption[];
  scale?: number;
  correct_answer?: string;
  weight?: number;
}

interface QuestionBuilderProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionBuilder({
  question,
  onUpdate,
  onDelete,
}: QuestionBuilderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleTextChange = (text: string) => {
    onUpdate({ ...question, text });
  };

  const handleTypeChange = (type: string) => {
    const updated: Question = {
      ...question,
      type: type as any,
    };

    // Initialize defaults for new type
    if (type === 'multiple_choice') {
      updated.options = question.options || [
        { id: 'opt_1', text: 'Option 1' },
        { id: 'opt_2', text: 'Option 2' },
      ];
    } else if (type === 'likert') {
      updated.scale = question.scale || 5;
    }

    onUpdate(updated);
  };

  const handleAddOption = () => {
    const options = question.options || [];
    const newOption: QuestionOption = {
      id: `opt_${Date.now()}`,
      text: `Option ${options.length + 1}`,
    };
    onUpdate({ ...question, options: [...options, newOption] });
  };

  const handleUpdateOption = (index: number, text: string) => {
    const options = [...(question.options || [])];
    options[index].text = text;
    onUpdate({ ...question, options });
  };

  const handleRemoveOption = (index: number) => {
    const options = question.options?.filter((_, i) => i !== index) || [];
    onUpdate({ ...question, options });
  };

  const handleWeightChange = (weight: string) => {
    onUpdate({ ...question, weight: parseInt(weight) });
  };

  return (
    <div
      className="p-4 border rounded-lg bg-white hover:bg-slate-50 transition"
      draggable
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <GripVertical className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing" />
        <div className="flex-1">
          <Label className="text-sm font-medium text-slate-600">Question</Label>
          <Textarea
            value={question.text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter your question..."
            className="mt-2 resize-none"
            rows={2}
          />
        </div>
        <Button
          onClick={() => onDelete(question.id)}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor={`type-${question.id}`} className="text-sm font-medium">
            Question Type
          </Label>
          <Select value={question.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="mt-2" id={`type-${question.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="likert">Likert Scale</SelectItem>
              <SelectItem value="open_text">Open Text</SelectItem>
              <SelectItem value="scenario">Scenario</SelectItem>
              <SelectItem value="forced_choice">Forced Choice Pair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`weight-${question.id}`} className="text-sm font-medium">
            Weight
          </Label>
          <Input
            id={`weight-${question.id}`}
            type="number"
            min="1"
            max="5"
            value={question.weight || 1}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {/* Type-Specific Fields */}
      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Answer Options</Label>
            <Button onClick={handleAddOption} variant="outline" size="sm" className="gap-1">
              <Plus className="w-3 h-3" />
              Add Option
            </Button>
          </div>

          {question.options.map((option, idx) => (
            <div key={option.id} className="flex gap-2 items-center">
              <Input
                value={option.text}
                onChange={(e) => handleUpdateOption(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-1"
              />
              <Button
                onClick={() => handleRemoveOption(idx)}
                variant="ghost"
                size="sm"
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {question.type === 'likert' && (
        <div className="p-4 bg-slate-50 rounded-lg border">
          <Label htmlFor={`scale-${question.id}`} className="text-sm font-medium">
            Scale Length
          </Label>
          <Select
            value={question.scale?.toString() || '5'}
            onValueChange={(value) =>
              onUpdate({ ...question, scale: parseInt(value) })
            }
          >
            <SelectTrigger className="mt-2" id={`scale-${question.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5-Point Scale (Disagree to Agree)</SelectItem>
              <SelectItem value="7">7-Point Scale (Strongly Disagree to Strongly Agree)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
