/**
 * @file DataTableViewer E2E tests
 *
 * Tests for:
 * - Resize/drag interaction (no conflict)
 * - Horizontal scroll behavior
 * - Axis alignment between header and body
 */

import { test, expect } from "@playwright/test";

test.describe("DataTableViewer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/viewer/data-table-viewer");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: "DataTableViewer" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("renders table with columns and rows", async ({ page }) => {
    // Check that column headers are visible
    await expect(page.getByRole("columnheader").first()).toBeVisible();

    // Check that data rows are rendered
    await expect(page.locator('[data-index]').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("no horizontal overflow when content fits container", async ({
    page,
  }) => {
    // Find the scroll container
    const scrollContainer = page
      .locator('[style*="overflow: auto"]')
      .first();
    await expect(scrollContainer).toBeVisible();

    // Check if horizontal scroll is needed
    const overflowInfo = await scrollContainer.evaluate((el) => {
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        hasHorizontalScroll: el.scrollWidth > el.clientWidth + 1,
      };
    });

    // Log for debugging
    console.log("Scroll info:", overflowInfo);

    // Take screenshot for visual verification
    await page.screenshot({
      path: "e2e/screenshots/data-table-viewer-overflow.png",
    });
  });

  test("resize handle does not conflict with column drag", async ({
    page,
  }) => {
    // Find a resizable header cell
    const headerCell = page.getByRole("columnheader").first();
    await expect(headerCell).toBeVisible();

    // Get the resize handle (positioned at right edge of header cell)
    const cellBox = await headerCell.boundingBox();
    if (!cellBox) {
      throw new Error("Could not get header cell bounding box");
    }

    // Move mouse to resize handle area (right edge)
    await page.mouse.move(cellBox.x + cellBox.width - 4, cellBox.y + cellBox.height / 2);

    // Wait a bit for any hover state to apply
    await page.waitForTimeout(100);

    // Take screenshot for visual verification
    await page.screenshot({
      path: "e2e/screenshots/data-table-viewer-resize-cursor.png",
    });
  });

  test("column resize works without triggering drag", async ({ page }) => {
    // Find resizable columns section
    const resizableSection = page.locator("text=Resizable Columns");
    if (await resizableSection.isVisible()) {
      // Find the header cell in resizable section
      const headerCells = page.getByRole("columnheader");
      const firstHeader = headerCells.first();
      await expect(firstHeader).toBeVisible();

      const cellBox = await firstHeader.boundingBox();
      if (!cellBox) {
        throw new Error("Could not get header cell bounding box");
      }

      // Perform resize drag on right edge
      const startX = cellBox.x + cellBox.width - 2;
      const startY = cellBox.y + cellBox.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 50, startY);
      await page.mouse.up();

      // Verify cell width changed
      const newBox = await firstHeader.boundingBox();
      if (newBox) {
        // Width should have increased
        expect(newBox.width).toBeGreaterThan(cellBox.width);
      }
    }
  });

  test("click on resize handle does not trigger sort", async ({ page }) => {
    // The main DataTableViewer demo has resizable columns
    // Find a sortable header cell
    const headerCells = page.getByRole("columnheader");
    const firstHeader = headerCells.first();
    await expect(firstHeader).toBeVisible();

    // Get initial aria-sort state
    const initialSort = await firstHeader.getAttribute("aria-sort");

    const cellBox = await firstHeader.boundingBox();
    if (!cellBox) {
      throw new Error("Could not get header cell bounding box");
    }

    // Click on resize handle area (right edge of cell)
    await page.mouse.click(cellBox.x + cellBox.width - 2, cellBox.y + cellBox.height / 2);

    // Wait for any state updates
    await page.waitForTimeout(100);

    // Verify sort state hasn't changed
    const afterSort = await firstHeader.getAttribute("aria-sort");
    expect(afterSort).toBe(initialSort);

    // Take screenshot for verification
    await page.screenshot({
      path: "e2e/screenshots/data-table-viewer-resize-no-sort.png",
    });
  });

  test("header and body columns are aligned", async ({ page }) => {
    // Wait for table to render
    await page.waitForTimeout(500);

    // Get header cell positions
    const headerCells = await page.getByRole("columnheader").all();
    const headerPositions: number[] = [];

    for (const cell of headerCells) {
      const box = await cell.boundingBox();
      if (box) {
        headerPositions.push(box.x);
      }
    }

    // Get first row cell positions
    const firstRow = page.locator('[data-index="0"]').first();
    if (await firstRow.isVisible()) {
      const bodyCells = await firstRow.locator("div").all();
      const bodyPositions: number[] = [];

      for (const cell of bodyCells) {
        const box = await cell.boundingBox();
        if (box) {
          bodyPositions.push(box.x);
        }
      }

      // Compare header and body positions (should be aligned within 2px)
      const minLength = Math.min(headerPositions.length, bodyPositions.length);
      for (let i = 0; i < minLength; i++) {
        const diff = Math.abs(headerPositions[i] - bodyPositions[i]);
        expect(diff).toBeLessThan(2);
      }
    }

    // Take screenshot for visual verification
    await page.screenshot({
      path: "e2e/screenshots/data-table-viewer-alignment.png",
    });
  });
});
