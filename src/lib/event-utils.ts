// Client-safe utility functions (no database imports)
// These can be imported in 'use client' components

export interface PokerEvent {
  id: string;
  eventName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM format
  endTime?: string | null; // HH:MM format (optional)
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

// Format time for display (e.g., "16:00" -> "4:00 PM EST")
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm} EST`;
}

// Format time range for display (e.g., "16:00" - "20:00" -> "4:00 PM - 8:00 PM EST")
export function formatTimeRange(startTime: string, endTime?: string | null | undefined): string {
  if (!endTime) {
    return formatTime(startTime);
  }
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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

