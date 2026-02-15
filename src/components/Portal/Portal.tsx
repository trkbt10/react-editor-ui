/**
 * @file Portal component - Renders children into a DOM node outside the parent hierarchy
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
