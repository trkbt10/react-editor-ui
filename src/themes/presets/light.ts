/**
 * @file Light theme preset
 */

import type { ColorTokens, ThemeTokens } from "../tokens";
import { baseTokens } from "../tokens";

/**
 * Light theme color tokens
 */
export const lightColorTokens: ColorTokens = {
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
  "color-text-on-emphasis": "#ffffff",
  "color-text-on-warning": "#000000",

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
  "shadow-thumb": "0 1px 2px rgba(0, 0, 0, 0.2)",

  // Bounding Box
  "bounding-box-stroke": "#18a0fb",
  "bounding-box-handle-fill": "#ffffff",
  "bounding-box-handle-stroke": "#18a0fb",
  "bounding-box-label-bg": "#18a0fb",
  "bounding-box-label-text": "#ffffff",

  // Box Model Editor
  "box-model-margin-bg": "rgba(251, 191, 36, 0.2)",
  "box-model-margin-stroke": "rgba(251, 191, 36, 0.6)",
  "box-model-border-bg": "rgba(148, 163, 184, 0.2)",
  "box-model-border-stroke": "rgba(148, 163, 184, 0.6)",
  "box-model-padding-bg": "rgba(34, 197, 94, 0.2)",
  "box-model-padding-stroke": "rgba(34, 197, 94, 0.6)",
  "box-model-content-bg": "rgba(59, 130, 246, 0.15)",
  "box-model-content-stroke": "rgba(59, 130, 246, 0.5)",
  "box-model-border": "#9ca3af",
  "box-model-handle": "#6b7280",
  "box-model-handle-hover": "#2563eb",
};

/**
 * Light theme (default)
 */
export const lightTheme: ThemeTokens = {
  ...baseTokens,
  ...lightColorTokens,
};
