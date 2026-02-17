/**
 * @file Canvas gesture E2E tests
 */

import { test, expect } from "@playwright/test";
import { setupCanvas, getViewportInfo, panCanvas, zoomCanvas } from "../utils";

test.describe("Canvas Gestures", () => {
  test("should render canvas", async ({ page }) => {
    const locators = await setupCanvas(page, "/#/canvas");
    await expect(locators.container).toBeVisible();
    await expect(locators.svg).toBeVisible();
  });

  test("should pan with middle mouse button", async ({ page }) => {
    const locators = await setupCanvas(page, "/#/canvas");
    const initialViewport = await getViewportInfo(page);

    await panCanvas(page, locators, 100, 50);

    const newViewport = await getViewportInfo(page);
    expect(newViewport.x).toBeLessThan(initialViewport.x);
    expect(newViewport.y).toBeLessThan(initialViewport.y);
  });

  test("should zoom with mouse wheel", async ({ page }) => {
    const locators = await setupCanvas(page, "/#/canvas");
    const initialViewport = await getViewportInfo(page);

    // Zoom in (negative deltaY)
    await zoomCanvas(page, locators, -100);

    const newViewport = await getViewportInfo(page);
    expect(newViewport.scale).toBeGreaterThan(initialViewport.scale);
  });

  test("should display canvas element", async ({ page }) => {
    await setupCanvas(page, "/#/canvas");
    const element = page.locator('[data-testid="canvas-element"]');
    await expect(element).toBeVisible();
    await expect(element).toHaveText("Canvas Element");
  });
});
