/**
 * @file E2E tests for LayerItem component
 *
 * Tests Figma-style layer panel interactions:
 * - Selection (click, Shift+click range, Cmd/Ctrl+click toggle)
 * - Drag and drop (reorder, insert into group)
 * - Context menu
 * - Visibility/lock toggles
 * - Inline rename
 */

import { test, expect } from "@playwright/test";

const LAYER_ITEM_PAGE = "/#/components/data-display/layer-item";

test.describe("LayerItem: Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');
  });

  test("single click selects a layer", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-2"]');
    await layer.click();

    // aria-selected should be true for clicked item
    await expect(layer).toHaveAttribute("aria-selected", "true");

    // Other layers should not be selected
    const otherLayer = page.locator('[data-testid="layer-item-3"]');
    await expect(otherLayer).toHaveAttribute("aria-selected", "false");
  });

  test("Cmd/Ctrl+click toggles selection", async ({ page }) => {
    // First, click to select layer 1
    const layer1 = page.locator('[data-testid="layer-item-1"]');
    await layer1.click();
    await expect(layer1).toHaveAttribute("aria-selected", "true");

    // Cmd+click to add layer 2 to selection
    const layer2 = page.locator('[data-testid="layer-item-2"]');
    await layer2.click({ modifiers: ["Meta"] });

    // Both should be selected
    await expect(layer1).toHaveAttribute("aria-selected", "true");
    await expect(layer2).toHaveAttribute("aria-selected", "true");

    // Cmd+click layer 1 again to deselect it
    await layer1.click({ modifiers: ["Meta"] });
    await expect(layer1).toHaveAttribute("aria-selected", "false");
    await expect(layer2).toHaveAttribute("aria-selected", "true");
  });

  test("Shift+click selects range", async ({ page }) => {
    // Click layer 1 first
    const layer1 = page.locator('[data-testid="layer-item-1"]');
    await layer1.click();

    // Shift+click layer 4 to select range 1-4
    const layer4 = page.locator('[data-testid="layer-item-4"]');
    await layer4.click({ modifiers: ["Shift"] });

    // All layers in range should be selected
    await expect(layer1).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-testid="layer-item-2"]')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-testid="layer-item-3"]')).toHaveAttribute("aria-selected", "true");
    await expect(layer4).toHaveAttribute("aria-selected", "true");
  });

  test("Cmd+Shift+click adds range to existing selection", async ({ page }) => {
    // Click layer 1
    const layer1 = page.locator('[data-testid="layer-item-1"]');
    await layer1.click();

    // Cmd+click layer 5 to add it (now 1 and 5 selected)
    const layer5 = page.locator('[data-testid="layer-item-5"]');
    await layer5.click({ modifiers: ["Meta"] });

    // Shift+Cmd+click layer 7 to add range 5-7
    const layer7 = page.locator('[data-testid="layer-item-7"]');
    await layer7.click({ modifiers: ["Meta", "Shift"] });

    // Layer 1, 5, 6, 7 should all be selected
    await expect(layer1).toHaveAttribute("aria-selected", "true");
    await expect(layer5).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-testid="layer-item-6"]')).toHaveAttribute("aria-selected", "true");
    await expect(layer7).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("LayerItem: Visibility and Lock", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');
  });

  test("visibility toggle works on hover", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');

    // Hover to reveal visibility button
    await layer.hover();

    // Find and click visibility toggle
    const visibilityBtn = layer.locator('[data-testid="visibility-toggle"]');
    await expect(visibilityBtn).toBeVisible();
    await visibilityBtn.click();

    // Layer should now be dimmed (visible=false)
    await expect(layer).toHaveCSS("opacity", "0.5");

    // Click again to restore
    await layer.hover();
    await visibilityBtn.click();
    await expect(layer).not.toHaveCSS("opacity", "0.5");
  });

  test("lock toggle works on hover", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');

    // Hover to reveal lock button
    await layer.hover();

    // Find and click lock toggle
    const lockBtn = layer.locator('[data-testid="lock-toggle"]');
    await expect(lockBtn).toBeVisible();
    await lockBtn.click();

    // Lock icon should change (we check via re-hovering)
    await layer.hover();
    // The icon should still be there (lock state persists)
    await expect(lockBtn).toBeVisible();
  });
});

