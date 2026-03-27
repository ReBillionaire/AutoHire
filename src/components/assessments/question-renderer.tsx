'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'likert' | 'open_text' | 'scenario' | 'forced_choice';
  options?: Array<{ id: string; text: string }>;
  scale?: number;
  correct_answer?: string;
}

interface QuestionRendererProps {
  question: Question;
  value?: string | number | string[];
  onChange: (value: string | number | string[]) => void;
  assessmentType: 'SKILL' | 'PSYCHOMETRIC' | 'ATTITUDE' | 'BACKGROUND';
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  assessmentType,
}: QuestionRendererProps) {
  const [openTextValue, setOpenTextValue] = useState((value as string) || '');

  const handleOpenTextChange = (text: string) => {
    setOpenTextValue(text);
    onChange(text);
  };

  switch (question.type) {
    case 'multiple_choice':
      return (
        <div className="space-y-4">
          <RadioGroup value={(value as string) || ''} onValueChange={onChange}>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center gap-3">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="text-base cursor-pointer font-normal flex-1 py-3 px-4 rounded-lg border border-transparent hover:bg-slate-50 transition"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case 'likert':
      const scalePoints = question.scale || 5;
      const labels = {
        5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        7: [
          'Strongly Disagree',
          'Disagree',
          'Somewhat Disagree',
          'Neutral',
          'Somewhat Agree',
          'Agree',
          'Strongly Agree',
        ],
      };

      return (
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-slate-600 mb-4">
            <span>{labels[scalePoints as keyof typeof labels][0]}</span>
            <span>{labels[scalePoints as keyof typeof labels][scalePoints - 1]}</span>
          </div>
          <div className="flex gap-2 justify-between">
            {Array.from({ length: scalePoints }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => onChange(idx + 1)}
                className={`flex-1 py-3 px-2 rounded-lg border-2 font-medium transition ${
                  value === idx + 1
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-600 text-center">
            {value && `You selected: ${labels[scalePoints as keyof typeof labels][Number(value) - 1]}`}
          </div>
        </div>
      );

    case 'open_text':
      return (
        <div className="space-y-2">
          <Textarea
            placeholder="Enter your response here..."
            value={openTextValue}
            onChange={(e) => handleOpenTextChange(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <div className="text-xs text-slate-500 text-right">
            {openTextValue.length} characters
          </div>
        </div>
      );

    case 'scenario':
      // For scenarios, we render as multiple choice with more context
      return (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-slate-700 italic">
              {question.text.includes('Scenario:')
                ? question.text
                : `Scenario: ${question.text}`}
            </p>
          </div>
          <RadioGroup value={(value as string) || ''} onValueChange={onChange}>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <Label
                  htmlFor={option.id}
                  className="text-base cursor-pointer font-normal flex-1"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case 'forced_choice':
      // Forced choice pairs - often used in DISC assessments
      const pairs = question.options || [];
      return (
        <div className="space-y-4">
          {pairs.length > 0 && (
            <div className="border rounded-lg p-4 bg-slate-50">
              <p className="text-sm text-slate-600 mb-4">
                Which statement is more true for you?
              </p>
              <div className="space-y-3">
                {pairs.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                      value === option.id
                        ? 'border-blue-600 bg-white'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <Checkbox
                      checked={value === option.id}
                      onCheckedChange={() => onChange(option.id)}
                      className="mt-0.5"
                    />
                    <span className="text-base text-slate-700 flex-1">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    default:
      return <div className="text-slate-600">Unknown question type</div>;
  }
}
