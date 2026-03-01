/**
 * @file Table component re-render performance E2E tests
 *
 * Tests that memo/useMemo/useCallback optimizations prevent unnecessary re-renders.
 * Uses react-scan console output to detect component re-renders.
 *
 * Main user operation scenarios:
 * 1. Sort click - only clicked column should update
 * 2. Column resize - only resized column should update
 * 3. Row hover - only hovered row should update
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

test.describe("Table re-render performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/data-display/table");
    await page.waitForLoadState("networkidle");

    // Wait for initial render to complete
    await page.waitForSelector('[role="columnheader"]');
    await page.waitForTimeout(500);
  });

  test("sort click should not re-render unrelated header cells", async ({
    page,
  }) => {
    const rerenders: RerenderLog[] = [];

    // Start capturing console logs from react-scan
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("TableHeaderCell")) {
        const parsed = parseRerenderLog(text);
        if (parsed) {
          rerenders.push(parsed);
        }
      }
    });

    // Scroll to Resizable Columns section (has both sort and resize)
    const resizableSection = page.locator("text=Resizable Columns");
    await resizableSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Clear initial render logs
    rerenders.length = 0;

    // Find the "Name" header in resizable section (index ~13)
    const headers = page.getByRole("columnheader");
    const headerCount = await headers.count();

    let nameHeaderIndex = -1;
    for (let i = 12; i < headerCount; i++) {
      const text = await headers.nth(i).textContent();
      if (text?.includes("Name")) {
        nameHeaderIndex = i;
        break;
      }
    }

    if (nameHeaderIndex === -1) {
      throw new Error("Could not find Name header in resizable section");
    }

    // Click to sort the "Name" column
    const nameHeader = headers.nth(nameHeaderIndex);
    const box = await nameHeader.boundingBox();
    if (!box) throw new Error("Could not get header bounding box");

    // Click center of header (not resize handle)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    // Log results
    console.log("--- Sort Click Re-renders ---");
    console.log(`Total TableHeaderCell re-renders: ${rerenders.length}`);
    rerenders.forEach((r) =>
      console.log(`  ${r.component} count:${r.count} (${r.time})`)
    );

    // Expectation: Only sorted columns should re-render
    // Page has 2 tables with shared sort state, so 2 Name columns re-render
    // StrictMode may cause additional renders in dev mode
    // Before optimization: 10 re-renders (all 5 columns × 2 tables)
    // After optimization: 2-4 re-renders (only sorted columns)
    expect(rerenders.length).toBeLessThanOrEqual(5);
  });

  test("column resize should not re-render unrelated header cells", async ({
    page,
  }) => {
    const rerenders: RerenderLog[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("TableHeaderCell")) {
        const parsed = parseRerenderLog(text);
        if (parsed) {
          rerenders.push(parsed);
        }
      }
    });

    // Scroll to Resizable Columns section
    const resizableSection = page.locator("text=Resizable Columns");
    await resizableSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Clear initial render logs
    rerenders.length = 0;

    // Find the first header in resizable section
    const headers = page.getByRole("columnheader");
    const headerCount = await headers.count();

    // Resizable section headers start around index 12
    const firstResizableHeader = headers.nth(12);
    const box = await firstResizableHeader.boundingBox();
    if (!box) throw new Error("Could not get header bounding box");

    // Perform resize on right edge
    const startX = box.x + box.width - 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 30, startY);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Log results
    console.log("--- Column Resize Re-renders ---");
    console.log(`Total TableHeaderCell re-renders: ${rerenders.length}`);
    rerenders.forEach((r) =>
      console.log(`  ${r.component} count:${r.count} (${r.time})`)
    );

    // Expectation: Only the resized column should re-render significantly
    // Some re-renders during drag are expected, but should be limited
    // If all 5 columns re-render on each resize step, that's a problem
    expect(rerenders.length).toBeLessThanOrEqual(10);
  });

  test("row hover should not re-render other rows", async ({ page }) => {
    const rerenders: RerenderLog[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("TableRow")) {
        const parsed = parseRerenderLog(text);
        if (parsed) {
          rerenders.push(parsed);
        }
      }
    });

    // Use Basic Table section
    await page.waitForTimeout(300);

    // Clear initial render logs
    rerenders.length = 0;

    // Find rows in the first table
    const rows = page.locator('[role="row"]');
    const rowCount = await rows.count();

    if (rowCount < 2) {
      throw new Error("Not enough rows for hover test");
    }

    // Hover over first row
    const firstRow = rows.nth(1); // Skip header row
    await firstRow.hover();
    await page.waitForTimeout(200);

    // Hover over second row
    const secondRow = rows.nth(2);
    await secondRow.hover();
    await page.waitForTimeout(200);

    // Log results
    console.log("--- Row Hover Re-renders ---");
    console.log(`Total TableRow re-renders: ${rerenders.length}`);
    rerenders.forEach((r) =>
      console.log(`  ${r.component} count:${r.count} (${r.time})`)
    );

    // Expectation: Each hover should only re-render 1-2 rows (enter/leave)
    // 2 hovers = max 4 row re-renders
    expect(rerenders.length).toBeLessThanOrEqual(6);
  });

  test("scrolling should not re-render header cells", async ({ page }) => {
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

    // Scroll to Resizable Columns section (has scrollable content)
    const resizableSection = page.locator("text=Resizable Columns");
    await resizableSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Clear initial render logs
    headerRerenders.length = 0;

    // Perform multiple scroll actions on the page
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, -50);
    await page.waitForTimeout(300);

    // Log results
    console.log("--- Scroll Re-renders ---");
    console.log(`TableHeaderCell re-renders during scroll: ${headerRerenders.length}`);
    headerRerenders.forEach((r) =>
      console.log(`  ${r.component} count:${r.count} (${r.time})`)
    );

    // Expectation: Header cells should NOT re-render during body scroll
    // Headers are sticky and should remain stable
    expect(headerRerenders.length).toBe(0);
  });

  test("clicking unrelated area should not re-render table components", async ({
    page,
  }) => {
    const rerenders: {
      headerCells: RerenderLog[];
      rows: RerenderLog[];
      cells: RerenderLog[];
    } = {
      headerCells: [],
      rows: [],
      cells: [],
    };

    page.on("console", (msg) => {
      const text = msg.text();
      const parsed = parseRerenderLog(text);
      if (!parsed) return;

      if (text.includes("TableHeaderCell")) {
        rerenders.headerCells.push(parsed);
      } else if (text.includes("TableRow")) {
        rerenders.rows.push(parsed);
      } else if (text.includes("TableCell")) {
        rerenders.cells.push(parsed);
      }
    });

    // Wait for full render
    await page.waitForTimeout(500);

    // Clear logs
    rerenders.headerCells.length = 0;
    rerenders.rows.length = 0;
    rerenders.cells.length = 0;

    // Click on demo container title (unrelated to table)
    const demoTitle = page.locator('text="Table"').first();
    await demoTitle.click();
    await page.waitForTimeout(300);

    // Log results
    console.log("--- Unrelated Click Re-renders ---");
    console.log(`TableHeaderCell: ${rerenders.headerCells.length}`);
    console.log(`TableRow: ${rerenders.rows.length}`);
    console.log(`TableCell: ${rerenders.cells.length}`);

    // Expectation: No table components should re-render
    expect(rerenders.headerCells.length).toBe(0);
    expect(rerenders.rows.length).toBe(0);
    expect(rerenders.cells.length).toBe(0);
  });
});
