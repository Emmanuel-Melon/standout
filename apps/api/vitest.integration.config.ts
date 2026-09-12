import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] }),
  ],
  test: {
    name: "integration",
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/tests.integration.setup.ts"],
    include: ["src/**/*.controller.test.ts"],
    hookTimeout: 30000,
  },
});
