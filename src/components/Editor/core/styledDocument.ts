/**
 * @file Styled Document Types and Utilities
 *
 * Tree-based decoration structure for rich text editing.
 * Supports both rich text (nested decorations) and syntax highlighting + overlays.
 *
 * @example Rich text (nested decorations)
 * ```
 * <bold>Hello <italic>world</italic></bold>
 * ```
 *
 * @example Syntax highlighting + overlays
 * ```
 * content: <keyword>const</keyword> <variable>x</variable> = <number>1</number>
 * overlays: [
 *   { id: "lint", root: <warning range="0-5">...</warning> }
 *   { id: "spellcheck", root: <error range="10-15">...</error> }
 * ]
 * ```
 */

import type { TextStyle, TextStyleSegment } from "./types";

// =============================================================================
// Node Types
// =============================================================================

/**
 * A node in the styled document tree.
 */
export type StyledNode =
  | TextNode
  | StyledElement;

/**
 * Plain text node (leaf node in the tree).
 */
export type TextNode = {
  readonly type: "text";
  readonly content: string;
};

/**
 * Styled element node that can contain children.
 */
export type StyledElement = {
  readonly type: "element";
  /** Style identifier (e.g., "bold", "keyword", "lint-warning") */
  readonly tag: string;
  /** Child nodes */
  readonly children: readonly StyledNode[];
};

// =============================================================================
// Document Types
// =============================================================================

/**
 * Style definitions mapping tags to styles.
 */
export type StyleDefinitions = {
  readonly [tag: string]: TextStyle;
};

/**
 * Overlay layer for additional decorations (lint, spellcheck, etc.).
 */
export type OverlayLayer = {
  readonly id: string;
  /** Root node of this layer's decorations */
  readonly root: StyledNode;
  /** Priority for rendering order (higher = on top) */
  readonly priority: number;
};

/**
 * Complete styled document.
 */
export type StyledDocument = {
  /** Main content (text + base decorations) */
  readonly content: StyledNode;
  /** Overlay layers (lint, spellcheck, etc.) */
  readonly overlays: readonly OverlayLayer[];
  /** Tag to style mapping */
  readonly styles: StyleDefinitions;
  /** Total character count (cached) */
  readonly length: number;
};

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create an empty document.
 */
export function createEmptyDocument(): StyledDocument {
  return {
    content: { type: "text", content: "" },
    overlays: [],
    styles: {},
    length: 0,
  };
}

/**
 * Create a document from plain text.
 */
export function createDocument(
  text: string,
  styles?: StyleDefinitions
): StyledDocument {
  return {
    content: { type: "text", content: text },
    overlays: [],
    styles: styles ?? {},
    length: text.length,
  };
}

/**
 * Create a text node.
 */
export function text(content: string): TextNode {
  return { type: "text", content };
}

/**
 * Create a styled element node.
 */
export function element(tag: string, children: readonly StyledNode[]): StyledElement {
  return { type: "element", tag, children };
}

// =============================================================================
// Text Extraction
// =============================================================================

/**
 * Get plain text from a node tree.
 */
export function getPlainText(node: StyledNode): string {
  if (node.type === "text") {
    return node.content;
  }
  return node.children.map(getPlainText).join("");
}

/**
 * Get plain text from a document.
 */
export function getDocumentText(doc: StyledDocument): string {
  return getPlainText(doc.content);
}

/**
 * Get length of a node tree.
 */
export function getNodeLength(node: StyledNode): number {
  if (node.type === "text") {
    return node.content.length;
  }
  return node.children.reduce((sum, child) => sum + getNodeLength(child), 0);
}

// =============================================================================
// Tree Traversal
// =============================================================================

/**
 * Find the path to a node at a given offset.
 * Returns array of nodes from root to the containing node.
 */
export function getNodePathAtOffset(
  node: StyledNode,
  offset: number,
  path: StyledNode[] = []
): readonly StyledNode[] {
  path.push(node);

  if (node.type === "text") {
    return path;
  }

  let currentOffset = 0;
  for (const child of node.children) {
    const childLength = getNodeLength(child);
    if (offset < currentOffset + childLength) {
      return getNodePathAtOffset(child, offset - currentOffset, path);
    }
    currentOffset += childLength;
  }

  return path;
}

/**
 * Get all tags that apply at a given offset.
 */
