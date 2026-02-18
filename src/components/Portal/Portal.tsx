/**
 * @file Portal component - Renders children into a DOM node outside the parent hierarchy
 *
 * @description
 * Renders children into a DOM node outside the React component tree.
 * Uses createPortal to mount content at a specified container or document.body.
 * Essential for modals, tooltips, and dropdowns that need to escape overflow/z-index constraints.
 *
 * @example
 * ```tsx
 * import { Portal } from "react-editor-ui/Portal";
 *
 * <Portal>
 *   <div className="modal">Modal content</div>
 * </Portal>
 * ```
 */

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type PortalProps = {
  children: ReactNode;
  container?: Element | null;
};

function subscribeToNothing() {
  return () => {};
}

function getDocumentBody() {
  return document.body;
}

function getServerSnapshot(): null {
  return null;
}

/**
 * Portal renders children into a DOM node outside the parent hierarchy.
 * Uses createPortal to mount content at a specified container or document.body.
 */
export function Portal({ children, container }: PortalProps) {
  const mountNode = useSyncExternalStore(
    subscribeToNothing,
    () => container ?? getDocumentBody(),
    getServerSnapshot,
  );

  if (!mountNode) {
    return null;
  }

  return createPortal(children, mountNode);
}
