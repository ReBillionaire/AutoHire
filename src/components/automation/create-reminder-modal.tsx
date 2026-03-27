'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface CreateReminderModalProps {
  onClose: () => void;
  onCreated: () => void;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const reminderTypes = [
  { value: 'ASSESSMENT_REMINDER', label: '📋 Assessment Reminder' },
  { value: 'DISC_REMINDER', label: '🎯 DISC Reminder' },
  { value: 'INTERVIEW_REMINDER', label: '📞 Interview Reminder' },
  { value: 'APPLICATION_FOLLOWUP', label: '📧 Application Follow-up' },
  { value: 'DEADLINE_WARNING', label: '⏰ Deadline Warning' },
  { value: 'CUSTOM', label: '📌 Custom' },
];

export function CreateReminderModal({ onClose, onCreated }: CreateReminderModalProps) {
  const [candidateId, setCandidateId] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCandidates, setFetchingCandidates] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setFetchingCandidates(true);
      const response = await fetch('/api/candidates?limit=100');
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setFetchingCandidates(false);
    }
  };

  const handleCreate = async () => {
    if (!candidateId || !type || !message || !scheduledDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      const response = await fetch('/api/automation/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          type,
          message,
          scheduledFor: dateTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create reminder');

      onCreated();
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  // Set default date to today
  const defaultDate = new Date().toISOString().split('T')[0];
  if (!scheduledDate) {
    // This is just for display purposes, not setting state
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create Reminder</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Candidate */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Candidate *</label>
            <Select value={candidateId} onValueChange={setCandidateId} disabled={fetchingCandidates}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder={fetchingCandidates ? "Loading..." : "Select candidate"} />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Reminder Type *</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {reminderTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter reminder message"
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Scheduled For *</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={scheduledDate || defaultDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-input text-foreground"
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-28 px-3 py-2 border border-border rounded-md bg-input text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!candidateId || !type || !message || !scheduledDate || loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Reminder'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
