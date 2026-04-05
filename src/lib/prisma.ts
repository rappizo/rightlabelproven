import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { jsonPrisma } from "@/lib/json-store";

declare global {
  var __rlpPrismaClient: PrismaClient | undefined;
}

function hasConfiguredPostgresUrl(value?: string) {
  if (!value) {
    return false;
  }

  const normalized = value.trim();

  if (!normalized || normalized.startsWith("file:")) {
    return false;
  }

  if (
    normalized.includes("PROJECT_REF") ||
    normalized.includes("YOUR_DB_PASSWORD") ||
    normalized.includes("YOUR_SUPABASE") ||
    normalized.includes("[") ||
    normalized.includes("]")
  ) {
    return false;
  }

  return normalized.startsWith("postgres://") || normalized.startsWith("postgresql://");
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const useSupabaseDatabase = hasConfiguredPostgresUrl(process.env.DATABASE_URL);

const prismaClient = useSupabaseDatabase
  ? globalThis.__rlpPrismaClient ?? createPrismaClient()
  : null;

if (process.env.NODE_ENV !== "production" && prismaClient) {
  globalThis.__rlpPrismaClient = prismaClient;
}

export const databaseMode = useSupabaseDatabase ? "supabase" : "json";
export const databaseLabel = useSupabaseDatabase
  ? "Supabase PostgreSQL"
  : "Local JSON fallback";

export const prisma = (prismaClient ?? jsonPrisma) as unknown as typeof jsonPrisma;
