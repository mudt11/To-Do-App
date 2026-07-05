import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL || '';
  // Cắt bỏ dấu ngoặc kép nếu file .env bị dính
  connectionString = connectionString.replace(/^"|"$/g, '').trim();

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined trong file .env!");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;