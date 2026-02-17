/**
 * @file CSS variable utility
 *
 * Generates CSS variable references with type-safe token names.
 * Uses lightTheme values as fallbacks for when no theme is injected.
 */

import type { ThemeTokens } from "./tokens";
import { lightTheme } from "./presets";

/**
 * CSS variable prefix for all react-editor-ui variables
 */
export const CSS_VAR_PREFIX = "rei";

/**
 * Generate a CSS variable reference with fallback
 *
 * @param token - Token name from ThemeTokens
 * @returns CSS variable string like `var(--rei-color-primary, #2563eb)`
 *
 * @example
 * cssVar("color-primary") // "var(--rei-color-primary, #2563eb)"
 * cssVar("space-md")      // "var(--rei-space-md, 8px)"
 */
export function cssVar<K extends keyof ThemeTokens>(token: K): string {
  const fallback = lightTheme[token];
  return `var(--${CSS_VAR_PREFIX}-${token}, ${fallback})`;
}
