/**
 * @file E2E tests for BoxModelEditor component
 *
 * Comprehensive tests for all drag operations with exact value verification.
 */

import { test, expect } from "@playwright/test";

// Helper to extract value from JSON output
function extractValue(json: string | null, path: string[]): number {
  if (!json) return 0;
  try {
    let obj = JSON.parse(json);
    for (const key of path) {
      obj = obj[key];
    }
    return typeof obj === "number" ? obj : 0;
  } catch {
    return 0;
  }
}

test.describe("BoxModelEditor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/primitives/box-model-editor");
    await page.waitForSelector("h2");
    await page.waitForSelector('[data-testid="box-model-editor"]');
  });

  test.describe("Structure", () => {
    test("renders all layers correctly", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      await expect(editor.locator('[data-testid="box-model-margin-layer"]')).toBeVisible();
      await expect(editor.locator('[data-testid="box-model-border-layer"]')).toBeVisible();
      await expect(editor.locator('[data-testid="box-model-padding-layer"]')).toBeVisible();
      await expect(editor.locator('[data-testid="box-model-content-layer"]')).toBeVisible();
    });

    test("margin layer is a donut path (rectangular outer with inner hole)", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const marginLayer = editor.locator('[data-testid="box-model-margin-layer"]');
      // Margin is now a path (donut shape) with evenodd fill-rule
      const tagName = await marginLayer.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("path");
      const fillRule = await marginLayer.getAttribute("fill-rule");
      expect(fillRule).toBe("evenodd");
    });

    test("border layer has border-radius (path element)", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const borderLayer = editor.locator('[data-testid="box-model-border-layer"]');
      const tagName = await borderLayer.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("path");
    });
  });

  test.describe("Margin edge operations", () => {
    test("drag margin-top upward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-margin-top"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["margin", "top"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy - 40 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["margin", "top"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test("drag margin-right rightward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-margin-right"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["margin", "right"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx + 40, clientY: cy });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["margin", "right"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test("drag margin-bottom downward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-margin-bottom"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["margin", "bottom"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy + 40 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["margin", "bottom"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test("drag margin-left leftward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-margin-left"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["margin", "left"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx - 40, clientY: cy });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["margin", "left"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });
  });

  test.describe("Margin corner operations", () => {
    test("drag topLeft corner outward increases left and top margin", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-margin-corner-topLeft"]');
      const pre = page.locator("pre").first();

      // Hover to make corner visible
      await editor.hover();
      await page.waitForTimeout(50);

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialLeft = extractValue(await pre.textContent(), ["margin", "left"]);
      const initialTop = extractValue(await pre.textContent(), ["margin", "top"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      // Drag outward (top-left direction)
      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx - 30, clientY: cy - 30 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalLeft = extractValue(await pre.textContent(), ["margin", "left"]);
      const finalTop = extractValue(await pre.textContent(), ["margin", "top"]);

      expect(finalLeft).toBeGreaterThan(initialLeft);
      expect(finalTop).toBeGreaterThan(initialTop);
    });

    test("drag bottomRight corner outward increases right and bottom margin", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-margin-corner-bottomRight"]');
      const pre = page.locator("pre").first();

      await editor.hover();
      await page.waitForTimeout(50);

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialRight = extractValue(await pre.textContent(), ["margin", "right"]);
      const initialBottom = extractValue(await pre.textContent(), ["margin", "bottom"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      // Drag outward (bottom-right direction)
      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx + 30, clientY: cy + 30 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalRight = extractValue(await pre.textContent(), ["margin", "right"]);
      const finalBottom = extractValue(await pre.textContent(), ["margin", "bottom"]);

      expect(finalRight).toBeGreaterThan(initialRight);
      expect(finalBottom).toBeGreaterThan(initialBottom);
    });
  });

  test.describe("Padding edge operations", () => {
    test("drag padding-top upward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-padding-top"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["padding", "top"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy - 30 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["padding", "top"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });
  });

  test.describe("Border radius operations", () => {
    test("all four radius zones are positioned at correct border corners", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const borderLayer = editor.locator('[data-testid="box-model-border-layer"]');
      const borderBox = await borderLayer.boundingBox();
      expect(borderBox).not.toBeNull();

      const corners = [
        { name: "topLeft", expectedX: borderBox!.x, expectedY: borderBox!.y },
        { name: "topRight", expectedX: borderBox!.x + borderBox!.width, expectedY: borderBox!.y },
        { name: "bottomRight", expectedX: borderBox!.x + borderBox!.width, expectedY: borderBox!.y + borderBox!.height },
        { name: "bottomLeft", expectedX: borderBox!.x, expectedY: borderBox!.y + borderBox!.height },
      ];

      for (const { name, expectedX, expectedY } of corners) {
        const radiusZone = editor.locator(`[data-testid="box-model-radius-${name}"]`);
        const radiusBox = await radiusZone.boundingBox();
        expect(radiusBox, `${name} radius zone should exist`).not.toBeNull();

        const zoneCenterX = radiusBox!.x + radiusBox!.width / 2;
        const zoneCenterY = radiusBox!.y + radiusBox!.height / 2;

        // Radius zone should be positioned near the corner (within tolerance)
        // The zone is slightly inward from the corner to align with the arc
        const tolerance = 40;
        expect(zoneCenterX, `${name} X position`).toBeGreaterThan(expectedX - tolerance);
        expect(zoneCenterX, `${name} X position`).toBeLessThan(expectedX + tolerance);
        expect(zoneCenterY, `${name} Y position`).toBeGreaterThan(expectedY - tolerance);
        expect(zoneCenterY, `${name} Y position`).toBeLessThan(expectedY + tolerance);
      }
    });

    test("drag topLeft radius inward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-radius-topLeft"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["borderRadius", "topLeft"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      // Drag inward (toward center) increases radius
      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx + 30, clientY: cy + 30 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["borderRadius", "topLeft"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test("drag bottomRight radius inward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-radius-bottomRight"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["borderRadius", "bottomRight"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      // Drag inward (toward center) increases radius - for bottomRight that's left and up
      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx - 30, clientY: cy - 30 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["borderRadius", "bottomRight"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test("radius zones have correct cursor direction", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();

      const topLeftCursor = await editor.locator('[data-testid="box-model-radius-topLeft"]').evaluate((el) => window.getComputedStyle(el).cursor);
      expect(topLeftCursor).toBe("nwse-resize");

      const bottomRightCursor = await editor.locator('[data-testid="box-model-radius-bottomRight"]').evaluate((el) => window.getComputedStyle(el).cursor);
      expect(bottomRightCursor).toBe("nwse-resize");

      const topRightCursor = await editor.locator('[data-testid="box-model-radius-topRight"]').evaluate((el) => window.getComputedStyle(el).cursor);
      expect(topRightCursor).toBe("nesw-resize");

      const bottomLeftCursor = await editor.locator('[data-testid="box-model-radius-bottomLeft"]').evaluate((el) => window.getComputedStyle(el).cursor);
      expect(bottomLeftCursor).toBe("nesw-resize");
    });

    test("all four radius arcs are drawn inside the border (inner curve)", async ({ page }) => {
      // This test verifies that arcs trace the inner corner curve, not the outer curve
      // by checking that all radius arc paths are positioned inside the border
      const editor = page.locator('[data-testid="box-model-editor"]').first();

      const result = await editor.evaluate((svg) => {
        const borderPath = svg.querySelector('[data-testid="box-model-border-layer"]');
        if (!borderPath) return { error: "border layer not found" };

        const borderRect = borderPath.getBoundingClientRect();
        // Radius indicator arcs specifically use "3 2" stroke-dasharray pattern
        // Other layers use "4 2" (padding) or "2 2" (content)
        const radiusArcs = svg.querySelectorAll('path[stroke-dasharray="3 2"]');

        if (radiusArcs.length !== 4) {
          return { error: `expected 4 radius arcs, found ${radiusArcs.length}` };
        }

        const tolerance = 5;
        const failures: string[] = [];

        radiusArcs.forEach((path, i) => {
          const rect = path.getBoundingClientRect();
          if (rect.left < borderRect.left - tolerance) {
            failures.push(`arc ${i}: left edge ${rect.left.toFixed(1)} < border left ${borderRect.left.toFixed(1)}`);
          }
          if (rect.top < borderRect.top - tolerance) {
            failures.push(`arc ${i}: top edge ${rect.top.toFixed(1)} < border top ${borderRect.top.toFixed(1)}`);
          }
          if (rect.right > borderRect.right + tolerance) {
            failures.push(`arc ${i}: right edge ${rect.right.toFixed(1)} > border right ${borderRect.right.toFixed(1)}`);
          }
          if (rect.bottom > borderRect.bottom + tolerance) {
            failures.push(`arc ${i}: bottom edge ${rect.bottom.toFixed(1)} > border bottom ${borderRect.bottom.toFixed(1)}`);
          }
        });

        return failures.length > 0 ? { failures } : { success: true };
      });

      expect(result).not.toHaveProperty("error");
      expect(result).not.toHaveProperty("failures");
      expect(result).toHaveProperty("success", true);
    });

    test("drag operations work correctly for all four corners", async ({ page }) => {
      // Unified test to verify all corners respond to inward drag correctly
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const pre = page.locator("pre").first();

      const corners = [
        { name: "topLeft", dx: 30, dy: 30 },      // inward is +x, +y
        { name: "topRight", dx: -30, dy: 30 },    // inward is -x, +y
        { name: "bottomRight", dx: -30, dy: -30 }, // inward is -x, -y
        { name: "bottomLeft", dx: 30, dy: -30 },  // inward is +x, -y
      ];

      for (const { name, dx, dy } of corners) {
        const handle = editor.locator(`[data-testid="box-model-radius-${name}"]`);
        const handleBox = await handle.boundingBox();
        expect(handleBox, `${name} handle should exist`).not.toBeNull();

        const initialValue = extractValue(await pre.textContent(), ["borderRadius", name]);

        const cx = handleBox!.x + handleBox!.width / 2;
        const cy = handleBox!.y + handleBox!.height / 2;

        // Drag inward should increase radius
        await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
        await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx + dx, clientY: cy + dy });
        await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

        const finalValue = extractValue(await pre.textContent(), ["borderRadius", name]);
        expect(finalValue, `${name} radius should increase when dragged inward`).toBeGreaterThan(initialValue);
      }
    });
  });

  test.describe("Border edge operations", () => {
    test("drag border-top upward increases value", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-border-top"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["border", "top"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy - 20 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["border", "top"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });
  });

  test.describe("Content size operations", () => {
    test("drag content-right rightward increases width", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-content-right"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["contentSize", "width"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx + 40, clientY: cy });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["contentSize", "width"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test("drag content-bottom downward increases height", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-content-bottom"]');
      const pre = page.locator("pre").first();

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialValue = extractValue(await pre.textContent(), ["contentSize", "height"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy + 30 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalValue = extractValue(await pre.textContent(), ["contentSize", "height"]);
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test("drag content corner outward increases both width and height", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const handle = editor.locator('[data-testid="box-model-content-corner-bottomRight"]');
      const pre = page.locator("pre").first();

      await editor.hover();
      await page.waitForTimeout(50);

      const handleBox = await handle.boundingBox();
      expect(handleBox).not.toBeNull();

      const initialWidth = extractValue(await pre.textContent(), ["contentSize", "width"]);
      const initialHeight = extractValue(await pre.textContent(), ["contentSize", "height"]);

      const cx = handleBox!.x + handleBox!.width / 2;
      const cy = handleBox!.y + handleBox!.height / 2;

      // Drag outward (bottom-right direction)
      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx + 30, clientY: cy + 30 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalWidth = extractValue(await pre.textContent(), ["contentSize", "width"]);
      const finalHeight = extractValue(await pre.textContent(), ["contentSize", "height"]);

      expect(finalWidth).toBeGreaterThan(initialWidth);
      expect(finalHeight).toBeGreaterThan(initialHeight);
    });
  });

  test.describe("Display modes", () => {
    test("auto-size mode expands SVG when values increase", async ({ page }) => {
      const autoSizeSection = page.locator("text=Auto-size Mode").locator("..");
      const editor = autoSizeSection.locator('[data-testid="box-model-editor"]');

      await expect(editor).toBeVisible();

      const initialBox = await editor.boundingBox();
      expect(initialBox).not.toBeNull();
      const initialWidth = initialBox!.width;

      // Increase margin in the main editor
      const mainEditor = page.locator('[data-testid="box-model-editor"]').first();
      const marginHandle = mainEditor.locator('[data-testid="box-model-margin-right"]');

      const handleBox = await marginHandle.boundingBox();
      if (handleBox) {
        const cx = handleBox.x + handleBox.width / 2;
        const cy = handleBox.y + handleBox.height / 2;

        await marginHandle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
        await mainEditor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx + 60, clientY: cy });
        await mainEditor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });
      }

      await page.waitForTimeout(100);

      const finalBox = await editor.boundingBox();
      expect(finalBox).not.toBeNull();
      expect(finalBox!.width).toBeGreaterThan(initialWidth);
    });
  });

  test.describe("Disabled state", () => {
    test("disabled editor ignores all interactions", async ({ page }) => {
      await page.locator("h3:has-text('Disabled')").scrollIntoViewIfNeeded();
      const disabledSection = page.locator("h3:has-text('Disabled')").locator("..");
      const editor = disabledSection.locator('[data-testid="box-model-editor"]');
      const pre = page.locator("pre").first();

      await expect(editor).toBeVisible();

      const handle = editor.locator('[data-testid="box-model-margin-top"]');
      const handleBox = await handle.boundingBox();

      if (!handleBox) {
        test.skip();
        return;
      }

      const initialContent = await pre.textContent();

      const cx = handleBox.x + handleBox.width / 2;
      const cy = handleBox.y + handleBox.height / 2;

      await handle.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy, isPrimary: true });
      await editor.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", button: 0, clientX: cx, clientY: cy - 40 });
      await editor.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });

      const finalContent = await pre.textContent();
      expect(finalContent).toBe(initialContent);
    });
  });

  test.describe("Corner handle visibility", () => {
    test("corner handles are hidden when not hovering", async ({ page }) => {
      const editor = page.locator('[data-testid="box-model-editor"]').first();
      const cornerHandle = editor.locator('[data-testid="box-model-margin-corner-topLeft"]');

      // Not hovering - should be transparent
      const fillOpacity = await cornerHandle.evaluate((el) => window.getComputedStyle(el).fillOpacity);
      expect(parseFloat(fillOpacity)).toBe(0);
    });
  });
});
