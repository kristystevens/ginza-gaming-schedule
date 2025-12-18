import { NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/events';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const events = getAllEvents();
  
  // Also write to a JSON file for the Telegram bot to read
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const filePath = path.join(dataDir, 'events.json');
  fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
  
  return NextResponse.json(events);
}


