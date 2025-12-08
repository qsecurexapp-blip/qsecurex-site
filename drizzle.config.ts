import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("DATABASE_URL not set - drizzle-kit commands will not work without it");
}

const connectionUrl = dbUrl ? (dbUrl.includes('sslmode=') ? dbUrl : `${dbUrl}?sslmode=require`) : "";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
});
