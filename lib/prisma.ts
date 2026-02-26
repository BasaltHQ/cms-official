import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma_v3: PrismaClient;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(globalThis as any).cachedPrisma_v3) {
    (globalThis as any).cachedPrisma_v3 = new PrismaClient();
  }
  prisma = (globalThis as any).cachedPrisma_v3;
}

export const prismadb = prisma;
