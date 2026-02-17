/**
 * @file Shared E2E test utilities for Canvas tests
 */

import type { Page, Locator } from "@playwright/test";

export type CanvasLocators = {
  container: Locator;
  svg: Locator;
  content: Locator;
};

/**
 * Get the canvas container element.
 */
export function getCanvasContainer(page: Page): Locator {
  return page.locator('[role="application"][aria-label="Test canvas"]');
}

/**
 * Get the canvas SVG element.
 */
export function getCanvasSvg(page: Page): Locator {
  return page.locator('[data-testid="canvas-svg"]');
}

/**
 * Get the canvas content layer.
 */
export function getCanvasContent(page: Page): Locator {
  return page.locator('[data-testid="canvas-content"]');
}

/**
 * Get all canvas locators.
 */
export function getCanvasLocators(page: Page): CanvasLocators {
  return {
    container: getCanvasContainer(page),
    svg: getCanvasSvg(page),
    content: getCanvasContent(page),
  };
}

/**
 * Setup canvas and wait for it to render.
 */
export async function setupCanvas(page: Page, route: string): Promise<CanvasLocators> {
  await page.goto(route);
  await page.waitForSelector('[role="application"]');
  return getCanvasLocators(page);
}

/**
 * Get viewport info from the page.
 */
export async function getViewportInfo(page: Page): Promise<{ x: number; y: number; scale: number }> {
  const text = await page.locator("p:has-text('Viewport:')").textContent();
  if (!text) {
    return { x: 0, y: 0, scale: 1 };
  }
  const match = text.match(/x=([\d.-]+), y=([\d.-]+), scale=([\d.-]+)/);
  if (!match) {
    return { x: 0, y: 0, scale: 1 };
  }
  return {
    x: parseFloat(match[1]),
    y: parseFloat(match[2]),
    scale: parseFloat(match[3]),
  };
}

/**
 * Pan the canvas by dragging.
 */
export async function panCanvas(
  page: Page,
  locators: CanvasLocators,
  deltaX: number,
  deltaY: number
): Promise<void> {
  const box = await locators.container.boundingBox();
  if (!box) {
    throw new Error("Canvas container not found");
  }
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // Middle mouse button pan
  await page.mouse.move(centerX, centerY);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(centerX + deltaX, centerY + deltaY);
  await page.mouse.up({ button: "middle" });
  await page.waitForTimeout(100);
}

/**
 * Zoom the canvas with wheel.
 */
export async function zoomCanvas(
  page: Page,
  locators: CanvasLocators,
  deltaY: number
): Promise<void> {
  const box = await locators.container.boundingBox();
  if (!box) {
    throw new Error("Canvas container not found");
  }
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(100);
}
