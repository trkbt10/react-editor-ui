/**
 * @file E2E tests for data display component re-render performance
 *
 * Tests re-renders during user interactions for:
 * - PropertyRow: hover interactions
 * - SectionHeader: expand/collapse clicks
 * - TreeItem: selection, expand/collapse
 * - LayerItem: selection, visibility toggle, lock toggle, expand/collapse
 * - Select: open/close, option selection
 * - ContextMenu: open, hover, selection
 */

import { test, expect } from "@playwright/test";

// Helper to count component re-renders from react-scan logs
function countRenders(logs: string[], componentName: string): number {
  return logs.filter((log) => log.includes(componentName)).length;
}

// Helper to setup console log capture
function setupLogCapture(page: import("@playwright/test").Page): string[] {
  const allLogs: string[] = [];
  page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));
  return allLogs;
}

test.describe("PropertyRow Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/property-row");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during hover", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="button"]');

    const logsBefore = allLogs.length;

    // Hover over clickable PropertyRows
    const clickableRows = page.locator('[role="button"]');
    const count = await clickableRows.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await clickableRows.nth(i).hover();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const propertyRowRenders = countRenders(logsAfter, "PropertyRow");

    console.log("=== PropertyRow Hover ===");
    console.log(`PropertyRow re-renders: ${propertyRowRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Only the hovered row should re-render (hover state change)
    // With proper memo, sibling rows should not re-render
  });
});

test.describe("SectionHeader Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/section-header");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during expand/collapse", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[aria-expanded]');

    const logsBefore = allLogs.length;

    // Click on collapsible headers to toggle
    const headers = page.locator('[aria-expanded]');
    const count = await headers.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await headers.nth(i).click();
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const sectionHeaderRenders = countRenders(logsAfter, "SectionHeader");
    const chevronIconRenders = countRenders(logsAfter, "ChevronIcon");

    console.log("=== SectionHeader Expand/Collapse ===");
    console.log(`SectionHeader re-renders: ${sectionHeaderRenders}`);
    console.log(`ChevronIcon re-renders: ${chevronIconRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Only the clicked header should re-render, not siblings
  });
});

