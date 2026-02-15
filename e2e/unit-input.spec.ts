/**
 * @file UnitInput E2E tests
 * Tests for the UnitInput component with wheel, keyboard, and unit cycling interactions
 */

import { test, expect } from "@playwright/test";

test.describe("UnitInput", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/components/primitives/unit-input");
  });

  test("should render the demo page", async ({ page }) => {
    await expect(page.locator("h2", { hasText: "UnitInput" })).toBeVisible();
  });

  test("should display current value and unit", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await expect(input).toHaveValue("100px");

    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await expect(unitButton).toHaveText("px");
  });

  test("should allow typing a new value", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.fill("200px");
    await expect(input).toHaveValue("200px");
  });

  test("should increment value with arrow up key", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();
    await input.fill("100px");

    await input.press("ArrowUp");
    await expect(input).toHaveValue("101px");

    await input.press("ArrowUp");
    await expect(input).toHaveValue("102px");
  });

  test("should decrement value with arrow down key", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();
    await input.fill("100px");

    await input.press("ArrowDown");
    await expect(input).toHaveValue("99px");

    await input.press("ArrowDown");
    await expect(input).toHaveValue("98px");
  });

  test("should use larger step with shift+arrow key", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.click();
    await input.fill("100px");

    await input.press("Shift+ArrowUp");
    await expect(input).toHaveValue("110px");

    await input.press("Shift+ArrowDown");
    await expect(input).toHaveValue("100px");
  });

  test("should increment value with mouse wheel up", async ({ page }) => {
    const container = page.locator('[aria-label="Width"]').locator("..");
    const input = page.locator('[aria-label="Width"]');
    await input.click();
    await input.fill("100px");

    // Focus must be on input for wheel to work
    await input.focus();
    await container.dispatchEvent("wheel", { deltaY: -100 });

    await expect(input).toHaveValue("101px");
  });

  test("should decrement value with mouse wheel down", async ({ page }) => {
    const container = page.locator('[aria-label="Width"]').locator("..");
    const input = page.locator('[aria-label="Width"]');
    await input.click();
    await input.fill("100px");

    await input.focus();
    await container.dispatchEvent("wheel", { deltaY: 100 });

    await expect(input).toHaveValue("99px");
  });

  test("should cycle through units when unit button is clicked", async ({ page }) => {
    const input = page.locator('[aria-label="Width"]');
    await input.fill("100px");

    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');

    // px -> %
    await unitButton.click();
    await expect(input).toHaveValue("100%");
    await expect(unitButton).toHaveText("%");

    // % -> em
    await unitButton.click();
    await expect(input).toHaveValue("100em");
    await expect(unitButton).toHaveText("em");

    // em -> rem
    await unitButton.click();
    await expect(input).toHaveValue("100rem");
    await expect(unitButton).toHaveText("rem");

    // rem -> px (back to start)
    await unitButton.click();
    await expect(input).toHaveValue("100px");
    await expect(unitButton).toHaveText("px");
  });

  test("should support Auto value when allowAuto is enabled", async ({ page }) => {
    const input = page.locator('[aria-label="Height"]');
    await expect(input).toHaveValue("Auto");

    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await expect(unitButton).toHaveText("Auto");
  });

  test("should cycle to Auto and back when allowAuto is enabled", async ({ page }) => {
    const input = page.locator('[aria-label="Height"]');

    // Start at Auto, click to go to 0px
    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await unitButton.click();
    await expect(input).toHaveValue("0px");

    // Type a value
    await input.fill("50px");

    // Cycle through: px -> % -> em -> rem -> Auto
    await unitButton.click(); // %
    await unitButton.click(); // em
    await unitButton.click(); // rem
    await unitButton.click(); // Auto
    await expect(input).toHaveValue("Auto");
    await expect(unitButton).toHaveText("Auto");
  });

  test("should allow typing auto to set Auto value", async ({ page }) => {
    const input = page.locator('[aria-label="Height"]');
    await input.fill("100px");
    await expect(input).toHaveValue("100px");

    await input.fill("auto");
    await expect(input).toHaveValue("Auto");
  });

  test("should respect min constraint", async ({ page }) => {
    const input = page.locator('[aria-label="Opacity"]');
    await input.fill("5%");

    // Try to go below 0
    for (let i = 0; i < 10; i++) {
      await input.press("ArrowDown");
    }

    await expect(input).toHaveValue("0%");
  });

  test("should respect max constraint", async ({ page }) => {
    const input = page.locator('[aria-label="Opacity"]');
    await input.fill("95%");

    // Try to go above 100
    for (let i = 0; i < 10; i++) {
      await input.press("ArrowUp");
    }

    await expect(input).toHaveValue("100%");
  });

  test("should use custom step values", async ({ page }) => {
    const input = page.locator('[aria-label="Line height"]');
    await input.fill("1.5em");

    await input.press("ArrowUp");
    await expect(input).toHaveValue("1.6em");

    await input.press("ArrowDown");
    await expect(input).toHaveValue("1.5em");

    // Shift step should be 0.5
    await input.press("Shift+ArrowUp");
    await expect(input).toHaveValue("2em");
  });

  test("should be disabled when disabled prop is true", async ({ page }) => {
    const input = page.locator('[aria-label="Disabled"]');
    await expect(input).toBeDisabled();

    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await expect(unitButton).toBeDisabled();
  });

  test("should support different sizes", async ({ page }) => {
    // Verify all size variants render
    const smallInput = page.locator('[aria-label="Small"]');
    const mediumInput = page.locator('[aria-label="Medium"]');
    const largeInput = page.locator('[aria-label="Large"]');

    await expect(smallInput).toBeVisible();
    await expect(mediumInput).toBeVisible();
    await expect(largeInput).toBeVisible();
  });

  test("should handle decimal values correctly", async ({ page }) => {
    const input = page.locator('[aria-label="Line height"]');
    await input.fill("1.25em");

    await input.press("ArrowUp"); // +0.1
    await expect(input).toHaveValue("1.35em");
  });

  test("should preserve unit when adjusting value", async ({ page }) => {
    const input = page.locator('[aria-label="Font size"]');
    await input.fill("16px");

    const unitButton = input.locator("..").locator('[data-testid="unit-input-unit-button"]');
    await unitButton.click(); // Switch to pt
    await expect(input).toHaveValue("16pt");

    await input.press("ArrowUp");
    await expect(input).toHaveValue("17pt");
  });
});
