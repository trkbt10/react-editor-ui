/**
 * @file Placeholder - Barrel exports are prohibited
 *
 * This file intentionally exports nothing.
 *
 * WHY THIS FILE EXISTS:
 * - Prevents accidental recreation of barrel exports
 * - Documents the architectural decision
 *
 * WHY BARREL EXPORTS ARE PROHIBITED:
 * - Barrel files become "broken windows" that accumulate re-exports
 * - Re-export chains harm tree-shaking effectiveness
 * - Makes dependency graphs harder to analyze
 *
 * HOW TO IMPORT:
 * - Import directly from individual component modules
 * - Example: import { Button } from "./components/Button/Button"
 * - NOT: import { Button } from "./components"
 *
 * See: eslint/plugins/custom/rules/no-barrel-import.js
 */

// Intentionally empty - do not add exports here
export {};
