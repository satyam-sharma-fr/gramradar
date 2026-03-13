import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getConnectionString() {
  // Use direct postgres URL if available, otherwise parse from prisma+postgres URL
  if (process.env.DIRECT_DATABASE_URL) {
    return process.env.DIRECT_DATABASE_URL;
  }

  const url = process.env.DATABASE_URL!;
  if (url.startsWith("prisma+postgres://")) {
    // Extract the api_key, decode it, and get the databaseUrl
    const apiKey = new URL(url.replace("prisma+postgres://", "https://")).searchParams.get("api_key");
    if (apiKey) {
      try {
        const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString());
        return decoded.databaseUrl;
      } catch {
        // fallback
      }
    }
  }

  return url;
}

function createPrismaClient() {
  const connectionString = getConnectionString();
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
