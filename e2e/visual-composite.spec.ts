/**
 * @file Visual snapshot tests for composite components
 */

import { test, expect } from "@playwright/test";

test.describe("Visual: Composite", () => {
  test("StrokeSettingsPanel", async ({ page }) => {
    await page.goto("/#/components/composite/stroke-settings-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/stroke-settings-panel.png",
      fullPage: true,
    });
  });

  test("TypographyPanel", async ({ page }) => {
    await page.goto("/#/components/composite/typography-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/typography-panel.png",
      fullPage: true,
    });
  });

  test("FontsPanel", async ({ page }) => {
    await page.goto("/#/components/composite/fonts-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/fonts-panel.png",
      fullPage: true,
    });
  });

  test("PositionPanel", async ({ page }) => {
    await page.goto("/#/components/composite/position-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/position-panel.png",
      fullPage: true,
    });
  });

  test("PositionPanel - no visible horizontal overflow", async ({ page }) => {
    await page.goto("/#/components/composite/position-panel");
    await page.waitForSelector("h2");

    // Find all PositionPanel components (they have title="Position")
    const panels = page.locator("h3:has-text('Position')").locator("..").locator("..");

    const panelCount = await panels.count();
    expect(panelCount).toBeGreaterThan(0);

    // Check each panel for visible overflow (skip elements with overflow: hidden)
    for (let i = 0; i < panelCount; i++) {
      const panel = panels.nth(i);

      const overflowInfo = await panel.evaluate((el) => {
        // Check all children recursively for visible overflow
        const checkOverflow = (element: Element, path: string): { hasOverflow: boolean; path: string; scrollWidth: number; clientWidth: number } | null => {
          const htmlEl = element as HTMLElement;
          const style = window.getComputedStyle(htmlEl);

          // Skip elements with overflow: hidden/scroll/auto (they handle overflow internally)
          const hasOverflowHandling = style.overflow === "hidden" || style.overflow === "scroll" || style.overflow === "auto" ||
                                       style.overflowX === "hidden" || style.overflowX === "scroll" || style.overflowX === "auto";

          if (!hasOverflowHandling && htmlEl.scrollWidth > htmlEl.clientWidth + 1) { // +1 for rounding
            return {
              hasOverflow: true,
              path,
              scrollWidth: htmlEl.scrollWidth,
              clientWidth: htmlEl.clientWidth,
            };
          }

          // If this element handles overflow, don't check children
          if (hasOverflowHandling) {
            return null;
          }

          for (let j = 0; j < element.children.length; j++) {
            const child = element.children[j];
            const result = checkOverflow(child, `${path} > ${child.tagName}[${j}]`);
            if (result) return result;
          }
          return null;
        };
        return checkOverflow(el, "panel");
      });

      expect(overflowInfo, `Panel ${i} should not have visible horizontal overflow: ${JSON.stringify(overflowInfo)}`).toBeNull();
    }
  });

  test("PositionPanel - all content within panel bounds", async ({ page }) => {
    await page.goto("/#/components/composite/position-panel");
    await page.waitForSelector("h2");

    // Get the first panel's bounding box
    const panel = page.locator("h3:has-text('Position')").first().locator("..").locator("..");
    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();

    // Check alignment controls are within bounds
    const hAlign = page.getByRole("group", { name: "Horizontal alignment" }).first();
    const hAlignBox = await hAlign.boundingBox();
    expect(hAlignBox).not.toBeNull();
    expect(hAlignBox!.x).toBeGreaterThanOrEqual(panelBox!.x);
    expect(hAlignBox!.x + hAlignBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width);

    // Check X/Y inputs are within bounds
    const xInput = page.getByRole("textbox", { name: "X position" }).first();
    const xBox = await xInput.boundingBox();
    expect(xBox).not.toBeNull();
    expect(xBox!.x).toBeGreaterThanOrEqual(panelBox!.x);
    expect(xBox!.x + xBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width);

    // Check rotation input is within bounds
    const rotationInput = page.getByRole("textbox", { name: "Rotation" }).first();
    const rotationBox = await rotationInput.boundingBox();
    expect(rotationBox).not.toBeNull();
    expect(rotationBox!.x).toBeGreaterThanOrEqual(panelBox!.x);
    expect(rotationBox!.x + rotationBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width);
  });

  test("PositionPanel - dropdown renders via portal", async ({ page }) => {
    await page.goto("/#/components/composite/position-panel");
    await page.waitForSelector("h2");

    // Click on the first horizontal constraint dropdown to open it
    const horizontalConstraintSelect = page.getByRole("combobox", { name: "Horizontal constraint" }).first();
    await horizontalConstraintSelect.click();

    // The dropdown should be visible and rendered in body (via portal)
    const dropdown = page.locator("body > [role='listbox']");
    await expect(dropdown).toBeVisible();

    // Dropdown should have options
    const options = dropdown.locator("[role='option']");
    await expect(options).toHaveCount(5); // Left, Right, Left and Right, Center, Scale

    // Take screenshot with dropdown open
    await page.screenshot({
      path: "e2e/screenshots/position-panel-dropdown.png",
      fullPage: true,
    });
  });
});
