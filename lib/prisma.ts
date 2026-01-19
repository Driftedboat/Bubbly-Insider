import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only initialize Prisma if DATABASE_URL is set (not on serverless without DB)
let prismaInstance: PrismaClient | null = null

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }
} catch (e) {
  console.warn('Prisma client initialization failed, database features disabled:', e)
}

export const prisma = prismaInstance
