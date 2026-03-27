'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Clock, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateRuleModal } from '@/components/automation/create-rule-modal';
import { AutomationStatsPanel } from '@/components/automation/stats-panel';
import { ActivityTimeline } from '@/components/automation/activity-timeline';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  executionCount: number;
  lastExecutedAt: string | null;
  createdAt: string;
  config: Record<string, any>;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  candidateName?: string;
}

const triggerColors: Record<string, string> = {
  APPLICATION_RECEIVED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  ASSESSMENT_PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  ASSESSMENT_COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  DISC_COMPLETED: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  INTERVIEW_SCHEDULED: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  INTERVIEW_COMPLETED: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  STAGE_CHANGED: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  DEADLINE_APPROACHING: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  NO_RESPONSE: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
};

const actionIcons: Record<string, any> = {
  SEND_EMAIL: '📧',
  SEND_REMINDER: '🔔',
  MOVE_STAGE: '→',
  SCHEDULE_ASSESSMENT: '📋',
  GENERATE_REPORT: '📊',
  NOTIFY_TEAM: '👥',
  ARCHIVE_CANDIDATE: '📁',
};

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeRules: 0,
    executedToday: 0,
    pendingReminders: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterTrigger, setFilterTrigger] = useState<string>('all');

  useEffect(() => {
    fetchRules();
    fetchTimeline();
    fetchStats();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/automation');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await fetch('/api/automation/timeline?limit=10');
      if (!response.ok) throw new Error('Failed to fetch timeline');
      const data = await response.json();
      setTimeline(data.events || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch rules to count active
      const rulesRes = await fetch('/api/automation');
      const rulesData = await rulesRes.json();
      const activeCount = (rulesData.rules || []).filter((r: AutomationRule) => r.active).length;

      // Fetch reminders to count pending
      const remindersRes = await fetch('/api/automation/reminders?status=PENDING&limit=1');
      const remindersData = await remindersRes.json();

      setStats({
        activeRules: activeCount,
        executedToday: 0, // TODO: track daily executions
        pendingReminders: remindersData.total || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/automation/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });

      if (!response.ok) throw new Error('Failed to update rule');

      setRules(rules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r));
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Delete this automation rule?')) return;

    try {
      const response = await fetch(`/api/automation/${ruleId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete rule');

      setRules(rules.filter(r => r.id !== ruleId));
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleRuleCreated = () => {
    setShowCreateModal(false);
    fetchRules();
    fetchStats();
  };

  const filteredRules = filterTrigger === 'all'
    ? rules
    : rules.filter(r => r.trigger === filterTrigger);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline Automation</h1>
          <p className="text-muted-foreground mt-1">Create and manage automation rules for your hiring pipeline</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Rule
        </Button>
      </div>

      {/* Stats */}
      <AutomationStatsPanel stats={stats} />

      {/* Rules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Automation Rules</h2>
          <Select value={filterTrigger} onValueChange={setFilterTrigger}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Triggers</SelectItem>
              <SelectItem value="APPLICATION_RECEIVED">Application Received</SelectItem>
              <SelectItem value="ASSESSMENT_PENDING">Assessment Pending</SelectItem>
              <SelectItem value="ASSESSMENT_COMPLETED">Assessment Completed</SelectItem>
              <SelectItem value="DISC_COMPLETED">DISC Completed</SelectItem>
              <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
              <SelectItem value="INTERVIEW_COMPLETED">Interview Completed</SelectItem>
              <SelectItem value="STAGE_CHANGED">Stage Changed</SelectItem>
              <SelectItem value="DEADLINE_APPROACHING">Deadline Approaching</SelectItem>
              <SelectItem value="NO_RESPONSE">No Response</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No automation rules found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground">Rule Name</TableHead>
                  <TableHead className="text-foreground">Trigger</TableHead>
                  <TableHead className="text-foreground">Action</TableHead>
                  <TableHead className="text-foreground">Executions</TableHead>
                  <TableHead className="text-foreground">Last Run</TableHead>
                  <TableHead className="text-foreground w-24">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={triggerColors[rule.trigger] || ''}>
                        {rule.trigger.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {actionIcons[rule.action] || '⚙️'} {rule.action.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{rule.executionCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rule.lastExecutedAt
                        ? new Date(rule.lastExecutedAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.active}
                          onCheckedChange={() => handleToggleRule(rule.id, rule.active)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Recent Activity</h2>
        <ActivityTimeline events={timeline} />
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <CreateRuleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRuleCreated}
        />
      )}
    </div>
  );
}