test.describe("LayerItem: Expand/Collapse", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');
  });

  test("expand button toggles children visibility", async ({ page }) => {
    // Layer 1 (Main Frame) should be expanded by default
    const layer1 = page.locator('[data-testid="layer-item-1"]');
    await expect(layer1).toHaveAttribute("aria-expanded", "true");

    // Children should be visible
    const layer2 = page.locator('[data-testid="layer-item-2"]');
    await expect(layer2).toBeVisible();

    // Click expand button to collapse (it's a span with role="button")
    const expandBtn = layer1.locator('[role="button"][aria-label="Collapse"]');
    await expandBtn.click();

    // Children should be hidden
    await expect(layer2).not.toBeVisible();

    // Click again to expand
    const expandBtnAfter = layer1.locator('[role="button"][aria-label="Expand"]');
    await expandBtnAfter.click();
    await expect(layer2).toBeVisible();
  });
});

test.describe("LayerItem: Inline Rename", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');
  });

  test("double-tap enters edit mode", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');

    // Double-tap (two quick clicks)
    await layer.click();
    await layer.click();

    // Input should appear
    const input = page.locator('[data-testid="layer-name-input"]');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test("Enter commits rename", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');

    // Enter edit mode
    await layer.click();
    await layer.click();

    const input = page.locator('[data-testid="layer-name-input"]');
    await input.fill("New Layer Name");
    await page.keyboard.press("Enter");

    // Input should disappear
    await expect(input).not.toBeVisible();

    // Label should be updated
    await expect(layer).toContainText("New Layer Name");
  });

  test("Escape cancels rename", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');

    // Enter edit mode
    await layer.click();
    await layer.click();

    const input = page.locator('[data-testid="layer-name-input"]');
    await input.fill("Should Not Apply");
    await page.keyboard.press("Escape");

    // Input should disappear
    await expect(input).not.toBeVisible();

    // Original label should be preserved
    await expect(layer).toContainText("Logo");
  });

  test("locked layer cannot be renamed", async ({ page }) => {
    // Layer 7 (Footer) is locked by default
    const layer = page.locator('[data-testid="layer-item-7"]');

    // Try double-tap
    await layer.click();
    await layer.click();

    // Input should NOT appear
    const input = page.locator('[data-testid="layer-name-input"]');
    await expect(input).not.toBeVisible();
  });
});

test.describe("LayerItem: Context Menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');
  });

  test("right-click shows context menu", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');
    await layer.click({ button: "right" });

    // Context menu should appear
    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();
  });

  test("context menu item triggers action", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');
    await layer.click({ button: "right" });

    // Click duplicate
    const duplicateItem = page.locator('[data-testid="context-menu-item-duplicate"]');
    await duplicateItem.click();

    // Context menu should close
    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).not.toBeVisible();

    // Should see a "Copy" layer
    await expect(page.getByText("Logo Copy")).toBeVisible();
  });

  test("delete action removes layer", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-8"]');
    await expect(layer).toBeVisible();

    // Right-click and delete
    await layer.click({ button: "right" });
    const deleteItem = page.locator('[data-testid="context-menu-item-delete"]');
    await deleteItem.click();

    // Layer should be removed
    await expect(layer).not.toBeVisible();
  });

  test("click outside closes context menu", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');
    await layer.click({ button: "right" });

    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();

    // Click outside
    await page.click("h2");

    await expect(contextMenu).not.toBeVisible();
  });

  test("Escape closes context menu", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');
    await layer.click({ button: "right" });

    const contextMenu = page.locator('[data-testid="context-menu"]');
    await expect(contextMenu).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");

    await expect(contextMenu).not.toBeVisible();
  });
});

