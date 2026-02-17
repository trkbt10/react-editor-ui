/**
 * E2E test to measure re-renders when dragging canvas elements in DesignDemo
 */
import { test, expect } from "@playwright/test";

test.describe("DesignDemo performance", () => {
  test("dragging canvas element should not cause excessive re-renders in sidebar", async ({ page }) => {
    // Inject render counter before page load
    await page.addInitScript(() => {
      (window as unknown as { __renderCounts: Record<string, number> }).__renderCounts = {};
    });

    await page.goto("http://localhost:5620/#/app-demo/design");

    // Wait for page to be fully loaded
    await page.waitForSelector('[data-testid="bounding-box"]', { timeout: 10000 });

    // Inject MutationObserver to count DOM updates in sidebar area
    const setupObserver = await page.evaluate(() => {
      // Find sidebar by looking for element with "Layers" text content
      const allDivs = document.querySelectorAll('div');
      let sidebar: Element | null = null;
      for (const div of allDivs) {
        const style = window.getComputedStyle(div);
        if (style.borderRight && style.borderRight.includes('solid') && div.textContent?.includes('Layers')) {
          sidebar = div;
          break;
        }
      }

      if (!sidebar) {
        // Fallback: find the first panel-like container
        sidebar = document.querySelector('[data-grid-area="sidebar"]') ||
                  Array.from(document.querySelectorAll('div')).find(el =>
                    el.textContent?.includes('Pages') && el.textContent?.includes('Layers')
                  ) || null;
      }

      if (!sidebar) {
        return { error: "Sidebar not found", html: document.body.innerHTML.slice(0, 500) };
      }

      let mutationCount = 0;
      const observer = new MutationObserver((mutations) => {
        mutationCount += mutations.length;
      });

      observer.observe(sidebar, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      (window as unknown as { __sidebarObserver: MutationObserver; __getMutationCount: () => number }).__sidebarObserver = observer;
      (window as unknown as { __sidebarObserver: MutationObserver; __getMutationCount: () => number }).__getMutationCount = () => mutationCount;

      return { found: true };
    });

    console.log("Setup:", setupObserver);

    // Get the bounding box element
    const boundingBox = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(boundingBox).toBeVisible();

    // Reset mutation count
    await page.evaluate(() => {
      const win = window as unknown as { __getMutationCount: () => number };
      // Store initial count to subtract later
      (window as unknown as { __initialMutationCount: number }).__initialMutationCount = win.__getMutationCount();
    });

    // Perform drag operation
    const box = await boundingBox.boundingBox();
    if (!box) {
      throw new Error("Could not get bounding box");
    }

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Simulate drag with multiple move events
    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Move in small increments to simulate real drag
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(startX + i * 5, startY + i * 5);
      await page.waitForTimeout(16); // ~60fps
    }

    await page.mouse.up();

    // Wait for any pending updates
    await page.waitForTimeout(100);

    // Get mutation count
    const result = await page.evaluate(() => {
      const win = window as unknown as {
        __getMutationCount: () => number;
        __initialMutationCount: number;
        __sidebarObserver: MutationObserver;
      };
      const totalMutations = win.__getMutationCount() - win.__initialMutationCount;
      win.__sidebarObserver.disconnect();
      return { sidebarMutations: totalMutations };
    });

    console.log("Drag result:", result);

    // Sidebar should have minimal mutations during canvas drag
    // If sidebar is properly isolated, it should have 0-5 mutations
    // If it's re-rendering on every drag, it could have 50+ mutations
    expect(result.sidebarMutations).toBeLessThan(20);
  });
});
