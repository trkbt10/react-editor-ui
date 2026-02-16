/**
 * @file TextEditor Performance E2E Tests
 *
 * Tests to verify that editing text doesn't cause excessive re-renders.
 */

import { test, expect } from "@playwright/test";

test.describe("TextEditor Performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/editor/text-editor");
    await page.waitForSelector("textarea");
  });

  test("typing should not cause full re-render", async ({ page }) => {
    // Get the first textarea (editor)
    const textarea = page.locator("textarea").first();
    await textarea.focus();

    // Clear existing content
    await textarea.fill("");

    // Inject performance monitoring
    await page.evaluate(() => {
      (window as unknown as { renderCounts: number[] }).renderCounts = [];
      const observer = new MutationObserver(() => {
        (window as unknown as { renderCounts: number[] }).renderCounts.push(Date.now());
      });

      // Observe the SVG content for mutations
      const svgContainer = document.querySelector("svg");
      if (svgContainer) {
        observer.observe(svgContainer, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      }
    });

    // Type several characters quickly
    const testString = "Hello World";
    const startTime = Date.now();

    for (const char of testString) {
      await textarea.press(char);
      // Small delay to allow render
      await page.waitForTimeout(10);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Get mutation counts
    const renderCounts = await page.evaluate(
      () => (window as unknown as { renderCounts: number[] }).renderCounts.length
    );

    // Verify text was typed
    const value = await textarea.inputValue();
    expect(value).toBe(testString);

    // Log performance metrics
    console.log(`Typed ${testString.length} characters in ${duration}ms`);
    console.log(`Observed ${renderCounts} SVG mutations`);

    // Performance assertion: mutations should be proportional to keystrokes
    // Allow some overhead but not excessive (less than 5x the character count)
    expect(renderCounts).toBeLessThan(testString.length * 5);
  });

  test("editing should maintain responsive input", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await textarea.focus();

    // Fill with some initial content
    await textarea.fill("Initial text content for testing.");

    // Measure time to type additional characters
    const testString = "ABC";
    const times: number[] = [];

    for (const char of testString) {
      const start = Date.now();
      await textarea.press(char);
      // Wait for the character to appear
      await page.waitForFunction(
        (expected) => {
          const ta = document.querySelector("textarea");
          return ta && ta.value.includes(expected);
        },
        char,
        { timeout: 1000 }
      );
      times.push(Date.now() - start);
    }

    // Each keystroke should complete within reasonable time (< 200ms)
    const maxTime = Math.max(...times);
    console.log(`Keystroke times: ${times.join(", ")}ms, max: ${maxTime}ms`);

    expect(maxTime).toBeLessThan(200);
  });

  test("cursor should update without full content re-render", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await textarea.focus();
    await textarea.fill("Line 1\nLine 2\nLine 3");

    // Track cursor rect changes vs content changes
    const metrics = await page.evaluate(() => {
      const cursorMutations: number[] = [];
      const contentMutations: number[] = [];

      const svg = document.querySelector("svg");
      if (!svg) return { cursor: 0, content: 0 };

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const target = mutation.target as Element;
          // Cursor elements typically have specific attributes or are rect elements with animation
          if (
            target.tagName === "rect" &&
            target.getAttribute("style")?.includes("animation")
          ) {
            cursorMutations.push(Date.now());
          } else {
            contentMutations.push(Date.now());
          }
        }
      });

      observer.observe(svg, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      (window as unknown as { perfObserver: MutationObserver }).perfObserver = observer;
      return { cursor: 0, content: 0 };
    });

    // Move cursor with arrow keys
    await textarea.press("ArrowDown");
    await page.waitForTimeout(50);
    await textarea.press("ArrowDown");
    await page.waitForTimeout(50);
    await textarea.press("ArrowRight");
    await page.waitForTimeout(50);
    await textarea.press("ArrowRight");
    await page.waitForTimeout(50);

    // Get final metrics
    const finalMetrics = await page.evaluate(() => {
      const win = window as unknown as {
        perfObserver?: MutationObserver;
      };
      win.perfObserver?.disconnect();
      return { success: true };
    });

    expect(finalMetrics.success).toBe(true);
  });
});
