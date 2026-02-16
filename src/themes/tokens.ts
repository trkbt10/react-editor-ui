/**
 * @file Theme token definitions
 *
 * Each theme defines values for all CSS variables.
 * These are injected via ThemeProvider.
 */

/**
 * Base tokens - theme-independent structural values
 */
export type BaseTokens = {
  // Spacing
  "space-xs": string;
  "space-sm": string;
  "space-md": string;
  "space-lg": string;
  "space-xl": string;
  "space-2xl": string;

  // Font sizes
  "size-font-xs": string;
  "size-font-sm": string;
  "size-font-md": string;
  "size-font-lg": string;

  // Icon sizes
  "size-icon-sm": string;
  "size-icon-md": string;
  "size-icon-lg": string;
  "size-icon-xl": string;

  // Component heights
  "size-height-sm": string;
  "size-height-md": string;
  "size-height-lg": string;
  "size-height-xl": string;

  // Border radius
  "radius-sm": string;
  "radius-md": string;
  "radius-lg": string;
  "radius-full": string;

  // Z-index
  "z-dropdown": string;
  "z-sticky": string;
  "z-modal": string;
  "z-popover": string;
  "z-tooltip": string;

  // Transitions - Duration
  "duration-fast": string;
  "duration-normal": string;
  "duration-slow": string;

  // Transitions - Easing
  "easing-default": string;
  "easing-in": string;
  "easing-out": string;

  // Component-specific sizes
  "size-toolbar-height": string;
  "size-tabbar-height": string;
  "size-statusbar-height": string;
  "size-panel-header-height": string;
  "size-tree-indent": string;
  "size-property-label": string;
  "size-checkbox-sm": string;
  "size-checkbox-md": string;
  "size-color-swatch-sm": string;
  "size-color-swatch-md": string;
  "size-color-swatch-lg": string;
  "size-divider-width": string;
  "canvas-ruler-size": string;
};

/**
 * Color tokens - theme-dependent values
 */
export type ColorTokens = {
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

  // Colors - Error states
  "color-error-bg": string;
  "color-error-bg-hover": string;
  "color-error-bg-active": string;
  "color-error-border": string;
  "color-error-border-hover": string;

  // Colors - Backdrop
  "color-backdrop": string;

  // Colors - Interactive States
  "color-hover": string;
  "color-active": string;
  "color-selected": string;
  "color-selected-subtle": string;
  "color-drop-target": string;
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

  // Colors - Tooltip
  "tooltip-bg": string;
  "tooltip-color": string;

  // Colors - Canvas
  "canvas-ruler-bg": string;
  "canvas-ruler-text": string;
  "canvas-ruler-tick": string;
  "canvas-ruler-indicator": string;
  "canvas-grid-major": string;
  "canvas-grid-minor": string;
  "canvas-grid-origin": string;
  "canvas-guide": string;
  "canvas-checker-light": string;
  "canvas-checker-dark": string;

  // Shadows
  "shadow-sm": string;
  "shadow-md": string;
  "shadow-lg": string;
};

export type ThemeTokens = BaseTokens & ColorTokens;

/**
 * Base tokens - shared across all themes
 */
export const baseTokens: BaseTokens = {
  // Spacing
  "space-xs": "2px",
  "space-sm": "4px",
  "space-md": "8px",
  "space-lg": "12px",
  "space-xl": "16px",
  "space-2xl": "24px",

  // Font sizes
  "size-font-xs": "9px",
  "size-font-sm": "11px",
  "size-font-md": "12px",
  "size-font-lg": "14px",

  // Icon sizes
  "size-icon-sm": "12px",
  "size-icon-md": "14px",
  "size-icon-lg": "18px",
  "size-icon-xl": "24px",

  // Component heights
  "size-height-sm": "22px",
  "size-height-md": "28px",
  "size-height-lg": "32px",
  "size-height-xl": "40px",

  // Border radius
  "radius-sm": "5px",
  "radius-md": "6px",
  "radius-lg": "10px",
  "radius-full": "9999px",

  // Z-index
  "z-dropdown": "1000",
  "z-sticky": "1100",
  "z-modal": "1200",
  "z-popover": "1300",
  "z-tooltip": "1400",

  // Transitions - Duration
  "duration-fast": "100ms",
  "duration-normal": "200ms",
  "duration-slow": "300ms",

  // Transitions - Easing
  "easing-default": "cubic-bezier(0.4, 0, 0.2, 1)",
  "easing-in": "cubic-bezier(0.4, 0, 1, 1)",
  "easing-out": "cubic-bezier(0, 0, 0.2, 1)",

  // Component-specific sizes
  "size-toolbar-height": "44px",
  "size-tabbar-height": "32px",
  "size-statusbar-height": "24px",
  "size-panel-header-height": "40px",
  "size-tree-indent": "16px",
  "size-property-label": "100px",
  "size-checkbox-sm": "12px",
  "size-checkbox-md": "14px",
  "size-color-swatch-sm": "14px",
  "size-color-swatch-md": "18px",
  "size-color-swatch-lg": "22px",
  "size-divider-width": "1px",
  "canvas-ruler-size": "20px",
};

