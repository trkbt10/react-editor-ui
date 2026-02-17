/**
 * @file Typography E2E tests - TypographySection integration for text nodes
 */

import { test, expect, type Page } from "@playwright/test";

/**
 * Helper to draw a shape on the canvas
 */
async function drawOnCanvas(page: Page): Promise<void> {
  const canvasSvg = page.locator('[data-testid="canvas-svg"]');
  const svgBox = await canvasSvg.boundingBox();
  if (!svgBox) throw new Error("Could not get SVG bounding box");

  // Draw a shape on empty area
  const startX = svgBox.x + svgBox.width - 200;
  const startY = svgBox.y + svgBox.height - 200;
  const endX = startX + 120;
  const endY = startY + 80;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
  await page.waitForTimeout(200);
}

/**
 * Helper to add a text node by entering drawing mode and drawing on canvas.
 */
async function addTextNode(page: Page): Promise<void> {
  const textToolButton = page.locator('button[aria-label="Text tool"]');
  await textToolButton.click();
  await page.waitForTimeout(100);
  await drawOnCanvas(page);
  // Wait for node to be created and selected
  await page.waitForTimeout(200);
}

test.describe("Typography Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should show Typography section for text nodes", async ({ page }) => {
    // Add a text node
    await addTextNode(page);

    // Wait for bounding box to appear (node selected)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Verify Typography section appears in inspector
    const typographySection = page.locator('text=Typography').first();
    await expect(typographySection).toBeVisible();

    // Verify Text Color section also appears
    const textColorSection = page.locator('text=Text Color');
    await expect(textColorSection).toBeVisible();
  });

  test("should have font family selector", async ({ page }) => {
    await addTextNode(page);

    // Wait for selection
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Find font family selector (labeled as "Font family")
    const fontFamilySelect = page.locator('[aria-label="Font family"]');
    await expect(fontFamilySelect).toBeVisible();
  });

  test("should have font weight selector", async ({ page }) => {
    await addTextNode(page);

    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Find font weight selector (labeled as "Font weight")
    const fontWeightSelect = page.locator('[aria-label="Font weight"]');
    await expect(fontWeightSelect).toBeVisible();
  });

  test("should have font size input", async ({ page }) => {
    await addTextNode(page);

    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Find font size input (labeled as "Font size")
    const fontSizeInput = page.locator('[aria-label="Font size"]');
    await expect(fontSizeInput).toBeVisible();
  });

  test("should have horizontal alignment control", async ({ page }) => {
    await addTextNode(page);

    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Find horizontal alignment label and control
    const horizontalLabel = page.locator('text=Horizontal');
    await expect(horizontalLabel).toBeVisible();
  });

  test("should have vertical alignment control", async ({ page }) => {
    await addTextNode(page);

    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Find vertical alignment label
    const verticalLabel = page.locator('text=Vertical');
    await expect(verticalLabel).toBeVisible();
  });

  test("should change font weight", async ({ page }) => {
    await addTextNode(page);

    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Change font weight to Bold
    const fontWeightSelect = page.locator('[aria-label="Font weight"]');
    await fontWeightSelect.click();

    // Select exactly "Bold" (not "Semi Bold" or "Extra Bold")
    const boldOption = page.getByRole('option', { name: 'Bold', exact: true });
    await expect(boldOption).toBeVisible();
    await boldOption.click();

    // Verify the select now shows Bold
    await expect(fontWeightSelect).toContainText("Bold");
  });

  test("should not show Typography section for shape nodes", async ({ page }) => {
    // Add a shape node using the shape tool
    const shapeButton = page.locator('button[aria-label="Add shape"]');
    await shapeButton.click();

    // Draw the shape on canvas
    await drawOnCanvas(page);

    // Verify bounding box appears (shape is selected)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Verify inspector shows Shape Properties (not Typography)
    const shapeProps = page.locator('text=Shape Properties');
    await expect(shapeProps).toBeVisible();

    // Verify Typography section does NOT appear for shape nodes
    // We check the main inspector panel for Typography heading
    const inspectorPanel = page.locator('[data-testid="inspector-panel"], [role="region"]').first();
    const typographyInInspector = inspectorPanel.locator('text=Typography');

    // Typography should not be visible in the inspector for shape nodes
    await expect(typographyInInspector).not.toBeVisible({ timeout: 1000 });
  });
});
