import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        test: {
          // Fast, deterministic, offline — runs on every push and PR.
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          // Live calls against a running server (and optionally the Gemini
          // API). Opt-in: only runs when RUN_GEMINI_INTEGRATION=1 is set,
          // so day-to-day CI stays offline and free.
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
