/**
 * @file Visual snapshot tests for primitive components
 */

import { test } from "@playwright/test";

test.describe("Visual: Primitives", () => {
  test("IconButton", async ({ page }) => {
    await page.goto("/#/components/primitives/icon-button");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/icon-button.png",
      fullPage: true,
    });
  });

  test("Button", async ({ page }) => {
    await page.goto("/#/components/primitives/button");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/button.png",
      fullPage: true,
    });
  });

  test("Input", async ({ page }) => {
    await page.goto("/#/components/primitives/input");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/input.png",
      fullPage: true,
    });
  });

  test("Badge", async ({ page }) => {
    await page.goto("/#/components/primitives/badge");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/badge.png",
      fullPage: true,
    });
  });

  test("Checkbox", async ({ page }) => {
    await page.goto("/#/components/primitives/checkbox");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/checkbox.png",
      fullPage: true,
    });
  });

  test("SegmentedControl", async ({ page }) => {
    await page.goto("/#/components/primitives/segmented-control");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/segmented-control.png",
      fullPage: true,
    });
  });

  test("ColorPicker", async ({ page }) => {
    await page.goto("/#/components/primitives/color-picker");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/color-picker.png",
      fullPage: true,
    });
  });

  test("ColorInput", async ({ page }) => {
    await page.goto("/#/components/primitives/color-input");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/color-input.png",
      fullPage: true,
    });
  });

  test("GradientEditor", async ({ page }) => {
    await page.goto("/#/components/primitives/gradient-editor");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/gradient-editor.png",
      fullPage: true,
    });
  });
});
