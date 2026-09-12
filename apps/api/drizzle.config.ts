import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { dbConfig } from "./src/config";

export default defineConfig({
  out: "./drizzle",
  schema: [
    "./src/feature/**/*.schema.ts",
    "./src/workflows/**/*.schema.ts",
    "./src/workflows/**/*.enums.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: dbConfig.postgres.url,
  },
});
