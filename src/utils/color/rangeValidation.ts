/**
 * @file Numeric range validation utilities for percentage inputs
 */

export type PercentageValidationResult = {
  isValid: boolean;
  parsed: number | null;
};

/**
 * Parse and validate percentage input (0-100)
 * Returns parsed value if valid, null otherwise
 */
export function parsePercentageInput(value: string): PercentageValidationResult {
  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return { isValid: false, parsed: null };
  }

  return { isValid: true, parsed };
}

/**
 * Validate percentage on blur - returns corrected string value
 * @param inputValue - Current input string value
 * @param fallbackValue - Value to return if invalid
 */
export function validatePercentageOnBlur(
  inputValue: string,
  fallbackValue: number,
): string {
  const result = parsePercentageInput(inputValue);

  if (!result.isValid) {
    return String(fallbackValue);
  }

  return String(result.parsed);
}