export function getTagsAtOffset(
  doc: StyledDocument,
  offset: number
): readonly string[] {
  const path = getNodePathAtOffset(doc.content, offset);
  return path
    .filter((node): node is StyledElement => node.type === "element")
    .map((node) => node.tag);
}

// =============================================================================
// Edit Operations
// =============================================================================

/**
 * Split a text node at an offset.
 * Returns [before, after] text nodes.
 */
function splitTextNode(
  node: TextNode,
  offset: number
): [TextNode, TextNode] {
  return [
    { type: "text", content: node.content.slice(0, offset) },
    { type: "text", content: node.content.slice(offset) },
  ];
}

/**
 * Insert text into a node at a given offset.
 */
function insertTextIntoNode(
  node: StyledNode,
  offset: number,
  newText: string
): StyledNode {
  if (node.type === "text") {
    return {
      type: "text",
      content: node.content.slice(0, offset) + newText + node.content.slice(offset),
    };
  }

  // Find which child contains the offset
  let currentOffset = 0;
  const newChildren: StyledNode[] = [];
  let inserted = false;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childLength = getNodeLength(child);

    // Insert into the first child that contains the offset
    // Use strict less-than for the upper bound to avoid inserting at boundaries twice
    if (!inserted && offset >= currentOffset && offset < currentOffset + childLength) {
      newChildren.push(insertTextIntoNode(child, offset - currentOffset, newText));
      inserted = true;
    } else if (!inserted && offset === currentOffset + childLength && i === node.children.length - 1) {
      // Special case: inserting at the end of the last child
      newChildren.push(insertTextIntoNode(child, offset - currentOffset, newText));
      inserted = true;
    } else {
      newChildren.push(child);
    }
    currentOffset += childLength;
  }

  // If we haven't inserted yet, insert at the end
  if (!inserted) {
    if (newChildren.length === 0) {
      newChildren.push({ type: "text", content: newText });
    } else {
      // Insert at the beginning of the next logical position
      // or append a new text node
      newChildren.push({ type: "text", content: newText });
    }
  }

  return { ...node, children: newChildren };
}

/**
 * Insert text into a document at a given offset.
 */
export function insertText(
  doc: StyledDocument,
  offset: number,
  newText: string
): StyledDocument {
  if (newText.length === 0) {
    return doc;
  }

  const newContent = insertTextIntoNode(doc.content, offset, newText);
  return {
    ...doc,
    content: newContent,
    length: doc.length + newText.length,
  };
}

/**
 * Delete a range from a node.
 */
function deleteRangeFromNode(
  node: StyledNode,
  start: number,
  end: number
): StyledNode | null {
  if (node.type === "text") {
    const before = node.content.slice(0, start);
    const after = node.content.slice(end);
    const newContent = before + after;
    if (newContent.length === 0) {
      return null;
    }
    return { type: "text", content: newContent };
  }

  // Process children
  const newChildren: StyledNode[] = [];
  let currentOffset = 0;

  for (const child of node.children) {
    const childLength = getNodeLength(child);
    const childStart = currentOffset;
    const childEnd = currentOffset + childLength;

    if (end <= childStart || start >= childEnd) {
      // Child is completely outside delete range
      newChildren.push(child);
    } else if (start <= childStart && end >= childEnd) {
      // Child is completely inside delete range - remove it
      // Don't add to newChildren
    } else {
      // Child partially overlaps
      const deleteStart = Math.max(0, start - childStart);
      const deleteEnd = Math.min(childLength, end - childStart);
      const result = deleteRangeFromNode(child, deleteStart, deleteEnd);
      if (result) {
        newChildren.push(result);
      }
    }

    currentOffset = childEnd;
  }

  // Merge adjacent text nodes
  const mergedChildren = mergeAdjacentTextNodes(newChildren);

  if (mergedChildren.length === 0) {
    return null;
  }

  return { ...node, children: mergedChildren };
}

/**
 * Merge adjacent text nodes in an array.
 */
function mergeAdjacentTextNodes(nodes: StyledNode[]): StyledNode[] {
  const result: StyledNode[] = [];

  for (const node of nodes) {
    if (node.type === "text" && result.length > 0) {
      const last = result[result.length - 1];
      if (last.type === "text") {
        result[result.length - 1] = {
          type: "text",
          content: last.content + node.content,
        };
        continue;
      }
    }
    result.push(node);
  }

  return result;
}

/**
 * Delete a range from a document.
 */
