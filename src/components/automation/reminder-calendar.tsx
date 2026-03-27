import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReminderCalendarProps {
  reminders: Array<{
    id: string;
    scheduledFor: string;
    type: string;
    candidate: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export function ReminderCalendar({ reminders }: ReminderCalendarProps) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const remindersByDate: Record<number, typeof reminders> = {};
  reminders.forEach((reminder) => {
    const date = new Date(reminder.scheduledFor);
    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth()
    ) {
      const day = date.getDate();
      if (!remindersByDate[day]) {
        remindersByDate[day] = [];
      }
      remindersByDate[day].push(reminder);
    }
  });

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Card className="p-6 border-border bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">{monthName}</h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => (
            <div
              key={`${weekIdx}-${dayIdx}`}
              className={`min-h-20 p-2 rounded-lg border ${
                day === null
                  ? 'bg-muted/30 border-transparent'
                  : day === today.getDate()
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30'
                  : 'bg-muted border-border'
              }`}
            >
              {day && (
                <>
                  <p className="text-xs font-medium text-foreground mb-1">{day}</p>
                  <div className="space-y-1">
                    {remindersByDate[day]?.slice(0, 2).map((reminder) => (
                      <div
                        key={reminder.id}
                        className="text-xs px-1.5 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 truncate"
                      >
                        {reminder.candidate.firstName}
                      </div>
                    ))}
                    {remindersByDate[day]?.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{remindersByDate[day].length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
