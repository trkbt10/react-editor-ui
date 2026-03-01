/**
 * @file Default message renderer components
 */

import type { MessageComponentMap } from "../types";

export { DefaultUserMessage } from "./DefaultUserMessage";
export { DefaultAssistantMessage } from "./DefaultAssistantMessage";
export { DefaultSystemMessage } from "./DefaultSystemMessage";
export { DefaultThinkingIndicator } from "./DefaultThinkingIndicator";
export { DefaultFallbackMessage } from "./DefaultFallbackMessage";
export { ContentPartRenderer, defaultContentComponents } from "./ContentPartRenderer";
export { MessageActions, type MessageActionsProps } from "./MessageActions";

// Lazy imports for tree-shaking
import { DefaultUserMessage } from "./DefaultUserMessage";
import { DefaultAssistantMessage } from "./DefaultAssistantMessage";
import { DefaultSystemMessage } from "./DefaultSystemMessage";
import { DefaultThinkingIndicator } from "./DefaultThinkingIndicator";
import { DefaultFallbackMessage } from "./DefaultFallbackMessage";

/** Default component map for all message roles */
export const defaultComponents: Required<MessageComponentMap> = {
  user: DefaultUserMessage,
  assistant: DefaultAssistantMessage,
  system: DefaultSystemMessage,
  thinking: DefaultThinkingIndicator,
  fallback: DefaultFallbackMessage,
};
