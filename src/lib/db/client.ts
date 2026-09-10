/**
 * @file client.ts
 * @description Server-only PostgreSQL Database Client and Drizzle ORM Instance.
 * Implements connection pooling, environment configuration guards, and safe fallback checks.
 */

import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy global connection cache to prevent connection exhaustion in development hot-reloading
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

/**
 * Validates whether a valid PostgreSQL connection string is supplied.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(
    databaseUrl &&
      (databaseUrl.startsWith('postgres://') ||
        databaseUrl.startsWith('postgresql://'))
  );
}

function createClient(): postgres.Sql | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return postgres(databaseUrl!, {
    max: process.env.NODE_ENV === 'production' ? 20 : 5,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: false, // Required for Supabase transaction poolers (PgBouncer)
  });
}

const conn = globalForDb.conn ?? createClient();
if (process.env.NODE_ENV !== 'production' && conn) {
  globalForDb.conn = conn;
}

/**
 * Authoritative Drizzle ORM database instance with pre-bound schema.
 * Returns null if DATABASE_URL is not configured (allowing fallback repositories).
 */
export const db = conn ? drizzle(conn, { schema }) : null;

export type DbType = typeof db;
export { schema };
