/**
 * @file Theme injection utilities
 *
 * Injects theme tokens as CSS variables into the document.
 * This approach uses a <style> element instead of inline styles.
 */

import { themes, type ThemeName, type ThemeTokens } from "./tokens";
import { CSS_VAR_PREFIX } from "../constants/styles";

const STYLE_ID = "rei-theme-vars";

function buildCssText(themeTokens: ThemeTokens, selector: string = ":root"): string {
  const lines: string[] = [];
  lines.push(`${selector} {`);

  for (const [key, value] of Object.entries(themeTokens)) {
    lines.push(`  --${CSS_VAR_PREFIX}-${key}: ${value};`);
  }

  lines.push("}");
  return lines.join("\n");
}

function getOrCreateStyleElement(): HTMLStyleElement {
  const existing = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (existing) {
    return existing;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  document.head.appendChild(style);
  return style;
}

/**
 * Inject theme CSS variables into the document
 *
 * @param theme - Theme name or custom tokens
 * @param selector - CSS selector to scope the theme (default: ":root")
 *
 * @example
 * // Apply dark theme globally
 * injectTheme("dark");
 *
 * @example
 * // Apply light theme to a specific container
 * injectTheme("light", ".my-container");
 *
 * @example
 * // Apply custom tokens
 * injectTheme({ "color-primary": "#ff0000" });
 */
export function injectTheme(
  theme: ThemeName | Partial<ThemeTokens>,
  selector: string = ":root",
): void {
  const tokens: ThemeTokens =
    typeof theme === "string" ? themes[theme] : { ...themes.light, ...theme };

  const style = getOrCreateStyleElement();
  style.textContent = buildCssText(tokens, selector);
}

/**
 * Remove injected theme styles
 */
export function clearTheme(): void {
  const style = document.getElementById(STYLE_ID);
  if (style) {
    style.remove();
  }
}

/**
 * Get CSS text for a theme (for SSR or manual injection)
 *
 * @param theme - Theme name or custom tokens
 * @param selector - CSS selector (default: ":root")
 * @returns CSS text string
 *
 * @example
 * const css = getThemeCss("dark");
 * // Returns: ":root { --rei-color-surface: #1e1f24; ... }"
 */
export function getThemeCss(
  theme: ThemeName | Partial<ThemeTokens>,
  selector: string = ":root",
): string {
  const tokens: ThemeTokens =
    typeof theme === "string" ? themes[theme] : { ...themes.light, ...theme };

  return buildCssText(tokens, selector);
}
