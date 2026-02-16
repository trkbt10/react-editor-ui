/**
 * @file E2E tests for AnimationPanel component
 */

import { test, expect } from "@playwright/test";

test.describe("AnimationPanel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/composite/animation-panel");
    await page.waitForSelector("h2");
  });

  test("visual snapshot", async ({ page }) => {
    await page.screenshot({
      path: "e2e/screenshots/animation-panel.png",
      fullPage: true,
    });
  });

  test("renders bezier curve editor on left, controls on right", async ({ page }) => {
    // Find the AnimationPanel
    const panel = page.locator("h3:has-text('Animation')").first().locator("..").locator("..");

    // Get bezier curve editor (SVG with role="application")
    const bezierEditor = panel.locator("[role='application'][aria-label='Easing curve editor']");
    await expect(bezierEditor).toBeVisible();
    const bezierBox = await bezierEditor.boundingBox();
    expect(bezierBox).not.toBeNull();

    // Get Duration input
    const durationInput = panel.getByRole("textbox", { name: "Duration" });
    await expect(durationInput).toBeVisible();
    const durationBox = await durationInput.boundingBox();
    expect(durationBox).not.toBeNull();

    // Get Delay input
    const delayInput = panel.getByRole("textbox", { name: "Delay" });
    await expect(delayInput).toBeVisible();
    const delayBox = await delayInput.boundingBox();
    expect(delayBox).not.toBeNull();

    // Verify layout: bezier should be on the left of Duration/Delay inputs
    expect(bezierBox!.x).toBeLessThan(durationBox!.x);
    expect(bezierBox!.x).toBeLessThan(delayBox!.x);

    // Duration and Delay should be vertically stacked (same X position roughly)
    expect(Math.abs(durationBox!.x - delayBox!.x)).toBeLessThan(5);
    expect(durationBox!.y).toBeLessThan(delayBox!.y);
  });

  test("no visible horizontal overflow", async ({ page }) => {
    const panel = page.locator("h3:has-text('Animation')").first().locator("..").locator("..");

    const overflowInfo = await panel.evaluate((el) => {
      const checkOverflow = (element: Element, path: string): { hasOverflow: boolean; path: string; scrollWidth: number; clientWidth: number } | null => {
        const htmlEl = element as HTMLElement;
        const style = window.getComputedStyle(htmlEl);

        const hasOverflowHandling = style.overflow === "hidden" || style.overflow === "scroll" || style.overflow === "auto" ||
                                     style.overflowX === "hidden" || style.overflowX === "scroll" || style.overflowX === "auto";

        if (!hasOverflowHandling && htmlEl.scrollWidth > htmlEl.clientWidth + 1) {
          return {
            hasOverflow: true,
            path,
            scrollWidth: htmlEl.scrollWidth,
            clientWidth: htmlEl.clientWidth,
          };
        }

        if (hasOverflowHandling) {
          return null;
        }

        for (let j = 0; j < element.children.length; j++) {
          const child = element.children[j];
          const result = checkOverflow(child, `${path} > ${child.tagName}[${j}]`);
          if (result) {
            return result;
          }
        }
        return null;
      };
      return checkOverflow(el, "panel");
    });

    expect(overflowInfo, `Panel should not have visible horizontal overflow: ${JSON.stringify(overflowInfo)}`).toBeNull();
  });

  test("easing preset dropdown opens", async ({ page }) => {
    const panel = page.locator("h3:has-text('Animation')").first().locator("..").locator("..");

    // Click on the easing preset selector
    const easingSelect = panel.getByRole("combobox", { name: "Easing preset" });
    await easingSelect.click();

    // Dropdown should be visible
    const dropdown = page.locator("body > [role='listbox']");
    await expect(dropdown).toBeVisible();

    // Should have easing options (linear, ease, ease-in, ease-out, ease-in-out, custom = 6 options)
    const options = dropdown.locator("[role='option']");
    await expect(options).toHaveCount(6);

    await page.screenshot({
      path: "e2e/screenshots/animation-panel-dropdown.png",
      fullPage: true,
    });
  });

  test("bezier curve editor has interactive control points", async ({ page }) => {
    const panel = page.locator("h3:has-text('Animation')").first().locator("..").locator("..");
    const bezierEditor = panel.locator("[role='application'][aria-label='Easing curve editor']");

    // Verify the bezier editor renders correctly
    await expect(bezierEditor).toBeVisible();

    // Should have bezier curve path
    const curvePath = bezierEditor.locator("path");
    await expect(curvePath).toBeVisible();

    // Should have control point circles (2 fixed points + 2 handle visible + 2 handle hit areas = 6)
    const circles = bezierEditor.locator("circle");
    const circleCount = await circles.count();
    expect(circleCount).toBe(6);

    // Verify cursor changes to grab on handles (the transparent hit area circles)
    const handleHitArea = circles.nth(2); // First handle hit area
    const cursor = await handleHitArea.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(cursor).toBe("grab");
  });

  test("all content within panel bounds", async ({ page }) => {
    const panel = page.locator("h3:has-text('Animation')").first().locator("..").locator("..");
    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();

    // Check bezier editor is within bounds
    const bezierEditor = panel.locator("[role='application'][aria-label='Easing curve editor']");
    const bezierBox = await bezierEditor.boundingBox();
    expect(bezierBox).not.toBeNull();
    expect(bezierBox!.x).toBeGreaterThanOrEqual(panelBox!.x);
    expect(bezierBox!.x + bezierBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width + 1);

    // Check duration input is within bounds
    const durationInput = panel.getByRole("textbox", { name: "Duration" });
    const durationBox = await durationInput.boundingBox();
    expect(durationBox).not.toBeNull();
    expect(durationBox!.x).toBeGreaterThanOrEqual(panelBox!.x);
    expect(durationBox!.x + durationBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width + 1);
  });
});