export function deleteRange(
  doc: StyledDocument,
  start: number,
  end: number
): StyledDocument {
  if (start >= end || start < 0 || end > doc.length) {
    return doc;
  }

  const newContent = deleteRangeFromNode(doc.content, start, end);
  return {
    ...doc,
    content: newContent ?? { type: "text", content: "" },
    length: doc.length - (end - start),
  };
}

/**
 * Replace a range with new text.
 */
export function replaceRange(
  doc: StyledDocument,
  start: number,
  end: number,
  newText: string
): StyledDocument {
  // Delete then insert (could be optimized)
  const deleted = deleteRange(doc, start, end);
  return insertText(deleted, start, newText);
}

// =============================================================================
// Style Operations
// =============================================================================

/**
 * Extract a range from a node, returning the extracted portion.
 */
function extractRange(
  node: StyledNode,
  start: number,
  end: number
): StyledNode | null {
  if (node.type === "text") {
    const content = node.content.slice(start, end);
    if (content.length === 0) {
      return null;
    }
    return { type: "text", content };
  }

  // For elements, extract from children
  const extractedChildren: StyledNode[] = [];
  let currentOffset = 0;

  for (const child of node.children) {
    const childLength = getNodeLength(child);
    const childStart = currentOffset;
    const childEnd = currentOffset + childLength;

    if (end <= childStart || start >= childEnd) {
      // Child is completely outside range
      currentOffset = childEnd;
      continue;
    }

    // Child overlaps with range
    const extractStart = Math.max(0, start - childStart);
    const extractEnd = Math.min(childLength, end - childStart);
    const extracted = extractRange(child, extractStart, extractEnd);
    if (extracted) {
      extractedChildren.push(extracted);
    }

    currentOffset = childEnd;
  }

  if (extractedChildren.length === 0) {
    return null;
  }

  return { ...node, children: extractedChildren };
}

/**
 * Wrap a range with a tag.
 */
function wrapRangeInNode(
  node: StyledNode,
  start: number,
  end: number,
  tag: string
): StyledNode {
  if (node.type === "text") {
    const before = node.content.slice(0, start);
    const middle = node.content.slice(start, end);
    const after = node.content.slice(end);

    const parts: StyledNode[] = [];
    if (before.length > 0) {
      parts.push({ type: "text", content: before });
    }
    if (middle.length > 0) {
      parts.push({
        type: "element",
        tag,
        children: [{ type: "text", content: middle }],
      });
    }
    if (after.length > 0) {
      parts.push({ type: "text", content: after });
    }

    // If only one part, return it directly; otherwise wrap in a fragment element
    if (parts.length === 1) {
      return parts[0];
    }
    // Return as element with same tag (preserving parent structure)
    // For text nodes being split, we need to return the parts
    // This case should be handled by the caller
    return {
      type: "element",
      tag: "__fragment__", // Special marker for merging
      children: parts,
    };
  }

  // For elements, process children
  const newChildren: StyledNode[] = [];
  let currentOffset = 0;

  for (const child of node.children) {
    const childLength = getNodeLength(child);
    const childStart = currentOffset;
    const childEnd = currentOffset + childLength;

    if (end <= childStart || start >= childEnd) {
      // Child is completely outside range
      newChildren.push(child);
    } else if (start <= childStart && end >= childEnd) {
      // Child is completely inside range - wrap entire child
      newChildren.push({
        type: "element",
        tag,
        children: [child],
      });
    } else {
      // Child partially overlaps
      const wrapStart = Math.max(0, start - childStart);
      const wrapEnd = Math.min(childLength, end - childStart);
      const wrapped = wrapRangeInNode(child, wrapStart, wrapEnd, tag);

      // Flatten fragment elements
      if (wrapped.type === "element" && wrapped.tag === "__fragment__") {
        newChildren.push(...wrapped.children);
      } else {
        newChildren.push(wrapped);
      }
    }

    currentOffset = childEnd;
  }

  return { ...node, children: newChildren };
}

/**
 * Wrap a range in the document with a tag.
 */
export function wrapWithTag(
  doc: StyledDocument,
  start: number,
  end: number,
  tag: string
): StyledDocument {
  if (start >= end || start < 0 || end > doc.length) {
    return doc;
  }

  let newContent = wrapRangeInNode(doc.content, start, end, tag);

  // Flatten top-level fragment
  if (newContent.type === "element" && newContent.tag === "__fragment__") {
    if (newContent.children.length === 1) {
      newContent = newContent.children[0];
    } else {
      // Wrap multiple children in a root element
      newContent = {
        type: "element",
        tag: "__root__",
        children: newContent.children,
      };
    }
  }

  return { ...doc, content: newContent };
}

