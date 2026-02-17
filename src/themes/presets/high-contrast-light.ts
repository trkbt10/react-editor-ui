/**
 * @file High contrast light theme preset
 */

import type { ThemeTokens } from "../tokens";
import { baseTokens } from "../tokens";
import { lightColorTokens } from "./light";

/**
 * High contrast light theme
 */
export const highContrastLightTheme: ThemeTokens = {
  ...baseTokens,
  ...lightColorTokens,
  "color-text": "#000000",
  "color-text-muted": "#374151",
  "color-border": "#000000",
  "color-divider": "#000000",
};
