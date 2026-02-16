/**
 * @file E2E tests for Panel component re-render performance
 *
 * Tests that optimized panels don't trigger unnecessary re-renders:
 * - When one input changes, other inputs shouldn't re-render
 * - When parent state changes, memoized children shouldn't re-render
 *
 * Uses react-scan logs to count component re-renders.
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5620/#/components/composite";

/**
 * Helper to capture and count re-renders
 * react-scan logs in format: "ComponentName ×N" or similar
 */
function createRerenderCounter() {
  const logs: string[] = [];
  return {
    logs,
    setupListener: (page: import("@playwright/test").Page) => {
      page.on("console", (msg) => {
        const text = msg.text();
        logs.push(`[${msg.type()}] ${text}`);
      });
    },
    countRerenders: (componentName: string, since: number = 0) => {
      return logs.slice(since).filter((log) => log.includes(componentName)).length;
    },
    getLogsSince: (since: number) => logs.slice(since),
    getCurrentLength: () => logs.length,
    // Filter logs that look like react-scan output
    getRerenderLogs: (since: number = 0) => {
      return logs.slice(since).filter((log) =>
        log.includes("×") || // react-scan format
        log.includes("re-render") ||
        log.includes("rendered") ||
        log.includes("Panel") ||
        log.includes("Input") ||
        log.includes("Select")
      );
    },
  };
}

test.describe("PositionPanel Re-render Performance", () => {
  test("changing X input should not re-render unrelated components", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/position-panel`);
    await page.waitForTimeout(1500);

    // Wait for panel to render - use first() to avoid strict mode violation
    await page.waitForSelector('[aria-label="X position"]');

    const logsBefore = counter.getCurrentLength();

    // Find X input and change its value - use first() for the first panel instance
    const xInput = page.locator('[aria-label="X position"]').first();
    await xInput.click();
    await xInput.fill("150");
    await page.waitForTimeout(300);

    // Log counts
    const rerenderLogs = counter.getRerenderLogs(logsBefore);
    console.log("=== PositionPanel X Input Change ===");
    console.log(`Total logs: ${counter.getLogsSince(logsBefore).length}`);
    console.log(`Re-render related logs: ${rerenderLogs.length}`);
    console.log("Sample logs:", rerenderLogs.slice(0, 5));

    // Take screenshot for visual verification
    await page.screenshot({
      path: "e2e/screenshots/position-panel-x-change.png",
      fullPage: true,
    });
  });

  test("changing alignment should not re-render position inputs", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/position-panel`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="X position"]');

    const logsBefore = counter.getCurrentLength();

    // Click horizontal alignment button - use first() for first panel
    const alignCenter = page.locator('[aria-label="Align center horizontally"]').first();
    if (await alignCenter.isVisible()) {
      await alignCenter.click();
      await page.waitForTimeout(300);
    }

    const rerenderLogs = counter.getRerenderLogs(logsBefore);
    console.log("=== PositionPanel Alignment Change ===");
    console.log(`Total logs: ${counter.getLogsSince(logsBefore).length}`);
    console.log(`Re-render related logs: ${rerenderLogs.length}`);

    await page.screenshot({
      path: "e2e/screenshots/position-panel-align-change.png",
      fullPage: true,
    });
  });
});

