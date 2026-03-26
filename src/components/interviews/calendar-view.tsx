'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
  parseISO,
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

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i); // 9 AM to 6 PM
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  SCREENING: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-900 dark:text-purple-100', border: 'border-purple-300 dark:border-purple-700' },
  PHONE: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-900 dark:text-blue-100', border: 'border-blue-300 dark:border-blue-700' },
  TECHNICAL: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-900 dark:text-red-100', border: 'border-red-300 dark:border-red-700' },
  BEHAVIORAL: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-900 dark:text-green-100', border: 'border-green-300 dark:border-green-700' },
  CASE_STUDY: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-900 dark:text-amber-100', border: 'border-amber-300 dark:border-amber-700' },
  PRESENTATION: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-900 dark:text-indigo-100', border: 'border-indigo-300 dark:border-indigo-700' },
  FINAL: { bg: 'bg-rose-100 dark:bg-rose-900', text: 'text-rose-900 dark:text-rose-100', border: 'border-rose-300 dark:border-rose-700' },
};

export default function CalendarView({ interviews }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getInterviewsForSlot = (date: Date, hour: number) => {
    return interviews.filter((interview) => {
      const interviewDate = new Date(interview.scheduledAt);
      return (
        isSameDay(interviewDate, date) &&
        interviewDate.getHours() === hour
      );
    });
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="font-medium text-slate-900 dark:text-white">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </p>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="inline-block w-full min-w-max">
          {/* Header - Days */}
          <div className="grid gap-0.5 bg-slate-50 dark:bg-slate-950 p-4" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
            <div />
            {weekDays.map((day, i) => (
              <div key={i} className="text-center border-r border-b border-slate-200 dark:border-slate-800 pb-3 last:border-r-0">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                  {DAYS[day.getDay()]}
                </p>
                <p className={`text-lg font-bold mt-1 ${
                  isToday(day)
                    ? 'text-blue-600'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Body - Hours and Interview Blocks */}
          <div className="grid gap-0" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
            {HOURS.map((hour) => (
              <div key={`row-${hour}`} className="contents">
                {/* Hour label */}
                <div className="bg-slate-50 dark:bg-slate-950 border-r border-b border-slate-200 dark:border-slate-800 p-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {`${hour}:00`}
                </div>

                {/* Time slots for each day */}
                {weekDays.map((day, dayIdx) => {
                  const dayInterviews = getInterviewsForSlot(day, hour);
                  const isCurrentHour = isToday(day) && new Date().getHours() === hour;

                  return (
                    <div
                      key={`slot-${dayIdx}-${hour}`}
                      className={`min-h-20 border-r border-b border-slate-200 dark:border-slate-800 p-1 ${
                        isCurrentHour
                          ? 'bg-blue-50 dark:bg-blue-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      } ${
                        dayIdx === weekDays.length - 1 ? 'border-r-0' : ''
                      }`}
                    >
                      {dayInterviews.map((interview) => {
                        const colors = typeColors[interview.type] || typeColors.SCREENING;
                        return (
                          <Link key={interview.id} href={`/interviews/${interview.id}`}>
                            <div
                              className={`text-xs p-1 rounded mb-0.5 cursor-pointer border-l-2 transition-all hover:shadow-sm ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                              <p className="font-semibold truncate">
                                {interview.candidateName}
                              </p>
                              <p className="truncate opacity-75">
                                {interview.type.slice(0, 3)}
                              </p>
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
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(typeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${colors.bg} border ${colors.border}`} />
            <span className="text-slate-600 dark:text-slate-400">
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
