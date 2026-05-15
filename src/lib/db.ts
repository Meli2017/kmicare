import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Singleton partagé en développement ET en production.
// Sans ce pattern, Next.js crée une nouvelle instance Prisma à chaque
// import du module en production (hot-module reload / serverless workers),
// ce qui épuise rapidement le pool de connexions MySQL.
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma