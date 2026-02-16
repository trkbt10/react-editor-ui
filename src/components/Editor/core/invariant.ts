/**
 * @file Invariant assertion utilities
 *
 * Provides strict assertion functions that throw errors instead of silently
 * falling back. This helps catch bugs early in development.
 */

/**
 * Assert that a condition is true, throwing an error if not.
 *
 * Unlike optional chaining or nullish coalescing, this function makes
 * failures explicit and traceable.
 *
 * @param condition - The condition to check
 * @param message - Error message if condition is false
 * @throws Error if condition is false
 */
export function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(`[Editor] Invariant violation: ${message}`);
  }
}

/**
 * Assert that a value is defined (not null or undefined).
 *
 * @param value - The value to check
 * @param name - Name of the value for error message
 * @returns The value, guaranteed to be defined
 * @throws Error if value is null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  name: string
): T {
  if (value === null || value === undefined) {
    throw new Error(`[Editor] ${name} is required but was ${value}`);
  }
  return value;
}

/**
 * Assert that a measurement element is available.
 * This is a common assertion in font metrics and text measurement.
 *
 * @param element - The measurement element
 * @param context - Context description for error message
 * @returns The element, guaranteed to be defined
 */
export function assertMeasureElement(
  element: HTMLElement | null,
  context: string
): HTMLElement {
  if (!element) {
    throw new Error(
      `[Editor] Measurement element not available in ${context}. ` +
      `Ensure the component is mounted and containerRef is set.`
    );
  }
  return element;
}

/**
 * Assert that measureText function is provided.
 *
 * @param measureText - The measureText function
 * @param context - Context description for error message
 * @returns The function, guaranteed to be defined
 */
export function assertMeasureText(
  measureText: ((text: string) => number) | undefined,
  context: string
): (text: string) => number {
  if (!measureText) {
    throw new Error(
      `[Editor] measureText function not provided in ${context}. ` +
      `Ensure useFontMetrics hook is initialized and measureText is passed to the renderer.`
    );
  }
  return measureText;
}
