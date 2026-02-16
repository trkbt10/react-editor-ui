/**
 * @file Check SVG element count in Canvas
 */

import { test, expect } from "@playwright/test";

test("count SVG elements in Canvas", async ({ page }) => {
  await page.goto("http://localhost:5620/#/components/canvas/bounding-box");
  await page.waitForTimeout(1000);

  // Count SVG elements
  const elementCounts = await page.evaluate(() => {
    const svg = document.querySelector('svg[data-testid="canvas-svg"]');
    if (!svg) {
      return { error: "No SVG found" };
    }

    const counts: Record<string, number> = {};
    const countElements = (el: Element, prefix = "") => {
      const tag = el.tagName.toLowerCase();
      const key = prefix ? `${prefix}>${tag}` : tag;
      counts[key] = (counts[key] || 0) + 1;

      Array.from(el.children).forEach((child) => {
        countElements(child, tag);
      });
    };

    countElements(svg);
    return counts;
  });

  console.log("=== SVG Element Counts ===");
  console.log(JSON.stringify(elementCounts, null, 2));

  // Count total lines
  const totalLines = await page.evaluate(() => {
    return document.querySelectorAll('svg line').length;
  });
  console.log(`Total <line> elements: ${totalLines}`);

  // Count total rects
  const totalRects = await page.evaluate(() => {
    return document.querySelectorAll('svg rect').length;
  });
  console.log(`Total <rect> elements: ${totalRects}`);
});
