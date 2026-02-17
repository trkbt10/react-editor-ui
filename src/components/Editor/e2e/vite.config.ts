/**
 * @file Vite configuration for Editor E2E environment
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { E2E_PORT } from "./config";

export default defineConfig({
  plugins: [react()],
  root: "src/components/Editor/e2e",
  server: {
    port: E2E_PORT,
    strictPort: false,
  },
});
