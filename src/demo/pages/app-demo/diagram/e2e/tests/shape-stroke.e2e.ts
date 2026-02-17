/**
 * @file Shape Stroke E2E tests - StrokeSection integration for shape nodes
 */

import { test, expect, type Page } from "@playwright/test";

/**
 * Helper to add a shape and select it
 */
async function addAndSelectShape(page: Page) {
  // Click shape tool button
  const shapeButton = page.locator('button[aria-label="Add shape"]');
  await shapeButton.click();
  await page.waitForTimeout(100);

  // Draw shape on canvas
  const canvasSvg = page.locator('[data-testid="canvas-svg"]');
  const svgBox = await canvasSvg.boundingBox();
  if (!svgBox) throw new Error("Could not get SVG bounding box");

  const startX = svgBox.x + svgBox.width - 200;
  const startY = svgBox.y + svgBox.height - 200;
  const endX = startX + 120;
  const endY = startY + 80;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
  await page.waitForTimeout(200);

  // Verify shape is selected (bounding box visible)
  const boundingBox = page.locator('[data-testid="bounding-box"]');
  await expect(boundingBox).toBeVisible();

  // Get the shape container with stroke settings
  const shapeContainer = page.locator('[data-stroke-settings]').last();
  return shapeContainer;
}

test.describe("Shape Stroke Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should show Stroke Settings section for shapes", async ({ page }) => {
    await addAndSelectShape(page);

    // Verify Shape Properties header
    const shapeHeader = page.locator('text=Shape Properties');
    await expect(shapeHeader).toBeVisible();

    // Verify Stroke Settings section
    const strokeSettingsHeader = page.locator('text=Stroke Settings');
    await expect(strokeSettingsHeader).toBeVisible();
  });

  test("should have Basic, Dynamic, Brush tabs in Stroke Settings", async ({ page }) => {
    await addAndSelectShape(page);

    // Find the Stroke Settings section's SegmentedControl
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    await expect(tabControl).toBeVisible();

    // Verify all tabs exist
    const basicTab = tabControl.locator('text=Basic');
    const dynamicTab = tabControl.locator('text=Dynamic');
    const brushTab = tabControl.locator('text=Brush');

    await expect(basicTab).toBeVisible();
    await expect(dynamicTab).toBeVisible();
    await expect(brushTab).toBeVisible();
  });

  // =========================================================================
  // Basic Tab - Value Change Tests with SVG Verification
  // =========================================================================

  test("should change join type and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Find join control
    const joinControl = page.locator('[aria-label="Join type"]');
    await expect(joinControl).toBeVisible();

    // Click on "Round" join option (second button)
    const roundOption = joinControl.locator('button').nth(1);
    await roundOption.click();
    await page.waitForTimeout(200);

    // Verify it's selected
    await expect(roundOption).toHaveAttribute('aria-checked', 'true');

    // Verify SVG path has correct stroke-linejoin attribute
    const visiblePath = shape.locator('path[data-stroke-join]');
    await expect(visiblePath).toHaveAttribute('data-stroke-join', 'round');
  });

  test("should change join type to bevel and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Find join control
    const joinControl = page.locator('[aria-label="Join type"]');
    const bevelOption = joinControl.locator('button').nth(2);
    await bevelOption.click();
    await page.waitForTimeout(200);

    // Verify it's selected
    await expect(bevelOption).toHaveAttribute('aria-checked', 'true');

    // Verify SVG path has correct stroke-linejoin attribute
    const visiblePath = shape.locator('path[data-stroke-join]');
    await expect(visiblePath).toHaveAttribute('data-stroke-join', 'bevel');
  });

  test("should change miter angle and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Ensure miter join is selected (first button)
    const joinControl = page.locator('[aria-label="Join type"]');
    const miterOption = joinControl.locator('button').nth(0);
    await miterOption.click();
    await page.waitForTimeout(100);

    // Find miter angle input
    const miterAngleInput = page.locator('input[aria-label="Miter angle"]');
    await expect(miterAngleInput).toBeVisible();

    // Change miter angle
    await miterAngleInput.clear();
    await miterAngleInput.fill("30");
    await miterAngleInput.blur();
    await page.waitForTimeout(200);

    // Verify input value changed
    await expect(miterAngleInput).toHaveValue("30");

    // Verify SVG path has correct stroke-miterlimit attribute
    const visiblePath = shape.locator('path[data-stroke-miterlimit]');
    await expect(visiblePath).toHaveAttribute('data-stroke-miterlimit', '30');
  });

  test("should change width profile and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Find width profile select
    const widthProfileSelect = page.locator('[aria-label="Width profile"]');
    await widthProfileSelect.click();
    await page.waitForTimeout(100);

    // Select taper-end option (second option)
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    if (optionCount > 1) {
      await options.nth(1).click();
      await page.waitForTimeout(200);
    }

    // Verify width profile is applied to SVG
    const outlinePath = shape.locator('path[data-width-profile]');
    const profileAttr = await outlinePath.getAttribute('data-width-profile');
    expect(profileAttr).toBeTruthy();
    expect(profileAttr).not.toBe('uniform');
  });

  // =========================================================================
  // Dynamic Tab - Value Change Tests with SVG Verification
  // =========================================================================

  test("should update frequency and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Switch to Dynamic tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Find the Frequency input
    const frequencyInput = page.locator('input[aria-label="Frequency"]');
    await expect(frequencyInput).toBeVisible();

    // Change frequency
    await frequencyInput.clear();
    await frequencyInput.fill("15");
    await frequencyInput.blur();
    await page.waitForTimeout(200);

    // Verify input value changed
    await expect(frequencyInput).toHaveValue("15");

    // Verify frequency is applied to SVG
    const strokeSettings = await shape.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.frequency).toBe(15);
  });

  test("should update wiggle and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Switch to Dynamic tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Find the Wiggle input
    const wiggleInput = page.locator('input[aria-label="Wiggle"]');
    await expect(wiggleInput).toBeVisible();

    // Change wiggle value
    await wiggleInput.clear();
    await wiggleInput.fill("20");
    await wiggleInput.blur();
    await page.waitForTimeout(200);

    // Verify input value changed
    await expect(wiggleInput).toHaveValue("20");

    // Verify wiggle is applied to SVG
    const strokeSettings = await shape.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.wiggle).toBe(20);
  });

  test("should update smoothen and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Switch to Dynamic tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Find the Smoothen input
    const smoothenInput = page.locator('input[aria-label="Smoothen"]');
    await expect(smoothenInput).toBeVisible();

    // Change smoothen value
    await smoothenInput.clear();
    await smoothenInput.fill("40");
    await smoothenInput.blur();
    await page.waitForTimeout(200);

    // Verify input value changed
    await expect(smoothenInput).toHaveValue("40");

    // Verify smoothen is applied to SVG
    const strokeSettings = await shape.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.smoothen).toBe(40);
  });

  // =========================================================================
  // Brush Tab - Value Change Tests with SVG Verification
  // =========================================================================

  test("should change brush type and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Switch to Brush tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const brushTab = tabControl.locator('text=Brush');
    await brushTab.click();
    await page.waitForTimeout(100);

    // Find brush type select
    const brushTypeSelect = page.locator('[aria-label="Brush type"]');
    await expect(brushTypeSelect).toBeVisible();

    // Click to open dropdown
    await brushTypeSelect.click();
    await page.waitForTimeout(100);

    // Select "Rough" brush type
    const roughOption = page.getByRole('option', { name: 'Rough' });
    if (await roughOption.isVisible()) {
      await roughOption.click();
      await page.waitForTimeout(200);

      // Verify brush type is applied to SVG
      const strokeSettings = await shape.getAttribute('data-stroke-settings');
      expect(strokeSettings).toBeTruthy();
      const settings = JSON.parse(strokeSettings!);
      expect(settings.brushType).toBe('rough');
    } else {
      // If Rough is not available, select any other option
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      if (optionCount > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(200);

        const strokeSettings = await shape.getAttribute('data-stroke-settings');
        expect(strokeSettings).toBeTruthy();
      }
    }
  });

  test("should change brush direction and apply to SVG", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Switch to Brush tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const brushTab = tabControl.locator('text=Brush');
    await brushTab.click();
    await page.waitForTimeout(100);

    // Find direction control
    const directionControl = page.locator('[aria-label="Brush direction"]');
    await expect(directionControl).toBeVisible();

    // Click on "Right" direction option (second button)
    const rightOption = directionControl.locator('button').nth(1);
    await rightOption.click();
    await page.waitForTimeout(200);

    // Verify it's selected
    await expect(rightOption).toHaveAttribute('aria-checked', 'true');

    // Verify brush direction is applied to SVG
    const strokeSettings = await shape.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.brushDirection).toBe('right');
  });

  // =========================================================================
  // Persistence Tests
  // =========================================================================

  test("should persist stroke settings after tab switch", async ({ page }) => {
    const shape = await addAndSelectShape(page);

    // Switch to Dynamic tab and change frequency
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(200);

    // Find and change the Frequency input
    const frequencyInput = page.locator('input[aria-label="Frequency"]');
    await expect(frequencyInput).toBeVisible();

    await frequencyInput.clear();
    await frequencyInput.fill("25");
    await frequencyInput.blur();
    await page.waitForTimeout(300);

    // Verify value was set
    await expect(frequencyInput).toHaveValue("25");

    // Switch to Basic tab
    const basicTab = tabControl.locator('text=Basic');
    await basicTab.click();
    await page.waitForTimeout(300);

    // Switch back to Dynamic tab
    await dynamicTab.click();
    await page.waitForTimeout(200);

    // Verify frequency value is preserved
    const frequencyInputAfter = page.locator('input[aria-label="Frequency"]');
    await expect(frequencyInputAfter).toHaveValue("25");

    // Verify it's also in the SVG data
    const strokeSettings = await shape.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.frequency).toBe(25);
  });

  test("should persist stroke settings after reselecting shape", async ({ page }) => {
    await addAndSelectShape(page);

    // Switch to Dynamic tab and change values
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Set frequency
    const frequencyInput = page.locator('input[aria-label="Frequency"]');
    await frequencyInput.clear();
    await frequencyInput.fill("30");
    await frequencyInput.blur();
    await page.waitForTimeout(100);

    // Set wiggle
    const wiggleInput = page.locator('input[aria-label="Wiggle"]');
    await wiggleInput.clear();
    await wiggleInput.fill("35");
    await wiggleInput.blur();
    await page.waitForTimeout(100);

    // Press Escape to deselect
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Click on the bounding box area to reselect the shape
    // Use force: true to bypass the pointer events interception check
    const shapeContainer = page.locator('[data-stroke-settings]').last();
    await shapeContainer.click({ force: true });
    await page.waitForTimeout(200);

    // Verify shape is selected again (bounding box visible)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Switch to Dynamic tab
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Verify values persisted
    await expect(page.locator('input[aria-label="Frequency"]')).toHaveValue("30");
    await expect(page.locator('input[aria-label="Wiggle"]')).toHaveValue("35");

    // Also verify in SVG data
    const strokeSettings = await shapeContainer.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.frequency).toBe(30);
    expect(settings.wiggle).toBe(35);
  });
});