/**
 * Light theme color tokens
 */
const lightColorTokens: ColorTokens = {
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

  // Error states
  "color-error-bg": "rgba(239, 68, 68, 0.1)",
  "color-error-bg-hover": "rgba(239, 68, 68, 0.15)",
  "color-error-bg-active": "rgba(239, 68, 68, 0.2)",
  "color-error-border": "rgba(239, 68, 68, 0.3)",
  "color-error-border-hover": "rgba(239, 68, 68, 0.4)",

  // Backdrop
  "color-backdrop": "rgba(0, 0, 0, 0.4)",

  // Interactive States
  "color-hover": "rgba(0, 0, 0, 0.04)",
  "color-active": "rgba(0, 0, 0, 0.08)",
  "color-selected": "rgba(37, 99, 235, 0.1)",
  "color-selected-subtle": "rgba(37, 99, 235, 0.05)",
  "color-drop-target": "rgba(37, 99, 235, 0.15)",
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

  // Tooltip
  "tooltip-bg": "#1f2937",
  "tooltip-color": "#ffffff",

  // Canvas
  "canvas-ruler-bg": "#f3f4f6",
  "canvas-ruler-text": "#6b7280",
  "canvas-ruler-tick": "#9ca3af",
  "canvas-ruler-indicator": "#dc2626",
  "canvas-grid-major": "rgba(0, 0, 0, 0.1)",
  "canvas-grid-minor": "rgba(0, 0, 0, 0.04)",
  "canvas-grid-origin": "rgba(37, 99, 235, 0.6)",
  "canvas-guide": "rgba(37, 99, 235, 0.8)",
  "canvas-checker-light": "#e5e7eb",
  "canvas-checker-dark": "#d1d5db",

  // Shadows
  "shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
  "shadow-md": "0 4px 6px rgba(0, 0, 0, 0.07)",
  "shadow-lg": "0 10px 15px rgba(0, 0, 0, 0.1)",
};

/**
 * Light theme (default)
 */
export const lightTheme: ThemeTokens = {
  ...baseTokens,
  ...lightColorTokens,
};

/**
 * Dark theme color tokens
 */
const darkColorTokens: ColorTokens = {
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

  // Error states
  "color-error-bg": "rgba(239, 68, 68, 0.15)",
  "color-error-bg-hover": "rgba(239, 68, 68, 0.2)",
  "color-error-bg-active": "rgba(239, 68, 68, 0.25)",
  "color-error-border": "rgba(239, 68, 68, 0.4)",
  "color-error-border-hover": "rgba(239, 68, 68, 0.5)",

  // Backdrop
  "color-backdrop": "rgba(0, 0, 0, 0.6)",

  // Interactive States
  "color-hover": "rgba(255, 255, 255, 0.08)",
  "color-active": "rgba(255, 255, 255, 0.12)",
  "color-selected": "rgba(59, 130, 246, 0.2)",
  "color-selected-subtle": "rgba(59, 130, 246, 0.1)",
  "color-drop-target": "rgba(59, 130, 246, 0.25)",
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

  // Tooltip
  "tooltip-bg": "#374151",
  "tooltip-color": "#ffffff",

  // Canvas
  "canvas-ruler-bg": "#1a1a1a",
  "canvas-ruler-text": "#6b7280",
  "canvas-ruler-tick": "#4b5563",
  "canvas-ruler-indicator": "#ef4444",
  "canvas-grid-major": "rgba(255, 255, 255, 0.08)",
  "canvas-grid-minor": "rgba(255, 255, 255, 0.03)",
  "canvas-grid-origin": "rgba(59, 130, 246, 0.5)",
  "canvas-guide": "rgba(59, 130, 246, 0.7)",
  "canvas-checker-light": "#2a2a2a",
  "canvas-checker-dark": "#1f1f1f",

  // Shadows
  "shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.3)",
  "shadow-md": "0 4px 8px rgba(0, 0, 0, 0.4)",
  "shadow-lg": "0 8px 24px rgba(0, 0, 0, 0.5)",
};

/**
 * Dark theme
 */
export const darkTheme: ThemeTokens = {
  ...baseTokens,
  ...darkColorTokens,
};

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

/**
 * All available themes
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  "high-contrast-light": highContrastLightTheme,
} as const;

export type ThemeName = keyof typeof themes;
