import { Card } from '@/components/ui/card';
import { Zap, Clock, AlertCircle } from 'lucide-react';

interface AutomationStatsPanelProps {
  stats: {
    activeRules: number;
    executedToday: number;
    pendingReminders: number;
  };
}

export function AutomationStatsPanel({ stats }: AutomationStatsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Rules</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.activeRules}</p>
            <p className="text-xs text-muted-foreground mt-2">automation rules enabled</p>
          </div>
          <Zap className="w-8 h-8 text-blue-500 opacity-50" />
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Executed Today</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.executedToday}</p>
            <p className="text-xs text-muted-foreground mt-2">automations triggered</p>
          </div>
          <Zap className="w-8 h-8 text-emerald-500 opacity-50" />
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pending Reminders</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.pendingReminders}</p>
            <p className="text-xs text-muted-foreground mt-2">awaiting delivery</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-50" />
        </div>
      </Card>
    </div>
  );
}
