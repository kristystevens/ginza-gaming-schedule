import { NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/events';
import fs from 'fs';
import path from 'path';

// Prevent static generation during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not set, returning empty array');
      return NextResponse.json([]);
    }

    const events = await getAllEvents();
    
    // Also write to a JSON file for the Telegram bot to read
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'events.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error exporting events:', error);
    // During build time, return empty array instead of error
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: 'Failed to export events' },
      { status: 500 }
    );
  }
}


