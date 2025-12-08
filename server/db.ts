import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

// Make sure this is exported
export const hasDatabase = !!process.env.DATABASE_URL;

if (!process.env.DATABASE_URL) {
  console.error("[DB] DATABASE_URL missing");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