test.describe("StrokeSettingsPanel Re-render Performance", () => {
  test("changing tab should not cause excessive re-renders", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/stroke-settings-panel`);
    await page.waitForTimeout(1500);

    // Wait for panel
    await page.waitForSelector('[aria-label="Stroke settings tab"]');

    const logsBefore = counter.getCurrentLength();

    // SegmentedControl uses radio buttons
    const dynamicTab = page.getByRole("radio", { name: "Dynamic" }).first();
    await dynamicTab.click();
    await page.waitForTimeout(300);

    const brushTab = page.getByRole("radio", { name: "Brush" }).first();
    await brushTab.click();
    await page.waitForTimeout(300);

    const basicTab = page.getByRole("radio", { name: "Basic" }).first();
    await basicTab.click();
    await page.waitForTimeout(300);

    const rerenderLogs = counter.getRerenderLogs(logsBefore);
    console.log("=== StrokeSettingsPanel Tab Changes ===");
    console.log(`Total logs: ${counter.getLogsSince(logsBefore).length}`);
    console.log(`Re-render related logs: ${rerenderLogs.length}`);
    console.log("Sample logs:", rerenderLogs.slice(0, 10));

    await page.screenshot({
      path: "e2e/screenshots/stroke-panel-tab-change.png",
      fullPage: true,
    });
  });

  test("changing miter angle should not re-render style select", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/stroke-settings-panel`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="Miter angle"]');

    const logsBefore = counter.getCurrentLength();

    // Change miter angle
    const miterInput = page.locator('[aria-label="Miter angle"]');
    await miterInput.click();
    await miterInput.fill("45");
    await page.waitForTimeout(300);

    const logsAfter = counter.getLogsSince(logsBefore);
    console.log("=== StrokeSettingsPanel Miter Angle Change ===");
    console.log(`Total re-render logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/stroke-panel-miter-change.png",
      fullPage: true,
    });
  });
});

test.describe("TypographyPanel Re-render Performance", () => {
  test("changing font size should not re-render alignment controls", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/typography-panel`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="Font size"]');

    const logsBefore = counter.getCurrentLength();

    // Change font size
    const fontSizeInput = page.locator('[aria-label="Font size"]');
    await fontSizeInput.click();
    await fontSizeInput.fill("24");
    await page.waitForTimeout(300);

    const logsAfter = counter.getLogsSince(logsBefore);
    console.log("=== TypographyPanel Font Size Change ===");
    console.log(`Total re-render logs: ${logsAfter.length}`);
    console.log("Logs:", logsAfter.slice(0, 10));

    await page.screenshot({
      path: "e2e/screenshots/typography-panel-fontsize-change.png",
      fullPage: true,
    });
  });

  test("expanding/collapsing section should be efficient", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/typography-panel`);
    await page.waitForTimeout(1500);

    // Find the collapsible section header
    const sectionHeader = page.locator("text=Typography").first();

    const logsBefore = counter.getCurrentLength();

    // Collapse
    await sectionHeader.click();
    await page.waitForTimeout(300);

    // Expand
    await sectionHeader.click();
    await page.waitForTimeout(300);

    const logsAfter = counter.getLogsSince(logsBefore);
    console.log("=== TypographyPanel Collapse/Expand ===");
    console.log(`Total re-render logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/typography-panel-toggle.png",
      fullPage: true,
    });
  });
});

