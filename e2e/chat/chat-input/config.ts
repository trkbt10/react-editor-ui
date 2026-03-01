/**
 * @file ChatInput E2E shared configuration
 *
 * Port can be overridden via E2E_CHAT_PORT environment variable.
 */

export const E2E_PORT = Number(process.env.E2E_CHAT_PORT) || 19728;
export const BASE_URL = `http://localhost:${E2E_PORT}`;
