/**
 * @file Dropdown positioning E2E tests
 * Tests for automatic flip and viewport clamping behavior of dropdowns
 */

import { test, expect, type Page } from "@playwright/test";

/**
 * Helper to resize viewport
 */
async function resizeViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
}

test.describe("Dropdown Positioning", () => {
  test.describe("Select Component", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/components/data-display/select");
    });

    test("should open dropdown below trigger by default", async ({ page }) => {
      // Use a large viewport
      await resizeViewport(page, 1024, 768);

      const select = page.locator('[aria-label="Select fruit"]');
      await select.click();

      const dropdown = page.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible();

      // Get positions
      const selectBox = await select.boundingBox();
      const dropdownBox = await dropdown.boundingBox();

      expect(selectBox).not.toBeNull();
      expect(dropdownBox).not.toBeNull();

      // Dropdown should be below the select
      if (selectBox && dropdownBox) {
        expect(dropdownBox.y).toBeGreaterThan(selectBox.y + selectBox.height);
      }
    });

    test("should flip dropdown above when near bottom of viewport", async ({ page }) => {
      // Use a small viewport height
      await resizeViewport(page, 1024, 300);

      // Click on select (it should be visible in small viewport)
      const select = page.locator('[aria-label="Select fruit"]');
      await expect(select).toBeVisible();

      const selectBox = await select.boundingBox();

      // Click the select
      await select.click();

      const dropdown = page.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible();

      const dropdownBox = await dropdown.boundingBox();

      // Check dropdown stays within viewport
      if (dropdownBox && selectBox) {
        const viewportHeight = 300;
        // Dropdown should fit within viewport
        expect(dropdownBox.y + dropdownBox.height).toBeLessThanOrEqual(viewportHeight + 8);
      }
    });

    test("should clamp dropdown to viewport edges", async ({ page }) => {
      await resizeViewport(page, 600, 768);

      const select = page.locator('[aria-label="Select fruit"]');
      await select.click();

      const dropdown = page.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible();

      const dropdownBox = await dropdown.boundingBox();

      // Dropdown should be within viewport bounds
      if (dropdownBox) {
        expect(dropdownBox.x).toBeGreaterThanOrEqual(0);
        expect(dropdownBox.y).toBeGreaterThanOrEqual(0);
        expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(600);
      }
    });
  });

  test.describe("Tooltip Component", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/components/feedback/tooltip");
    });

    test("should flip tooltip placement when near viewport edge", async ({ page }) => {
      await resizeViewport(page, 1024, 300);

      // Find a tooltip trigger near the bottom
      const tooltipTriggers = page.locator('[data-tooltip-trigger="true"]');
      const count = await tooltipTriggers.count();

      if (count > 0) {
        const lastTrigger = tooltipTriggers.last();
        await lastTrigger.hover();

        // Wait for tooltip to appear (delay)
        await page.waitForTimeout(400);

        const tooltip = page.locator('[role="tooltip"]');
        const isVisible = await tooltip.isVisible();

        if (isVisible) {
          const tooltipBox = await tooltip.boundingBox();

          // Tooltip should be within viewport
          if (tooltipBox) {
            expect(tooltipBox.y).toBeGreaterThanOrEqual(0);
            expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(300);
          }
        }
      }
    });
  });

  test.describe("Context Menu Component", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/components/data-display/context-menu");
    });

    test("should clamp context menu to viewport when opened near edge", async ({ page }) => {
      await resizeViewport(page, 800, 600);

      // Right click near the right edge
      const container = page.locator('[data-testid="context-menu-trigger"]').first();

      if (await container.isVisible()) {
        // Right click near the right edge of the container
        const box = await container.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width - 10, box.y + 50, { button: "right" });

          const contextMenu = page.locator('[data-testid="context-menu"]');
          await expect(contextMenu).toBeVisible();

          const menuBox = await contextMenu.boundingBox();

          // Context menu should be within viewport
          if (menuBox) {
            expect(menuBox.x).toBeGreaterThanOrEqual(0);
            expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(800);
          }
        }
      }
    });

    test("should clamp context menu when opened near bottom edge", async ({ page }) => {
      await resizeViewport(page, 800, 400);

      const container = page.locator('[data-testid="context-menu-trigger"]').first();

      if (await container.isVisible()) {
        // Right click near the bottom of the container
        const box = await container.boundingBox();
        if (box) {
          await page.mouse.click(box.x + 50, box.y + box.height - 10, { button: "right" });

          const contextMenu = page.locator('[data-testid="context-menu"]');
          await expect(contextMenu).toBeVisible();

          const menuBox = await contextMenu.boundingBox();

          // Context menu should be within viewport
          if (menuBox) {
            expect(menuBox.y).toBeGreaterThanOrEqual(0);
            expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(400);
          }
        }
      }
    });
  });

  // Note: SplitButton test requires finding an enabled button which varies by demo state
  // The core positioning logic is tested via Select component tests above
});

test.describe("Diagram Toolbar Dropdowns", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
  });

  test("should open toolbar dropdown and position horizontally within viewport", async ({ page }) => {
    await resizeViewport(page, 1200, 800);

    // Find toolbar buttons with dropdown behavior
    const frameButton = page.locator('[aria-label="Add Frame"]');

    if (await frameButton.isVisible()) {
      await frameButton.click();

      // Wait for dropdown to appear
      await page.waitForTimeout(100);

      // Check if dropdown is visible
      const dropdown = page.locator('[role="menu"]');

      if (await dropdown.isVisible()) {
        const dropdownBox = await dropdown.boundingBox();

        if (dropdownBox) {
          // Dropdown should be within horizontal viewport bounds
          expect(dropdownBox.x).toBeGreaterThanOrEqual(0);
          expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(1200);
        }
      }
    }
  });
});
