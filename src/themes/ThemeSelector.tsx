/**
 * @file ThemeSelector component
 *
 * A dropdown to select and apply themes via CSS injection.
 */

import { useEffect } from "react";
import { Select } from "../components/Select/Select";
import { themes, type ThemeName } from "./tokens";
import { injectTheme } from "./injectTheme";

export type ThemeSelectorProps = {
  /**
   * Current theme value
   */
  value: ThemeName;
  /**
   * Called when theme changes
   */
  onChange: (theme: ThemeName) => void;
  /**
   * CSS selector to scope the theme (default: ":root")
   */
  selector?: string;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
  /**
   * Additional className
   */
  className?: string;
  /**
   * Accessible label
   */
  "aria-label"?: string;
};

const themeOptions: Array<{ value: ThemeName; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "high-contrast-light", label: "High Contrast" },
];

/** Dropdown for switching between light, dark, and high-contrast themes */
export function ThemeSelector({
  value,
  onChange,
  selector = ":root",
  size = "sm",
  className,
  "aria-label": ariaLabel = "Select theme",
}: ThemeSelectorProps) {
  useEffect(() => {
    injectTheme(value, selector);
  }, [value, selector]);

  return (
    <Select
      options={themeOptions}
      value={value}
      onChange={onChange}
      size={size}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

/**
 * Get all available theme names
 */
export function getThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}
