import { prisma } from './db';
import type { Event } from '@prisma/client';
import type { PokerEvent } from './event-utils';
export type { PokerEvent } from './event-utils';

// Generate recurring event instances
function generateRecurringInstances(event: PokerEvent, endDate: Date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)): PokerEvent[] {
  if (!event.isRecurring || !event.recurrencePattern) {
    return [];
  }

  const instances: PokerEvent[] = [];
  const startDate = new Date(event.date);
  const recurrenceEnd = event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : endDate;
  const maxDate = recurrenceEnd < endDate ? recurrenceEnd : endDate;

  let currentDate = new Date(startDate);
  
  // Generate instances based on pattern
  while (currentDate <= maxDate) {
    // Skip the original event date (it's already in the events array)
    if (currentDate.toISOString().split('T')[0] !== event.date) {
      instances.push({
        ...event,
        id: `${event.id}_${currentDate.toISOString().split('T')[0]}`,
        date: currentDate.toISOString().split('T')[0],
        parentEventId: event.id,
      });
    }
    
    // Advance to next occurrence
    advanceDateByPattern(currentDate, event.recurrencePattern);
  }

  return instances;
}

// Advance a date by the recurrence pattern
function advanceDateByPattern(date: Date, pattern: 'daily' | 'weekly' | 'monthly'): void {
  switch (pattern) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }
}

// Convert Prisma Event to PokerEvent
function toPokerEvent(event: Event): PokerEvent {
  return {
    id: event.id,
    eventName: event.eventName,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    stakes: event.stakes,
    gameType: event.gameType,
    description: event.description,
    streamingLink: event.streamingLink,
    gameLink: event.gameLink,
    telegramChatLink: event.telegramChatLink,
    lumaEventUrl: event.lumaEventUrl,
    isRecurring: event.isRecurring,
    recurrencePattern: event.recurrencePattern as 'daily' | 'weekly' | 'monthly' | null,
    recurrenceEndDate: event.recurrenceEndDate,
    parentEventId: event.parentEventId,
  };
}

// Event utilities
export async function getAllEvents(): Promise<PokerEvent[]> {
  // During build time, return empty array if DATABASE_URL is not set
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const dbEvents = await prisma.event.findMany({
    where: {
      parentEventId: null, // Only get parent events, not instances
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
  });

  const allEvents: PokerEvent[] = [];
  const now = new Date();
  const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

  for (const event of dbEvents) {
    const pokerEvent = toPokerEvent(event);
    // Add the original event
    allEvents.push(pokerEvent);
    
    // Generate recurring instances if applicable
    if (pokerEvent.isRecurring && pokerEvent.recurrencePattern) {
      const instances = generateRecurringInstances(pokerEvent, endDate);
      allEvents.push(...instances);
    }
  }

  // Sort by date and time
  return allEvents.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

export async function getEventById(id: string): Promise<PokerEvent | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const event = await prisma.event.findUnique({
    where: { id },
  });
  return event ? toPokerEvent(event) : null;
}

export async function getEventsByDate(date: string): Promise<PokerEvent[]> {
  const events = await getAllEvents();
  return events.filter(e => e.date === date);
}

export async function getEventsThisWeek(): Promise<PokerEvent[]> {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

  const events = await getAllEvents();
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  });
}

export async function getTodayEvents(): Promise<PokerEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  return getEventsByDate(today);
}

export async function addEvent(event: Omit<PokerEvent, 'id'>): Promise<PokerEvent> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Cannot add event.');
  }

  const newEvent = await prisma.event.create({
    data: {
      eventName: event.eventName,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime || null,
      stakes: event.stakes,
      gameType: event.gameType,
      description: event.description || null,
      streamingLink: event.streamingLink || null,
      gameLink: event.gameLink || null,
      telegramChatLink: event.telegramChatLink || null,
      lumaEventUrl: event.lumaEventUrl || null,
      isRecurring: event.isRecurring || false,
      recurrencePattern: event.recurrencePattern || null,
      recurrenceEndDate: event.recurrenceEndDate || null,
      parentEventId: event.parentEventId || null,
    },
  });
  return toPokerEvent(newEvent);
}

export async function updateEvent(id: string, updates: Partial<PokerEvent>): Promise<PokerEvent | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Cannot update event.');
  }

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        eventName: updates.eventName,
        date: updates.date,
        startTime: updates.startTime,
        endTime: updates.endTime ?? undefined,
        stakes: updates.stakes,
        gameType: updates.gameType,
        description: updates.description ?? undefined,
        streamingLink: updates.streamingLink ?? undefined,
        gameLink: updates.gameLink ?? undefined,
        telegramChatLink: updates.telegramChatLink ?? undefined,
        lumaEventUrl: updates.lumaEventUrl ?? undefined,
        isRecurring: updates.isRecurring,
        recurrencePattern: updates.recurrencePattern ?? undefined,
        recurrenceEndDate: updates.recurrenceEndDate ?? undefined,
      },
    });
    return toPokerEvent(updated);
  } catch {
    return null;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Cannot delete event.');
  }

  try {
    // Delete the event and all its recurring instances (if any)
    await prisma.event.deleteMany({
      where: {
        OR: [
          { id },
          { parentEventId: id },
        ],
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Get parent event (for recurring instances)
export async function getParentEvent(event: PokerEvent): Promise<PokerEvent | null> {
  if (!event.parentEventId) return null;
  return getEventById(event.parentEventId);
}

// Check if event is a recurring instance
export function isRecurringInstance(event: PokerEvent): boolean {
  return !!event.parentEventId;
}

// Re-export utility functions from event-utils (client-safe, no database imports)
export { formatTime, formatTimeRange, getDayName, isToday } from './event-utils';

