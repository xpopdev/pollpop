import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["app/**/*.test.ts", "lib/**/*.test.ts", "**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e/**", "playwright.config.ts"],
    setupFiles: [],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
