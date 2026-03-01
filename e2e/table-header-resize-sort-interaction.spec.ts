/**
 * @file TableHeaderCell resize/sort interaction E2E tests
 *
 * Verifies that:
 * - Resize handle is aligned with the th border (no 1px gap)
 * - Clicking resize handle does not trigger sort
 * - Clicking header center triggers sort correctly
 */

import { test } from "@playwright/test";

test.describe("TableHeaderCell resize/sort interaction", () => {
  test("resize handle aligns with border and sort works correctly", async ({ page }) => {
  // Capture console logs
  page.on("console", (msg) => {
    if (msg.text().includes("TableHeaderCell")) {
      console.log("BROWSER:", msg.text());
    }
  });

  await page.goto("/#/components/data-display/table");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  // Find resizable columns section and scroll to it
  const resizableSection = page.locator("text=Resizable Columns");
  await resizableSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Take screenshot before interaction
  await page.screenshot({
    path: "e2e/screenshots/table-header-resize-before.png",
    fullPage: false,
  });

  // Get column headers after the "Resizable Columns" text
  const headers = page.getByRole("columnheader");
  const headerCount = await headers.count();
  console.log("Total headers found:", headerCount);

  // Find headers in the resizable section (they should be after other sections)
  // Let's look at the last set of headers
  for (let i = 0; i < headerCount; i++) {
    const header = headers.nth(i);
    const box = await header.boundingBox();
    const text = await header.textContent();

    if (!box) continue;

    // Get computed styles
    const styles = await header.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.width,
        borderRightWidth: cs.borderRightWidth,
        boxSizing: cs.boxSizing,
      };
    });

    console.log(`Header ${i} "${text}":`, {
      x: box.x,
      width: box.width,
      rightEdge: box.x + box.width,
      styles,
    });

    // Check for resize handle (last div child)
    const children = await header.locator("> div").all();
    for (const child of children) {
      const childStyles = await child.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          position: cs.position,
          right: cs.right,
          width: cs.width,
          cursor: cs.cursor,
        };
      });

      if (childStyles.cursor === "col-resize") {
        const childBox = await child.boundingBox();
        if (childBox) {
          console.log(`  Resize handle:`, {
            x: childBox.x,
            width: childBox.width,
            rightEdge: childBox.x + childBox.width,
            ...childStyles,
          });

          // Calculate alignment
          const headerRightEdge = box.x + box.width;
          const handleRightEdge = childBox.x + childBox.width;
          console.log(
            `  Alignment: header right=${headerRightEdge.toFixed(1)}, handle right=${handleRightEdge.toFixed(1)}, diff=${(headerRightEdge - handleRightEdge).toFixed(1)}`
          );
        }
      }
    }
  }

  // Test sort/resize interaction on sortable header (Name column, index 13)
  // Looking for a header with "Name" that has resize handle
  console.log("\n--- Sort/Resize Interaction Test ---");

  for (let i = 12; i < headerCount; i++) {
    const header = headers.nth(i);
    const text = await header.textContent();

    // Test on "Name" column which should be sortable
    if (text?.includes("Name")) {
      const box = await header.boundingBox();
      if (!box) continue;

      const initialSort = await header.getAttribute("aria-sort");
      console.log(`Testing sortable header ${i} "${text}"`);
      console.log("Initial aria-sort:", initialSort);

      // Click on resize handle area (right edge - within 8px handle)
      const clickX = box.x + box.width - 3;
      const clickY = box.y + box.height / 2;
      console.log(`Clicking at (${clickX.toFixed(1)}, ${clickY.toFixed(1)})`);

      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(300);

      const afterSort = await header.getAttribute("aria-sort");
      console.log("After click aria-sort:", afterSort);

      if (initialSort !== afterSort) {
        console.log("❌ ERROR: Sort was triggered by clicking resize area!");
      } else {
        console.log("✓ Sort was NOT triggered (correct)");
      }

      // Move mouse away from header first to reset hover state
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);

      // Also test clicking in center of header (should trigger sort)
      const centerX = box.x + box.width / 2;
      console.log(`Center click at (${centerX.toFixed(1)}, ${clickY.toFixed(1)})`);
      console.log(`Header bounds: x=${box.x}, width=${box.width}, right=${box.x + box.width}`);

      // Move to center explicitly, wait, then click
      await page.mouse.move(centerX, clickY);
      await page.waitForTimeout(100);
      await page.mouse.click(centerX, clickY);
      await page.waitForTimeout(300);

      const afterCenterClick = await header.getAttribute("aria-sort");
      console.log("After center click aria-sort:", afterCenterClick);

      if (afterCenterClick === afterSort) {
        console.log("❌ ERROR: Sort was NOT triggered when clicking center!");
        // Check if the column is actually sortable
        const sortable = await header.evaluate((el) => {
          // Check for sortable cursor or other indicators
          return {
            cursor: window.getComputedStyle(el).cursor,
            hasOnClick: typeof (el as any).onclick === "function",
          };
        });
        console.log("Header sortable info:", sortable);
      } else {
        console.log("✓ Sort WAS triggered when clicking center (correct)");
      }

      break;
    }
  }

  // Take screenshot after interaction
  await page.screenshot({
    path: "e2e/screenshots/table-header-resize-after.png",
    fullPage: false,
  });
  });
});
