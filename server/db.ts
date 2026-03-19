import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Keep pool small for Supabase PgBouncer Session mode and avoid connection storms in dev reloads.
const poolMax = Number(process.env.DB_POOL_MAX || 5);
const client =
  // Reuse the client in dev to prevent new pools on every hot reload.
  (globalThis as any).__drizzleClient ??
  postgres(process.env.DATABASE_URL, {
    max: poolMax,
    idle_timeout: 5, // seconds to free idle slots quickly
    connect_timeout: 10, // seconds
    prepare: false, // PgBouncer session mode can't share prepared statements safely
  });

if (!(globalThis as any).__drizzleClient) {
  (globalThis as any).__drizzleClient = client;
}

export const db = drizzle(client, { schema });
