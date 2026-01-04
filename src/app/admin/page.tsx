'use client';

import { useState, useEffect } from 'react';
import type { PokerEvent } from '@/lib/event-utils';
import { formatTime, formatTimeRange, type Timezone } from '@/lib/event-utils';

export default function AdminPage() {
  const [events, setEvents] = useState<PokerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<PokerEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        // Only show error for actual HTTP errors (not 200/empty array)
        let errorMessage = `Failed to fetch events (${response.status})`;
        try {
          const errorData = await response.json();
          // Check if errorData has an error property or is an error object
          if (errorData && typeof errorData === 'object') {
            if (errorData.error) {
              errorMessage = String(errorData.error);
            } else if (errorData.message) {
              errorMessage = String(errorData.message);
            }
            // Include details if available (for debugging)
            if (errorData.details) {
              console.error('Error details:', errorData.details);
            }
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText && errorText.trim()) {
              errorMessage = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
            }
          } catch {
            // Use default error message
          }
        }
        // Ensure errorMessage is always a string
        const finalErrorMessage = String(errorMessage || `Failed to fetch events (${response.status})`);
        // Log errors (Next.js will handle NODE_ENV replacement at build time)
        console.error('Failed to fetch events:', response.status, finalErrorMessage);
        setEvents([]);
        setError(finalErrorMessage);
        return;
      }
      
      const data = await response.json();
      // Check if the response is an error object instead of an array
      if (data && typeof data === 'object' && data.error && !Array.isArray(data)) {
        setError(data.error);
        setEvents([]);
        return;
      }
      // Ensure data is always an array
      const eventsArray = Array.isArray(data) ? data : [];
      setEvents(eventsArray);
      // Clear error if we successfully got an array (even if empty)
      setError(null);
    } catch (error) {
      console.error('Error fetching events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events. Please refresh the page.';
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const event = events.find(e => e.id === id);
    const isRecurringInstance = event?.parentEventId;
    const isParentRecurring = event?.isRecurring;
    
    const confirmMessage = isRecurringInstance
      ? 'This is a recurring event instance. Deleting it will only remove this instance, not the series.'
      : isParentRecurring
      ? 'This is a recurring event. Deleting it will remove the event and all its future instances. Are you sure?'
      : 'Are you sure you want to delete this event?';
    
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchEvents();
        
        // Notify other tabs/windows that events were updated
        localStorage.setItem('events-updated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('events-updated'));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEdit = (event: PokerEvent) => {
    // If this is a recurring instance, find and edit the parent event instead
    if (event.parentEventId) {
      const parentEvent = events.find(e => e.id === event.parentEventId);
      if (parentEvent) {
        setEditingEvent(parentEvent);
        setShowForm(true);
        return;
      }
    }
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    
    const isRecurring = formData.get('isRecurring') === 'on';
    const recurrencePattern = formData.get('recurrencePattern') as 'daily' | 'weekly' | 'monthly' | null;
    const recurrenceEndDate = formData.get('recurrenceEndDate') as string | null;

    // Helper to convert empty strings to undefined
    const getValue = (value: FormDataEntryValue | null): string | undefined => {
      const str = value as string;
      return str && str.trim() ? str.trim() : undefined;
    };

    const eventData: Partial<PokerEvent> = {
      eventName: (formData.get('eventName') as string)?.trim(),
      date: (formData.get('date') as string)?.trim(),
      startTime: (formData.get('startTime') as string)?.trim(),
      endTime: getValue(formData.get('endTime')),
      timezone: ((formData.get('timezone') as Timezone) || 'EST') as Timezone,
      stakes: (formData.get('stakes') as string)?.trim(),
      gameType: (formData.get('gameType') as string)?.trim(),
      description: getValue(formData.get('description')),
      streamingLink: getValue(formData.get('streamingLink')),
      gameLink: getValue(formData.get('gameLink')),
      telegramChatLink: getValue(formData.get('telegramChatLink')),
      lumaEventUrl: getValue(formData.get('lumaEventUrl')),
      isRecurring: isRecurring,
      recurrencePattern: isRecurring && recurrencePattern ? recurrencePattern : undefined,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : undefined,
    };

    // Validate required fields
    if (!eventData.eventName || !eventData.date || !eventData.startTime || !eventData.stakes || !eventData.gameType) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const url = '/api/events';
      const body = editingEvent ? { ...eventData, id: editingEvent.id } : eventData;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${editingEvent ? 'update' : 'create'} event. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.error || errorData.message || errorMessage;
            // Log full error details for debugging
            // Log error response for debugging
            console.error('Error response:', errorData);
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (parseError) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
            }
          } catch {
            // Use default error message if all parsing fails
            console.error('Failed to parse error response:', parseError);
          }
        }
        setError(errorMessage);
        return;
      }

      const result = await response.json();
      setSuccess(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
      fetchEvents();
      
      // Clear form after a short delay
      setTimeout(() => {
        setShowForm(false);
        setEditingEvent(null);
        (e.target as HTMLFormElement).reset();
        setSuccess(null);
      }, 1500);
      
      // Notify other tabs/windows that events were updated
      localStorage.setItem('events-updated', Date.now().toString());
      // Trigger custom event for same-tab listeners
      window.dispatchEvent(new CustomEvent('events-updated'));
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error instanceof Error ? error.message : 'Failed to save event. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6513cf] border-t-transparent mb-4"></div>
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 text-[#6513cf] tracking-tight">
                Admin Panel
              </h1>
              <p className="text-slate-400 text-base sm:text-lg font-light">Manage Poker Events</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingEvent(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  showForm 
                    ? 'bg-slate-800/60 text-slate-300 border border-slate-700/40 hover:bg-slate-800/80' 
                    : 'bg-[#6513cf] text-white shadow-md shadow-[#6513cf]/30 hover:bg-[#6513cf]/90'
                }`}
              >
                {showForm ? 'Cancel' : '+ Add Event'}
              </button>
              <a
                href="/"
                className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-800/60 text-slate-200 border border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600/60 transition-all"
              >
                View Schedule
              </a>
            </div>
          </div>
        </header>

        {showForm && (
          <EventForm
            event={editingEvent}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingEvent(null);
              setError(null);
              setSuccess(null);
            }}
            error={error}
            success={success}
          />
        )}

        {error && !showForm && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400">
            {error}
          </div>
        )}

        {success && !showForm && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/40 text-green-400">
            {success}
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-200">Events</h2>
            <span className="px-2.5 py-1 rounded-md bg-slate-800/40 text-slate-400 text-xs font-medium border border-slate-700/40">
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </span>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-slate-800/40 bg-slate-900/30">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-800/40 mb-4">
                <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-slate-300 text-base font-medium mb-1">No events yet</p>
              <p className="text-slate-500 text-sm">Add your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventForm({ event, onSubmit, onCancel, error, success }: { event: PokerEvent | null; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; error?: string | null; success?: string | null }) {
  const [isRecurring, setIsRecurring] = useState(event?.isRecurring || false);

  return (
    <div className="mb-8 rounded-xl border border-slate-800/40 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8 shadow-lg">
      <h3 className="text-xl sm:text-2xl font-semibold text-slate-200 mb-5">
        {event ? 'Edit Event' : 'Create New Event'}
      </h3>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-green-400 text-sm">
          {success}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Event Name *</label>
            <input
              type="text"
              name="eventName"
              required
              defaultValue={event?.eventName}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
              placeholder="Enter event name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date *</label>
            <input
              type="date"
              name="date"
              required
              defaultValue={event?.date}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Time *</label>
            <input
              type="time"
              name="startTime"
              required
              defaultValue={event?.startTime}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">End Time</label>
            <input
              type="time"
              name="endTime"
              defaultValue={event?.endTime ?? undefined}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Timezone *</label>
            <select
              name="timezone"
              required
              defaultValue={event?.timezone || 'EST'}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            >
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="CST">CST (Central Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Select the timezone for this event's time</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Stakes *</label>
            <input
              type="text"
              name="stakes"
              required
              placeholder="e.g., NLH 1/2"
              defaultValue={event?.stakes}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Game Type *</label>
            <input
              type="text"
              name="gameType"
              required
              placeholder="e.g., No Limit Hold'em"
              defaultValue={event?.gameType}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <input
              type="text"
              name="description"
              defaultValue={event?.description ?? undefined}
              placeholder="Optional description"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Streaming Link</label>
            <input
              type="url"
              name="streamingLink"
              defaultValue={event?.streamingLink ?? undefined}
              placeholder="https://twitch.tv/..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Game Link</label>
            <input
              type="url"
              name="gameLink"
              defaultValue={event?.gameLink ?? undefined}
              placeholder="https://example.com/game"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Telegram Chat Link</label>
            <input
              type="url"
              name="telegramChatLink"
              defaultValue={event?.telegramChatLink ?? undefined}
              placeholder="https://t.me/..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Luma Event URL</label>
            <input
              type="url"
              name="lumaEventUrl"
              defaultValue={event?.lumaEventUrl ?? undefined}
              placeholder="https://luma.com/events/..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
            />
          </div>
        </div>
        
        {/* Recurring Event Options */}
        <div className="pt-4 border-t border-slate-800/40">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              name="isRecurring"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700/50 bg-slate-950/50 text-[#6513cf] focus:ring-[#6513cf]/20 focus:ring-1"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-slate-300 cursor-pointer">
              Make this a recurring event
            </label>
          </div>
          
          {isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Recurrence Pattern</label>
                <select
                  name="recurrencePattern"
                  defaultValue={event?.recurrencePattern || 'weekly'}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date (Optional)</label>
                <input
                  type="date"
                  name="recurrenceEndDate"
                  defaultValue={event?.recurrenceEndDate ?? undefined}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-700/40 text-slate-200 focus:outline-none focus:border-[#6513cf]/50 focus:ring-1 focus:ring-[#6513cf]/20 transition-all"
                  placeholder="Leave empty for no end date"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to recur indefinitely</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-800/40">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg font-medium bg-[#6513cf] text-white shadow-md shadow-[#6513cf]/30 hover:bg-[#6513cf]/90 transition-all"
          >
            {event ? 'Update Event' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg font-medium bg-slate-800/60 text-slate-300 border border-slate-700/40 hover:bg-slate-800/80 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function EventRow({ event, onEdit, onDelete }: { event: PokerEvent; onEdit: () => void; onDelete: () => void }) {
  const isInstance = !!event.parentEventId;
  
  return (
    <div className={`rounded-lg border backdrop-blur-sm p-4 sm:p-5 hover:border-slate-700/50 transition-all shadow-sm ${
      isInstance 
        ? 'border-slate-800/30 bg-slate-900/30' 
        : 'border-slate-800/40 bg-slate-900/50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-100">{event.eventName}</h3>
            {isInstance && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800/40 text-slate-400 border border-slate-700/30">
                Instance
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#6513cf]/15 text-[#dc78ff] border border-[#6513cf]/25 font-medium">
              {formatTimeRange(event.startTime, event.endTime ?? undefined, 'EST', (event.timezone || 'EST') as Timezone)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-300 border border-slate-700/40 font-medium">
              {event.date}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-300 border border-slate-700/40 font-medium">
              {event.stakes}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#33aae1]/15 text-[#33aae1] border border-[#33aae1]/25 font-medium">
              {event.gameType}
            </span>
            {event.isRecurring && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#dc78ff]/15 text-[#dc78ff] border border-[#dc78ff]/25 font-medium">
                🔁 {event.recurrencePattern || 'Recurring'}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-slate-400 text-sm mb-2.5 leading-relaxed">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {event.streamingLink && <span className="flex items-center gap-1">📺 Stream</span>}
            {event.gameLink && <span className="flex items-center gap-1">🎮 Game</span>}
            {event.telegramChatLink && <span className="flex items-center gap-1">💬 Telegram</span>}
            {event.lumaEventUrl && <span className="flex items-center gap-1">📝 Luma</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#33aae1]/10 text-[#33aae1] border border-[#33aae1]/40 hover:bg-[#33aae1]/15 transition-all"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/15 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
