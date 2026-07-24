import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";

import { env } from "~/env";

const createPrismaClient = () => {
  const connectionString = env.DATABASE_URL.includes("?")
    ? env.DATABASE_URL
    : `${env.DATABASE_URL}?sslmode=no-verify`;

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
