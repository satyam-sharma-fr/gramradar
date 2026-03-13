import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getConnectionString() {
  // For runtime: prefer DIRECT_DATABASE_URL (unpooled), fallback to DATABASE_URL_UNPOOLED, then DATABASE_URL
  return (
    process.env.DIRECT_DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    ""
  );
}

function createPrismaClient() {
  const connectionString = getConnectionString();

  // If it's a prisma+postgres:// URL, extract the real postgres URL
  if (connectionString.startsWith("prisma+postgres://")) {
    const apiKey = new URL(
      connectionString.replace("prisma+postgres://", "https://")
    ).searchParams.get("api_key");
    if (apiKey) {
      try {
        const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString());
        const adapter = new PrismaPg({ connectionString: decoded.databaseUrl });
        return new PrismaClient({ adapter });
      } catch {
        // fallthrough
      }
    }
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
