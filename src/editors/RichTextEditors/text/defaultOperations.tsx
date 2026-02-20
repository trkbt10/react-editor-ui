/**
 * @file Default operations for TextEditor SelectionToolbar
 *
 * Provides default inline formatting operations with icons and labels.
 * These can be used directly with SelectionToolbar.
 * Supports configurable operation sets via enabledOperations.
 */

import type { ReactNode } from "react";
import type { SelectionToolbarOperation } from "../../../components/SelectionToolbar/types";

// =============================================================================
// Types
// =============================================================================

/**
 * Operation type determines how the operation is handled:
 * - "toggle": Toggles a style tag on/off (e.g., bold, italic)
 * - "color": Opens a color picker (requires special handling)
 * - "block": Block-level operation (e.g., heading, list)
 */
export type OperationType = "toggle" | "color" | "block";

/**
 * Extended operation definition with type information.
 */
export type OperationDefinition = {
  readonly id: string;
  readonly label: string;
  readonly icon: ReactNode;
  readonly shortcutKey?: string;
  readonly type: OperationType;
};

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

const TextColorIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 20L12 4L19 20" />
    <path d="M8 14H16" />
    <rect x="4" y="21" width="16" height="2" fill="currentColor" stroke="none" />
  </svg>
);

// Block-level operation icons
const Heading1Icon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6v12" />
    <path d="M14 6v12" />
    <path d="M4 12h10" />
    <path d="M20 18v-8l-2 2" />
  </svg>
);

const Heading2Icon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6v12" />
    <path d="M12 6v12" />
    <path d="M4 12h8" />
    <path d="M18 10c1.5 0 2 .5 2 2s-1.5 2-2 2c-1 0-2 1-2 2h4" />
  </svg>
);

const Heading3Icon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6v12" />
    <path d="M12 6v12" />
    <path d="M4 12h8" />
    <path d="M17.5 10c1.5 0 2.5.5 2.5 1.5s-1 1.5-2.5 1.5" />
    <path d="M17.5 13c1.5 0 2.5.5 2.5 1.5s-1 1.5-2.5 1.5" />
  </svg>
);

const BulletListIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="5" cy="6" r="1.5" fill="currentColor" />
    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="5" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

const NumberedListIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="10" y1="18" x2="20" y2="18" />
    <text x="3" y="8" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">1</text>
    <text x="3" y="14" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">2</text>
    <text x="3" y="20" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">3</text>
  </svg>
);

const BlockquoteIcon = (): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16" />
    <path d="M4 10h16" />
    <path d="M4 14h16" />
    <path d="M4 18h16" />
    <rect x="2" y="5" width="2" height="14" fill="currentColor" stroke="none" rx="1" />
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
// Operation Definitions
// =============================================================================

/**
 * All available inline operation definitions.
 * Use `createConfiguredOperations` to filter by enabled IDs.
 */
export const inlineOperationDefinitions: readonly OperationDefinition[] = [
  { id: "bold", label: "Bold", icon: <BoldIcon />, shortcutKey: "B", type: "toggle" },
  { id: "italic", label: "Italic", icon: <ItalicIcon />, shortcutKey: "I", type: "toggle" },
  { id: "underline", label: "Underline", icon: <UnderlineIcon />, shortcutKey: "U", type: "toggle" },
  { id: "strikethrough", label: "Strikethrough", icon: <StrikethroughIcon />, shortcutKey: "S", type: "toggle" },
  { id: "code", label: "Code", icon: <CodeIcon />, shortcutKey: "E", type: "toggle" },
  { id: "textColor", label: "Text Color", icon: <TextColorIcon />, type: "color" },
];

/**
 * Block-level operation definitions (Markdown-style).
 * These modify the block type rather than adding inline styles.
 */
export const blockOperationDefinitions: readonly OperationDefinition[] = [
  { id: "heading-1", label: "Heading 1", icon: <Heading1Icon />, type: "block" },
  { id: "heading-2", label: "Heading 2", icon: <Heading2Icon />, type: "block" },
  { id: "heading-3", label: "Heading 3", icon: <Heading3Icon />, type: "block" },
  { id: "bullet-list", label: "Bullet List", icon: <BulletListIcon />, type: "block" },
  { id: "numbered-list", label: "Numbered List", icon: <NumberedListIcon />, type: "block" },
  { id: "blockquote", label: "Quote", icon: <BlockquoteIcon />, type: "block" },
];

/**
 * All available operation definitions (inline + block).
 * Use `createConfiguredOperations` to filter by enabled IDs.
 */
export const allOperationDefinitions: readonly OperationDefinition[] = [
  ...inlineOperationDefinitions,
  ...blockOperationDefinitions,
];

/**
 * Default enabled operation IDs (toggle operations only).
 */
export const DEFAULT_ENABLED_OPERATIONS = ["bold", "italic", "underline"] as const;

/**
 * Map of operation ID to definition for quick lookup.
 */
export const operationDefinitionsMap = new Map(
  allOperationDefinitions.map((def) => [def.id, def]),
);

// Legacy support
const operationDefinitions = allOperationDefinitions.filter(
  (def) => def.type === "toggle",
);

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

// =============================================================================
// Configurable Operations
// =============================================================================

/**
 * Get operation definitions filtered by enabled IDs.
 *
 * @param enabledIds - Operation IDs to include (order is preserved)
 * @returns Filtered operation definitions
 */
export function getEnabledOperations(
  enabledIds: readonly string[],
): readonly OperationDefinition[] {
  return enabledIds
    .map((id) => operationDefinitionsMap.get(id))
    .filter((def): def is OperationDefinition => def !== undefined);
}

/**
 * Create SelectionToolbar operations from enabled IDs with active states.
 * Note: Color operations need special handling and are excluded from this output.
 *
 * @param enabledIds - Operation IDs to include
 * @param activeTags - Tags currently applied to the selection
 * @param activeBlockTypes - Block types currently active (optional)
 * @returns Operations for toggle and block type items
 */
export function createConfiguredOperations(
  enabledIds: readonly string[],
  activeTags: readonly string[] = [],
  activeBlockTypes: readonly string[] = [],
): readonly SelectionToolbarOperation[] {
  const mod = getModifierKey();
  const enabled = getEnabledOperations(enabledIds);

  return enabled
    .filter((def) => def.type === "toggle" || def.type === "block")
    .map((def) => ({
      id: def.id,
      label: def.label,
      icon: def.icon,
      shortcut: def.shortcutKey ? `${mod}${def.shortcutKey}` : undefined,
      // For toggle operations, check activeTags; for block operations, check activeBlockTypes
      active: def.type === "toggle"
        ? activeTags.includes(def.id)
        : activeBlockTypes.includes(def.id),
    }));
}

/**
 * Check if a color operation is enabled.
 */
export function hasColorOperation(enabledIds: readonly string[]): boolean {
  return enabledIds.some((id) => {
    const def = operationDefinitionsMap.get(id);
    return def?.type === "color";
  });
}
