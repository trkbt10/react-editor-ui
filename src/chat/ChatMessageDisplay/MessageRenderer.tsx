/**
 * @file MessageRenderer - Resolves and renders a single chat message
 */

import { memo, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  ChatMessage,
  MessageComponentMap,
  MessageDisplayOptions,
  ContentPartComponentMap,
  MessageAction,
} from "./types";
import { defaultComponents } from "./defaults";

type MergedComponents = typeof defaultComponents & MessageComponentMap;

/** Merges user-provided components with default components. */
function mergeComponents(
  components: MessageComponentMap | undefined,
): MergedComponents {
  return components ? { ...defaultComponents, ...components } : defaultComponents;
}

type RenderMessageOptions = {
  message: ChatMessage;
  merged: MergedComponents;
  displayOptions?: MessageDisplayOptions;
  contentComponents?: ContentPartComponentMap;
  actions?: MessageAction[];
  onClick?: () => void;
};

function renderMessage({
  message,
  merged,
  displayOptions,
  contentComponents,
  actions,
  onClick,
}: RenderMessageOptions): ReactNode {
  const baseProps = {
    message,
    displayOptions,
    contentComponents,
    actions,
    onClick,
  };

  switch (message.role) {
    case "user": {
      const C = merged.user;
      return C ? <C {...baseProps} role="user" /> : null;
    }
    case "assistant": {
      const C = merged.assistant;
      return C ? <C {...baseProps} role="assistant" /> : null;
    }
    case "system": {
      const C = merged.system;
      return C ? <C {...baseProps} role="system" /> : null;
    }
    default: {
      const C = merged.fallback;
      return C ? <C {...baseProps} /> : null;
    }
  }
}

export type MessageRendererProps = {
  message: ChatMessage;
  components?: MessageComponentMap;
  displayOptions?: MessageDisplayOptions;
  contentComponents?: ContentPartComponentMap;
  actions?: MessageAction[];
  onClick?: () => void;
};

export const MessageRenderer = memo(function MessageRenderer({
  message,
  components,
  displayOptions,
  contentComponents,
  actions,
  onClick,
}: MessageRendererProps) {
  const merged = useMemo(() => mergeComponents(components), [components]);

  return useMemo(
    () =>
      renderMessage({
        message,
        merged,
        displayOptions,
        contentComponents,
        actions,
        onClick,
      }),
    [message, merged, displayOptions, contentComponents, actions, onClick],
  );
});

export { mergeComponents };
