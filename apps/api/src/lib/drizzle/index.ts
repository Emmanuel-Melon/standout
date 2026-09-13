import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { dbConfig } from "@/config";
import { combinedAuthSchema } from "@/feature/auth/auth.schema";
import { combinedProfileSchema } from "@/feature/profile/profile.schema";
import { combinedUsersSchema } from "@/feature/users/users.schema";

const pool = new Pool({
  connectionString: dbConfig.postgres.url,
});

export const db = drizzle(pool, {
  schema: {
    ...combinedAuthSchema,
    ...combinedProfileSchema,
    ...combinedUsersSchema,
  },
});

export type Database = typeof db;

export const closeDb = async () => {
  await pool.end();
};
