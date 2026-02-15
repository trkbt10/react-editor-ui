/**
 * @file E2E tests for ContextMenu component
 *
 * Tests context menu positioning, scrolling, and nested submenus:
 * - Viewport boundary handling (edges, corners)
 * - Scrollable content for long menus
 * - Nested submenu positioning
 * - Keyboard and click-outside closing
 */

import { test, expect } from "@playwright/test";

const CONTEXT_MENU_PAGE = "/#/components/data-display/context-menu";

test.describe("ContextMenu: Basic Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONTEXT_MENU_PAGE);
    await page.waitForSelector('[data-testid="context-trigger-basic"]');
  });

  test("opens on right-click", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-basic"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();
  });

  test("closes on click outside", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-basic"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Click outside
    await page.click("h2");
    await expect(menu).not.toBeVisible();
  });

  test("closes on Escape key", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-basic"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
  });

  test("selects item and closes menu", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-basic"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Click on "Copy" item
    const copyItem = page.locator('[data-testid="context-menu-item-copy"]');
    await copyItem.click();

    // Menu should close
    await expect(menu).not.toBeVisible();

    // Action should be recorded
    await expect(page.getByText("Last action: Selected: copy")).toBeVisible();
  });

  test("shows shortcut hints", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-basic"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Should see shortcut hint
    await expect(menu).toContainText("⌘C");
  });

  test("shows danger item styling", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-basic"]');
    await trigger.click({ button: "right" });

    const deleteItem = page.locator('[data-testid="context-menu-item-delete"]');
    await expect(deleteItem).toBeVisible();

    // Danger items have red color
    const color = await deleteItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Check that it's a reddish color (RGB format)
    expect(color).toMatch(/rgb\(2\d\d, \d+, \d+\)/);
  });
});

test.describe("ContextMenu: Viewport Boundary Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONTEXT_MENU_PAGE);
    await page.waitForSelector('[data-testid="context-trigger-basic"]');
  });

  test("adjusts position when near right edge", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-top-right"]');

    // Get viewport size
    const viewportSize = page.viewportSize();
    if (!viewportSize) throw new Error("No viewport");

    // Right-click on the right edge trigger
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Menu should be adjusted to stay within viewport
    const menuBox = await menu.boundingBox();
    if (!menuBox) throw new Error("No menu box");

    // Menu's right edge should not exceed viewport
    expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width);
  });

  test("adjusts position when near bottom edge", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-bottom-right"]');

    // Get viewport size
    const viewportSize = page.viewportSize();
    if (!viewportSize) throw new Error("No viewport");

    // Right-click on the bottom edge trigger
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Menu should be adjusted to stay within viewport
    const menuBox = await menu.boundingBox();
    if (!menuBox) throw new Error("No menu box");

    // Menu's bottom edge should not exceed viewport
    expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewportSize.height);
  });

  test("menu stays within viewport on corner position", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-bottom-right"]');

    // Get viewport size
    const viewportSize = page.viewportSize();
    if (!viewportSize) throw new Error("No viewport");

    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    const menuBox = await menu.boundingBox();
    if (!menuBox) throw new Error("No menu box");

    // Check all edges
    expect(menuBox.x).toBeGreaterThanOrEqual(0);
    expect(menuBox.y).toBeGreaterThanOrEqual(0);
    expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width);
    expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewportSize.height);
  });
});

test.describe("ContextMenu: Scrollable Content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONTEXT_MENU_PAGE);
    await page.waitForSelector('[data-testid="context-trigger-long"]');
  });

  test("long menu has scrollable content", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-long"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Check that menu has overflow-y: auto
    const overflowY = await menu.evaluate((el) => {
      return window.getComputedStyle(el).overflowY;
    });
    expect(overflowY).toBe("auto");

    // Check that menu has maxHeight set
    const maxHeight = await menu.evaluate((el) => {
      return window.getComputedStyle(el).maxHeight;
    });
    expect(maxHeight).not.toBe("none");
    expect(parseInt(maxHeight)).toBeLessThanOrEqual(300);
  });

  test("can scroll through long menu", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-long"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // First few items should be visible
    await expect(page.locator('[data-testid="context-menu-item-item-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="context-menu-item-item-5"]')).toBeVisible();

    // Last items might not be visible initially (requires scrolling)
    const lastItemVisible = await page.locator('[data-testid="context-menu-item-item-30"]').isVisible();

    if (!lastItemVisible) {
      // Scroll to bottom
      await menu.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });

      // Now last item should be visible
      await expect(page.locator('[data-testid="context-menu-item-item-30"]')).toBeVisible();
    }
  });

  test("scrollable menu respects maxHeight", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-long"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    const menuBox = await menu.boundingBox();
    if (!menuBox) throw new Error("No menu box");

    // Menu height should be limited (not showing all 30 items at once)
    expect(menuBox.height).toBeLessThanOrEqual(300);

    // Check that scroll is needed (scrollHeight > clientHeight)
    const hasScroll = await menu.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });
    expect(hasScroll).toBe(true);
  });
});

