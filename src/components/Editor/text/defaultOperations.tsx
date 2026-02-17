/**
 * @file Default operations for TextEditor SelectionToolbar
 *
 * Provides default inline formatting operations with icons and labels.
 * These can be used directly with SelectionToolbar.
 */

import type { ReactNode } from "react";
import type { SelectionToolbarOperation } from "../../SelectionToolbar/types";

// =============================================================================
// Icons (Simple SVG icons)
// =============================================================================

const BoldIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const UnderlineIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

const StrikethroughIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9" />
    <path d="M4 12h16" />
    <path d="M17.3 12c1.1.4 2.9 1.8 2.9 4 0 2.4-1.6 3.6-3.8 3.9-2.6.4-4.9-.2-6.4-.9" />
  </svg>
);

const CodeIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

// =============================================================================
// Platform Detection
// =============================================================================

/**
 * Detect if running on macOS for keyboard shortcut display.
 */
function isMac(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/**
 * Get the modifier key symbol for the current platform.
 */
function getModifierKey(): string {
  return isMac() ? "\u2318" : "Ctrl+";
}

// =============================================================================
// Default Operations
// =============================================================================

/**
 * Operation definition with icon factory.
 */
type OperationDefinition = {
  readonly id: string;
  readonly label: string;
  readonly icon: ReactNode;
  readonly shortcutKey: string;
};

const operationDefinitions: readonly OperationDefinition[] = [
  { id: "bold", label: "Bold", icon: <BoldIcon />, shortcutKey: "B" },
  { id: "italic", label: "Italic", icon: <ItalicIcon />, shortcutKey: "I" },
  { id: "underline", label: "Underline", icon: <UnderlineIcon />, shortcutKey: "U" },
  { id: "strikethrough", label: "Strikethrough", icon: <StrikethroughIcon />, shortcutKey: "S" },
  { id: "code", label: "Code", icon: <CodeIcon />, shortcutKey: "E" },
];

/**
 * Create operations with active states based on applied tags.
 *
 * @param activeTags - Tags currently applied to the selection
 * @returns Operations with active states set
 */
export function createInlineOperations(
  activeTags: readonly string[] = [],
): readonly SelectionToolbarOperation[] {
  const mod = getModifierKey();

  return operationDefinitions.map((def) => ({
    id: def.id,
    label: def.label,
    icon: def.icon,
    shortcut: `${mod}${def.shortcutKey}`,
    active: activeTags.includes(def.id),
  }));
}

/**
 * Default inline operations without active states.
 * Use createInlineOperations() for dynamic active states.
 */
export const defaultInlineOperations: readonly SelectionToolbarOperation[] =
  createInlineOperations([]);
