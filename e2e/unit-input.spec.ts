/**
 * @file UnitInput E2E tests
 * Tests for the Figma-style UnitInput component with wheel, keyboard, and unit cycling
 */

import { test, expect } from "@playwright/test";

test.describe("UnitInput", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/primitives/unit-input");
  });

  test("should render the demo page", async ({ page }) => {
    await expect(page.locator("h2", { hasText: "UnitInput" })).toBeVisible();
  });

  test("should display only the number in input, unit separately", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    // Should show just "100" not "100px"
    await expect(input).toHaveValue("100");

    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await expect(unitButton).toHaveText("px");
  });

  test("should allow typing a new value", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();
    await input.fill("200");
    await input.blur();

    // Value should be committed with the current unit
    await expect(input).toHaveValue("200");
  });

  test("should allow typing value with unit to change both", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();
    await input.fill("50%");
    await input.blur();

    await expect(input).toHaveValue("50");
    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await expect(unitButton).toHaveText("%");
  });

  test("should increment value with arrow up key", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();

    await input.press("ArrowUp");
    await expect(input).toHaveValue("101");

    await input.press("ArrowUp");
    await expect(input).toHaveValue("102");
  });

  test("should decrement value with arrow down key", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();

    await input.press("ArrowDown");
    await expect(input).toHaveValue("99");

    await input.press("ArrowDown");
    await expect(input).toHaveValue("98");
  });

  test("should use larger step with shift+arrow key", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();

    await input.press("Shift+ArrowUp");
    await expect(input).toHaveValue("110");

    await input.press("Shift+ArrowDown");
    await expect(input).toHaveValue("100");
  });

  test("should increment value with mouse wheel up", async ({ page }) => {
    const container = page.locator('[aria-label="Width"]').locator("..");
    const input = page.locator('[aria-label="Width"]');
    await input.click();

    await container.dispatchEvent("wheel", { deltaY: -100 });

    await expect(input).toHaveValue("101");
  });

  test("should decrement value with mouse wheel down", async ({ page }) => {
    const container = page.locator('[aria-label="Width"]').locator("..");
    const input = page.locator('[aria-label="Width"]');
    await input.click();

    await container.dispatchEvent("wheel", { deltaY: 100 });

    await expect(input).toHaveValue("99");
  });

  test("should cycle through units when unit is clicked", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');

    // px -> %
    await unitButton.click();
    await expect(unitButton).toHaveText("%");
    await expect(input).toHaveValue("100");

    // % -> em
    await unitButton.click();
    await expect(unitButton).toHaveText("em");

    // em -> rem
    await unitButton.click();
    await expect(unitButton).toHaveText("rem");

    // rem -> px (back to start)
    await unitButton.click();
    await expect(unitButton).toHaveText("px");
  });

  test("should support Auto value when allowAuto is enabled", async ({ page }) => {
    const input = page.locator('[aria-label="Height"]');
    await expect(input).toHaveValue("Auto");

    // Unit button should not be shown for Auto
    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await expect(unitButton).not.toBeVisible();
  });

  test("should cycle to Auto and back when allowAuto is enabled", async ({ page }) => {
    const input = page.locator('[aria-label="Height"]');

    // Type a value to exit Auto mode
    await input.click();
    await input.fill("50px");
    await input.blur();

    await expect(input).toHaveValue("50");

    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await expect(unitButton).toBeVisible();

    // Cycle through: px -> % -> em -> Auto
    await unitButton.click(); // %
    await unitButton.click(); // em
    await unitButton.click(); // Auto

    await expect(input).toHaveValue("Auto");
    await expect(unitButton).not.toBeVisible();
  });

  test("should allow typing auto to set Auto value", async ({ page }) => {
    const input = page.locator('[aria-label="Height"]');

    // Type a value first
    await input.click();
    await input.fill("100px");
    await input.blur();
    await expect(input).toHaveValue("100");

    // Now type auto
    await input.click();
    await input.fill("auto");
    await input.blur();
    await expect(input).toHaveValue("Auto");
  });

  test("should respect min constraint", async ({ page }) => {
    const input = page.locator('[aria-label="Opacity"]');

    // Type a low value
    await input.click();
    await input.fill("5");
    await input.blur();

    // Try to go below 0
    await input.click();
    for (let i = 0; i < 10; i++) {
      await input.press("ArrowDown");
    }

    await expect(input).toHaveValue("0");
  });

  test("should respect max constraint", async ({ page }) => {
    const input = page.locator('[aria-label="Opacity"]');

    // Type a high value
    await input.click();
    await input.fill("95");
    await input.blur();

    // Try to go above 100
    await input.click();
    for (let i = 0; i < 10; i++) {
      await input.press("ArrowUp");
    }

    await expect(input).toHaveValue("100");
  });

  test("should use custom step values", async ({ page }) => {
    const input = page.locator('[aria-label="Line height"]');

    await input.click();
    await input.fill("1.5");
    await input.blur();

    await input.click();
    await input.press("ArrowUp");
    await expect(input).toHaveValue("1.6");

    await input.press("ArrowDown");
    await expect(input).toHaveValue("1.5");

    // Shift step should be 0.5
    await input.press("Shift+ArrowUp");
    await expect(input).toHaveValue("2");
  });

  test("should be disabled when disabled prop is true", async ({ page }) => {
    const input = page.locator('[aria-label="Disabled"]');
    await expect(input).toBeDisabled();
  });

  test("should support different sizes", async ({ page }) => {
    const smallInput = page.locator('[aria-label="Small"]');
    const mediumInput = page.locator('[aria-label="Medium"]');
    const largeInput = page.locator('[aria-label="Large"]');

    await expect(smallInput).toBeVisible();
    await expect(mediumInput).toBeVisible();
    await expect(largeInput).toBeVisible();
  });

  test("should handle decimal values correctly", async ({ page }) => {
    const input = page.locator('[aria-label="Line height"]');

    await input.click();
    await input.fill("1.25");
    await input.blur();

    await input.click();
    await input.press("ArrowUp"); // +0.1
    await expect(input).toHaveValue("1.35");
  });

  test("should preserve unit when adjusting value", async ({ page }) => {
    const input = page.locator('[aria-label="Font size"]');
    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');

    await input.click();
    await input.fill("16");
    await input.blur();

    // Switch to pt
    await unitButton.click();
    await expect(unitButton).toHaveText("pt");

    // Adjust value - should keep pt unit
    await input.click();
    await input.press("ArrowUp");
    await expect(input).toHaveValue("17");
    await expect(unitButton).toHaveText("pt");
  });

  test("should commit value on Enter", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');

    await input.click();
    await input.fill("250");
    await input.press("Enter");

    await expect(input).toHaveValue("250");
  });

  test("should revert value on Escape", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');

    // Original value is 100
    await input.click();
    await input.fill("999");
    await input.press("Escape");

    // Should revert to 100
    await expect(input).toHaveValue("100");
  });
});
