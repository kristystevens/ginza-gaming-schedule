// Client-safe utility functions (no database imports)
// These can be imported in 'use client' components

export interface PokerEvent {
  id: string;
  eventName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM format
  endTime?: string | null; // HH:MM format (optional)
  timezone?: string | null; // EST, CST, or PST (defaults to EST)
  stakes: string; // e.g., "NLH 1/2", "PLO 0.5/1"
  gameType: string;
  description?: string | null;
  streamingLink?: string | null;
  gameLink?: string | null;
  telegramChatLink?: string | null;
  lumaEventUrl?: string | null;
  // Recurring event fields
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | null;
  recurrenceEndDate?: string | null; // YYYY-MM-DD (optional end date for recurring events)
  parentEventId?: string | null; // ID of the parent event for recurring instances
}

// Timezone support
export type Timezone = 'EST' | 'CST' | 'PST';

// Timezone offsets in hours from EST
const TIMEZONE_OFFSETS: Record<Timezone, number> = {
  EST: 0,   // Eastern Standard Time (UTC-5)
  CST: -1,  // Central Standard Time (UTC-6)
  PST: -3,  // Pacific Standard Time (UTC-8)
};

// Convert time from EST to another timezone
function convertTime(time: string, fromTimezone: Timezone, toTimezone: Timezone): string {
  if (fromTimezone === toTimezone) {
    return time;
  }

  const [hours, minutes] = time.split(':').map(Number);
  const offsetDiff = TIMEZONE_OFFSETS[toTimezone] - TIMEZONE_OFFSETS[fromTimezone];
  let newHour = hours + offsetDiff;

  // Handle day rollover
  if (newHour < 0) {
    newHour += 24;
  } else if (newHour >= 24) {
    newHour -= 24;
  }

  return `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Get timezone abbreviation
function getTimezoneAbbr(timezone: Timezone): string {
  return timezone;
}

// Format time for display (e.g., "16:00" -> "4:00 PM EST")
// Converts from eventTimezone (stored) to displayTimezone (user preference)
export function formatTime(time: string, displayTimezone: Timezone = 'EST', eventTimezone: Timezone = 'EST'): string {
  // Convert from event's stored timezone to display timezone
  const convertedTime = convertTime(time, eventTimezone, displayTimezone);
  const [hours, minutes] = convertedTime.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const tzAbbr = getTimezoneAbbr(displayTimezone);
  return `${displayHour}:${minutes} ${ampm} ${tzAbbr}`;
}

// Format time range for display (e.g., "16:00" - "20:00" -> "4:00 PM - 8:00 PM EST")
export function formatTimeRange(startTime: string, endTime?: string | null | undefined, displayTimezone: Timezone = 'EST', eventTimezone: Timezone = 'EST'): string {
  if (!endTime) {
    return formatTime(startTime, displayTimezone, eventTimezone);
  }
  return `${formatTime(startTime, displayTimezone, eventTimezone)} - ${formatTime(endTime, displayTimezone, eventTimezone)}`;
}

// Get day name from date string
export function getDayName(date: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = new Date(date).getDay();
  return days[dayIndex];
}

// Check if event is today
export function isToday(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
}

