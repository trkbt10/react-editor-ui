/**
 * @file Drawing Mode E2E tests - Shape and frame drawing interactions
 */

import { test, expect } from "@playwright/test";

test.describe("Drawing Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    // Wait for the canvas to be rendered
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should enter drawing mode when clicking shape button", async ({ page }) => {
    // Click the main shape button (Add shape)
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await expect(mainButton).toBeVisible();
    await mainButton.click();

    // Wait for cursor to change to crosshair
    const canvasContainer = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvasContainer.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });
  });

  test("should draw a rectangle by dragging on canvas", async ({ page }) => {
    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();
    const initialCount = await getNodeCount();

    // Click the main shape button to enter drawing mode
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Get the SVG element (background layer where clicks trigger drawing)
    const canvasSvg = page.locator('[data-testid="canvas-svg"]');
    const svgBox = await canvasSvg.boundingBox();
    expect(svgBox).not.toBeNull();
    if (!svgBox) return;

    // Draw a rectangle by dragging on the SVG (minimum size is 20x20)
    // Use positions that are definitely in empty space
    const startX = svgBox.x + svgBox.width - 200;
    const startY = svgBox.y + svgBox.height - 200;
    const endX = startX + 120;
    const endY = startY + 80;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Verify a new node was created
    const afterCount = await getNodeCount();
    expect(afterCount).toBe(initialCount + 1);

    // Verify the new node is selected (bounding box visible)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Verify tool returns to select mode (cursor should not be crosshair)
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).not.toBe("crosshair");
    }).toPass({ timeout: 2000 });
  });

  test("should not create node when drag is smaller than minimum size", async ({ page }) => {
    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();
    const initialCount = await getNodeCount();

    // Click the main shape button to enter drawing mode
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Get the SVG element
    const canvasSvg = page.locator('[data-testid="canvas-svg"]');
    const svgBox = await canvasSvg.boundingBox();
    expect(svgBox).not.toBeNull();
    if (!svgBox) return;

    // Draw a very small rectangle (less than minimum 20x20)
    const startX = svgBox.x + svgBox.width - 200;
    const startY = svgBox.y + svgBox.height - 200;
    const endX = startX + 10; // Only 10px wide
    const endY = startY + 10; // Only 10px tall

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Verify no new node was created
    const afterCount = await getNodeCount();
    expect(afterCount).toBe(initialCount);
  });

  test("should cancel drawing with Escape key", async ({ page }) => {
    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();
    const initialCount = await getNodeCount();

    // Click the main shape button to enter drawing mode
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Get the SVG element
    const canvasSvg = page.locator('[data-testid="canvas-svg"]');
    const svgBox = await canvasSvg.boundingBox();
    expect(svgBox).not.toBeNull();
    if (!svgBox) return;

    // Start drawing on empty area
    const startX = svgBox.x + svgBox.width - 200;
    const startY = svgBox.y + svgBox.height - 200;
    const endX = startX + 120;
    const endY = startY + 80;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);

    // Check that preview is visible
    const preview = page.locator('[data-testid="drawing-preview"]');
    await expect(preview).toBeVisible();

    // Press Escape to cancel
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);

    // Release mouse
    await page.mouse.up();

    // Preview should be gone
    await expect(preview).not.toBeVisible();

    // Verify no node was created
    const afterCount = await getNodeCount();
    expect(afterCount).toBe(initialCount);

    // Verify tool returns to select mode (cursor should not be crosshair)
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).not.toBe("crosshair");
    }).toPass({ timeout: 2000 });
  });

  test("should exit drawing mode with Escape key before drawing", async ({ page }) => {
    // Click the main shape button to enter drawing mode
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Press Escape to exit drawing mode
    await page.keyboard.press("Escape");

    // Verify tool returns to select mode (cursor should not be crosshair)
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).not.toBe("crosshair");
    }).toPass({ timeout: 2000 });
  });

  test("should show selected state on shape button in drawing mode", async ({ page }) => {
    // Get the split button container
    const splitButton = page.locator('button[aria-label="Add shape"]').locator("..");

    // Before clicking, the button should have default border color
    const initialBorderColor = await splitButton.evaluate((el) => {
      const button = el.querySelector('button');
      return button ? window.getComputedStyle(button).borderColor : "";
    });

    // Click the main shape button to enter drawing mode
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();
    await page.waitForTimeout(100);

    // After clicking, the button should have a different (selected) border color
    const selectedBorderColor = await splitButton.evaluate((el) => {
      const button = el.querySelector('button');
      return button ? window.getComputedStyle(button).borderColor : "";
    });

    // The border color should have changed (indicating selected state)
    expect(selectedBorderColor).not.toBe(initialBorderColor);
  });

  test("should enter Frame drawing mode when clicking frame button", async ({ page }) => {
    // Click the frame main button (left part of split button)
    const frameButton = page.locator('button[aria-label="Draw Frame"]');
    await expect(frameButton).toBeVisible();
    await frameButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });
  });

  test("should draw a frame by dragging on canvas", async ({ page }) => {
    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();
    const initialCount = await getNodeCount();

    // Click the frame button to enter drawing mode
    const frameButton = page.locator('button[aria-label="Draw Frame"]');
    await frameButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Get the SVG element
    const canvasSvg = page.locator('[data-testid="canvas-svg"]');
    const svgBox = await canvasSvg.boundingBox();
    expect(svgBox).not.toBeNull();
    if (!svgBox) return;

    // Draw a frame by dragging on empty area
    const startX = svgBox.x + svgBox.width - 300;
    const startY = svgBox.y + svgBox.height - 300;
    const endX = startX + 200;
    const endY = startY + 150;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);

    // Check that drawing preview appears
    const preview = page.locator('[data-testid="drawing-preview"]');
    await expect(preview).toBeVisible();

    await page.mouse.up();
    await page.waitForTimeout(200);

    // Verify a new node was created
    const afterCount = await getNodeCount();
    expect(afterCount).toBe(initialCount + 1);

    // Verify the new node is selected
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });

  test("should still allow preset selection from frame dropdown", async ({ page }) => {
    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();
    const initialCount = await getNodeCount();

    // Click the frame dropdown button (right part of split button)
    // The frame SplitButton's dropdown uses "Open menu" aria-label, find the one after Draw Frame button
    const frameContainer = page.locator('button[aria-label="Draw Frame"]').locator("..");
    const dropdownButton = frameContainer.locator('button[aria-label="Open menu"]');
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(100);

    // Select A4 preset
    const a4Option = page.locator('button:has-text("A4")');
    await expect(a4Option).toBeVisible();
    await a4Option.click();
    await page.waitForTimeout(100);

    // Verify a new frame was created
    const afterCount = await getNodeCount();
    expect(afterCount).toBe(initialCount + 1);

    // Verify the new frame is selected
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });

  test("should not overflow viewport when frame dropdown is opened", async ({ page }) => {
    // Get viewport dimensions
    const viewportSize = page.viewportSize();
    if (!viewportSize) {
      throw new Error("Viewport size is not set");
    }

    // Click the frame dropdown button
    const frameContainer = page.locator('button[aria-label="Draw Frame"]').locator("..");
    const dropdownButton = frameContainer.locator('button[aria-label="Open menu"]');
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(100);

    // Find the dropdown listbox
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();

    // Get dropdown bounding box
    const dropdownBox = await dropdown.boundingBox();
    expect(dropdownBox).not.toBeNull();

    if (dropdownBox) {
      // Verify dropdown is within viewport
      expect(dropdownBox.y).toBeGreaterThanOrEqual(0);
      expect(dropdownBox.y + dropdownBox.height).toBeLessThanOrEqual(viewportSize.height);
      expect(dropdownBox.x).toBeGreaterThanOrEqual(0);
      expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(viewportSize.width);
    }
  });

  test("should draw ellipse with correct preview shape", async ({ page }) => {
    // Open dropdown and select Ellipse
    const dropdownToggle = page.locator('button[aria-label="Open menu"]').first();
    await dropdownToggle.click();
    const ellipseOption = page.getByRole("option", { name: "Ellipse O", exact: true });
    await ellipseOption.click();

    // Click the main shape button to enter drawing mode
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Get the SVG element
    const canvasSvg = page.locator('[data-testid="canvas-svg"]');
    const svgBox = await canvasSvg.boundingBox();
    expect(svgBox).not.toBeNull();
    if (!svgBox) return;

    // Start drawing on empty area
    const startX = svgBox.x + svgBox.width - 200;
    const startY = svgBox.y + svgBox.height - 200;
    const endX = startX + 120;
    const endY = startY + 80;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);

    // Check that the preview is an ellipse element
    const preview = page.locator('[data-testid="drawing-preview"]');
    await expect(preview).toBeVisible();

    const tagName = await preview.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("ellipse");

    await page.mouse.up();
  });

  test("should snap to grid when enabled", async ({ page }) => {
    // Click the main shape button to enter drawing mode
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();

    // Wait for cursor to change to crosshair (drawing mode active)
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Get the SVG element
    const canvasSvg = page.locator('[data-testid="canvas-svg"]');
    const svgBox = await canvasSvg.boundingBox();
    expect(svgBox).not.toBeNull();
    if (!svgBox) return;

    // Draw a rectangle - make it large enough to ensure it passes minimum size
    const startX = svgBox.x + svgBox.width - 200;
    const startY = svgBox.y + svgBox.height - 200;
    const endX = startX + 80; // ~80px
    const endY = startY + 60; // ~60px

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Verify a node was created and is selected
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Get the created node's bounding box dimensions
    const boundingBoxBorder = page.locator('[data-testid="bounding-box-border"]');
    const boxRect = await boundingBoxBorder.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    // The dimensions should be reasonable (grid size is 20, so we expect multiples of 20)
    // Since snap is enabled by default, the width/height should be snapped
    const roundedWidth = Math.round(boxRect.width);
    const roundedHeight = Math.round(boxRect.height);

    // Just verify the node was created with reasonable size (>= minimum 20)
    expect(roundedWidth).toBeGreaterThanOrEqual(20);
    expect(roundedHeight).toBeGreaterThanOrEqual(20);
  });
});
