/**
 * @file ChatMessageDisplay E2E tests
 *
 * Tests for cursor behavior, click handling, and layout.
 */

import { test, expect } from "@playwright/test";

test.describe("ChatMessageDisplay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/chat/chat-message-display");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: "ChatMessageDisplay" }),
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe("cursor behavior", () => {
    test("cursor:pointer is only on message bubbles, not empty space", async ({
      page,
    }) => {
      // Find the message display container (has overflow: auto)
      const container = page.locator('[style*="overflow: auto"]').first();
      await expect(container).toBeVisible();

      // Wait for messages to render
      await expect(page.locator("[data-index]").first()).toBeVisible({
        timeout: 5000,
      });

      // Get a message item wrapper (full width)
      const messageItem = page.locator("[data-index]").first();
      await expect(messageItem).toBeVisible();

      // The message item wrapper should NOT have cursor:pointer
      const wrapperCursor = await messageItem.evaluate(
        (el) => window.getComputedStyle(el).cursor,
      );
      expect(wrapperCursor).not.toBe("pointer");

      // Find the actual message bubble (the inner div with padding and background)
      // User messages have blue background, assistant messages have raised surface
      const messageBubble = messageItem.locator(
        '[style*="border-radius"][style*="padding"]',
      );

      if ((await messageBubble.count()) > 0) {
        const bubbleCursor = await messageBubble
          .first()
          .evaluate((el) => window.getComputedStyle(el).cursor);
        // If onMessageClick is provided, bubble should have pointer
        expect(bubbleCursor).toBe("pointer");
      }
    });

    test("clicking on empty space next to message does not trigger click handler", async ({
      page,
    }) => {
      // Wait for messages
      await expect(page.locator("[data-index]").first()).toBeVisible({
        timeout: 5000,
      });

      // Get initial selected state from stats
      const statsText = await page
        .locator("text=Messages:")
        .first()
        .textContent();
      const initialHasSelection = statsText?.includes("Selected:");

      // Click on the left edge of the message container (empty space)
      const messageItem = page.locator("[data-index]").first();
      const box = await messageItem.boundingBox();

      if (box) {
        // Click at the very left edge (outside the bubble)
        await page.mouse.click(box.x + 5, box.y + box.height / 2);
      }

      // Wait a bit for any state update
      await page.waitForTimeout(100);

      // Selection state should not have changed if we clicked empty space
      const newStatsText = await page
        .locator("text=Messages:")
        .first()
        .textContent();

      // If initially no selection, should still have no selection after clicking empty space
      if (!initialHasSelection) {
        expect(newStatsText?.includes("Selected:")).toBeFalsy();
      }
    });

    test("clicking on message bubble triggers selection", async ({ page }) => {
      // Wait for messages
      await expect(page.locator("[data-index]").first()).toBeVisible({
        timeout: 5000,
      });

      // Find a message bubble and click it
      const messageItem = page.locator("[data-index]").first();
      const bubble = messageItem.locator(
        '[style*="border-radius"][style*="padding"]',
      );

      if ((await bubble.count()) > 0) {
        await bubble.first().click();

        // Wait for state update
        await page.waitForTimeout(100);

        // Check that selection is shown in stats
        const statsText = await page
          .locator("text=Messages:")
          .first()
          .textContent();
        expect(statsText?.includes("Selected:")).toBeTruthy();
      }
    });
  });

  test.describe("variant styles", () => {
    test("flat variant renders without bubble background", async ({ page }) => {
      // Scroll down to Pattern Showcase section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Find the flat variant assistant message card
      const flatCard = page.locator('text="Flat Variant: Assistant (no bg)"');
      await expect(flatCard).toBeVisible({ timeout: 5000 });

      // The flat assistant message should have no background
      const flatMessage = flatCard
        .locator("..")
        .locator('[style*="word-break"]');

      if ((await flatMessage.count()) > 0) {
        const bg = await flatMessage
          .first()
          .evaluate((el) => window.getComputedStyle(el).backgroundColor);
        // Should be transparent or rgba(0,0,0,0)
        expect(
          bg === "transparent" ||
            bg === "rgba(0, 0, 0, 0)" ||
            !bg.includes("rgb"),
        ).toBeTruthy();
      }
    });

    test("bubble variant renders with background", async ({ page }) => {
      // Wait for messages in main display
      await expect(page.locator("[data-index]").first()).toBeVisible({
        timeout: 5000,
      });

      // Find an assistant message (left-aligned)
      const messages = page.locator("[data-index]");
      const count = await messages.count();

      for (let i = 0; i < count; i++) {
        const msg = messages.nth(i);
        const bubble = msg.locator('[style*="border-radius"][style*="padding"]');

        if ((await bubble.count()) > 0) {
          const bg = await bubble
            .first()
            .evaluate((el) => window.getComputedStyle(el).backgroundColor);
          // Bubble variant should have a background color
          expect(bg).not.toBe("transparent");
          expect(bg).not.toBe("rgba(0, 0, 0, 0)");
          break;
        }
      }
    });
  });
});
