'use client';

import { useState, useMemo, useEffect } from 'react';
import { formatTime, formatTimeRange, getDayName, isToday, type PokerEvent, type Timezone } from '@/lib/event-utils';

type ViewMode = 'today' | 'week';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [allEvents, setAllEvents] = useState<PokerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState<Timezone>(() => {
    // Load timezone preference from localStorage, default to EST
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timezone-preference');
      if (saved === 'EST' || saved === 'CST' || saved === 'PST') {
        return saved;
      }
    }
    return 'EST';
  });

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
    
    // Refresh events when window gets focus (e.g., coming back from admin panel)
    const handleFocus = () => {
      fetchEvents();
    };
    
    // Refresh events when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEvents();
      }
    };
    
    // Listen for custom events and storage events (when admin panel updates events)
    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e instanceof StorageEvent && e.key === 'events-updated') {
        fetchEvents();
      } else if (e.type === 'storage') {
        fetchEvents();
      }
    };
    
    // Also listen for custom events
    window.addEventListener('events-updated', handleStorageChange);
    
    // Periodic refresh every 30 seconds to catch updates
    const refreshInterval = setInterval(() => {
      fetchEvents();
    }, 30000); // 30 seconds
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('events-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('events-updated', handleStorageChange);
      clearInterval(refreshInterval);
    };
  }, []);

  // Save timezone preference when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timezone-preference', timezone);
    }
  }, [timezone]);

  // Refresh events when view mode changes
  useEffect(() => {
    fetchEvents();
  }, [viewMode]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        console.error('Failed to fetch events:', response.status);
        setAllEvents([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      // Ensure data is always an array
      const safeData = Array.isArray(data) ? data : [];
      setAllEvents(safeData);
      setLoading(false);
      // Debug: log events for this week
      if (viewMode === 'week') {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        const weekEvents = data.filter((event: PokerEvent) => {
          const eventDate = new Date(event.date + 'T00:00:00');
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
        console.log('Events for this week:', weekEvents.map((e: PokerEvent) => `${e.eventName} on ${e.date}`));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setAllEvents([]); // Set to empty array on any error
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on view mode
  const events = useMemo(() => {
    // Defensive check: ensure allEvents is always an array
    const safeEvents = Array.isArray(allEvents) ? allEvents : [];
    
    if (viewMode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return safeEvents.filter(e => e.date === today);
    } else {
      // Get events for this week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0); // Set to start of day
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999); // Set to end of day

      return safeEvents.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00'); // Parse as date only
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
  }, [allEvents, viewMode]);

  // Group events by date for weekly view
  const eventsByDate = useMemo(() => {
    // Defensive check: ensure events is always an array
    const safeEvents = Array.isArray(events) ? events : [];
    
    if (viewMode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return { [today]: safeEvents };
    }
    
    const grouped: Record<string, PokerEvent[]> = {};
    safeEvents.forEach(event => {
      // Ensure date is in YYYY-MM-DD format (handle any timezone issues)
      const eventDateStr = event.date.split('T')[0];
      if (!grouped[eventDateStr]) {
        grouped[eventDateStr] = [];
      }
      grouped[eventDateStr].push(event);
    });
    return grouped;
  }, [events, viewMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6513cf] border-t-transparent mb-4"></div>
          <p className="text-slate-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[1600px]">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-[#dc78ff] via-[#6513cf] to-[#33aae1] bg-clip-text text-transparent tracking-tight">
                Ginza Gaming
              </h1>
              <p className="text-slate-400 text-base sm:text-lg font-light">online poker, perfected.</p>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/60 text-slate-200 border border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600/60 transition-all"
            >
              Admin
            </a>
          </div>

          {/* View Toggle and Timezone Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/40">
              <button
                onClick={() => setViewMode('today')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  viewMode === 'today'
                    ? 'bg-[#6513cf] text-white shadow-md shadow-[#6513cf]/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
              Today
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                viewMode === 'week'
                  ? 'bg-[#6513cf] text-white shadow-md shadow-[#6513cf]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              This Week
            </button>
            </div>
            
            {/* Timezone Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">Timezone:</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value as Timezone)}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-900/60 text-slate-200 border border-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600/60 transition-all focus:outline-none focus:ring-2 focus:ring-[#6513cf]/50"
              >
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="PST">PST</option>
              </select>
            </div>
          </div>
        </header>

        {/* Schedule Content */}
        {viewMode === 'today' ? (
          <TodayView events={events} />
        ) : (
          <WeeklyView eventsByDate={eventsByDate} />
        )}
      </div>
    </div>
  );
}

function TodayView({ events }: { events: PokerEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-800/40 mb-4">
          <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-300 text-base font-medium mb-1">No events scheduled for today</p>
        <p className="text-slate-500 text-sm">Check back later or view the weekly schedule</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function WeeklyView({ eventsByDate }: { eventsByDate: Record<string, PokerEvent[]> }) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().toISOString().split('T')[0];
  
  // Get dates for this week
  const weekDates: string[] = [];
  const currentDate = new Date();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0); // Normalize to start of day
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    weekDates.push(`${year}-${month}-${day}`);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
      {weekDates.map((date, index) => {
        const dayEvents = eventsByDate[date] || [];
        const dayName = days[index];
        const isTodayDate = date === today;
        
        return (
          <div
            key={date}
            className={`rounded-xl border p-4 min-h-[280px] transition-all ${
              isTodayDate
                ? 'bg-gradient-to-br from-[#6513cf]/8 to-[#440093]/4 border-[#6513cf]/30 shadow-md shadow-[#6513cf]/5'
                : 'bg-slate-900/30 border-slate-800/40 hover:border-slate-700/50 hover:bg-slate-900/40'
            }`}
          >
            <div className="mb-4 pb-3 border-b border-slate-800/40">
              <h3 className={`font-semibold text-base mb-1 ${isTodayDate ? 'text-[#dc78ff]' : 'text-slate-200'}`}>
                {dayName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="space-y-3">
              {dayEvents.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-6">No events</p>
              ) : (
                dayEvents.map(event => (
                  <EventCard key={event.id} event={event} compact />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventCard({ event, compact = false }: { event: PokerEvent; compact?: boolean }) {
  return (
    <div
      className={`rounded-lg border bg-slate-900/50 backdrop-blur-sm transition-all hover:border-[#6513cf]/40 hover:shadow-lg hover:shadow-[#6513cf]/5 hover:-translate-y-0.5 ${
        compact 
          ? 'p-3 border-slate-800/40' 
          : 'p-4 sm:p-5 border-slate-800/40 shadow-sm'
      }`}
    >
      <div className={`${compact ? 'mb-2.5' : 'mb-3'}`}>
        <h3 className={`font-semibold text-slate-100 mb-2 ${compact ? 'text-sm' : 'text-lg'}`}>
          {event.eventName}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-md bg-[#6513cf]/15 text-[#dc78ff] border border-[#6513cf]/25 font-medium">
            {formatTimeRange(event.startTime, event.endTime ?? undefined, timezone)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-300 border border-slate-700/40 font-medium">
            {event.stakes}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[#33aae1]/15 text-[#33aae1] border border-[#33aae1]/25 font-medium">
            {event.gameType}
          </span>
          {(event.isRecurring || event.parentEventId) && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#dc78ff]/15 text-[#dc78ff] border border-[#dc78ff]/25 font-medium">
              🔁 {event.isRecurring ? 'Recurring' : 'Recurring Instance'}
            </span>
          )}
        </div>
      </div>
      
      {event.description && !compact && (
        <p className="text-slate-400 text-sm mb-3 leading-relaxed">{event.description}</p>
      )}

      <div className={`flex flex-wrap gap-1.5 ${compact ? 'mt-2.5' : 'mt-3'}`}>
        {event.lumaEventUrl && (
          <EventButton
            label="rsvp on luma"
            onClick={() => {
              if (event.lumaEventUrl) {
                window.open(event.lumaEventUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            variant="gold"
          />
        )}
        {event.streamingLink && (
          <EventButton
            label="Join Stream"
            onClick={() => {
              if (event.streamingLink) {
                window.open(event.streamingLink, '_blank', 'noopener,noreferrer');
              }
            }}
            variant="green"
          />
        )}
        {event.gameLink && (
          <EventButton
            label="Join Game"
            onClick={() => {
              const gameUrl = event.gameLink;
              if (gameUrl) {
                // Ensure URL is valid and opens in new tab
                try {
                  window.open(gameUrl, '_blank', 'noopener,noreferrer');
                } catch (error) {
                  console.error('Error opening game link:', error);
                  // Fallback: try direct navigation
                  window.location.href = gameUrl;
                }
              }
            }}
            variant="teal"
          />
        )}
        {event.telegramChatLink && (
          <EventButton
            label="Telegram"
            onClick={() => {
              if (event.telegramChatLink) {
                window.open(event.telegramChatLink, '_blank', 'noopener,noreferrer');
              }
            }}
            variant="blue"
          />
        )}
      </div>
    </div>
  );
}

function EventButton({ label, onClick, variant }: { label: string; onClick: () => void; variant: 'green' | 'teal' | 'blue' | 'gold' }) {
  const variantStyles = {
    green: 'bg-[#dc78ff]/10 text-[#dc78ff] border-[#dc78ff]/40 hover:bg-[#dc78ff]/15 hover:border-[#dc78ff]/60',
    teal: 'bg-[#33aae1]/10 text-[#33aae1] border-[#33aae1]/40 hover:bg-[#33aae1]/15 hover:border-[#33aae1]/60',
    blue: 'bg-[#6513cf]/10 text-[#6513cf] border-[#6513cf]/40 hover:bg-[#6513cf]/15 hover:border-[#6513cf]/60',
    gold: 'bg-[#440093]/10 text-[#dc78ff] border-[#440093]/40 hover:bg-[#440093]/15 hover:border-[#440093]/60'
  };

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all hover:scale-[1.02] active:scale-[0.98] ${variantStyles[variant]}`}
    >
      {label}
    </button>
  );
}
