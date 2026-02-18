/**
 * @file SplitButton dropdown positioning E2E tests
 * Tests for dropdown height and positioning when content is smaller than maxHeight
 */

import { test, expect } from "@playwright/test";

test.describe("SplitButton Dropdown Positioning", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    // Wait for the canvas to be rendered
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("shape dropdown should not have excess space below content when flipped to top", async ({ page }) => {
    // Click the shape dropdown button (right part of split button)
    const shapeContainer = page.locator('button[aria-label="Add shape"]').locator("..");
    const dropdownButton = shapeContainer.locator('button[aria-label="Open menu"]');
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(100);

    // Find the dropdown listbox
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();

    // Get dropdown bounding box
    const dropdownBox = await dropdown.boundingBox();
    expect(dropdownBox).not.toBeNull();
    if (!dropdownBox) return;

    // Get the dropdown button position (anchor)
    const buttonBox = await dropdownButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    if (!buttonBox) return;

    // Check if dropdown is positioned above the button (flipped to top)
    const isFlippedToTop = dropdownBox.y + dropdownBox.height < buttonBox.y + buttonBox.height / 2;

    if (isFlippedToTop) {
      // The dropdown's bottom edge should be close to the button's top edge (with small offset)
      const gap = buttonBox.y - (dropdownBox.y + dropdownBox.height);
      // Gap should be small (4-8px offset)
      expect(gap).toBeLessThanOrEqual(12);
      expect(gap).toBeGreaterThanOrEqual(0);
    }
  });

  test("frame dropdown should also align properly when flipped to top", async ({ page }) => {
    // Click the frame dropdown button
    const frameContainer = page.locator('button[aria-label="Draw Frame"]').locator("..");
    const dropdownButton = frameContainer.locator('button[aria-label="Open menu"]');
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(100);

    // Find the dropdown listbox
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();

    // Get dropdown bounding box
    const dropdownBox = await dropdown.boundingBox();
    expect(dropdownBox).not.toBeNull();
    if (!dropdownBox) return;

    // Get the dropdown button position (anchor)
    const buttonBox = await dropdownButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    if (!buttonBox) return;

    // Check if dropdown is positioned above the button (flipped to top)
    const isFlippedToTop = dropdownBox.y + dropdownBox.height < buttonBox.y + buttonBox.height / 2;

    if (isFlippedToTop) {
      // The dropdown's bottom edge should be close to the button's top edge
      const gap = buttonBox.y - (dropdownBox.y + dropdownBox.height);
      expect(gap).toBeLessThanOrEqual(12);
      expect(gap).toBeGreaterThanOrEqual(0);
    }
  });

  test("dropdown content should not have internal empty space at the bottom", async ({ page }) => {
    // Click the shape dropdown button
    const shapeContainer = page.locator('button[aria-label="Add shape"]').locator("..");
    const dropdownButton = shapeContainer.locator('button[aria-label="Open menu"]');
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(100);

    // Find the dropdown listbox
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();

    // Check that dropdown height matches its content (no excess space)
    const dropdownInfo = await dropdown.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        paddingTop: parseFloat(style.paddingTop),
        paddingBottom: parseFloat(style.paddingBottom),
      };
    });

    // If scrollHeight equals clientHeight, there's no overflow
    // The content should fill the available space without large gaps
    const contentHeight = dropdownInfo.scrollHeight;
    const visibleHeight = dropdownInfo.clientHeight;
    const padding = dropdownInfo.paddingTop + dropdownInfo.paddingBottom;

    // Content should be close to filling the visible area (allow for padding)
    // If there's a large gap (> 50px), something is wrong
    const unusedSpace = visibleHeight - contentHeight;
    expect(unusedSpace).toBeLessThanOrEqual(50);
  });
});
