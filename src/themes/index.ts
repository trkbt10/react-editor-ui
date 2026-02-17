/**
 * @file Theme exports
 */

// Token types and base tokens
export { baseTokens } from "./tokens";
export type { ThemeTokens, BaseTokens, ColorTokens } from "./tokens";

// Theme presets
export {
  themes,
  lightTheme,
  darkTheme,
  highContrastLightTheme,
  lightColorTokens,
  darkColorTokens,
} from "./presets";
export type { ThemeName } from "./presets";

// CSS injection utilities
export { injectTheme, clearTheme, getThemeCss } from "./injectTheme";

// CSS variable utility
export { cssVar, CSS_VAR_PREFIX } from "./cssVar";

// Theme selector component
export { ThemeSelector, getThemeNames } from "./ThemeSelector";
export type { ThemeSelectorProps } from "./ThemeSelector";