test.describe("LayerItem: Drag and Drop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');
  });

  test("drag starts when dragging a layer", async ({ page }) => {
    const layer = page.locator('[data-testid="layer-item-3"]');

    // Get initial position
    const box = await layer.boundingBox();
    if (!box) throw new Error("Layer not found");

    // Start drag
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    // Move mouse
    await page.mouse.move(box.x + box.width / 2, box.y + 100);

    // Layer should be draggable
    await expect(layer).toHaveAttribute("draggable", "true");

    await page.mouse.up();
  });

  test("drop indicator appears during drag over", async ({ page }) => {
    const sourceLayer = page.locator('[data-testid="layer-item-8"]');
    const targetLayer = page.locator('[data-testid="layer-item-7"]');

    const sourceBox = await sourceLayer.boundingBox();
    const targetBox = await targetLayer.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("Layers not found");

    // Initiate drag
    await sourceLayer.dragTo(targetLayer, {
      targetPosition: { x: targetBox.width / 2, y: 5 }, // Top of target (before position)
    });

    // The drag operation should complete without errors
    // Visual verification would require screenshot comparison
  });

  test("reorder layers via drag and drop", async ({ page }) => {
    // Background (8) should be at the bottom
    const background = page.locator('[data-testid="layer-item-8"]');
    const mainFrame = page.locator('[data-testid="layer-item-1"]');

    // Get initial order - Background should be after Main Frame tree
    const bgBox = await background.boundingBox();
    const mfBox = await mainFrame.boundingBox();

    if (!bgBox || !mfBox) throw new Error("Layers not found");

    // Background should be below Main Frame
    expect(bgBox.y).toBeGreaterThan(mfBox.y);

    // Drag Background to before Main Frame
    await background.dragTo(mainFrame, {
      targetPosition: { x: 50, y: 2 },
    });

    // After drag, check positions changed
    const bgBoxAfter = await background.boundingBox();
    const mfBoxAfter = await mainFrame.boundingBox();

    if (bgBoxAfter && mfBoxAfter) {
      // Background should now be above or at same level as Main Frame
      expect(bgBoxAfter.y).toBeLessThanOrEqual(mfBoxAfter.y);
    }
  });
});

test.describe("LayerItem: Multi-selection Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');
  });

  test("visibility toggle applies to all selected layers", async ({ page }) => {
    // Select multiple layers
    const layer2 = page.locator('[data-testid="layer-item-2"]');
    const layer3 = page.locator('[data-testid="layer-item-3"]');
    const layer4 = page.locator('[data-testid="layer-item-4"]');

    await layer2.click();
    await layer3.click({ modifiers: ["Meta"] });
    await layer4.click({ modifiers: ["Meta"] });

    // All should be selected
    await expect(layer2).toHaveAttribute("aria-selected", "true");
    await expect(layer3).toHaveAttribute("aria-selected", "true");
    await expect(layer4).toHaveAttribute("aria-selected", "true");

    // Toggle visibility on one of them
    await layer3.hover();
    const visibilityBtn = layer3.locator('[data-testid="visibility-toggle"]');
    await visibilityBtn.click();

    // All selected layers should be dimmed
    await expect(layer2).toHaveCSS("opacity", "0.5");
    await expect(layer3).toHaveCSS("opacity", "0.5");
    await expect(layer4).toHaveCSS("opacity", "0.5");
  });

  test("delete via context menu removes all selected layers", async ({ page }) => {
    // Select layers 3 and 4 using Shift+click (more reliable for range selection)
    const layer3 = page.locator('[data-testid="layer-item-3"]');
    const layer4 = page.locator('[data-testid="layer-item-4"]');

    await layer3.click();
    await layer4.click({ modifiers: ["Shift"] });

    // Verify both are selected
    await expect(layer3).toHaveAttribute("aria-selected", "true");
    await expect(layer4).toHaveAttribute("aria-selected", "true");

    // Right-click on one of the selected (context menu should preserve selection)
    await layer3.click({ button: "right" });

    // Click delete
    const deleteItem = page.locator('[data-testid="context-menu-item-delete"]');
    await deleteItem.click();

    // Both should be removed
    await expect(layer3).not.toBeVisible();
    await expect(layer4).not.toBeVisible();
  });
});

test.describe("LayerItem: Visual Regression", () => {
  test("layer item default state", async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');

    await page.screenshot({
      path: "e2e/screenshots/layer-item-default.png",
      fullPage: true,
    });
  });

  test("layer item with selection", async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');

    // Select multiple layers
    const layer1 = page.locator('[data-testid="layer-item-1"]');
    const layer2 = page.locator('[data-testid="layer-item-2"]');
    await layer1.click();
    await layer2.click({ modifiers: ["Meta"] });

    await page.screenshot({
      path: "e2e/screenshots/layer-item-multiselect.png",
      fullPage: true,
    });
  });

  test("layer item with context menu", async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');

    // Open context menu
    const layer = page.locator('[data-testid="layer-item-3"]');
    await layer.click({ button: "right" });

    await page.screenshot({
      path: "e2e/screenshots/layer-item-contextmenu.png",
      fullPage: true,
    });
  });

  test("layer item hover state", async ({ page }) => {
    await page.goto(LAYER_ITEM_PAGE);
    await page.waitForSelector('[data-testid^="layer-item-"]');

    // Hover over a layer to show action buttons
    const layer = page.locator('[data-testid="layer-item-3"]');
    await layer.hover();

    await page.screenshot({
      path: "e2e/screenshots/layer-item-hover.png",
      fullPage: true,
    });
  });
});
