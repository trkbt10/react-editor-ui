/**
 * @file Shared E2E test utilities for ChatInput tests
 */

import type { Page, Locator } from "@playwright/test";

export type ChatInputLocators = {
  container: Locator;
  textarea: Locator;
  sendButton: Locator;
  messageList: Locator;
};

/**
 * Get the chat input textarea.
 */
export function getChatTextarea(page: Page): Locator {
  return page.locator('textarea[aria-label="Chat message input"]');
}

/**
 * Get the send button.
 */
export function getSendButton(page: Page): Locator {
  return page.locator('button[aria-label="Send message"]');
}

/**
 * Get the message list container.
 */
export function getMessageList(page: Page): Locator {
  return page.locator('[data-testid="message-list"]');
}

/**
 * Get all user messages.
 */
export function getUserMessages(page: Page): Locator {
  return page.locator('[data-testid="message-user"]');
}

/**
 * Get all assistant messages.
 */
export function getAssistantMessages(page: Page): Locator {
  return page.locator('[data-testid="message-assistant"]');
}

/**
 * Get the loading indicator.
 */
export function getLoadingIndicator(page: Page): Locator {
  return page.locator('[data-testid="loading-indicator"]');
}

/**
 * Get all chat input locators.
 */
export function getChatInputLocators(page: Page): ChatInputLocators {
  return {
    container: page.locator(".chat-mount"),
    textarea: getChatTextarea(page),
    sendButton: getSendButton(page),
    messageList: getMessageList(page),
  };
}

/**
 * Setup chat input page and wait for it to render.
 */
export async function setupChatInput(page: Page, route = "/#/chat-input"): Promise<ChatInputLocators> {
  await page.goto(route);
  await page.waitForSelector('textarea[aria-label="Chat message input"]');
  return getChatInputLocators(page);
}

/**
 * Type a message and send it.
 */
export async function typeAndSend(
  page: Page,
  locators: ChatInputLocators,
  message: string
): Promise<void> {
  await locators.textarea.fill(message);
  await locators.sendButton.click();
}

/**
 * Type a message and press Enter to send.
 */
export async function typeAndPressEnter(
  page: Page,
  locators: ChatInputLocators,
  message: string
): Promise<void> {
  await locators.textarea.fill(message);
  await locators.textarea.press("Enter");
}

/**
 * Get the current input value from the test state display.
 */
export async function getInputValue(page: Page): Promise<string> {
  const text = await page.locator('[data-testid="input-value"]').textContent();
  const match = text?.match(/Input value: "(.*)"/);
  return match ? match[1] : "";
}

/**
 * Get the message count from the test state display.
 */
export async function getMessageCount(page: Page): Promise<number> {
  const text = await page.locator('[data-testid="message-count"]').textContent();
  const match = text?.match(/Messages: (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Wait for loading to complete.
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const loadingState = document.querySelector('[data-testid="loading-state"]');
    return loadingState?.textContent?.includes("false");
  });
}