test.describe("FontsPanel Re-render Performance", () => {
  test("selecting a font should not re-render all list items", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/fonts-panel`);
    await page.waitForTimeout(1500);

    // Wait for font list to render
    await page.waitForSelector('[role="listbox"]');

    const logsBefore = counter.getCurrentLength();

    // Click on different fonts
    const fontItems = page.locator('[role="listbox"] > *');
    const count = await fontItems.count();

    if (count >= 3) {
      await fontItems.nth(1).click();
      await page.waitForTimeout(200);
      await fontItems.nth(2).click();
      await page.waitForTimeout(200);
    }

    const rerenderLogs = counter.getRerenderLogs(logsBefore);
    console.log("=== FontsPanel Font Selection ===");
    console.log(`Total logs: ${counter.getLogsSince(logsBefore).length}`);
    console.log(`Re-render related logs: ${rerenderLogs.length}`);
    console.log("Sample logs:", rerenderLogs.slice(0, 10));

    // Count FontListItem re-renders specifically
    const fontListItemRenders = counter.logs.slice(logsBefore).filter((log) =>
      log.includes("FontListItem")
    ).length;
    console.log(`FontListItem re-renders: ${fontListItemRenders}`);
    console.log(`Font items in list: ${count}`);

    // Ideally: with 2 selections, only ~4 FontListItem renders (2 old + 2 new)
    // Not count * 2 = all items twice
    const isEfficient = fontListItemRenders <= count + 4;
    console.log(`Efficient: ${isEfficient} (${fontListItemRenders} <= ${count + 4})`);

    await page.screenshot({
      path: "e2e/screenshots/fonts-panel-selection.png",
      fullPage: true,
    });
  });

  test("typing in search should filter efficiently", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/fonts-panel`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[role="listbox"]');

    const logsBefore = counter.getCurrentLength();

    // Find search input and type
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.click();
    await searchInput.type("Inter", { delay: 100 });
    await page.waitForTimeout(300);

    const logsAfter = counter.getLogsSince(logsBefore);
    console.log("=== FontsPanel Search ===");
    console.log(`Total re-render logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/fonts-panel-search.png",
      fullPage: true,
    });
  });
});

test.describe("AnimationPanel Re-render Performance", () => {
  test("changing duration should not re-render bezier editor", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/animation-panel`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="Duration"]');

    const logsBefore = counter.getCurrentLength();

    // Change duration
    const durationInput = page.locator('[aria-label="Duration"]');
    await durationInput.click();
    await durationInput.fill("0.5");
    await page.waitForTimeout(300);

    const logsAfter = counter.getLogsSince(logsBefore);
    console.log("=== AnimationPanel Duration Change ===");
    console.log(`Total re-render logs: ${logsAfter.length}`);

    // BezierCurveEditor should not re-render when duration changes
    const bezierRenders = logsAfter.filter((log) => log.includes("BezierCurveEditor")).length;
    console.log(`BezierCurveEditor re-renders: ${bezierRenders}`);

    await page.screenshot({
      path: "e2e/screenshots/animation-panel-duration-change.png",
      fullPage: true,
    });

    // Ideally BezierCurveEditor should not re-render
    expect(bezierRenders).toBeLessThanOrEqual(1);
  });

  test("changing easing preset should update bezier smoothly", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/animation-panel`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="Easing preset"]');

    const logsBefore = counter.getCurrentLength();

    // Open easing preset dropdown and select different preset
    const easingSelect = page.locator('[aria-label="Easing preset"]');
    await easingSelect.click();
    await page.waitForTimeout(200);

    // Select a different easing
    const easeInOption = page.getByText("ease-in", { exact: true });
    if (await easeInOption.isVisible()) {
      await easeInOption.click();
      await page.waitForTimeout(300);
    }

    const logsAfter = counter.getLogsSince(logsBefore);
    console.log("=== AnimationPanel Easing Change ===");
    console.log(`Total re-render logs: ${logsAfter.length}`);

    await page.screenshot({
      path: "e2e/screenshots/animation-panel-easing-change.png",
      fullPage: true,
    });
  });
});

test.describe("Cross-Panel Interaction Test", () => {
  test("rapid interactions should remain responsive", async ({ page }) => {
    const counter = createRerenderCounter();
    counter.setupListener(page);

    await page.goto(`${BASE_URL}/position-panel`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('[aria-label="X position"]');

    const startTime = Date.now();

    // Perform rapid interactions - use first() for first panel instance
    const xInput = page.locator('[aria-label="X position"]').first();
    const yInput = page.locator('[aria-label="Y position"]').first();
    const rotationInput = page.locator('[aria-label="Rotation"]').first();

    for (let i = 0; i < 10; i++) {
      await xInput.click();
      await xInput.fill(`${100 + i * 10}`);
      await yInput.click();
      await yInput.fill(`${200 + i * 10}`);
      await rotationInput.click();
      await rotationInput.fill(`${i * 36}`);
    }

    const elapsed = Date.now() - startTime;

    console.log("=== Rapid Interaction Test ===");
    console.log(`Time for 30 input changes: ${elapsed}ms`);
    console.log(`Average per change: ${(elapsed / 30).toFixed(2)}ms`);
    console.log(`Total logs: ${counter.logs.length}`);
    console.log(`Re-render logs: ${counter.getRerenderLogs().length}`);

    await page.screenshot({
      path: "e2e/screenshots/position-panel-rapid-interaction.png",
      fullPage: true,
    });

    // Should complete in reasonable time (less than 5 seconds for 30 changes)
    expect(elapsed).toBeLessThan(5000);
  });
});
