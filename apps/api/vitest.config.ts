import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: [path.resolve(__dirname, "tsconfig.json")],
    }),
  ],
  resolve: {
    alias: {
      // Direct Vitest to the source code of the library
      "@ivyi/lib": path.resolve(__dirname, "../../packages/lib/src/index.ts"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["./src/tests/tests.unit.setup.ts"],
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "src/**/*.controller.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/db/migrations/", "dist/"],
    },
  },
});
