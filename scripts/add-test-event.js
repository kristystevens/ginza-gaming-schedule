const { PrismaClient } = require('@prisma/client');

async function addTestEvent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🎲 Adding test poker event...');
    
    // Create a test event for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const testEvent = await prisma.event.create({
      data: {
        eventName: 'Test Poker Night',
        date: dateStr,
        startTime: '19:00',
        endTime: '23:00',
        timezone: 'EST',
        stakes: 'NLH 1/2',
        gameType: 'No Limit Hold\'em',
        description: 'Test event for poker game - feel free to join!',
        streamingLink: 'https://twitch.tv/example',
        gameLink: 'https://example.com/game',
        telegramChatLink: 'https://t.me/example',
        isRecurring: false,
      },
    });
    
    console.log('✅ Test event created successfully!');
    console.log('📋 Event details:');
    console.log(`   Name: ${testEvent.eventName}`);
    console.log(`   Date: ${testEvent.date}`);
    console.log(`   Time: ${testEvent.startTime} - ${testEvent.endTime || 'TBD'}`);
    console.log(`   Stakes: ${testEvent.stakes}`);
    console.log(`   Game Type: ${testEvent.gameType}`);
    console.log(`   ID: ${testEvent.id}`);
    
  } catch (error) {
    console.error('❌ Error creating test event:', error.message);
    if (error.message.includes('DATABASE_URL')) {
      console.error('   Make sure DATABASE_URL is set in your .env file');
    }
  } finally {
    await prisma.$disconnect();
  }
}

addTestEvent();

