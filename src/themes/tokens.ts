/**
 * @file Theme token definitions
 *
 * Each theme defines values for all CSS variables.
 * These are injected via ThemeProvider.
 */

export type ThemeTokens = {
  // Colors - Primary
  "color-primary": string;
  "color-primary-hover": string;
  "color-primary-active": string;

  // Colors - Surface
  "color-surface": string;
  "color-surface-raised": string;
  "color-surface-overlay": string;

  // Colors - Text
  "color-text": string;
  "color-text-muted": string;
  "color-text-disabled": string;

  // Colors - Border
  "color-border": string;
  "color-border-focus": string;

  // Colors - State
  "color-success": string;
  "color-warning": string;
  "color-error": string;

  // Colors - Backdrop
  "color-backdrop": string;

  // Colors - Interactive States
  "color-hover": string;
  "color-active": string;
  "color-selected": string;
  "color-focus-ring": string;

  // Colors - Icon
  "color-icon": string;
  "color-icon-hover": string;
  "color-icon-active": string;

  // Colors - Divider
  "color-divider": string;

  // Colors - Input
  "color-input-bg": string;
  "color-input-border": string;
  "color-input-border-focus": string;

  // Colors - Log Levels
  "color-log-info": string;
  "color-log-warning": string;
  "color-log-error": string;
  "color-log-debug": string;
  "color-log-success": string;

  // Shadows
  "shadow-sm": string;
  "shadow-md": string;
  "shadow-lg": string;
};

/**
 * Light theme (default)
 */
export const lightTheme: ThemeTokens = {
  // Primary
  "color-primary": "#2563eb",
  "color-primary-hover": "#1d4ed8",
  "color-primary-active": "#1e40af",

  // Surface
  "color-surface": "#ffffff",
  "color-surface-raised": "#f9fafb",
  "color-surface-overlay": "#f3f4f6",

  // Text
  "color-text": "#111827",
  "color-text-muted": "#6b7280",
  "color-text-disabled": "#9ca3af",

  // Border
  "color-border": "#e5e7eb",
  "color-border-focus": "#2563eb",

  // State
  "color-success": "#16a34a",
  "color-warning": "#d97706",
  "color-error": "#dc2626",

  // Backdrop
  "color-backdrop": "rgba(0, 0, 0, 0.4)",

  // Interactive States
  "color-hover": "rgba(0, 0, 0, 0.04)",
  "color-active": "rgba(0, 0, 0, 0.08)",
  "color-selected": "rgba(37, 99, 235, 0.1)",
  "color-focus-ring": "rgba(37, 99, 235, 0.4)",

  // Icon
  "color-icon": "#6b7280",
  "color-icon-hover": "#374151",
  "color-icon-active": "#2563eb",

  // Divider
  "color-divider": "#e5e7eb",

  // Input
  "color-input-bg": "#ffffff",
  "color-input-border": "#d1d5db",
  "color-input-border-focus": "#2563eb",

  // Log Levels
  "color-log-info": "#6b7280",
  "color-log-warning": "#d97706",
  "color-log-error": "#dc2626",
  "color-log-debug": "#7c3aed",
  "color-log-success": "#16a34a",

  // Shadows
  "shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
  "shadow-md": "0 4px 6px rgba(0, 0, 0, 0.07)",
  "shadow-lg": "0 10px 15px rgba(0, 0, 0, 0.1)",
};

/**
 * Dark theme
 */
export const darkTheme: ThemeTokens = {
  // Primary
  "color-primary": "#3b82f6",
  "color-primary-hover": "#2563eb",
  "color-primary-active": "#1d4ed8",

  // Surface
  "color-surface": "#1e1f24",
  "color-surface-raised": "#2b2d35",
  "color-surface-overlay": "#3a3d47",

  // Text
  "color-text": "#e4e6eb",
  "color-text-muted": "#9ca3af",
  "color-text-disabled": "#6b7280",

  // Border
  "color-border": "rgba(255, 255, 255, 0.1)",
  "color-border-focus": "#3b82f6",

  // State
  "color-success": "#22c55e",
  "color-warning": "#f59e0b",
  "color-error": "#ef4444",

  // Backdrop
  "color-backdrop": "rgba(0, 0, 0, 0.6)",

  // Interactive States
  "color-hover": "rgba(255, 255, 255, 0.08)",
  "color-active": "rgba(255, 255, 255, 0.12)",
  "color-selected": "rgba(59, 130, 246, 0.2)",
  "color-focus-ring": "rgba(59, 130, 246, 0.5)",

  // Icon
  "color-icon": "#9ca3af",
  "color-icon-hover": "#e4e6eb",
  "color-icon-active": "#3b82f6",

  // Divider
  "color-divider": "rgba(255, 255, 255, 0.1)",

  // Input
  "color-input-bg": "rgba(0, 0, 0, 0.2)",
  "color-input-border": "rgba(255, 255, 255, 0.1)",
  "color-input-border-focus": "#3b82f6",

  // Log Levels
  "color-log-info": "#9ca3af",
  "color-log-warning": "#f59e0b",
  "color-log-error": "#ef4444",
  "color-log-debug": "#8b5cf6",
  "color-log-success": "#22c55e",

  // Shadows
  "shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.3)",
  "shadow-md": "0 4px 8px rgba(0, 0, 0, 0.4)",
  "shadow-lg": "0 8px 24px rgba(0, 0, 0, 0.5)",
};

/**
 * High contrast light theme
 */
export const highContrastLightTheme: ThemeTokens = {
  ...lightTheme,
  "color-text": "#000000",
  "color-text-muted": "#374151",
  "color-border": "#000000",
  "color-divider": "#000000",
};

/**
 * All available themes
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  "high-contrast-light": highContrastLightTheme,
} as const;

export type ThemeName = keyof typeof themes;
