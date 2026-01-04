const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    const events = await prisma.event.findMany();
    console.log(`✅ Database connected! Found ${events.length} events.`);
    console.log(`Database file exists: ${require('fs').existsSync('./prisma/dev.db')}`);
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

