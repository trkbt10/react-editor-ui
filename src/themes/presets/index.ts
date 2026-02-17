/**
 * @file Theme presets index
 */

export { lightTheme, lightColorTokens } from "./light";
export { darkTheme, darkColorTokens } from "./dark";
export { highContrastLightTheme } from "./high-contrast-light";

// Re-export for convenience
import { lightTheme } from "./light";
import { darkTheme } from "./dark";
import { highContrastLightTheme } from "./high-contrast-light";

/**
 * All available themes
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  "high-contrast-light": highContrastLightTheme,
} as const;

export type ThemeName = keyof typeof themes;
