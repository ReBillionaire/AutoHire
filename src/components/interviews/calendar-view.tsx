'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
} from 'date-fns';
import Link from 'next/link';

interface Interview {
  id: string;
  candidateName: string;
  type: string;
  scheduledAt: Date;
  status: string;
}

interface CalendarViewProps {
  interviews: Interview[];
}

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const typeColors: Record<string, string> = {
  SCREENING: 'bg-violet-50 text-violet-700 border-l-violet-500 dark:bg-violet-500/10 dark:text-violet-400',
  PHONE: 'bg-blue-50 text-blue-700 border-l-blue-500 dark:bg-blue-500/10 dark:text-blue-400',
  TECHNICAL: 'bg-red-50 text-red-700 border-l-red-500 dark:bg-red-500/10 dark:text-red-400',
  BEHAVIORAL: 'bg-emerald-50 text-emerald-700 border-l-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400',
  CASE_STUDY: 'bg-amber-50 text-amber-700 border-l-amber-500 dark:bg-amber-500/10 dark:text-amber-400',
  PRESENTATION: 'bg-indigo-50 text-indigo-700 border-l-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400',
  FINAL: 'bg-rose-50 text-rose-700 border-l-rose-500 dark:bg-rose-500/10 dark:text-rose-400',
};

const typeDots: Record<string, string> = {
  SCREENING: 'bg-violet-500',
  PHONE: 'bg-blue-500',
  TECHNICAL: 'bg-red-500',
  BEHAVIORAL: 'bg-emerald-500',
  CASE_STUDY: 'bg-amber-500',
  PRESENTATION: 'bg-indigo-500',
  FINAL: 'bg-rose-500',
};

export default function CalendarView({ interviews }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => setCurrentDate((prev) => addDays(prev, -7));
  const goToNextWeek = () => setCurrentDate((prev) => addDays(prev, 7));
  const goToToday = () => setCurrentDate(new Date());

  const getInterviewsForSlot = (date: Date, hour: number) => {
    return interviews.filter((interview) => {
      const d = new Date(interview.scheduledAt);
      return isSameDay(d, date) && d.getHours() === hour;
    });
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="h-8 w-8 p-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs px-3">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek} className="h-8 w-8 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-foreground">
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </p>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <div className="inline-block w-full min-w-[800px]">
          {/* Day headers */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            <div className="p-2" />
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`text-center py-3 border-l border-border ${isToday(day) ? 'bg-primary/5' : ''}`}
              >
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {DAYS[day.getDay()]}
                </p>
                <p className={`text-lg font-semibold mt-0.5 ${
                  isToday(day) ? 'text-primary' : 'text-foreground'
                }`}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="grid" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            {HOURS.map((hour) => (
              <div key={`row-${hour}`} className="contents">
                <div className="border-b border-border p-2 text-[11px] text-muted-foreground font-medium text-right pr-3">
                  {`${hour}:00`}
                </div>
                {weekDays.map((day, dayIdx) => {
                  const dayInterviews = getInterviewsForSlot(day, hour);
                  const isCurrentHour = isToday(day) && new Date().getHours() === hour;

                  return (
                    <div
                      key={`slot-${dayIdx}-${hour}`}
                      className={`min-h-[56px] border-l border-b border-border p-0.5 ${
                        isCurrentHour ? 'bg-primary/5' : 'hover:bg-muted/30'
                      }`}
                    >
                      {dayInterviews.map((interview) => {
                        const colors = typeColors[interview.type] || typeColors.SCREENING;
                        return (
                          <Link key={interview.id} href={`/interviews/${interview.id}`}>
                            <div className={`text-[10px] p-1.5 rounded-md border-l-2 cursor-pointer transition-all hover:shadow-sm mb-0.5 ${colors}`}>
                              <p className="font-medium truncate leading-tight">{interview.candidateName}</p>
                              <p className="truncate opacity-70 mt-0.5">{interview.type.charAt(0) + interview.type.slice(1).toLowerCase().replace('_', ' ')}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px]">
        {Object.entries(typeDots).map(([type, dotClass]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotClass}`} />
            <span className="text-muted-foreground">{type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
