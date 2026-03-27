'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface CreateRuleModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const triggers = [
  { value: 'APPLICATION_RECEIVED', label: 'Application Received' },
  { value: 'ASSESSMENT_PENDING', label: 'Assessment Pending' },
  { value: 'ASSESSMENT_COMPLETED', label: 'Assessment Completed' },
  { value: 'DISC_COMPLETED', label: 'DISC Completed' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
  { value: 'STAGE_CHANGED', label: 'Stage Changed' },
  { value: 'DEADLINE_APPROACHING', label: 'Deadline Approaching' },
  { value: 'NO_RESPONSE', label: 'No Response' },
];

const actions: Record<string, Array<{ value: string; label: string }>> = {
  APPLICATION_RECEIVED: [
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'SCHEDULE_ASSESSMENT', label: 'Schedule Assessment' },
    { value: 'NOTIFY_TEAM', label: 'Notify Team' },
  ],
  ASSESSMENT_PENDING: [
    { value: 'SEND_REMINDER', label: 'Send Reminder' },
    { value: 'SEND_EMAIL', label: 'Send Email' },
  ],
  ASSESSMENT_COMPLETED: [
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'MOVE_STAGE', label: 'Move Stage' },
    { value: 'GENERATE_REPORT', label: 'Generate Report' },
  ],
  DISC_COMPLETED: [
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'NOTIFY_TEAM', label: 'Notify Team' },
  ],
  INTERVIEW_SCHEDULED: [
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'SEND_REMINDER', label: 'Send Reminder' },
  ],
  INTERVIEW_COMPLETED: [
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'GENERATE_REPORT', label: 'Generate Report' },
    { value: 'NOTIFY_TEAM', label: 'Notify Team' },
  ],
  STAGE_CHANGED: [
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'NOTIFY_TEAM', label: 'Notify Team' },
  ],
  DEADLINE_APPROACHING: [
    { value: 'SEND_REMINDER', label: 'Send Reminder' },
    { value: 'SEND_EMAIL', label: 'Send Email' },
  ],
  NO_RESPONSE: [
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'SEND_REMINDER', label: 'Send Reminder' },
  ],
};

export function CreateRuleModal({ onClose, onCreated }: CreateRuleModalProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectTrigger = (selectedTrigger: string) => {
    setTrigger(selectedTrigger);
    setAction('');
    setStep('configure');
  };

  const handleCreate = async () => {
    if (!trigger || !action) return;

    try {
      setLoading(true);
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger,
          action,
          name: name || `${trigger} → ${action}`,
          config: {},
        }),
      });

      if (!response.ok) throw new Error('Failed to create rule');

      onCreated();
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create Automation Rule</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'select' ? (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">When this happens:</label>
                <Select value={trigger} onValueChange={handleSelectTrigger}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              {/* Back button and trigger info */}
              <div className="space-y-3">
                <button
                  onClick={() => setStep('select')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Change trigger
                </button>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Trigger:</strong>{' '}
                    {triggers.find((t) => t.value === trigger)?.label}
                  </p>
                </div>
              </div>

              {/* Action selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Do this:</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {(actions[trigger] || []).map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rule name */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Rule name (optional)</label>
                <Input
                  placeholder="e.g., Send assessment on application"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {step === 'select' ? (
            <Button disabled className="flex-1">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!action || loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Rule'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