/**
 * Remove a tag from a range in a node.
 */
function unwrapTagInNode(
  node: StyledNode,
  start: number,
  end: number,
  tag: string
): StyledNode {
  if (node.type === "text") {
    return node;
  }

  // If this is the tag to unwrap and it's within range
  if (node.tag === tag) {
    // Check if this entire node is within the unwrap range
    const nodeLength = getNodeLength(node);
    if (start === 0 && end >= nodeLength) {
      // Unwrap: return children merged
      const merged = mergeAdjacentTextNodes([...node.children]);
      if (merged.length === 1) {
        return merged[0];
      }
      return {
        type: "element",
        tag: "__fragment__",
        children: merged,
      };
    }
  }

  // Process children recursively
  const newChildren: StyledNode[] = [];
  let currentOffset = 0;

  for (const child of node.children) {
    const childLength = getNodeLength(child);
    const childStart = currentOffset;
    const childEnd = currentOffset + childLength;

    if (end <= childStart || start >= childEnd) {
      // Child is completely outside range
      newChildren.push(child);
    } else {
      // Child overlaps with range
      const unwrapStart = Math.max(0, start - childStart);
      const unwrapEnd = Math.min(childLength, end - childStart);
      const unwrapped = unwrapTagInNode(child, unwrapStart, unwrapEnd, tag);

      // Flatten fragment elements
      if (unwrapped.type === "element" && unwrapped.tag === "__fragment__") {
        newChildren.push(...unwrapped.children);
      } else {
        newChildren.push(unwrapped);
      }
    }

    currentOffset = childEnd;
  }

  return { ...node, children: mergeAdjacentTextNodes(newChildren) };
}

/**
 * Remove a tag from a range in the document.
 */
export function unwrapTag(
  doc: StyledDocument,
  start: number,
  end: number,
  tag: string
): StyledDocument {
  if (start >= end || start < 0 || end > doc.length) {
    return doc;
  }

  let newContent = unwrapTagInNode(doc.content, start, end, tag);

  // Flatten top-level fragment
  if (newContent.type === "element" && newContent.tag === "__fragment__") {
    if (newContent.children.length === 1) {
      newContent = newContent.children[0];
    }
  }

  return { ...doc, content: newContent };
}

/**
 * Add or update a style definition.
 */
export function setStyleDefinition(
  doc: StyledDocument,
  tag: string,
  style: TextStyle
): StyledDocument {
  return {
    ...doc,
    styles: {
      ...doc.styles,
      [tag]: style,
    },
  };
}

// =============================================================================
// Overlay Operations
// =============================================================================

/**
 * Add or update an overlay layer.
 */
export function setOverlayLayer(
  doc: StyledDocument,
  layer: OverlayLayer
): StyledDocument {
  const existingIndex = doc.overlays.findIndex((l) => l.id === layer.id);
  const newOverlays =
    existingIndex >= 0
      ? [
          ...doc.overlays.slice(0, existingIndex),
          layer,
          ...doc.overlays.slice(existingIndex + 1),
        ]
      : [...doc.overlays, layer];

  // Sort by priority
  newOverlays.sort((a, b) => a.priority - b.priority);

  return { ...doc, overlays: newOverlays };
}

/**
 * Remove an overlay layer.
 */
export function removeOverlayLayer(
  doc: StyledDocument,
  layerId: string
): StyledDocument {
  return {
    ...doc,
    overlays: doc.overlays.filter((l) => l.id !== layerId),
  };
}

// =============================================================================
// Conversion to Flat Segments
// =============================================================================

/**
 * Flatten a node tree to style segments.
 */
function flattenNode(
  node: StyledNode,
  offset: number,
  tags: readonly string[],
  styles: StyleDefinitions,
  segments: { start: number; end: number; style: TextStyle }[]
): number {
  if (node.type === "text") {
    if (node.content.length > 0 && tags.length > 0) {
      // Merge styles from all active tags
      const mergedStyle: TextStyle = {};
      for (const tag of tags) {
        const style = styles[tag];
        if (style) {
          Object.assign(mergedStyle, style);
        }
      }

      if (Object.keys(mergedStyle).length > 0) {
        segments.push({
          start: offset,
          end: offset + node.content.length,
          style: mergedStyle,
        });
      }
    }
    return offset + node.content.length;
  }

  // Element node: add tag to stack
  const newTags = node.tag === "__root__" || node.tag === "__fragment__"
    ? tags
    : [...tags, node.tag];

  let currentOffset = offset;
  for (const child of node.children) {
    currentOffset = flattenNode(child, currentOffset, newTags, styles, segments);
  }

  return currentOffset;
}

