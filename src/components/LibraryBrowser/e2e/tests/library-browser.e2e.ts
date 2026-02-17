/**
 * @file LibraryBrowser E2E tests
 */

import { test, expect } from "@playwright/test";

test.describe("LibraryBrowser", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/library-browser");
    await page.waitForSelector('[data-testid="library-browser"]');
  });

  test.describe("Navigation", () => {
    test("displays category list on initial load", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await expect(browser.getByText("Basic Shapes")).toBeVisible();
      await expect(browser.getByText("Flowchart")).toBeVisible();
      await expect(browser.getByText("Icons")).toBeVisible();
    });

    test("navigates into category on click", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByText("Basic Shapes").click();

      // Should show items in grid view
      await expect(browser.getByText("Rectangle")).toBeVisible();
      await expect(browser.getByText("Circle")).toBeVisible();
      await expect(browser.getByText("Triangle")).toBeVisible();

      // Should show navigation breadcrumb
      await expect(browser.getByRole("navigation")).toBeVisible();
    });

    test("navigates back using back button", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByText("Basic Shapes").click();
      await expect(browser.getByText("Rectangle")).toBeVisible();

      // Click back button
      await browser.getByRole("button", { name: "Go back" }).click();

      // Should return to category list
      await expect(browser.getByText("Basic Shapes")).toBeVisible();
      await expect(browser.getByText("Flowchart")).toBeVisible();
    });

    test("supports nested navigation", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByText("Flowchart").click();
      await browser.getByText("Basic").click();

      // Should show nested items
      await expect(browser.getByText("Process")).toBeVisible();
      await expect(browser.getByText("Decision")).toBeVisible();
    });
  });

  test.describe("Search", () => {
    test("filters items by search query", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      const searchInput = browser.getByPlaceholder("Search items...");
      await searchInput.fill("circle");

      // Should show matching item
      await expect(browser.getByText("Circle")).toBeVisible();

      // Categories should not be visible (grid view during search)
      await expect(browser.getByText("Basic Shapes")).not.toBeVisible();
    });

    test("shows empty state when no results", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      const searchInput = browser.getByPlaceholder("Search items...");
      await searchInput.fill("nonexistent");

      // Should show empty state message
      await expect(browser.getByText("No results found")).toBeVisible();
    });

    test("clears search and returns to list view", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      const searchInput = browser.getByPlaceholder("Search items...");
      await searchInput.fill("circle");
      await expect(browser.getByText("Circle")).toBeVisible();

      // Clear search
      await searchInput.fill("");

      // Should return to category list
      await expect(browser.getByText("Basic Shapes")).toBeVisible();
      await expect(browser.getByText("Flowchart")).toBeVisible();
    });
  });

  test.describe("Interactions", () => {
    test("fires click event on item click", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByText("Basic Shapes").click();

      // Click on item
      await browser.getByText("Rectangle").click();

      // Check event was fired
      await expect(page.getByTestId("last-action")).toHaveText("click");
      await expect(page.getByTestId("last-item")).toHaveText("Rectangle");
      await expect(page.getByTestId("click-count")).toHaveText("1");
    });

    test("fires filter button click event", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByRole("button", { name: "Filter" }).click();

      // Check event was fired
      await expect(page.getByTestId("last-action")).toHaveText("filter-click");
    });
  });

  test.describe("Layout", () => {
    test("list items have no horizontal overflow", async ({ page }) => {
      const browser = page.getByTestId("library-browser");

      // Check each list item for overflow
      const listItems = browser.locator('[role="button"]');
      const count = await listItems.count();

      for (let i = 0; i < count; i++) {
        const item = listItems.nth(i);
        const overflow = await item.evaluate((el) => {
          return el.scrollWidth > el.clientWidth;
        });
        expect(overflow).toBe(false);
      }
    });

    test("grid items render in 2 columns", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByText("Basic Shapes").click();

      // Wait for grid to render
      await page.waitForTimeout(200);

      // Get positions of first two items
      const items = browser.locator('[role="button"]');
      const firstBox = await items.nth(0).boundingBox();
      const secondBox = await items.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Second item should be to the right of first (same row)
        expect(secondBox.x).toBeGreaterThan(firstBox.x);
        // Should be on the same vertical level (same row)
        expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(10);
      }
    });
  });

  test.describe("Drag and Drop", () => {
    test("item is draggable", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByText("Basic Shapes").click();

      // Find draggable item
      const item = browser.getByText("Rectangle").locator("..");

      // Verify item has draggable attribute
      await expect(item).toHaveAttribute("draggable", "true");
    });

    test("fires drag start event", async ({ page }) => {
      const browser = page.getByTestId("library-browser");
      await browser.getByText("Basic Shapes").click();

      // Find draggable item
      const item = browser.getByRole("button", { name: "Rectangle" });

      // Perform drag action to external target
      await item.dragTo(page.getByTestId("info-panel"), { force: true });

      // Check event was fired
      await expect(page.getByTestId("last-action")).toHaveText("drag-start");
      await expect(page.getByTestId("last-item")).toHaveText("Rectangle");
    });
  });
});
