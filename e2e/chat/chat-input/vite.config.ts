/**
 * @file Vite configuration for ChatInput E2E environment
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { E2E_PORT } from "./config";

export default defineConfig({
  plugins: [react()],
  root: "e2e/chat/chat-input",
  server: {
    port: E2E_PORT,
    strictPort: false,
  },
});
