const { PrismaClient } = require('@prisma/client');

async function setupPostgres() {
  console.log('🔌 Testing PostgreSQL connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('\n📝 Please set DATABASE_URL in your .env file:');
    console.log('   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Check if Event table exists
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Event'
    `;

    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Event table exists');
      
      // Count events
      const count = await prisma.event.count();
      console.log(`📊 Found ${count} events in database`);
    } else {
      console.log('⚠️  Event table does not exist yet');
      console.log('   Run: npx prisma migrate dev');
    }

    // Test a simple query
    const events = await prisma.event.findMany({ take: 1 });
    console.log('✅ Database queries working correctly');

  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error.message);
    
    if (error.message.includes('P1001')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Make sure PostgreSQL is running');
      console.log('   - Check your DATABASE_URL connection string');
      console.log('   - Verify username, password, and database name');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupPostgres();

