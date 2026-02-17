/**
 * Primitives component performance tests
 * Measures re-renders during user interactions
 */
import { test, expect } from "@playwright/test";

test.describe("Primitives performance", () => {
  test.describe("ColorInput", () => {
    test("dragging color picker should not re-render ColorInput excessively", async ({ page }) => {
      const renderLogs: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        if (text.includes("render") || text.includes("Render") || text.includes("×") || text.includes("Color")) {
          renderLogs.push(text);
        }
      });

      await page.goto("http://localhost:5620/#/components/primitives/color-input");
      await page.waitForSelector('button[aria-label="Open color picker"]');
      await page.waitForTimeout(500);

      // Open color picker
      await page.click('button[aria-label="Open color picker"]');
      await page.waitForSelector('[role="application"][aria-label="Color picker"]');
      await page.waitForTimeout(300);

      renderLogs.length = 0;

      // Drag on saturation area
      const saturationArea = page.locator('[role="slider"][aria-label="Saturation and brightness"]');
      const box = await saturationArea.boundingBox();
      if (!box) throw new Error("Could not get bounding box");

      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      for (let i = 0; i < 5; i++) {
        await page.mouse.move(startX + i * 10, startY + i * 5);
        await page.waitForTimeout(32);
      }
      await page.mouse.up();
      await page.waitForTimeout(100);

      console.log("ColorInput render logs:", renderLogs);

      // Count ColorInput re-renders (not ColorPicker internal components)
      const colorInputRenders = renderLogs.filter(log =>
        log.includes("ColorInput") && !log.includes("ColorPicker")
      );

      console.log("ColorInput re-renders:", colorInputRenders.length);

      // With custom areEqual, only ColorInputs with actual value changes re-render
      // Other ColorInputs with unchanged values are skipped
      expect(colorInputRenders.length).toBeLessThanOrEqual(20);
    });

    test("clicking preset colors should have minimal re-renders", async ({ page }) => {
      const renderLogs: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        if (text.includes("render") || text.includes("Render") || text.includes("×")) {
          renderLogs.push(text);
        }
      });

      await page.goto("http://localhost:5620/#/components/primitives/color-input");
      await page.waitForSelector('button[aria-label="Open color picker"]');
      await page.waitForTimeout(500);

      await page.click('button[aria-label="Open color picker"]');
      await page.waitForSelector('[role="application"][aria-label="Color picker"]');
      await page.waitForTimeout(300);

      renderLogs.length = 0;

      // Click a preset color
      const presetButton = page.locator('button[aria-label^="Select color"]').first();
      await presetButton.click();
      await page.waitForTimeout(200);

      console.log("Preset click render logs:", renderLogs);
      console.log("Total re-renders:", renderLogs.length);

      // Should be minimal re-renders for a single click
      expect(renderLogs.length).toBeLessThanOrEqual(20);
    });
  });

  test.describe("SegmentedControl", () => {
    test("clicking segment should only re-render affected items", async ({ page }) => {
      const renderLogs: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        if (text.includes("render") || text.includes("Render") || text.includes("×") || text.includes("Segment")) {
          renderLogs.push(text);
        }
      });

      await page.goto("http://localhost:5620/#/components/primitives/segmented-control");
      // Use role="group" since SegmentedControl uses that
      await page.waitForSelector('[role="group"]', { timeout: 5000 });
      await page.waitForTimeout(500);

      renderLogs.length = 0;

      // Click on a different segment (role="radio" or role="checkbox")
      const segments = page.locator('[role="radio"], [role="checkbox"]');
      const segmentCount = await segments.count();
      if (segmentCount > 1) {
        await segments.nth(1).click();
        await page.waitForTimeout(200);
      }

      console.log("SegmentedControl render logs:", renderLogs);

      // Should only re-render the changed segments, not all
      const segmentRenders = renderLogs.filter(log => log.includes("Segment"));
      console.log("Segment re-renders:", segmentRenders.length);

      // With custom areEqual, only segments with actual changes re-render
      // Previously 29, now ~15 with optimization
      expect(segmentRenders.length).toBeLessThanOrEqual(20);
    });
  });

  test.describe("TabBar", () => {
    test("clicking tab should only re-render affected tabs", async ({ page }) => {
      const renderLogs: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        if (text.includes("render") || text.includes("Render") || text.includes("×") || text.includes("Tab")) {
          renderLogs.push(text);
        }
      });

      await page.goto("http://localhost:5620/#/components/primitives/tab-bar");
      await page.waitForSelector('[role="tablist"]');
      await page.waitForTimeout(500);

      renderLogs.length = 0;

      // Click on a different tab
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();
      if (tabCount > 1) {
        await tabs.nth(1).click();
        await page.waitForTimeout(200);
      }

      console.log("TabBar render logs:", renderLogs);

      const tabRenders = renderLogs.filter(log => log.includes("Tab"));
      console.log("Tab re-renders:", tabRenders.length);

      // With memo, should be reasonable re-renders
      // Multiple TabBars in demo page may cause more renders
      expect(tabRenders.length).toBeLessThanOrEqual(30);
    });
  });

  test.describe("GradientEditor", () => {
    test("editing gradient stop color should have minimal re-renders", async ({ page }) => {
      const renderLogs: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        if (text.includes("render") || text.includes("Render") || text.includes("×") || text.includes("Gradient")) {
          renderLogs.push(text);
        }
      });

      await page.goto("http://localhost:5620/#/components/primitives/gradient-editor");
      // Wait for any gradient-related element
      await page.waitForSelector('[aria-label^="Gradient"]', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);

      renderLogs.length = 0;

      // Click on a color swatch to open color picker
      const colorSwatch = page.locator('button[aria-label="Open color picker"]').first();
      if (await colorSwatch.isVisible()) {
        await colorSwatch.click();
        await page.waitForTimeout(300);
      }

      console.log("GradientEditor render logs:", renderLogs);
      console.log("Total re-renders:", renderLogs.length);

      // Minimal re-renders for opening color picker
      expect(renderLogs.length).toBeLessThanOrEqual(20);
    });
  });
});
