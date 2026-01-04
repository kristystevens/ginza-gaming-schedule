import { NextRequest, NextResponse } from 'next/server';
import {
  getAllEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent
} from '@/lib/events';
import fs from 'fs';
import path from 'path';

// Prevent static generation during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to export events to JSON file for Telegram bot
async function exportEventsToFile() {
  try {
    const events = await getAllEvents();
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, 'events.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Error exporting events:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      const event = await getEventById(id);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json(event);
    }
    
    const events = await getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error in GET:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Return error details in development for debugging
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    }
    // Always return empty array on error to prevent client-side crashes
    // The client can handle empty arrays gracefully
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...eventData } = body;
    
    // Validate required fields
    if (!id && (!eventData.eventName || !eventData.date || !eventData.startTime || !eventData.stakes || !eventData.gameType)) {
      return NextResponse.json({ 
        error: 'Missing required fields: eventName, date, startTime, stakes, and gameType are required.' 
      }, { status: 400 });
    }
    
    if (id) {
      // Update existing event
      const updated = await updateEvent(id, eventData);
      if (!updated) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      await exportEventsToFile();
      return NextResponse.json(updated);
    } else {
      // Create new event
      const newEvent = await addEvent(eventData);
      await exportEventsToFile();
      return NextResponse.json(newEvent, { status: 201 });
    }
  } catch (error) {
    console.error('Error in POST:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: `Failed to save event: ${errorMessage}` 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
  }
  
  const deleted = await deleteEvent(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  
  await exportEventsToFile();
  return NextResponse.json({ success: true });
}

