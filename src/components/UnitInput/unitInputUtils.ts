/**
 * @file Pure utility functions for UnitInput
 *
 * These functions handle parsing, formatting, and validation of unit values.
 */

export type UnitOption = {
  value: string;
  label: string;
};

export type ParsedValue = {
  num: number | null;
  unit: string;
  isAuto: boolean;
};

/**
 * Parse a value string into its numeric and unit components.
 *
 * @example
 * parseValue("10px", "px") // { num: 10, unit: "px", isAuto: false }
 * parseValue("auto", "px") // { num: null, unit: "", isAuto: true }
 * parseValue("50%", "px")  // { num: 50, unit: "%", isAuto: false }
 */
export function parseValue(value: string, defaultUnit: string): ParsedValue {
  const trimmed = value.trim().toLowerCase();

  if (trimmed === "auto") {
    return { num: null, unit: "", isAuto: true };
  }

  const match = trimmed.match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[2] || defaultUnit;
    return { num: isNaN(num) ? null : num, unit, isAuto: false };
  }

  return { num: null, unit: defaultUnit, isAuto: false };
}

/**
 * Format a number for display.
 * Integers are shown without decimals, floats are shown with up to 2 decimal places.
 *
 * @example
 * formatNumber(10)     // "10"
 * formatNumber(10.5)   // "10.5"
 * formatNumber(10.567) // "10.57"
 */
export function formatNumber(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Format a complete value string with number and unit.
 *
 * @example
 * formatFullValue(10, "px", false) // "10px"
 * formatFullValue(null, "px", true) // "Auto"
 * formatFullValue(null, "px", false) // ""
 */
export function formatFullValue(num: number | null, unit: string, isAuto: boolean): string {
  if (isAuto) {
    return "Auto";
  }
  if (num === null) {
    return "";
  }
  return `${formatNumber(num)}${unit}`;
}

/**
 * Get the display value (number only, no unit) from a parsed value.
 *
 * @example
 * getDisplayValue({ num: 10, unit: "px", isAuto: false }) // "10"
 * getDisplayValue({ num: null, unit: "", isAuto: true })  // "Auto"
 */
export function getDisplayValue(parsed: ParsedValue): string {
  if (parsed.isAuto) {
    return "Auto";
  }
  if (parsed.num !== null) {
    return formatNumber(parsed.num);
  }
  return "";
}

/**
 * Clamp a value between min and max bounds.
 *
 * @example
 * clampValue(5, 0, 10)   // 5
 * clampValue(-5, 0, 10)  // 0
 * clampValue(15, 0, 10)  // 10
 */
export function clampValue(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) {
    return min;
  }
  if (max !== undefined && value > max) {
    return max;
  }
  return value;
}

/**
 * Find the index of a unit in the units array (case-insensitive).
 * Returns 0 if not found.
 *
 * @example
 * findUnitIndex([{value: "px"}, {value: "%"}], "px") // 0
 * findUnitIndex([{value: "px"}, {value: "%"}], "%")  // 1
 * findUnitIndex([{value: "px"}, {value: "%"}], "em") // 0 (default)
 */
export function findUnitIndex(units: UnitOption[], currentUnit: string): number {
  const index = units.findIndex((u) => u.value.toLowerCase() === currentUnit.toLowerCase());
  return index >= 0 ? index : 0;
}
