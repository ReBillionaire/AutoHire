'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateReminderModal } from '@/components/automation/create-reminder-modal';
import { ReminderCalendar } from '@/components/automation/reminder-calendar';

interface PipelineReminder {
  id: string;
  type: string;
  status: string;
  message: string;
  scheduledFor: string;
  sentAt: string | null;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  applicationId: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  SENT: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  FAILED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  CANCELLED: 'bg-muted text-muted-foreground',
};

const typeLabels: Record<string, string> = {
  ASSESSMENT_REMINDER: '📋 Assessment Reminder',
  DISC_REMINDER: '🎯 DISC Reminder',
  INTERVIEW_REMINDER: '📞 Interview Reminder',
  APPLICATION_FOLLOWUP: '📧 Application Follow-up',
  DEADLINE_WARNING: '⏰ Deadline Warning',
  CUSTOM: '📌 Custom',
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<PipelineReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReminders, setSelectedReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReminders();
  }, [statusFilter]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/automation/reminders', window.location.origin);
      if (statusFilter !== 'all') {
        url.searchParams.append('status', statusFilter);
      }
      url.searchParams.append('limit', '100');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch reminders');
      const data = await response.json();
      setReminders(data.reminders || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminder = (reminderId: string) => {
    const newSelected = new Set(selectedReminders);
    if (newSelected.has(reminderId)) {
      newSelected.delete(reminderId);
    } else {
      newSelected.add(reminderId);
    }
    setSelectedReminders(newSelected);
  };

  const handleBulkAction = async (action: 'cancel' | 'resend') => {
    if (selectedReminders.size === 0) return;

    try {
      const reminderIds = Array.from(selectedReminders);
      const newStatus = action === 'cancel' ? 'CANCELLED' : 'PENDING';

      for (const reminderId of reminderIds) {
        await fetch('/api/automation/reminders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reminderId, status: newStatus }),
        });
      }

      setSelectedReminders(new Set());
      fetchReminders();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleCancelReminder = async (reminderId: string) => {
    try {
      const response = await fetch('/api/automation/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId, status: 'CANCELLED' }),
      });

      if (!response.ok) throw new Error('Failed to cancel reminder');
      fetchReminders();
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  };

  const handleReminderCreated = () => {
    setShowCreateModal(false);
    fetchReminders();
  };

  const upcomingReminders = reminders
    .filter((r) => new Date(r.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, 5);

  const filteredReminders = statusFilter === 'all'
    ? reminders
    : reminders.filter((r) => r.status === statusFilter);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline Reminders</h1>
          <p className="text-muted-foreground mt-1">Manage and schedule reminders for candidates</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Reminder
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">
                {reminders.filter((r) => r.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="text-2xl font-bold text-foreground">
                {reminders.filter((r) => r.status === 'SENT').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-foreground">
                {reminders.filter((r) => r.status === 'FAILED').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Upcoming (Next 5)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {upcomingReminders.map((reminder) => (
              <Card
                key={reminder.id}
                className="p-4 border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <p className="font-medium text-foreground text-sm">
                    {reminder.candidate.firstName} {reminder.candidate.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reminder.scheduledFor).toLocaleDateString()} at{' '}
                    {new Date(reminder.scheduledFor).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[reminder.type] || reminder.type}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedReminders.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedReminders.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('resend')}
            >
              Resend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('cancel')}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Reminders Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No reminders found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-8">
                  <input
                    type="checkbox"
                    checked={selectedReminders.size === filteredReminders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReminders(new Set(filteredReminders.map((r) => r.id)));
                      } else {
                        setSelectedReminders(new Set());
                      }
                    }}
                    className="rounded"
                  />
                </TableHead>
                <TableHead className="text-foreground">Candidate</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Message</TableHead>
                <TableHead className="text-foreground">Scheduled For</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.map((reminder) => (
                <TableRow key={reminder.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedReminders.has(reminder.id)}
                      onChange={() => handleToggleReminder(reminder.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {reminder.candidate.firstName} {reminder.candidate.lastName}
                    <p className="text-xs text-muted-foreground">{reminder.candidate.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[reminder.type] || reminder.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {reminder.message}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(reminder.scheduledFor).toLocaleDateString()} at{' '}
                    {new Date(reminder.scheduledFor).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[reminder.status] || ''}
                    >
                      {reminder.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reminder.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelReminder(reminder.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <CreateReminderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleReminderCreated}
        />
      )}
    </div>
  );
}
