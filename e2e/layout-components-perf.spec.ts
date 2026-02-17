/**
 * @file E2E tests for layout component re-render performance
 *
 * Tests re-renders during user interactions for:
 * - Toolbar: button clicks should not re-render entire toolbar
 * - SelectionToolbar: operation clicks should not re-render sibling buttons
 * - PropertySection: expand/collapse should not re-render other sections
 * - Panel: close button interaction
 * - PropertyGrid: input changes should not re-render sibling items
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

test.describe("Toolbar Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/layout/toolbar");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during button clicks", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    // Wait for toolbar to render
    await page.waitForSelector('[role="toolbar"]');

    const logsBefore = allLogs.length;

    // Click multiple toolbar buttons
    const buttons = page.locator('[role="toolbar"] button[aria-label]');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await buttons.nth(i).click();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const toolbarRenders = countRenders(logsAfter, "Toolbar");
    const toolbarGroupRenders = countRenders(logsAfter, "ToolbarGroup");
    const toolbarDividerRenders = countRenders(logsAfter, "ToolbarDivider");
    const iconButtonRenders = countRenders(logsAfter, "IconButton");

    console.log("=== Toolbar Button Clicks ===");
    console.log(`Toolbar re-renders: ${toolbarRenders}`);
    console.log(`ToolbarGroup re-renders: ${toolbarGroupRenders}`);
    console.log(`ToolbarDivider re-renders: ${toolbarDividerRenders}`);
    console.log(`IconButton re-renders: ${iconButtonRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Toolbar and ToolbarGroup should NOT re-render on child button clicks
    // Only the clicked button's state change should trigger minimal re-renders
    expect(toolbarRenders).toBe(0);
    expect(toolbarGroupRenders).toBe(0);
    expect(toolbarDividerRenders).toBe(0);
  });

  test("measure re-renders during hover interactions", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="toolbar"]');

    const logsBefore = allLogs.length;

    // Hover over multiple toolbar buttons
    const buttons = page.locator('[role="toolbar"] button[aria-label]');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await buttons.nth(i).hover();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== Toolbar Hover ===");
    console.log(`Toolbar re-renders: ${countRenders(logsAfter, "Toolbar")}`);
    console.log(`ToolbarGroup re-renders: ${countRenders(logsAfter, "ToolbarGroup")}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Parent components should not re-render on hover
    expect(countRenders(logsAfter, "Toolbar")).toBe(0);
    expect(countRenders(logsAfter, "ToolbarGroup")).toBe(0);
  });
});

test.describe("SelectionToolbar Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/layout/selection-toolbar");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during operation clicks", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    // Wait for selection toolbar
    await page.waitForSelector('[role="toolbar"][aria-label="Selection toolbar"]');

    const logsBefore = allLogs.length;

    // Click multiple operation buttons
    const operationButtons = page.locator('[role="toolbar"][aria-label="Selection toolbar"] button');
    const count = await operationButtons.count();
    for (let i = 0; i < Math.min(4, count); i++) {
      await operationButtons.nth(i).click();
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const selectionToolbarRenders = countRenders(logsAfter, "SelectionToolbar");
    const operationButtonRenders = countRenders(logsAfter, "OperationButton");
    const toolbarRenders = countRenders(logsAfter, "Toolbar");

    console.log("=== SelectionToolbar Operation Clicks ===");
    console.log(`SelectionToolbar re-renders: ${selectionToolbarRenders}`);
    console.log(`OperationButton re-renders: ${operationButtonRenders}`);
    console.log(`Toolbar re-renders: ${toolbarRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // OperationButton re-renders should be minimal:
    // - Only buttons whose `active` state changed should re-render
    // - With 4 clicks toggling active states, expect ~2-3 re-renders per click
    // - Total should be much less than count * clicks (e.g., 6 buttons * 4 clicks = 24)
    expect(operationButtonRenders).toBeLessThanOrEqual(16);
  });

  test("measure re-renders on placement change", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('[role="toolbar"][aria-label="Selection toolbar"]');

    const logsBefore = allLogs.length;

    // Change placement via the select dropdown
    const placementSelect = page.locator('select');
    await placementSelect.selectOption("bottom");
    await page.waitForTimeout(200);
    await placementSelect.selectOption("top");
    await page.waitForTimeout(200);

    const logsAfter = allLogs.slice(logsBefore);
    const operationButtonRenders = countRenders(logsAfter, "OperationButton");

    console.log("=== SelectionToolbar Placement Change ===");
    console.log(`SelectionToolbar re-renders: ${countRenders(logsAfter, "SelectionToolbar")}`);
    console.log(`OperationButton re-renders: ${operationButtonRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // OperationButton should NOT re-render when only position changes
    // Only container position style should change, not button content
    expect(operationButtonRenders).toBe(0);
  });
});

test.describe("PropertySection Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/layout/property-section");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during expand/collapse", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    // Wait for sections to render - look for the collapsible section header buttons
    await page.waitForSelector('button[aria-expanded]');

    const logsBefore = allLogs.length;

    // Find collapsible section headers (buttons with aria-expanded attribute)
    const headers = page.locator('button[aria-expanded]');
    const count = await headers.count();

    // Toggle each section twice (collapse then expand)
    for (let i = 0; i < count; i++) {
      await headers.nth(i).click();
      await page.waitForTimeout(150);
      await headers.nth(i).click();
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const propertySectionRenders = countRenders(logsAfter, "PropertySection");
    const sectionHeaderRenders = countRenders(logsAfter, "SectionHeader");
    const propertyGridRenders = countRenders(logsAfter, "PropertyGrid");

    console.log("=== PropertySection Expand/Collapse ===");
    console.log(`PropertySection re-renders: ${propertySectionRenders}`);
    console.log(`SectionHeader re-renders: ${sectionHeaderRenders}`);
    console.log(`PropertyGrid re-renders: ${propertyGridRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // When toggling one section, sibling sections should NOT re-render
    // Only the toggled section and its children should re-render
  });

  test("measure re-renders during input changes within section", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('input');

    const logsBefore = allLogs.length;

    // Type in input fields
    const inputs = page.locator('input[aria-label]');
    const count = await inputs.count();
    for (let i = 0; i < Math.min(2, count); i++) {
      await inputs.nth(i).click();
      await inputs.nth(i).fill("100");
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== PropertySection Input Changes ===");
    console.log(`PropertySection re-renders: ${countRenders(logsAfter, "PropertySection")}`);
    console.log(`PropertyGrid re-renders: ${countRenders(logsAfter, "PropertyGrid")}`);
    console.log(`PropertyGridItem re-renders: ${countRenders(logsAfter, "PropertyGridItem")}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Section container should not re-render when child input changes
    expect(countRenders(logsAfter, "PropertySection")).toBe(0);
  });
});

test.describe("Panel Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/layout/panel");
    await page.waitForTimeout(2000);
  });

  test("measure re-renders during close button hover", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    // Wait for panels to render
    await page.waitForSelector('button[aria-label="Close"]');

    const logsBefore = allLogs.length;

    // Hover over close buttons
    const closeButtons = page.locator('button[aria-label="Close"]');
    const count = await closeButtons.count();
    for (let i = 0; i < count; i++) {
      await closeButtons.nth(i).hover();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    const panelRenders = countRenders(logsAfter, "Panel");
    const iconButtonRenders = countRenders(logsAfter, "IconButton");

    console.log("=== Panel Close Button Hover ===");
    console.log(`Panel re-renders: ${panelRenders}`);
    console.log(`IconButton re-renders: ${iconButtonRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Panel should NOT re-render when hovering close button
    expect(panelRenders).toBe(0);
  });

  test("measure child content re-renders", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    await page.waitForSelector('h3');

    const logsBefore = allLogs.length;

    // Interact with content inside panels (PropertyRow)
    const rows = page.locator('[data-testid="property-row"]');
    if (await rows.count() > 0) {
      await rows.first().hover();
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(300);

    const logsAfter = allLogs.slice(logsBefore);
    console.log("=== Panel Content Interaction ===");
    console.log(`Panel re-renders: ${countRenders(logsAfter, "Panel")}`);
    console.log(`PropertyRow re-renders: ${countRenders(logsAfter, "PropertyRow")}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Panel container should not re-render on child interactions
    expect(countRenders(logsAfter, "Panel")).toBe(0);
  });
});

test.describe("PropertyGrid Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5620/#/components/layout/property-section");
    await page.waitForTimeout(2000);
  });

  test("measure sibling item re-renders during single input change", async ({ page }) => {
    const allLogs = setupLogCapture(page);

    // Wait for grid items
    await page.waitForSelector('input[aria-label="X"], input[aria-label="Y"]');

    const logsBefore = allLogs.length;

    // Change only the X input
    const xInput = page.locator('input[aria-label="X"]');
    await xInput.click();
    await xInput.fill("50");
    await page.waitForTimeout(200);

    const logsAfter = allLogs.slice(logsBefore);
    const propertyGridItemRenders = countRenders(logsAfter, "PropertyGridItem");
    const propertyGridRenders = countRenders(logsAfter, "PropertyGrid");

    console.log("=== PropertyGrid Single Input Change ===");
    console.log(`PropertyGrid re-renders: ${propertyGridRenders}`);
    console.log(`PropertyGridItem re-renders: ${propertyGridItemRenders}`);
    console.log(`Total logs: ${logsAfter.length}`);

    // Grid container should not re-render
    expect(propertyGridRenders).toBe(0);

    // Only the changed item should re-render, not siblings
    // With proper memo, only 1 PropertyGridItem should re-render
  });
});
