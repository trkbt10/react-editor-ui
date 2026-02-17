/**
 * @file Design E2E tests - Basic interactions and movement accuracy
 */

import { test, expect } from "@playwright/test";

test.describe("Design Editor - Movement Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/design");
    // Wait for the canvas to be rendered
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should render canvas with bounding box on selected element", async ({ page }) => {
    // Check that the canvas SVG is present
    const canvas = page.locator('[data-testid="canvas-svg"]');
    await expect(canvas).toBeVisible();

    // The demo has a pre-selected element, so bounding box should be visible
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });

  test("should move element accurately by dragging bounding box", async ({ page }) => {
    // Wait for bounding box to be visible (element is pre-selected)
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    // Get the bounding box position
    const box = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Record initial box center
    const initialCenterX = box.x + box.width / 2;
    const initialCenterY = box.y + box.height / 2;

    // Define drag distance in screen pixels
    const dragDistance = 100;

    // Drag the bounding box
    await page.mouse.move(initialCenterX, initialCenterY);
    await page.mouse.down();
    await page.mouse.move(initialCenterX + dragDistance, initialCenterY + dragDistance);
    await page.mouse.up();

    // Wait for state update
    await page.waitForTimeout(100);

    // Get new bounding box position
    const newBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    const newCenterX = newBox.x + newBox.width / 2;
    const newCenterY = newBox.y + newBox.height / 2;

    // Calculate actual movement
    const actualDeltaX = newCenterX - initialCenterX;
    const actualDeltaY = newCenterY - initialCenterY;

    console.log(`Drag distance: ${dragDistance}px`);
    console.log(`Actual delta: (${actualDeltaX}, ${actualDeltaY})`);
    console.log(`Movement ratio: ${(actualDeltaX / dragDistance).toFixed(2)}x`);

    // The movement should be proportional to the drag
    // Due to CSS scale on the container, we need to check if movement is reasonable
    // The key issue: if outerScale is not accounted for, movement will be way off

    // Allow 50% tolerance for scale adjustments
    expect(Math.abs(actualDeltaX)).toBeGreaterThan(dragDistance * 0.3);
    expect(Math.abs(actualDeltaX)).toBeLessThan(dragDistance * 3);
    expect(Math.abs(actualDeltaY)).toBeGreaterThan(dragDistance * 0.3);
    expect(Math.abs(actualDeltaY)).toBeLessThan(dragDistance * 3);

    // Movement should be in the same direction as drag
    expect(actualDeltaX).toBeGreaterThan(0);
    expect(actualDeltaY).toBeGreaterThan(0);
  });

  test("should have 1:1 movement ratio when dragging", async ({ page }) => {
    // This test specifically checks the movement ratio
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const initialBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    // Perform drag
    const dragDistance = 50;
    await page.mouse.move(initialBox.x, initialBox.y);
    await page.mouse.down();
    await page.mouse.move(initialBox.x + dragDistance, initialBox.y + dragDistance);
    await page.mouse.up();

    await page.waitForTimeout(100);

    const newBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    const deltaX = newBox.x - initialBox.x;
    const deltaY = newBox.y - initialBox.y;
    const ratioX = deltaX / dragDistance;
    const ratioY = deltaY / dragDistance;

    console.log(`Movement ratio X: ${ratioX.toFixed(3)}`);
    console.log(`Movement ratio Y: ${ratioY.toFixed(3)}`);

    // The ratio should be close to 1:1 (element follows cursor)
    // Acceptable range: 0.8 to 1.2 (accounting for viewport scale adjustments)
    expect(ratioX).toBeGreaterThan(0.8);
    expect(ratioX).toBeLessThan(1.2);
    expect(ratioY).toBeGreaterThan(0.8);
    expect(ratioY).toBeLessThan(1.2);
  });

  test("should not have erratic movement with small drags", async ({ page }) => {
    // Wait for bounding box
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const box = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    const initialCenter = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };

    // Do a very small drag (5px)
    const smallDrag = 5;
    await page.mouse.move(initialCenter.x, initialCenter.y);
    await page.mouse.down();
    await page.mouse.move(initialCenter.x + smallDrag, initialCenter.y + smallDrag);
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Get new position
    const newBox = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    const delta = {
      x: Math.abs(newBox.x - initialCenter.x),
      y: Math.abs(newBox.y - initialCenter.y),
    };

    console.log(`Small drag (${smallDrag}px) resulted in movement: (${delta.x.toFixed(2)}, ${delta.y.toFixed(2)})`);

    // Movement should NOT be erratic (not more than 10x the drag distance)
    // This is the key test for the "crazy movement" bug
    expect(delta.x).toBeLessThan(smallDrag * 10);
    expect(delta.y).toBeLessThan(smallDrag * 10);
  });

  test("should handle resize correctly", async ({ page }) => {
    // Wait for bounding box
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Get the bottom-right resize handle
    const handle = page.locator('[data-testid="bounding-box-handle-bottom-right"]');
    await expect(handle).toBeVisible();

    // Get initial bounding box dimensions
    const initialBox = await page.locator('[data-testid="bounding-box-border"]').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    // Get handle position
    const handleBox = await handle.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    // Drag the handle
    const dragAmount = 50;
    await page.mouse.move(handleBox.x, handleBox.y);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + dragAmount, handleBox.y + dragAmount);
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Get new dimensions
    const newBox = await page.locator('[data-testid="bounding-box-border"]').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    console.log(`Initial size: ${initialBox.width.toFixed(2)} x ${initialBox.height.toFixed(2)}`);
    console.log(`New size: ${newBox.width.toFixed(2)} x ${newBox.height.toFixed(2)}`);
    console.log(`Drag amount: ${dragAmount}px`);

    // Size should have increased (not decreased or stayed the same)
    expect(newBox.width).toBeGreaterThan(initialBox.width);
    expect(newBox.height).toBeGreaterThan(initialBox.height);

    // Size change should be proportional to drag (not erratic)
    const widthDelta = newBox.width - initialBox.width;
    const heightDelta = newBox.height - initialBox.height;

    expect(widthDelta).toBeLessThan(dragAmount * 5);
    expect(heightDelta).toBeLessThan(dragAmount * 5);
  });

  test("DEBUG: measure scale factors", async ({ page }) => {
    // Get various scale information
    const container = page.locator('[role="application"]');
    await expect(container).toBeVisible();

    const scaleInfo = await container.evaluate((el) => {
      // Get CSS computed scale
      const style = window.getComputedStyle(el);
      const transform = style.transform;

      // Get bounding rect vs offset dimensions
      const rect = el.getBoundingClientRect();
      const htmlEl = el as HTMLElement;
      const offsetW = htmlEl.offsetWidth;
      const offsetH = htmlEl.offsetHeight;

      // Calculate effective scale
      const scaleX = rect.width / offsetW;
      const scaleY = rect.height / offsetH;

      return {
        transform,
        rectWidth: rect.width,
        rectHeight: rect.height,
        offsetWidth: offsetW,
        offsetHeight: offsetH,
        effectiveScaleX: scaleX,
        effectiveScaleY: scaleY,
      };
    });

    console.log("Scale info:", JSON.stringify(scaleInfo, null, 2));

    // Check parent containers for transforms
    const parentScales = await container.evaluate((el) => {
      const scales: Array<{ tag: string; scale: number }> = [];
      let current: Element | null = el;

      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const transform = style.transform;
        if (transform && transform !== "none") {
          const match = transform.match(/matrix\(([^,]+)/);
          if (match) {
            const scaleValue = parseFloat(match[1]);
            scales.push({
              tag: current.tagName + (current.id ? `#${current.id}` : ""),
              scale: scaleValue,
            });
          }
        }
        current = current.parentElement;
      }

      return scales;
    });

    console.log("Parent scales:", JSON.stringify(parentScales, null, 2));
  });
});
