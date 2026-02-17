/**
 * @file Editor E2E shared configuration
 *
 * This file is shared between vite.config.ts and playwright.config.ts.
 * Port can be overridden via E2E_EDITOR_PORT environment variable.
 */

export const E2E_PORT = Number(process.env.E2E_EDITOR_PORT) || 19720;
export const BASE_URL = `http://localhost:${E2E_PORT}`;
