import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const hasDatabase = !!process.env.DATABASE_URL;

export let pool: Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

if (hasDatabase) {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  db = drizzle(pool, { schema });
} else {
  console.log("[db] DATABASE_URL not set - using in-memory storage");
}

export { hasDatabase };
