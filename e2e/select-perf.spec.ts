/**
 * Select component performance test
 * Measures re-renders when hovering over dropdown options
 */
import { test, expect } from "@playwright/test";

test.describe("Select performance", () => {
  test("hovering options should not re-render Select trigger", async ({ page }) => {
    const renderLogs: string[] = [];

    // Capture react-scan logs (includes "render", "×", or component names)
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("render") || text.includes("Render") || text.includes("×") || text.includes("Select")) {
        renderLogs.push(text);
      }
    });

    await page.goto("http://localhost:5620/#/components/primitives/select-preview");

    // Wait for component to render
    await page.waitForSelector('button[role="combobox"]');
    await page.waitForTimeout(500);

    // Open the first Select dropdown
    const selectButton = page.locator('button[role="combobox"]').first();
    await selectButton.click();

    // Wait for dropdown to appear
    await page.waitForSelector('[role="listbox"]');
    await page.waitForTimeout(300);

    // Clear logs after initial render
    renderLogs.length = 0;

    // Hover over each option
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();

    for (let i = 0; i < optionCount; i++) {
      await options.nth(i).hover();
      await page.waitForTimeout(100);
    }

    // Wait a bit for any async re-renders
    await page.waitForTimeout(200);

    // Log results
    console.log("Render logs during hover:", renderLogs);

    // Check that Select component itself didn't re-render
    // (only SelectDropdown and SelectOptionItem should)
    const selectMainRenders = renderLogs.filter((log) => {
      // Match "Select" but not "SelectDropdown" or "SelectOptionItem"
      const hasSelect = log.includes("Select");
      const isSubComponent = log.includes("SelectDropdown") || log.includes("SelectOptionItem");
      return hasSelect && !isSubComponent;
    });

    console.log("Select main component re-renders:", selectMainRenders.length);
    console.log("All render logs:", renderLogs.length);

    // Select trigger should not re-render when hovering options
    expect(selectMainRenders.length).toBe(0);
  });

  test("measure total re-renders on hover", async ({ page }) => {
    const renderLogs: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("render") || text.includes("Render") || text.includes("×")) {
        renderLogs.push(text);
      }
    });

    await page.goto("http://localhost:5620/#/components/primitives/select-preview");
    await page.waitForSelector('button[role="combobox"]');
    await page.waitForTimeout(500);

    const selectButton = page.locator('button[role="combobox"]').first();
    await selectButton.click();
    await page.waitForSelector('[role="listbox"]');
    await page.waitForTimeout(300);

    renderLogs.length = 0;

    const options = page.locator('[role="option"]');
    const optionCount = await options.count();

    // Hover each option
    for (let i = 0; i < optionCount; i++) {
      await options.nth(i).hover();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(200);

    console.log("All render logs:", renderLogs);
    console.log("Total render log count:", renderLogs.length);

    // With proper optimization:
    // - Only SelectOptionItem should re-render on hover (2 per hover: unfocus old, focus new)
    // - SelectDropdown should NOT re-render
    // - Select (main) should NOT re-render
    const selectDropdownRenders = renderLogs.filter(log =>
      log.includes("SelectDropdown") && !log.includes("SelectDropdownInner")
    );

    console.log("SelectDropdown re-renders:", selectDropdownRenders.length);

    // SelectDropdown should not re-render when hovering
    expect(selectDropdownRenders.length).toBe(0);
  });
});
