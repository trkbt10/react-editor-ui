/**
 * @file Test movement with various viewport sizes to detect scale-related issues
 */

import { test, expect } from "@playwright/test";

const PROD_URL = "http://localhost:5620";

// Test with different viewport sizes
const viewportSizes = [
  { width: 1920, height: 1080, name: "1080p" },
  { width: 1440, height: 900, name: "MacBook Pro 15" },
  { width: 1280, height: 800, name: "MacBook 13" },
  { width: 2560, height: 1440, name: "2K" },
  { width: 1024, height: 768, name: "Small" },
];

for (const viewport of viewportSizes) {
  test.describe(`Viewport ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("movement ratio test", async ({ page }) => {
      await page.goto(`${PROD_URL}/#/app-demo/design`);
      await page.waitForSelector('[data-testid="canvas-svg"]', { timeout: 10000 });

      const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
      await expect(moveArea).toBeVisible();

      // Get scale info
      const scaleInfo = await page.locator('[role="application"]').evaluate((el) => {
        let current: HTMLElement | null = el as HTMLElement;
        let totalScale = 1;

        while (current && current !== document.body) {
          const style = window.getComputedStyle(current);
          const transform = style.transform;
          if (transform && transform !== "none") {
            const match = transform.match(/matrix\(([^,]+)/);
            if (match) {
              totalScale *= parseFloat(match[1]);
            }
          }
          current = current.parentElement;
        }

        const rect = el.getBoundingClientRect();
        return {
          totalScale,
          canvasRect: { width: rect.width, height: rect.height },
          offsetSize: { width: (el as HTMLElement).offsetWidth, height: (el as HTMLElement).offsetHeight },
        };
      });

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

      console.log(`\n=== ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
      console.log(`Total scale: ${scaleInfo.totalScale.toFixed(4)}`);
      console.log(`Canvas rect: ${scaleInfo.canvasRect.width.toFixed(1)} x ${scaleInfo.canvasRect.height.toFixed(1)}`);
      console.log(`Drag: ${dragDistance}px → Movement: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`);
      console.log(`Ratio: ${ratioX.toFixed(3)}x, ${ratioY.toFixed(3)}x`);

      if (ratioX > 1.5 || ratioX < 0.5) {
        console.log(`!!! MOVEMENT ISSUE DETECTED: ratio ${ratioX.toFixed(2)}x !!!`);
      }

      // Expect ratio to be close to 1
      expect(ratioX).toBeGreaterThan(0.5);
      expect(ratioX).toBeLessThan(2.0);
    });
  });
}
