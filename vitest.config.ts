/**
 * @file Vitest testing framework configuration
 *
 * This configuration sets up the Vitest test runner with React testing support.
 * It configures:
 * - Global test utilities availability
 * - jsdom environment for React component testing
 * - Test discovery and execution settings
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/demo/**"],
    },
  },
});
