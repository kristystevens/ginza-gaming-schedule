const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Supabase!');
    
    // Check database version
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL version:', version[0].version.split(' ')[0] + ' ' + version[0].version.split(' ')[1]);
    
    // Check if Event table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found');
      console.log('   💡 Run: npx prisma migrate dev');
    } else {
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }
    
    // Try to query Event table if it exists
    const hasEventTable = tables.some(t => t.table_name === 'Event');
    if (hasEventTable) {
      const count = await prisma.event.count();
      console.log(`\n📊 Event table has ${count} events`);
    } else {
      console.log('\n⚠️  Event table does not exist');
      console.log('   Run: npx prisma migrate dev --name init_supabase');
    }
    
    console.log('\n✅ Connection test complete!');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    if (error.message.includes('P1001')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your DATABASE_URL in .env file');
      console.log('   - Verify Supabase project is active');
      console.log('   - Check network connection');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

