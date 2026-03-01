/**
 * @file DataTableViewer re-render performance E2E tests
 *
 * Tests that virtualized table properly memoizes components during scroll.
 * Uses react-scan console output to detect component re-renders.
 */

import { test, expect } from "@playwright/test";

type RerenderLog = {
  component: string;
  count: number;
  time: string;
};

function parseRerenderLog(text: string): RerenderLog | null {
  // react-scan format: "%cComponentName count:N (Xms)"
  const match = text.match(/%c(\w+)\s+(?:count:)?(\d+)?.*?\(([0-9.]+ms)\)/);
  if (match) {
    return {
      component: match[1],
      count: parseInt(match[2] || "1", 10),
      time: match[3],
    };
  }
  return null;
}

test.describe("DataTableViewer re-render performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/viewer/data-table-viewer");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[role="columnheader"]');
    await page.waitForTimeout(500);
  });

  test("vertical scroll should not re-render header cells", async ({
    page,
  }) => {
    const headerRerenders: RerenderLog[] = [];
    const rowRerenders: RerenderLog[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      const parsed = parseRerenderLog(text);
      if (!parsed) return;

      if (text.includes("TableHeaderCell")) {
        headerRerenders.push(parsed);
      } else if (text.includes("TableRow") || text.includes("VirtualRow")) {
        rowRerenders.push(parsed);
      }
    });

    // Find the scroll container
    const scrollContainer = page.locator('[style*="overflow"]').first();
    await expect(scrollContainer).toBeVisible();

    // Clear initial render logs
    headerRerenders.length = 0;
    rowRerenders.length = 0;

    // Perform scroll within the table
    const box = await scrollContainer.boundingBox();
    if (!box) throw new Error("Could not get scroll container bounding box");

    // Move to center of scroll container and scroll
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(200);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(200);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(300);

    // Log results
    console.log("--- DataTableViewer Scroll Re-renders ---");
    console.log(`TableHeaderCell: ${headerRerenders.length}`);
    console.log(`Row components: ${rowRerenders.length}`);

    // Expectation: Header cells should NOT re-render during scroll
    expect(headerRerenders.length).toBe(0);
  });

  test("rapid scrolling should maintain stable header", async ({ page }) => {
    const headerRerenders: RerenderLog[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("TableHeaderCell")) {
        const parsed = parseRerenderLog(text);
        if (parsed) {
          headerRerenders.push(parsed);
        }
      }
    });

    const scrollContainer = page.locator('[style*="overflow"]').first();
    await expect(scrollContainer).toBeVisible();

    const box = await scrollContainer.boundingBox();
    if (!box) throw new Error("Could not get scroll container bounding box");

    // Clear logs
    headerRerenders.length = 0;

    // Rapid scroll simulation
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 50);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);

    console.log("--- Rapid Scroll Re-renders ---");
    console.log(`TableHeaderCell: ${headerRerenders.length}`);

    // Headers should remain stable during rapid scroll
    expect(headerRerenders.length).toBe(0);
  });

  test("sort during scroll should only update sorted column", async ({
    page,
  }) => {
    const headerRerenders: RerenderLog[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("TableHeaderCell")) {
        const parsed = parseRerenderLog(text);
        if (parsed) {
          headerRerenders.push(parsed);
        }
      }
    });

    // Find a sortable header
    const headers = page.getByRole("columnheader");
    const firstHeader = headers.first();
    await expect(firstHeader).toBeVisible();

    const box = await firstHeader.boundingBox();
    if (!box) throw new Error("Could not get header bounding box");

    // Clear logs
    headerRerenders.length = 0;

    // Click to sort (avoid resize handle)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    console.log("--- Sort Click in DataTableViewer ---");
    console.log(`TableHeaderCell re-renders: ${headerRerenders.length}`);

    // Only the sorted column should re-render
    // With proper memoization, should be <= 2 (sorted column + possible direction indicator)
    expect(headerRerenders.length).toBeLessThanOrEqual(3);
  });

  test("clicking resize handle should not trigger sort", async ({ page }) => {
    await page.waitForTimeout(200);

    // Get first table headers
    const firstTable = page
      .locator('[style*="overflow"]')
      .first()
      .locator('[role="columnheader"]');

    // Use Name column (index 1, sortable)
    const nameHeader = firstTable.nth(1);
    await expect(nameHeader).toBeVisible();

    const box = await nameHeader.boundingBox();
    if (!box) throw new Error("Could not get header bounding box");

    const initialSort = await nameHeader.getAttribute("aria-sort");
    console.log("--- Sort/Resize Conflict Test ---");
    console.log(`Initial aria-sort: ${initialSort}`);

    // Click on resize handle area (right edge, within 8px handle)
    const handleX = box.x + box.width - 3;
    const handleY = box.y + box.height / 2;
    console.log(`Clicking resize handle at (${handleX.toFixed(1)}, ${handleY.toFixed(1)})`);

    await page.mouse.click(handleX, handleY);
    await page.waitForTimeout(300);

    const afterHandleClick = await nameHeader.getAttribute("aria-sort");
    console.log(`After handle click aria-sort: ${afterHandleClick}`);

    // Sort should NOT have been triggered
    expect(afterHandleClick).toBe(initialSort);
    console.log("✓ Resize handle click did NOT trigger sort");

    // Move mouse away first to clear hover state
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);

    // Now click center - should trigger sort
    const centerX = box.x + box.width / 2;
    console.log(`Clicking center at (${centerX.toFixed(1)}, ${handleY.toFixed(1)})`);

    // Move to center first, then click
    await page.mouse.move(centerX, handleY);
    await page.waitForTimeout(50);
    await page.mouse.click(centerX, handleY);
    await page.waitForTimeout(300);

    const afterCenterClick = await nameHeader.getAttribute("aria-sort");
    console.log(`After center click aria-sort: ${afterCenterClick}`);

    // Sort SHOULD have been triggered
    expect(afterCenterClick).not.toBe(initialSort);
    console.log("✓ Center click DID trigger sort");
  });

  test("dragging resize handle should not trigger sort", async ({ page }) => {
    await page.waitForTimeout(200);

    const firstTable = page
      .locator('[style*="overflow"]')
      .first()
      .locator('[role="columnheader"]');

    const nameHeader = firstTable.nth(1);
    await expect(nameHeader).toBeVisible();

    const box = await nameHeader.boundingBox();
    if (!box) throw new Error("Could not get header bounding box");

    const initialSort = await nameHeader.getAttribute("aria-sort");
    const initialWidth = box.width;
    console.log("--- Resize Drag / Sort Conflict Test ---");
    console.log(`Initial: aria-sort=${initialSort}, width=${initialWidth.toFixed(1)}px`);

    // Drag resize handle
    const handleX = box.x + box.width - 2;
    const handleY = box.y + box.height / 2;

    await page.mouse.move(handleX, handleY);
    await page.mouse.down();
    await page.mouse.move(handleX + 30, handleY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const afterDrag = await nameHeader.getAttribute("aria-sort");
    const afterBox = await nameHeader.boundingBox();
    if (!afterBox) throw new Error("Could not get header bounding box after drag");

    console.log(`After drag: aria-sort=${afterDrag}, width=${afterBox.width.toFixed(1)}px`);

    // Sort should NOT have changed
    expect(afterDrag).toBe(initialSort);
    console.log("✓ Resize drag did NOT trigger sort");

    // Width SHOULD have changed
    expect(afterBox.width).toBeGreaterThan(initialWidth + 15);
    console.log("✓ Column was resized");
  });

  test("fillWidth mode: resize redistributes space (justify behavior)", async ({
    page,
  }) => {
    await page.waitForTimeout(200);

    // Get headers from first table (fillWidth enabled)
    const firstTable = page
      .locator('[style*="overflow"]')
      .first()
      .locator('[role="columnheader"]');

    const idHeader = firstTable.nth(0);
    const nameHeader = firstTable.nth(1);
    const emailHeader = firstTable.nth(2);

    await expect(idHeader).toBeVisible();
    await expect(nameHeader).toBeVisible();
    await expect(emailHeader).toBeVisible();

    const idInitial = await idHeader.boundingBox();
    const emailInitial = await emailHeader.boundingBox();
    const nameInitial = await nameHeader.boundingBox();

    if (!idInitial || !emailInitial || !nameInitial) {
      throw new Error("Could not get initial bounding boxes");
    }

    console.log(`--- fillWidth Mode (Justify) ---`);
    console.log(`Initial: ID=${idInitial.width.toFixed(1)}px, Name=${nameInitial.width.toFixed(1)}px, Email=${emailInitial.width.toFixed(1)}px`);

    // Resize Name column
    const resizeX = nameInitial.x + nameInitial.width - 2;
    const resizeY = nameInitial.y + nameInitial.height / 2;

    await page.mouse.move(resizeX, resizeY);
    await page.mouse.down();
    await page.mouse.move(resizeX + 50, resizeY);
    await page.mouse.up();
    await page.waitForTimeout(300);

    const idAfter = await idHeader.boundingBox();
    const emailAfter = await emailHeader.boundingBox();
    const nameAfter = await nameHeader.boundingBox();

    if (!idAfter || !emailAfter || !nameAfter) {
      throw new Error("Could not get bounding boxes after resize");
    }

    console.log(`After: ID=${idAfter.width.toFixed(1)}px, Name=${nameAfter.width.toFixed(1)}px, Email=${emailAfter.width.toFixed(1)}px`);

    // Name column should be wider
    expect(nameAfter.width).toBeGreaterThan(nameInitial.width + 30);

    // Other columns should have SHRUNK (justify redistributes)
    expect(idAfter.width).toBeLessThan(idInitial.width);
    expect(emailAfter.width).toBeLessThan(emailInitial.width);

    // Ratio between flexible columns should be preserved
    const ratioBefore = idInitial.width / emailInitial.width;
    const ratioAfter = idAfter.width / emailAfter.width;
    console.log(`Ratio ID/Email: before=${ratioBefore.toFixed(2)}, after=${ratioAfter.toFixed(2)}`);
    expect(Math.abs(ratioAfter - ratioBefore) / ratioBefore).toBeLessThan(0.1);
  });

  test("fixed width mode: resize does not affect other columns", async ({
    page,
  }) => {
    await page.waitForTimeout(200);

    // Scroll to "Fixed Width Mode" section (no fillWidth)
    const fixedSection = page.locator("text=Fixed Width Mode").first();
    await fixedSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // The Fixed Width Mode table has 4 columns (ID, Name, Email, Role)
    // Find headers that are visible and belong to this section
    // We'll use the section's sibling div containing the table
    const sectionParent = fixedSection.locator("xpath=..");
    const tableContainer = sectionParent.locator('[style*="overflow"]').first();
    await expect(tableContainer).toBeVisible();

    const headers = tableContainer.locator('[role="columnheader"]');
    const headerCount = await headers.count();
    console.log(`Found ${headerCount} headers in Fixed Width Mode table`);

    const idHeader = headers.nth(0);
    const nameHeader = headers.nth(1);
    const emailHeader = headers.nth(2);

    await expect(idHeader).toBeVisible();
    await expect(nameHeader).toBeVisible();
    await expect(emailHeader).toBeVisible();

    const idInitial = await idHeader.boundingBox();
    const emailInitial = await emailHeader.boundingBox();
    const nameInitial = await nameHeader.boundingBox();

    if (!idInitial || !emailInitial || !nameInitial) {
      throw new Error("Could not get initial bounding boxes");
    }

    console.log(`--- Fixed Width Mode ---`);
    console.log(`Initial: ID=${idInitial.width.toFixed(1)}px, Name=${nameInitial.width.toFixed(1)}px, Email=${emailInitial.width.toFixed(1)}px`);

    // Resize Name column
    const resizeX = nameInitial.x + nameInitial.width - 2;
    const resizeY = nameInitial.y + nameInitial.height / 2;

    await page.mouse.move(resizeX, resizeY);
    await page.mouse.down();
    await page.mouse.move(resizeX + 50, resizeY);
    await page.mouse.up();
    await page.waitForTimeout(300);

    const idAfter = await idHeader.boundingBox();
    const emailAfter = await emailHeader.boundingBox();
    const nameAfter = await nameHeader.boundingBox();

    if (!idAfter || !emailAfter || !nameAfter) {
      throw new Error("Could not get bounding boxes after resize");
    }

    console.log(`After: ID=${idAfter.width.toFixed(1)}px, Name=${nameAfter.width.toFixed(1)}px, Email=${emailAfter.width.toFixed(1)}px`);

    // Name column should be wider
    expect(nameAfter.width).toBeGreaterThan(nameInitial.width + 30);

    // Other columns should NOT have changed (fixed mode)
    expect(Math.abs(idAfter.width - idInitial.width)).toBeLessThan(2);
    expect(Math.abs(emailAfter.width - emailInitial.width)).toBeLessThan(2);

    console.log("✓ Other columns remained stable (fixed width mode)");
  });
});
