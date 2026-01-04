const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function createTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating Event table in Supabase...');
    
    // Read the migration SQL file or create table directly
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL,
        "eventName" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT,
        "timezone" TEXT DEFAULT 'EST',
        "stakes" TEXT NOT NULL,
        "gameType" TEXT NOT NULL,
        "description" TEXT,
        "streamingLink" TEXT,
        "gameLink" TEXT,
        "telegramChatLink" TEXT,
        "lumaEventUrl" TEXT,
        "isRecurring" BOOLEAN NOT NULL DEFAULT false,
        "recurrencePattern" TEXT,
        "recurrenceEndDate" TEXT,
        "parentEventId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "Event_date_idx" ON "Event"("date");
      CREATE INDEX IF NOT EXISTS "Event_parentEventId_idx" ON "Event"("parentEventId");
    `;
    
    await prisma.$executeRawUnsafe(createTableSQL);
    console.log('✅ Event table created successfully!');
    
    // Verify
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Event'
    `;
    
    if (tables.length > 0) {
      console.log('✅ Verified: Event table exists');
    }
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Event table already exists');
    } else {
      console.error('❌ Error creating table:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTables();

