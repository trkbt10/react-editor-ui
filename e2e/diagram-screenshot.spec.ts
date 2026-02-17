/**
 * @file Screenshot test for Diagram Demo verification
 */

import { test } from "@playwright/test";

test("capture diagram demo screenshot", async ({ page }) => {
  await page.goto("/#/app-demo/diagram");
  await page.waitForSelector('[role="application"]');

  // Wait for rendering
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: "e2e/screenshots/diagram-frame-test.png", fullPage: true });
});

test("capture symbols page screenshot", async ({ page }) => {
  await page.goto("/#/app-demo/diagram");
  await page.waitForSelector('[role="application"]');

  // Switch to Symbols page
  const symbolsOption = page.getByRole("radio", { name: "Symbols" });
  await symbolsOption.click();

  // Wait for rendering
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: "e2e/screenshots/diagram-symbols-test.png", fullPage: true });
});