/**
 * Flatten overlay node to segments with given priority.
 */
function flattenOverlay(
  node: StyledNode,
  offset: number,
  tags: readonly string[],
  styles: StyleDefinitions,
  segments: { start: number; end: number; style: TextStyle; priority: number }[],
  priority: number
): number {
  if (node.type === "text") {
    if (node.content.length > 0 && tags.length > 0) {
      const mergedStyle: TextStyle = {};
      for (const tag of tags) {
        const style = styles[tag];
        if (style) {
          Object.assign(mergedStyle, style);
        }
      }

      if (Object.keys(mergedStyle).length > 0) {
        segments.push({
          start: offset,
          end: offset + node.content.length,
          style: mergedStyle,
          priority,
        });
      }
    }
    return offset + node.content.length;
  }

  const newTags = node.tag === "__root__" || node.tag === "__fragment__"
    ? tags
    : [...tags, node.tag];

  let currentOffset = offset;
  for (const child of node.children) {
    currentOffset = flattenOverlay(child, currentOffset, newTags, styles, segments, priority);
  }

  return currentOffset;
}

/**
 * Merge overlapping segments, with higher priority segments taking precedence.
 */
function mergeSegments(
  segments: { start: number; end: number; style: TextStyle; priority: number }[]
): TextStyleSegment[] {
  if (segments.length === 0) {
    return [];
  }

  // Sort by start position, then by priority (higher first)
  segments.sort((a, b) => a.start - b.start || b.priority - a.priority);

  // Collect all boundaries
  const boundaries = new Set<number>();
  for (const seg of segments) {
    boundaries.add(seg.start);
    boundaries.add(seg.end);
  }
  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

  const result: TextStyleSegment[] = [];

  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const start = sortedBoundaries[i];
    const end = sortedBoundaries[i + 1];

    // Find all segments that cover this range
    const covering = segments.filter((s) => s.start <= start && s.end >= end);

    if (covering.length > 0) {
      // Merge styles, higher priority last (to override)
      covering.sort((a, b) => a.priority - b.priority);
      const mergedStyle: TextStyle = {};
      for (const seg of covering) {
        Object.assign(mergedStyle, seg.style);
      }

      result.push({ start, end, style: mergedStyle });
    }
  }

  // Merge adjacent segments with identical styles
  const merged: TextStyleSegment[] = [];
  for (const seg of result) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.end === seg.start &&
      JSON.stringify(last.style) === JSON.stringify(seg.style)
    ) {
      merged[merged.length - 1] = { ...last, end: seg.end };
    } else {
      merged.push(seg);
    }
  }

  return merged;
}

/**
 * Convert document to flat style segments.
 * Merges content and overlay styles.
 */
export function toFlatSegments(doc: StyledDocument): readonly TextStyleSegment[] {
  const allSegments: { start: number; end: number; style: TextStyle; priority: number }[] = [];

  // Flatten main content (priority 0)
  const contentSegments: { start: number; end: number; style: TextStyle }[] = [];
  flattenNode(doc.content, 0, [], doc.styles, contentSegments);
  for (const seg of contentSegments) {
    allSegments.push({ ...seg, priority: 0 });
  }

  // Flatten overlays
  for (const overlay of doc.overlays) {
    flattenOverlay(overlay.root, 0, [], doc.styles, allSegments, overlay.priority);
  }

  return mergeSegments(allSegments);
}

// =============================================================================
// IME Composition Support
// =============================================================================

/**
 * Get display text and segments during IME composition.
 */
export function getDisplayDocumentForComposition(
  doc: StyledDocument,
  composition: {
    isComposing: boolean;
    text: string;
    startOffset: number;
    replacedLength: number;
  }
): {
  text: string;
  segments: readonly TextStyleSegment[];
} {
  if (!composition.isComposing) {
    return {
      text: getDocumentText(doc),
      segments: toFlatSegments(doc),
    };
  }

  // During composition, the document already contains the composition text
  // (browser updates textarea.value which updates our document)
  // We just need to return the current state
  return {
    text: getDocumentText(doc),
    segments: toFlatSegments(doc),
  };
}