test.describe("ContextMenu: Nested Submenus", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONTEXT_MENU_PAGE);
    await page.waitForSelector('[data-testid="context-trigger-nested"]');
  });

  test("shows submenu on hover", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-nested"]');
    await trigger.click({ button: "right" });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Hover over "New" item which has children
    const newItem = page.locator('[data-testid="context-menu-item-new"]');
    await newItem.hover();

    // Submenu should appear
    const submenu = page.locator('[data-testid="context-submenu-1"]');
    await expect(submenu).toBeVisible();
  });

  test("submenu has correct items", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-nested"]');
    await trigger.click({ button: "right" });

    const newItem = page.locator('[data-testid="context-menu-item-new"]');
    await newItem.hover();

    // Check submenu items
    await expect(page.locator('[data-testid="context-menu-item-new-file"]')).toBeVisible();
    await expect(page.locator('[data-testid="context-menu-item-new-folder"]')).toBeVisible();
    await expect(page.locator('[data-testid="context-menu-item-new-template"]')).toBeVisible();
  });

  test("deeply nested submenu works", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-nested"]');
    await trigger.click({ button: "right" });

    // Open first level submenu
    const newItem = page.locator('[data-testid="context-menu-item-new"]');
    await newItem.hover();

    await expect(page.locator('[data-testid="context-submenu-1"]')).toBeVisible();

    // Open second level submenu
    const templateItem = page.locator('[data-testid="context-menu-item-new-template"]');
    await templateItem.hover();

    // Check deeply nested items
    const deepSubmenu = page.locator('[data-testid="context-submenu-2"]');
    await expect(deepSubmenu).toBeVisible();
    await expect(page.locator('[data-testid="context-menu-item-template-react"]')).toBeVisible();
  });

  test("selecting nested item closes all menus", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-nested"]');
    await trigger.click({ button: "right" });

    // Open submenu
    const newItem = page.locator('[data-testid="context-menu-item-new"]');
    await newItem.hover();

    // Click submenu item
    const fileItem = page.locator('[data-testid="context-menu-item-new-file"]');
    await fileItem.click();

    // All menus should close
    await expect(page.locator('[data-testid="context-menu"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="context-submenu-1"]')).not.toBeVisible();

    // Action should be recorded
    await expect(page.getByText("Last action: Selected: new-file")).toBeVisible();
  });

  test("submenu indicator shows chevron", async ({ page }) => {
    const trigger = page.locator('[data-testid="context-trigger-nested"]');
    await trigger.click({ button: "right" });

    // Items with children should show chevron (svg with polyline)
    const newItem = page.locator('[data-testid="context-menu-item-new"]');
    const chevron = newItem.locator("svg");
    await expect(chevron).toBeVisible();
  });

  test("submenu positioned within viewport", async ({ page }) => {
    // Use the nested trigger (not at edge) to test submenu viewport handling
    const trigger = page.locator('[data-testid="context-trigger-nested"]');

    const viewportSize = page.viewportSize();
    if (!viewportSize) throw new Error("No viewport");

    // Click near the right edge of the trigger to force menu near edge
    const triggerBox = await trigger.boundingBox();
    if (!triggerBox) throw new Error("No trigger box");

    await trigger.click({
      button: "right",
      position: { x: triggerBox.width - 10, y: triggerBox.height / 2 },
    });

    const menu = page.locator('[data-testid="context-menu"]');
    await expect(menu).toBeVisible();

    // Open submenu by hovering on "Open Recent" which is further down
    const openRecentItem = page.locator('[data-testid="context-menu-item-open"]');
    await openRecentItem.hover();

    const submenu = page.locator('[data-testid="context-submenu-1"]');
    await expect(submenu).toBeVisible();

    // Submenu should be within viewport
    const submenuBox = await submenu.boundingBox();
    if (!submenuBox) throw new Error("No submenu box");

    expect(submenuBox.x).toBeGreaterThanOrEqual(0);
    expect(submenuBox.x + submenuBox.width).toBeLessThanOrEqual(viewportSize.width);
    expect(submenuBox.y).toBeGreaterThanOrEqual(0);
    expect(submenuBox.y + submenuBox.height).toBeLessThanOrEqual(viewportSize.height);
  });
});

test.describe("ContextMenu: Visual Regression", () => {
  test("basic menu appearance", async ({ page }) => {
    await page.goto(CONTEXT_MENU_PAGE);
    await page.waitForSelector('[data-testid="context-trigger-basic"]');

    const trigger = page.locator('[data-testid="context-trigger-basic"]');
    await trigger.click({ button: "right" });

    await page.waitForSelector('[data-testid="context-menu"]');

    await page.screenshot({
      path: "e2e/screenshots/context-menu-basic.png",
      fullPage: true,
    });
  });

  test("nested submenu appearance", async ({ page }) => {
    await page.goto(CONTEXT_MENU_PAGE);
    await page.waitForSelector('[data-testid="context-trigger-nested"]');

    const trigger = page.locator('[data-testid="context-trigger-nested"]');
    await trigger.click({ button: "right" });

    const newItem = page.locator('[data-testid="context-menu-item-new"]');
    await newItem.hover();

    await page.waitForSelector('[data-testid="context-submenu-1"]');

    await page.screenshot({
      path: "e2e/screenshots/context-menu-nested.png",
      fullPage: true,
    });
  });

  test("scrollable menu appearance", async ({ page }) => {
    await page.goto(CONTEXT_MENU_PAGE);
    await page.waitForSelector('[data-testid="context-trigger-long"]');

    const trigger = page.locator('[data-testid="context-trigger-long"]');
    await trigger.click({ button: "right" });

    await page.waitForSelector('[data-testid="context-menu"]');

    await page.screenshot({
      path: "e2e/screenshots/context-menu-scrollable.png",
      fullPage: true,
    });
  });
});
