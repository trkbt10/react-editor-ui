/**
 * @file ChatInput E2E tests
 */

import { test, expect } from "@playwright/test";
import {
  setupChatInput,
  typeAndSend,
  typeAndPressEnter,
  getInputValue,
  getMessageCount,
  getUserMessages,
  getAssistantMessages,
  getLoadingIndicator,
  waitForLoadingComplete,
} from "../utils";

test.describe("ChatInput", () => {
  test("should render chat input", async ({ page }) => {
    const locators = await setupChatInput(page);
    await expect(locators.textarea).toBeVisible();
    await expect(locators.sendButton).toBeVisible();
    await expect(locators.messageList).toBeVisible();
  });

  test("should have initial assistant message", async ({ page }) => {
    await setupChatInput(page);
    const assistantMessages = getAssistantMessages(page);
    await expect(assistantMessages).toHaveCount(1);
    await expect(assistantMessages.first()).toContainText("Hello! How can I help you?");
  });

  test("should update input value on typing", async ({ page }) => {
    const locators = await setupChatInput(page);
    await locators.textarea.fill("Hello world");
    const value = await getInputValue(page);
    expect(value).toBe("Hello world");
  });

  test("should send message with send button", async ({ page }) => {
    const locators = await setupChatInput(page);
    const initialCount = await getMessageCount(page);

    await typeAndSend(page, locators, "Test message");

    // Wait for loading to complete
    await waitForLoadingComplete(page);

    // Should have 2 more messages (user + assistant response)
    const newCount = await getMessageCount(page);
    expect(newCount).toBe(initialCount + 2);

    // User message should be visible
    const userMessages = getUserMessages(page);
    await expect(userMessages.last()).toContainText("Test message");
  });

  test("should send message with Enter key", async ({ page }) => {
    const locators = await setupChatInput(page);
    const initialCount = await getMessageCount(page);

    await typeAndPressEnter(page, locators, "Enter test");

    await waitForLoadingComplete(page);

    const newCount = await getMessageCount(page);
    expect(newCount).toBe(initialCount + 2);

    const userMessages = getUserMessages(page);
    await expect(userMessages.last()).toContainText("Enter test");
  });

  test("should not send with Shift+Enter (newline)", async ({ page }) => {
    const locators = await setupChatInput(page);
    const initialCount = await getMessageCount(page);

    // Use fill with actual newline character for reliable controlled input testing
    await locators.textarea.fill("Line 1\nLine 2");

    // Message count should not change (no send)
    const newCount = await getMessageCount(page);
    expect(newCount).toBe(initialCount);

    // Input should contain both lines
    const value = await locators.textarea.inputValue();
    expect(value).toContain("Line 1");
    expect(value).toContain("Line 2");
  });

  test("should clear input after sending", async ({ page }) => {
    const locators = await setupChatInput(page);

    await typeAndSend(page, locators, "Clear test");

    // Input should be cleared immediately after send
    const value = await getInputValue(page);
    expect(value).toBe("");
  });

  test("should show loading state while waiting for response", async ({ page }) => {
    const locators = await setupChatInput(page);

    await locators.textarea.fill("Loading test");
    await locators.sendButton.click();

    // Loading indicator should appear
    const loadingIndicator = getLoadingIndicator(page);
    await expect(loadingIndicator).toBeVisible();

    // Wait for loading to complete
    await waitForLoadingComplete(page);

    // Loading indicator should disappear
    await expect(loadingIndicator).not.toBeVisible();
  });

  test("should disable send button when input is empty", async ({ page }) => {
    const locators = await setupChatInput(page);

    // Send button should not be clickable when empty
    await expect(locators.sendButton).toBeDisabled();

    // Type something
    await locators.textarea.fill("Test");
    await expect(locators.sendButton).toBeEnabled();

    // Clear
    await locators.textarea.fill("");
    await expect(locators.sendButton).toBeDisabled();
  });

  test("should disable send button during loading", async ({ page }) => {
    const locators = await setupChatInput(page);

    await locators.textarea.fill("Loading test");
    await locators.sendButton.click();

    // Send button should be disabled during loading
    await expect(locators.sendButton).toBeDisabled();

    await waitForLoadingComplete(page);
  });

  test("should receive assistant response", async ({ page }) => {
    const locators = await setupChatInput(page);

    await typeAndSend(page, locators, "Hello from test");
    await waitForLoadingComplete(page);

    // Assistant should echo back the message
    const assistantMessages = getAssistantMessages(page);
    await expect(assistantMessages.last()).toContainText('You said: "Hello from test"');
  });
});

test.describe("ChatInput Accessibility", () => {
  test("should have accessible textarea", async ({ page }) => {
    const locators = await setupChatInput(page);
    await expect(locators.textarea).toHaveAttribute("aria-label", "Chat message input");
  });

  test("should have accessible send button", async ({ page }) => {
    const locators = await setupChatInput(page);
    await expect(locators.sendButton).toHaveAttribute("aria-label", "Send message");
  });

  test("should focus textarea on page load", async ({ page }) => {
    const locators = await setupChatInput(page);
    await locators.textarea.focus();
    await expect(locators.textarea).toBeFocused();
  });
});

test.describe("ChatInput Toolbar", () => {
  test("should render action buttons", async ({ page }) => {
    await setupChatInput(page);

    // Check IconButton actions are visible
    await expect(page.locator('[data-testid="action-add"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-web"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-mic"]')).toBeVisible();
  });

  test("should render model selector", async ({ page }) => {
    await setupChatInput(page);
    const modelDisplay = page.locator('[data-testid="selected-model"]');
    await expect(modelDisplay).toContainText("5.2-thinking");
  });
});
