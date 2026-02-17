/**
 * @file Symbol Instance Text Editing E2E tests
 *
 * Tests for editing text inside Symbol instances via double-click
 */

import { test, expect } from "@playwright/test";

test.describe("Symbol Instance Text Editing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should enter edit mode on double-click on symbol instance", async ({ page }) => {
    // Find the first symbol text content display (e.g., "Start", "Process", etc.)
    const symbolTextDisplay = page.locator('[data-testid="symbol-text-content-display"]').first();
    await expect(symbolTextDisplay).toBeVisible();

    // Get the text content before editing
    const originalText = await symbolTextDisplay.textContent();
    expect(originalText).toBeTruthy();

    // Get the text element's position
    const textBox = await symbolTextDisplay.boundingBox();
    expect(textBox).not.toBeNull();

    // Double-click on the symbol text to enter edit mode
    await page.mouse.dblclick(textBox!.x + textBox!.width / 2, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(200);

    // Verify contentEditable is now visible (edit mode activated)
    const editableSpan = page.locator('[data-testid="symbol-text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Verify focus is on the editable span
    const hasFocus = await editableSpan.evaluate((el) => document.activeElement === el);
    expect(hasFocus).toBe(true);
  });

  test("should edit symbol instance text and persist changes", async ({ page }) => {
    // Find the first symbol text content display
    const symbolTextDisplay = page.locator('[data-testid="symbol-text-content-display"]').first();
    await expect(symbolTextDisplay).toBeVisible();

    // Get original text
    const originalText = await symbolTextDisplay.textContent();

    // Get position and double-click
    const textBox = await symbolTextDisplay.boundingBox();
    await page.mouse.dblclick(textBox!.x + textBox!.width / 2, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(200);

    // Verify edit mode
    const editableSpan = page.locator('[data-testid="symbol-text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Type new content (text should be selected, so typing replaces it)
    const newText = "Edited Symbol";
    await page.keyboard.type(newText);

    // Press Enter to confirm
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);

    // Verify edit mode exited (contentEditable hidden, display visible)
    await expect(editableSpan).not.toBeVisible();
    const updatedDisplay = page.locator('[data-testid="symbol-text-content-display"]').first();
    await expect(updatedDisplay).toBeVisible();

    // Verify text was changed
    const updatedText = await updatedDisplay.textContent();
    expect(updatedText).toBe(newText);
    expect(updatedText).not.toBe(originalText);
  });

  test("should cancel edit on Escape key", async ({ page }) => {
    // Find symbol text
    const symbolTextDisplay = page.locator('[data-testid="symbol-text-content-display"]').first();
    await expect(symbolTextDisplay).toBeVisible();

    const originalText = await symbolTextDisplay.textContent();

    // Enter edit mode
    const textBox = await symbolTextDisplay.boundingBox();
    await page.mouse.dblclick(textBox!.x + textBox!.width / 2, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(200);

    const editableSpan = page.locator('[data-testid="symbol-text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Type some text
    await page.keyboard.type("Should be cancelled");

    // Press Escape to cancel
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Verify edit mode exited
    await expect(editableSpan).not.toBeVisible();

    // Verify original text is preserved
    const displayAfterCancel = page.locator('[data-testid="symbol-text-content-display"]').first();
    const textAfterCancel = await displayAfterCancel.textContent();
    expect(textAfterCancel).toBe(originalText);
  });

  test("should allow text selection in edit mode", async ({ page }) => {
    // Find symbol text
    const symbolTextDisplay = page.locator('[data-testid="symbol-text-content-display"]').first();
    const textBox = await symbolTextDisplay.boundingBox();

    // Enter edit mode
    await page.mouse.dblclick(textBox!.x + textBox!.width / 2, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(200);

    const editableSpan = page.locator('[data-testid="symbol-text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Click inside to position cursor
    const editBox = await editableSpan.boundingBox();
    await page.mouse.click(editBox!.x + 5, editBox!.y + editBox!.height / 2);
    await page.waitForTimeout(50);

    // Verify focus is maintained
    const hasFocus = await editableSpan.evaluate((el) => document.activeElement === el);
    expect(hasFocus).toBe(true);

    // Use Ctrl+A to select all
    await page.keyboard.press("Control+a");
    await page.waitForTimeout(50);

    // Type to replace
    await page.keyboard.type("Selected All");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);

    // Verify new text
    const updatedDisplay = page.locator('[data-testid="symbol-text-content-display"]').first();
    await expect(updatedDisplay).toContainText("Selected All");
  });

  test("should hide bounding box when editing symbol", async ({ page }) => {
    // Find and click on a symbol to select it
    const symbolTextDisplay = page.locator('[data-testid="symbol-text-content-display"]').first();
    const textBox = await symbolTextDisplay.boundingBox();

    // Single click to select
    await page.mouse.click(textBox!.x + textBox!.width / 2, textBox!.y + textBox!.height / 2);
    await page.waitForTimeout(200);

    // Verify bounding box is visible (node selected)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Get bounding box move area position for double-click
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    const moveAreaBox = await moveArea.boundingBox();

    // Double-click on bounding box move area to enter edit mode
    await page.mouse.dblclick(moveAreaBox!.x + moveAreaBox!.width / 2, moveAreaBox!.y + moveAreaBox!.height / 2);
    await page.waitForTimeout(200);

    // Verify edit mode is active
    const editableSpan = page.locator('[data-testid="symbol-text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Verify bounding box is hidden during edit
    await expect(boundingBox).not.toBeVisible();

    // Exit edit mode
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Verify bounding box reappears
    await expect(boundingBox).toBeVisible();
  });
});
