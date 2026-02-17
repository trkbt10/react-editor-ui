/**
 * @file LibraryBrowser E2E shared configuration
 *
 * Port can be overridden via E2E_LIBRARY_BROWSER_PORT environment variable.
 */

export const E2E_PORT = Number(process.env.E2E_LIBRARY_BROWSER_PORT) || 19724;
export const BASE_URL = `http://localhost:${E2E_PORT}`;
