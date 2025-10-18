/**
 * Prisma Client 싱글톤
 * 
 * Next.js 개발 환경에서 Hot Reload 시 Prisma 클라이언트 인스턴스가
 * 계속 생성되는 것을 방지
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
