import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { dbConfig } from "@/config";

const pool = new Pool({
  connectionString: dbConfig.postgres.url,
});

export const db = drizzle(pool, {
  schema: {},
});

export type Database = typeof db;

export const closeDb = async () => {
  await pool.end();
};
