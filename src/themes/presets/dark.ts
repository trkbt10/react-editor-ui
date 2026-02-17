/**
 * @file Dark theme preset
 */

import type { ColorTokens, ThemeTokens } from "../tokens";
import { baseTokens } from "../tokens";

/**
 * Dark theme color tokens
 */
export const darkColorTokens: ColorTokens = {
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