test.describe("TreeItem Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/tree-item");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during selection", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="treeitem"]');

    const logsBefore = allLogs.length;

    // Click on tree items to select
    const items = page.locator('[role="treeitem"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await items.nth(i).click();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const treeItemRenders = countRenders(logsAfter, "TreeItem");
    const expanderRenders = countRenders(logsAfter, "Expander");

    console.log("=== TreeItem Selection ===");
    console.log(`TreeItem re-renders: ${treeItemRenders}`);
    console.log(`Expander re-renders: ${expanderRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // With 5 selections, each changing 2 items (prev selected + new selected)
    // We expect around 10 TreeItem re-renders, not 5 * total_items
  });

  test("measure re-renders during expand/collapse", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="treeitem"]');

    const logsBefore = allLogs.length;

    // Click on expanders
    const expanders = page.locator('[aria-label="Expand"], [aria-label="Collapse"]');
    const count = await expanders.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await expanders.nth(i).click();
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== TreeItem Expand/Collapse ===");
    console.log(`TreeItem re-renders: ${countRenders(logsAfter, "TreeItem")}`);
    console.log(`Expander re-renders: ${countRenders(logsAfter, "Expander")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("LayerItem Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/layer-item");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during selection", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[data-testid^="layer-item"]');

    const logsBefore = allLogs.length;

    // Click on layer items to select
    const items = page.locator('[data-testid^="layer-item"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await items.nth(i).click();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const layerItemRenders = countRenders(logsAfter, "LayerItem");

    console.log("=== LayerItem Selection ===");
    console.log(`LayerItem re-renders: ${layerItemRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // With proper memo, only selected/deselected items should re-render
  });

  test("measure re-renders during visibility toggle", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[data-testid^="layer-item"]');

    const logsBefore = allLogs.length;

    // Hover to show visibility toggle, then click
    const items = page.locator('[data-testid^="layer-item"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      const item = items.nth(i);
      await item.hover();
      await page.waitForTimeout(100);
      const toggle = item.locator('[data-testid="visibility-toggle"]');
      if (await toggle.isVisible({ timeout: 500 }).catch(() => false)) {
        await toggle.click();
        await page.waitForTimeout(100);
      }
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== LayerItem Visibility Toggle ===");
    console.log(`LayerItem re-renders: ${countRenders(logsAfter, "LayerItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Only the toggled item should re-render
  });

  test("measure re-renders during lock toggle", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[data-testid^="layer-item"]');

    const logsBefore = allLogs.length;

    // Hover to show lock toggle, then click
    const items = page.locator('[data-testid^="layer-item"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      const item = items.nth(i);
      await item.hover();
      await page.waitForTimeout(100);
      const toggle = item.locator('[data-testid="lock-toggle"]');
      if (await toggle.isVisible({ timeout: 500 }).catch(() => false)) {
        await toggle.click();
        await page.waitForTimeout(100);
      }
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== LayerItem Lock Toggle ===");
    console.log(`LayerItem re-renders: ${countRenders(logsAfter, "LayerItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during expand/collapse", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[data-testid^="layer-item"]');

    // Find expanders within layer items
    const expanders = page.locator('[data-testid^="layer-item"] [aria-label="Expand"], [data-testid^="layer-item"] [aria-label="Collapse"]');
    const count = await expanders.count();

    if (count === 0) {
      console.log("No expanders found in LayerItem demo, skipping");
      return;
    }

    const logsBefore = allLogs.length;

    // Click on expanders
    for (let i = 0; i < Math.min(3, count); i++) {
      const expander = expanders.nth(i);
      if (await expander.isVisible({ timeout: 500 }).catch(() => false)) {
        await expander.click();
        await page.waitForTimeout(150);
      }
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== LayerItem Expand/Collapse ===");
    console.log(`LayerItem re-renders: ${countRenders(logsAfter, "LayerItem")}`);
    console.log(`ChevronIcon re-renders: ${countRenders(logsAfter, "ChevronIcon")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });
});

test.describe("Select Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/select");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during open/close", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="combobox"]');

    const logsBefore = allLogs.length;

    // Open and close select dropdowns
    const selects = page.locator('[role="combobox"]');
    const count = await selects.count();
    for (let i = 0; i < Math.min(2, count); i++) {
      const select = selects.nth(i);
      if (await select.isEnabled()) {
        await select.click();
        await page.waitForTimeout(200);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(100);
      }
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const selectRenders = countRenders(logsAfter, "Select");
    const optionRenders = countRenders(logsAfter, "SelectOptionItem");

    console.log("=== Select Open/Close ===");
    console.log(`Select re-renders: ${selectRenders}`);
    console.log(`SelectOptionItem re-renders: ${optionRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during option selection", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="combobox"]');

    const logsBefore = allLogs.length;

    // Open select and click options
    const select = page.locator('[role="combobox"]').first();
    if (await select.isEnabled()) {
      await select.click();
      await page.waitForTimeout(200);

      // Select different options
      const options = page.locator('[role="option"]');
      const optCount = await options.count();
      for (let i = 0; i < Math.min(3, optCount); i++) {
        // Re-open after each selection
        if (i > 0) {
          await select.click();
          await page.waitForTimeout(200);
        }
        const option = page.locator('[role="option"]').nth(i);
        if (await option.isVisible()) {
          await option.click();
          await page.waitForTimeout(150);
        }
      }
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== Select Option Selection ===");
    console.log(`Select re-renders: ${countRenders(logsAfter, "Select")}`);
    console.log(`SelectOptionItem re-renders: ${countRenders(logsAfter, "SelectOptionItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);
  });

  test("measure re-renders during option hover", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="combobox"]');

    // Open select
    const select = page.locator('[role="combobox"]').first();
    if (!(await select.isEnabled())) {
      return;
    }
    await select.click();
    await page.waitForTimeout(200);

    const logsBefore = allLogs.length;

    // Hover over options
    const options = page.locator('[role="option"]');
    const count = await options.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await options.nth(i).hover();
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const optionRenders = countRenders(logsAfter, "SelectOptionItem");

    console.log("=== Select Option Hover ===");
    console.log(`SelectOptionItem re-renders: ${optionRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // With 5 hovers, changing focus from one option to another
    // Expected: ~10 re-renders (prev focused + new focused per hover)
    // Should be much less than 5 * total_options
    expect(optionRenders).toBeLessThanOrEqual(15);
  });
});

test.describe("ContextMenu Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/data-display/context-menu");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during hover", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    // Open context menu by right-clicking on trigger area
    const trigger = page.locator('[data-testid="context-menu-trigger"]').first();
    if (!(await trigger.isVisible({ timeout: 1000 }).catch(() => false))) {
      // Try alternative: look for any area that triggers context menu
      const demoArea = page.locator('.demo-surface, [style*="background"]').first();
      await demoArea.click({ button: "right" });
    } else {
      await trigger.click({ button: "right" });
    }
    await page.waitForTimeout(300);

    const menu = page.locator('[role="menu"]');
    if (!(await menu.isVisible({ timeout: 1000 }).catch(() => false))) {
      console.log("Context menu not visible, skipping test");
      return;
    }

    const logsBefore = allLogs.length;

    // Hover over menu items
    const items = page.locator('[role="menuitem"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await items.nth(i).hover();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const menuItemRenders = countRenders(logsAfter, "MenuItem");
    const contextMenuRenders = countRenders(logsAfter, "ContextMenu");

    console.log("=== ContextMenu Hover ===");
    console.log(`ContextMenu re-renders: ${contextMenuRenders}`);
    console.log(`MenuItem re-renders: ${menuItemRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Only hovered items should re-render
    // ContextMenu container should not re-render on item hover
    expect(contextMenuRenders).toBe(0);
  });
});
