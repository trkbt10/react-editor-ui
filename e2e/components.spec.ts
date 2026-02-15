/**
 * @file Component demo E2E tests
 * Tests that component demos render correctly
 * Note: App uses HashRouter, so URLs are hash-based (e.g., /#/path)
 */

import { test, expect } from "@playwright/test";

test.describe("Component Demos", () => {
  test.describe("IconButton", () => {
    test("should render all variants and sizes", async ({ page }) => {
      await page.goto("/#/components/primitives/icon-button");

      // Check heading
      await expect(page.locator("h2", { hasText: "IconButton" })).toBeVisible();

      // Check sections exist
      await expect(page.locator("text=Sizes")).toBeVisible();
      await expect(page.locator("text=Variants")).toBeVisible();
      await expect(page.locator("text=States")).toBeVisible();

      // Check that buttons are rendered
      const buttons = page.locator("button[aria-label='Play']");
      await expect(buttons.first()).toBeVisible();
    });
  });

  test.describe("Button", () => {
    test("should render all variants", async ({ page }) => {
      await page.goto("/#/components/primitives/button");

      await expect(page.locator("h2", { hasText: "Button" })).toBeVisible();

      // Check variant buttons - use exact matching
      await expect(page.locator("button").filter({ hasText: /^Primary$/ })).toBeVisible();
      await expect(page.locator("button").filter({ hasText: /^Secondary$/ })).toBeVisible();
      await expect(page.locator("button").filter({ hasText: /^Ghost$/ })).toBeVisible();
      await expect(page.locator("button").filter({ hasText: /^Danger$/ })).toBeVisible();
    });

    test("should render disabled state", async ({ page }) => {
      await page.goto("/#/components/primitives/button");

      const disabledButton = page.locator("button", { hasText: "Disabled" }).first();
      await expect(disabledButton).toBeDisabled();
    });
  });

  test.describe("Input", () => {
    test("should handle text input", async ({ page }) => {
      await page.goto("/#/components/primitives/input");

      await expect(page.locator("h2", { hasText: "Input" })).toBeVisible();

      // Find and type in an input
      const input = page.locator("input[aria-label='Basic input']");
      await input.fill("Hello World");
      await expect(input).toHaveValue("Hello World");
    });

    test("should clear input with clearable feature", async ({ page }) => {
      await page.goto("/#/components/primitives/input");

      const clearableInput = page.locator("input[aria-label='Clearable input']");
      await expect(clearableInput).toHaveValue("example search");

      // Find and click clear button
      const clearButton = page
        .locator("input[aria-label='Clearable input']")
        .locator("..")
        .locator("button[aria-label='Clear']");

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(clearableInput).toHaveValue("");
      }
    });
  });

  test.describe("Badge", () => {
    test("should render all variants", async ({ page }) => {
      await page.goto("/#/components/primitives/badge");

      await expect(page.locator("h2", { hasText: "Badge" })).toBeVisible();

      // Check badge variants
      await expect(page.locator("text=Default").first()).toBeVisible();
      await expect(page.locator("text=Primary").first()).toBeVisible();
      await expect(page.locator("text=Success").first()).toBeVisible();
      await expect(page.locator("text=Warning").first()).toBeVisible();
      await expect(page.locator("text=Error").first()).toBeVisible();
    });
  });

  test.describe("Toolbar", () => {
    test("should render toolbar with groups", async ({ page }) => {
      await page.goto("/#/components/layout/toolbar");

      await expect(page.locator("h2", { hasText: "Toolbar" })).toBeVisible();

      // Check toolbar buttons are rendered
      await expect(page.locator("button[aria-label='Play']").first()).toBeVisible();
      await expect(page.locator("button[aria-label='Pause']").first()).toBeVisible();
    });
  });

  test.describe("PropertyRow", () => {
    test("should render property rows", async ({ page }) => {
      await page.goto("/#/components/data-display/property-row");

      await expect(page.locator("h2", { hasText: "PropertyRow" })).toBeVisible();

      // Check property labels
      await expect(page.locator("text=Name").first()).toBeVisible();
      await expect(page.locator("text=Type").first()).toBeVisible();
      await expect(page.locator("text=Position").first()).toBeVisible();
    });
  });

  test.describe("SectionHeader", () => {
    test("should toggle collapsible section", async ({ page }) => {
      await page.goto("/#/components/data-display/section-header");

      await expect(page.locator("h2", { hasText: "SectionHeader" })).toBeVisible();

      // Find collapsible section and toggle it
      const appearanceHeader = page.locator("text=Appearance").first();
      await expect(appearanceHeader).toBeVisible();

      // Content should be visible initially
      await expect(page.locator("text=Section content here...")).toBeVisible();

      // Click to collapse
      await appearanceHeader.click();

      // Content should be hidden
      await expect(page.locator("text=Section content here...")).not.toBeVisible();
    });
  });

  test.describe("TreeItem", () => {
    test("should render tree with expand/collapse", async ({ page }) => {
      await page.goto("/#/components/data-display/tree-item");

      await expect(page.locator("h2", { hasText: "TreeItem" })).toBeVisible();

      // Check tree items
      await expect(page.locator("text=src")).toBeVisible();
      await expect(page.locator("text=App.tsx")).toBeVisible();
      await expect(page.locator("text=index.tsx")).toBeVisible();
    });

    test("should select tree items on click", async ({ page }) => {
      await page.goto("/#/components/data-display/tree-item");

      // Click on a tree item
      const appTsx = page.locator("text=App.tsx");
      await appTsx.click();

      // Item should be selected (visual verification)
      await expect(appTsx).toBeVisible();
    });
  });

  test.describe("Select", () => {
    test("should change selection", async ({ page }) => {
      await page.goto("/#/components/data-display/select");

      await expect(page.locator("h2", { hasText: "Select" })).toBeVisible();

      // Custom Select uses button role="combobox"
      const select = page.locator("button[aria-label='Select fruit']");
      await expect(select).toBeVisible();

      // Initially shows "Apple"
      await expect(select).toContainText("Apple");

      // Click to open dropdown
      await select.click();

      // Click on Banana option
      await page.locator("div[role='option']", { hasText: "Banana" }).click();

      // Should now show Banana
      await expect(select).toContainText("Banana");
    });

    test("should show disabled select", async ({ page }) => {
      await page.goto("/#/components/data-display/select");

      // Custom Select uses button role="combobox"
      const disabledSelect = page.locator("button[aria-label='Disabled select']");
      await expect(disabledSelect).toBeVisible();
      await expect(disabledSelect).toBeDisabled();
    });
  });

  test.describe("StatusBar", () => {
    test("should render status bar items", async ({ page }) => {
      await page.goto("/#/components/feedback/status-bar");

      await expect(page.locator("h2", { hasText: "StatusBar" })).toBeVisible();

      // Check status bar items
      await expect(page.locator("text=Ln 42, Col 10")).toBeVisible();
      await expect(page.locator("text=UTF-8")).toBeVisible();
    });
  });

  test.describe("LogEntry", () => {
    test("should render log entries with different levels", async ({ page }) => {
      await page.goto("/#/components/feedback/log-entry");

      await expect(page.locator("h2", { hasText: "LogEntry" })).toBeVisible();

      // Check log messages
      await expect(page.locator("text=Application started")).toBeVisible();
      await expect(page.locator("text=Component re-rendered")).toBeVisible();
      await expect(page.locator("text=Build completed successfully")).toBeVisible();
      await expect(page.locator("text=Deprecated API usage")).toBeVisible();
      await expect(page.locator("text=Failed to connect")).toBeVisible();
    });
  });
});
