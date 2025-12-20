import 'server-only';
import { PrismaClient } from '@prisma/client';

// Prisma Client singleton pattern for serverless environments (Vercel)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization - only create PrismaClient when actually needed
// This prevents errors during build time when DATABASE_URL might not be set
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    // During build time, return a mock client that throws on use
    // This allows the module to load without errors
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error(
          'DATABASE_URL environment variable is not set. ' +
          'Please set it in your .env file or Vercel environment variables. ' +
          'This error occurs when trying to use the database without a connection string.'
        );
      },
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Lazy getter - only creates client when accessed
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Export as a getter function to prevent instantiation during build
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  // Initialize in development to catch errors early
  if (process.env.DATABASE_URL) {
    globalForPrisma.prisma = createPrismaClient();
  }
}

