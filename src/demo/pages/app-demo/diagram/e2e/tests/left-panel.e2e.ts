/**
 * @file Left panel E2E tests - Shapes search + Layers layout
 */

import { test, expect } from "@playwright/test";

test.describe("Left Panel - Shapes and Layers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should show shapes search at top and layers at bottom (no tabs)", async ({ page }) => {
    // Verify NO tab bar exists in the left panel
    const leftPanel = page.locator('[data-testid="left-panel"]');
    await expect(leftPanel).toBeVisible();

    // Tab bar should NOT be present
    const tabBar = leftPanel.locator('[role="tablist"]');
    await expect(tabBar).not.toBeVisible();

    // Shapes search section should be at the top
    const shapesSection = page.locator('[data-testid="shapes-section"]');
    await expect(shapesSection).toBeVisible();

    // Search input should be visible
    const searchInput = shapesSection.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Layers section should be at the bottom
    const layersSection = page.locator('[data-testid="layers-section"]');
    await expect(layersSection).toBeVisible();

    // Layers header should be visible
    const layersHeader = layersSection.locator('text=Layers');
    await expect(layersHeader).toBeVisible();
  });

  test("should have shapes section above layers section", async ({ page }) => {
    const shapesSection = page.locator('[data-testid="shapes-section"]');
    const layersSection = page.locator('[data-testid="layers-section"]');

    await expect(shapesSection).toBeVisible();
    await expect(layersSection).toBeVisible();

    // Get bounding boxes to verify vertical order
    const shapesBox = await shapesSection.boundingBox();
    const layersBox = await layersSection.boundingBox();

    expect(shapesBox).not.toBeNull();
    expect(layersBox).not.toBeNull();

    if (shapesBox && layersBox) {
      // Shapes section should be above (smaller Y) layers section
      expect(shapesBox.y).toBeLessThan(layersBox.y);
    }
  });

  test("should search shapes in the shapes section", async ({ page }) => {
    const shapesSection = page.locator('[data-testid="shapes-section"]');
    const searchInput = shapesSection.locator('input[placeholder*="Search"]');

    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill("ellipse");

    // Wait for search results
    await page.waitForTimeout(100);

    // Ellipse should be visible in results (div[role="button"] in LibraryGridItem)
    const ellipseItem = shapesSection.locator('div[role="button"]:has-text("Ellipse")');
    await expect(ellipseItem).toBeVisible();

    // Rectangle should not be visible (filtered out)
    const rectItem = shapesSection.locator('div[role="button"]:has-text("Rectangle")');
    await expect(rectItem).not.toBeVisible();
  });

  test("should show canvas layer items in layers section", async ({ page }) => {
    const layersSection = page.locator('[data-testid="layers-section"]');
    await expect(layersSection).toBeVisible();

    // Should show at least one layer item (from mockData)
    const layerItems = layersSection.locator('[data-testid^="layer-item-"]');
    const count = await layerItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should select node when clicking layer item", async ({ page }) => {
    const layersSection = page.locator('[data-testid="layers-section"]');
    const firstLayerItem = layersSection.locator('[data-testid^="layer-item-"]').first();

    await expect(firstLayerItem).toBeVisible();

    // Click the layer item
    await firstLayerItem.click();

    // Bounding box should appear on canvas
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });

  test("should drag shape from shapes section to canvas", async ({ page }) => {
    const shapesSection = page.locator('[data-testid="shapes-section"]');

    // Search for a shape to get grid view
    const searchInput = shapesSection.locator('input[placeholder*="Search"]');
    await searchInput.fill("rect");
    await page.waitForTimeout(100);

    // Find a draggable shape item (role="button" with draggable)
    const shapeItem = shapesSection.locator('div[role="button"][draggable="true"]').first();
    await expect(shapeItem).toBeVisible();

    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();
    const initialCount = await getNodeCount();

    // Get shape and canvas positions
    const shapeBox = await shapeItem.boundingBox();
    const canvas = page.locator('[data-testid="canvas-svg"]');
    const canvasBox = await canvas.boundingBox();

    expect(shapeBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();

    if (shapeBox && canvasBox) {
      // Drag from shape to canvas center
      await page.mouse.move(
        shapeBox.x + shapeBox.width / 2,
        shapeBox.y + shapeBox.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        canvasBox.x + canvasBox.width / 2,
        canvasBox.y + canvasBox.height / 2,
      );
      await page.mouse.up();

      await page.waitForTimeout(200);

      // Verify node count increased
      const afterCount = await getNodeCount();
      expect(afterCount).toBe(initialCount + 1);
    }
  });

  test("should have resizable divider between shapes and layers", async ({ page }) => {
    // Divider should exist
    const divider = page.locator('[data-testid="panel-divider"]');
    await expect(divider).toBeVisible();

    // Divider should have appropriate cursor style (row-resize, ns-resize, or col-resize from ResizeHandle)
    const cursor = await divider.evaluate((el) =>
      window.getComputedStyle(el).cursor,
    );
    expect(["row-resize", "ns-resize", "col-resize"]).toContain(cursor);
  });
});
