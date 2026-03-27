import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  candidateName?: string;
}

const typeIcons: Record<string, string> = {
  rule_executed: '⚙️',
  reminder_sent: '🔔',
  stage_changed: '→',
  assessment_created: '📋',
};

const typeLabels: Record<string, string> = {
  rule_executed: 'Rule Executed',
  reminder_sent: 'Reminder Sent',
  stage_changed: 'Stage Changed',
  assessment_created: 'Assessment Created',
};

const typeColors: Record<string, string> = {
  rule_executed: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  reminder_sent: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  stage_changed: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  assessment_created: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
};

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <Card className="p-12 text-center border-border bg-card">
        <p className="text-muted-foreground">No activity yet</p>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="divide-y divide-border">
        {events.map((event, index) => (
          <div key={event.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                  {typeIcons[event.type] || '•'}
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-8 bg-border my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                    {event.candidateName && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Candidate: {event.candidateName}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`${typeColors[event.type] || ''} flex-shrink-0`}
                  >
                    {typeLabels[event.type] || event.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {formatTimeAgo(new Date(event.timestamp))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
