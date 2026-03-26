'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { addDays, format, startOfDay, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';

interface AvailabilitySlot {
  date: Date;
  time: string;
  available: boolean;
  interviewer: string;
}

interface AvailabilityPickerProps {
  interviewerIds: string[];
  slots?: AvailabilitySlot[];
  selectedDate?: string;
  selectedTime?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function AvailabilityPicker({
  interviewerIds,
  slots = [],
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: AvailabilityPickerProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Get unique available dates from slots
  const availableDates = useMemo(() => {
    if (slots.length === 0) return [];

    const uniqueDates = new Set<string>();
    const now = startOfDay(new Date());

    slots.forEach((slot) => {
      const slotDate = startOfDay(slot.date);
      if (isAfter(slotDate, now) || isBefore(slotDate, now)) {
        uniqueDates.add(format(slotDate, 'yyyy-MM-dd'));
      }
    });

    return Array.from(uniqueDates)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime())
      .slice(0, 14); // Show next 2 weeks
  }, [slots]);

  // Get time slots for selected date
  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate || slots.length === 0) return [];

    return slots
      .filter((slot) => format(slot.date, 'yyyy-MM-dd') === selectedDate)
      .sort((a, b) => {
        const aTime = new Date(`2000-01-01 ${a.time}`).getTime();
        const bTime = new Date(`2000-01-01 ${b.time}`).getTime();
        return aTime - bTime;
      });
  }, [selectedDate, slots]);

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  if (slots.length === 0) {
    return (
      <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          No availability data loaded. Once interviewers are added, their availability will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div>
        <Label className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Select Date
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availableDates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = selectedDate === dateStr;
            const dayName = format(date, 'EEE');
            const dayNum = format(date, 'd');

            return (
              <button
                key={dateStr}
                onClick={() => {
                  onDateChange(dateStr);
                  setExpandedDate(dateStr);
                  onTimeChange('');
                }}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {dayName}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {dayNum}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div>
          <Label className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Select Time (GMT-8)
          </Label>

          {timeSlotsForDate.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlotsForDate.map((slot) => {
                const slotKey = `${slot.date.getTime()}-${slot.time}`;
                const isSelected = selectedTime === slotKey;

                return (
                  <button
                    key={slotKey}
                    onClick={() => {
                      if (slot.available) {
                        onTimeChange(slotKey);
                      }
                    }}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      !slot.available
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {slot.time}
                    </p>
                    {!slot.available && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Booked
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                No available slots on {selectedDateObj?.toLocaleDateString()}. Please select another date.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Selected: <strong>{selectedDateObj?.toLocaleDateString()}</strong> at{' '}
            <strong>
              {timeSlotsForDate.find((s) => `${s.date.getTime()}-${s.time}` === selectedTime)?.time}
            </strong>
          </p>
        </Card>
      )}

      {/* Conflict Detection */}
      {selectedDate && selectedTime && timeSlotsForDate.length > 0 && (
        <Card className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Interviewers available:</span>{' '}
            {Array.from(
              new Set(
                slots
                  .filter(
                    (s) =>
                      format(s.date, 'yyyy-MM-dd') === selectedDate &&
                      s.available
                  )
                  .map((s) => s.interviewer)
              )
            ).join(', ')}
          </p>
        </Card>
      )}
    </div>
  );
}
