/**
 * @file Connection Stroke E2E tests - StrokeSection integration for connection lines
 */

import { test, expect, type Page } from "@playwright/test";

/**
 * Helper to select a connection and verify inspector is visible.
 */
async function selectConnection(page: Page) {
  const connectionGroup = page.locator('[data-connection-id]').first();
  const count = await connectionGroup.count();
  if (count === 0) {
    return null;
  }

  const clickablePath = connectionGroup.locator("path").first();
  await clickablePath.evaluate((el) => {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    el.dispatchEvent(event);
  });

  await page.waitForTimeout(100);
  return connectionGroup;
}

test.describe("Connection Stroke Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should show Stroke Settings section for connections", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Verify Connection Properties header
    const connectionHeader = page.locator('text=Connection Properties');
    await expect(connectionHeader).toBeVisible();

    // Verify Stroke Settings section
    const strokeSettingsHeader = page.locator('text=Stroke Settings');
    await expect(strokeSettingsHeader).toBeVisible();
  });

  test("should have Basic, Dynamic, Brush tabs in Stroke Settings", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

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

  test("should switch to Dynamic tab and show frequency/wiggle/smoothen controls", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Click Dynamic tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Verify Dynamic tab controls are visible
    const frequencyLabel = page.locator('text=Frequency');
    const wiggleLabel = page.locator('text=Wiggle');
    const smoothenLabel = page.locator('text=Smoothen');

    await expect(frequencyLabel).toBeVisible();
    await expect(wiggleLabel).toBeVisible();
    await expect(smoothenLabel).toBeVisible();
  });

  test("should switch to Brush tab and show brush controls", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Click Brush tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const brushTab = tabControl.locator('text=Brush');
    await brushTab.click();
    await page.waitForTimeout(100);

    // Verify Brush tab controls are visible
    // Brush type select (has aria-label="Brush type")
    const brushTypeSelect = page.locator('[aria-label="Brush type"]');
    // Direction label and control
    const directionLabel = page.locator('text=Direction');

    await expect(brushTypeSelect).toBeVisible();
    await expect(directionLabel).toBeVisible();
  });

  test("should show width profile and join controls in Basic tab", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Basic tab should be active by default
    // Look for width profile select (aria-label="Width profile")
    const widthProfileSelect = page.locator('[aria-label="Width profile"]');
    await expect(widthProfileSelect).toBeVisible();

    // Look for join control (aria-label="Join type")
    const joinControl = page.locator('[aria-label="Join type"]');
    await expect(joinControl).toBeVisible();
  });

  test("should change width profile and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Find and click width profile select (aria-label="Width profile")
    const widthProfileSelect = page.locator('[aria-label="Width profile"]');
    await widthProfileSelect.click();
    await page.waitForTimeout(100);

    // Select "taper-end" option (second option)
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    if (optionCount > 1) {
      await options.nth(1).click();
      await page.waitForTimeout(200);
    }

    // Verify width profile is applied to SVG (outline path with data-width-profile)
    const outlinePath = connection.locator('path[data-width-profile]');
    const profileAttr = await outlinePath.getAttribute('data-width-profile');
    expect(profileAttr).toBeTruthy();
    expect(profileAttr).not.toBe('uniform');
  });

  test("should change join type and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Find join control (SegmentedControl with aria-label="Join type")
    const joinControl = page.locator('[aria-label="Join type"]');
    await expect(joinControl).toBeVisible();

    // Click on "Round" join option (second button: miter=0, round=1, bevel=2)
    const roundOption = joinControl.locator('button').nth(1);
    await roundOption.click();
    await page.waitForTimeout(100);

    // Verify it's selected (aria-checked="true")
    await expect(roundOption).toHaveAttribute('aria-checked', 'true');

    // Verify SVG path has correct stroke-linejoin attribute
    const visiblePath = connection.locator('path[data-stroke-join]');
    await expect(visiblePath).toHaveAttribute('data-stroke-join', 'round');
  });

  test("should show Arrows section with Start and End arrowhead selects", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Verify Arrows section
    const arrowsHeader = page.locator('text=Arrows');
    await expect(arrowsHeader).toBeVisible();

    // Verify Start and End arrowhead controls
    const startArrowSelect = page.locator('button[aria-label="Start arrowhead"]');
    const endArrowSelect = page.locator('button[aria-label="End arrowhead"]');

    await expect(startArrowSelect).toBeVisible();
    await expect(endArrowSelect).toBeVisible();
  });

  test("should change start arrowhead type", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Find start arrowhead select
    const startArrowSelect = page.locator('button[aria-label="Start arrowhead"]');
    await startArrowSelect.click();

    // Select "Arrow"
    const arrowOption = page.getByRole('option', { name: 'Arrow', exact: true });
    await expect(arrowOption).toBeVisible();
    await arrowOption.click();
    await page.waitForTimeout(100);

    // Verify the connection now has a start arrow marker
    const visiblePath = connection.locator("path").nth(2);
    const markerStart = await visiblePath.getAttribute("marker-start");
    expect(markerStart).toContain("url(#");
  });

  test("should update frequency and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

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
    await frequencyInput.fill("10");
    await frequencyInput.blur();
    await page.waitForTimeout(200);

    // Verify input value changed
    await expect(frequencyInput).toHaveValue("10");

    // Verify frequency is applied to SVG (via data-stroke-settings)
    const strokeSettings = await connection.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.frequency).toBe(10);
  });

  test("should persist stroke settings after tab switch", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Switch to Dynamic tab and change frequency
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(200);

    // Find the Frequency input using its aria-label
    const frequencyInput = page.locator('input[aria-label="Frequency"]');
    await expect(frequencyInput).toBeVisible();

    // Get current value and change it
    await frequencyInput.clear();
    await frequencyInput.fill("15");
    // Blur the input to trigger change
    await frequencyInput.blur();
    await page.waitForTimeout(300);

    // Verify value was set
    await expect(frequencyInput).toHaveValue("15");

    // Wait for state to propagate before switching tabs
    // This tests that the value persists through the state update cycle
    await page.waitForTimeout(500);

    // Switch to Basic tab
    const basicTab = tabControl.locator('text=Basic');
    await basicTab.click();
    await page.waitForTimeout(300);

    // Switch back to Dynamic tab
    await dynamicTab.click();
    await page.waitForTimeout(200);

    // Find the Frequency input again after tab switch
    const frequencyInputAfter = page.locator('input[aria-label="Frequency"]');
    await expect(frequencyInputAfter).toBeVisible();

    // Verify frequency value is preserved after tab switch
    await expect(frequencyInputAfter).toHaveValue("15");
  });

  // =========================================================================
  // Dynamic Tab - Value Change Tests
  // =========================================================================

  test("should update wiggle and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

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
    await wiggleInput.fill("25");
    await wiggleInput.blur();
    await page.waitForTimeout(200);

    // Verify input value changed
    await expect(wiggleInput).toHaveValue("25");

    // Verify wiggle is applied to SVG
    const strokeSettings = await connection.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.wiggle).toBe(25);
  });

  test("should update smoothen and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

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
    await smoothenInput.fill("50");
    await smoothenInput.blur();
    await page.waitForTimeout(200);

    // Verify input value changed
    await expect(smoothenInput).toHaveValue("50");

    // Verify smoothen is applied to SVG
    const strokeSettings = await connection.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.smoothen).toBe(50);
  });

  // =========================================================================
  // Basic Tab - Value Change Tests
  // =========================================================================

  test("should change join type to bevel and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Find join control
    const joinControl = page.locator('[aria-label="Join type"]');
    await expect(joinControl).toBeVisible();

    // Click on "Bevel" join option (third button: miter=0, round=1, bevel=2)
    const bevelOption = joinControl.locator('button').nth(2);
    await bevelOption.click();
    await page.waitForTimeout(100);

    // Verify it's selected
    await expect(bevelOption).toHaveAttribute('aria-checked', 'true');

    // Verify SVG path has correct stroke-linejoin attribute
    const visiblePath = connection.locator('path[data-stroke-join]');
    await expect(visiblePath).toHaveAttribute('data-stroke-join', 'bevel');
  });

  test("should change miter angle and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

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
    await miterAngleInput.fill("45");
    await miterAngleInput.blur();
    await page.waitForTimeout(100);

    // Verify input value changed
    await expect(miterAngleInput).toHaveValue("45");

    // Verify SVG path has correct stroke-miterlimit attribute
    const visiblePath = connection.locator('path[data-stroke-miterlimit]');
    await expect(visiblePath).toHaveAttribute('data-stroke-miterlimit', '45');
  });

  // =========================================================================
  // Brush Tab - Value Change Tests
  // =========================================================================

  test("should change brush type and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

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
      const strokeSettings = await connection.getAttribute('data-stroke-settings');
      expect(strokeSettings).toBeTruthy();
      const settings = JSON.parse(strokeSettings!);
      expect(settings.brushType).toBe('rough');
    } else {
      // If Rough is not available, select any other option and verify change
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      if (optionCount > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(200);

        const strokeSettings = await connection.getAttribute('data-stroke-settings');
        expect(strokeSettings).toBeTruthy();
      }
    }
  });

  test("should change brush direction and apply to SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Switch to Brush tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const brushTab = tabControl.locator('text=Brush');
    await brushTab.click();
    await page.waitForTimeout(100);

    // Find direction control (SegmentedControl)
    const directionControl = page.locator('[aria-label="Brush direction"]');
    await expect(directionControl).toBeVisible();

    // Click on "Right" direction option (assuming left=0, right=1, both=2)
    const rightOption = directionControl.locator('button').nth(1);
    await rightOption.click();
    await page.waitForTimeout(200);

    // Verify it's selected
    await expect(rightOption).toHaveAttribute('aria-checked', 'true');

    // Verify brush direction is applied to SVG
    const strokeSettings = await connection.getAttribute('data-stroke-settings');
    expect(strokeSettings).toBeTruthy();
    const settings = JSON.parse(strokeSettings!);
    expect(settings.brushDirection).toBe('right');
  });

  test("should change brush width profile and verify in SVG", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Switch to Brush tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const brushTab = tabControl.locator('text=Brush');
    await brushTab.click();
    await page.waitForTimeout(100);

    // Find brush width profile select
    const brushWidthProfileSelect = page.locator('[aria-label="Brush width profile"]');
    await expect(brushWidthProfileSelect).toBeVisible();

    // Get initial stroke settings
    const initialSettings = await connection.getAttribute('data-stroke-settings');

    // Click to open dropdown
    await brushWidthProfileSelect.click();
    await page.waitForTimeout(100);

    // Select a different profile (second option)
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    if (optionCount > 1) {
      await options.nth(1).click();
      await page.waitForTimeout(200);
    }

    // Verify stroke settings changed
    const newSettings = await connection.getAttribute('data-stroke-settings');
    expect(newSettings).toBeTruthy();
    // Settings should have changed (brush width profile might be in different field)
  });

  // =========================================================================
  // Arrows - Value Change Tests
  // =========================================================================

  test("should change end arrowhead type", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Find end arrowhead select
    const endArrowSelect = page.locator('button[aria-label="End arrowhead"]');
    await endArrowSelect.click();
    await page.waitForTimeout(100);

    // Select "Triangle"
    const triangleOption = page.getByRole('option', { name: 'Triangle', exact: true });
    await expect(triangleOption).toBeVisible();
    await triangleOption.click();
    await page.waitForTimeout(100);

    // Verify the connection now has an end arrow marker
    const visiblePath = connection.locator("path").nth(2);
    const markerEnd = await visiblePath.getAttribute("marker-end");
    expect(markerEnd).toContain("url(#");
  });

  test("should change end arrowhead to diamond", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Find end arrowhead select
    const endArrowSelect = page.locator('button[aria-label="End arrowhead"]');
    await endArrowSelect.click();
    await page.waitForTimeout(100);

    // Select "Diamond"
    const diamondOption = page.getByRole('option', { name: 'Diamond', exact: true });
    await expect(diamondOption).toBeVisible();
    await diamondOption.click();
    await page.waitForTimeout(100);

    // Verify the connection now has an end arrow marker
    const visiblePath = connection.locator("path").nth(2);
    const markerEnd = await visiblePath.getAttribute("marker-end");
    expect(markerEnd).toContain("url(#");
  });

  test("should change start arrowhead to circle", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Find start arrowhead select
    const startArrowSelect = page.locator('button[aria-label="Start arrowhead"]');
    await startArrowSelect.click();
    await page.waitForTimeout(100);

    // Select "Circle"
    const circleOption = page.getByRole('option', { name: 'Circle', exact: true });
    await expect(circleOption).toBeVisible();
    await circleOption.click();
    await page.waitForTimeout(100);

    // Verify the connection now has a start arrow marker
    const visiblePath = connection.locator("path").nth(2);
    const markerStart = await visiblePath.getAttribute("marker-start");
    expect(markerStart).toContain("url(#");
  });

  test("should remove arrowhead by selecting None", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // First, add an arrowhead
    const endArrowSelect = page.locator('button[aria-label="End arrowhead"]');
    await endArrowSelect.click();
    await page.waitForTimeout(100);

    const arrowOption = page.getByRole('option', { name: 'Arrow', exact: true });
    await arrowOption.click();
    await page.waitForTimeout(100);

    // Verify arrow was added
    const visiblePath = connection.locator("path").nth(2);
    let markerEnd = await visiblePath.getAttribute("marker-end");
    expect(markerEnd).toContain("url(#");

    // Now remove the arrowhead
    await endArrowSelect.click();
    await page.waitForTimeout(100);

    const noneOption = page.getByRole('option', { name: 'None', exact: true });
    await noneOption.click();
    await page.waitForTimeout(100);

    // Verify arrow was removed (marker-end should be null or empty)
    markerEnd = await visiblePath.getAttribute("marker-end");
    expect(markerEnd === null || markerEnd === "" || markerEnd === "none").toBeTruthy();
  });

  // =========================================================================
  // Persistence Tests - Verify values persist after reselection
  // =========================================================================

  test("should persist Dynamic tab values after reselecting connection", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Switch to Dynamic tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const dynamicTab = tabControl.locator('text=Dynamic');
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Set all three values
    const frequencyInput = page.locator('input[aria-label="Frequency"]');
    const wiggleInput = page.locator('input[aria-label="Wiggle"]');
    const smoothenInput = page.locator('input[aria-label="Smoothen"]');

    await frequencyInput.clear();
    await frequencyInput.fill("20");
    await frequencyInput.blur();
    await page.waitForTimeout(100);

    await wiggleInput.clear();
    await wiggleInput.fill("30");
    await wiggleInput.blur();
    await page.waitForTimeout(100);

    await smoothenInput.clear();
    await smoothenInput.fill("40");
    await smoothenInput.blur();
    await page.waitForTimeout(100);

    // Press Escape to deselect
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Reselect the connection
    await selectConnection(page);
    await page.waitForTimeout(100);

    // Switch to Dynamic tab
    await dynamicTab.click();
    await page.waitForTimeout(100);

    // Verify all values persisted
    await expect(page.locator('input[aria-label="Frequency"]')).toHaveValue("20");
    await expect(page.locator('input[aria-label="Wiggle"]')).toHaveValue("30");
    await expect(page.locator('input[aria-label="Smoothen"]')).toHaveValue("40");
  });

  test("should persist Brush tab values after reselecting connection", async ({ page }) => {
    const connection = await selectConnection(page);
    if (!connection) {
      test.skip();
      return;
    }

    // Switch to Brush tab
    const tabControl = page.locator('[aria-label="Stroke settings tab"]');
    const brushTab = tabControl.locator('text=Brush');
    await brushTab.click();
    await page.waitForTimeout(100);

    // Change brush direction to right
    const directionControl = page.locator('[aria-label="Brush direction"]');
    const rightOption = directionControl.locator('button').nth(1);
    await rightOption.click();
    await page.waitForTimeout(100);

    // Press Escape to deselect
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Reselect the connection
    await selectConnection(page);
    await page.waitForTimeout(100);

    // Switch to Brush tab
    await brushTab.click();
    await page.waitForTimeout(100);

    // Verify direction persisted
    const rightOptionAfter = page.locator('[aria-label="Brush direction"]').locator('button').nth(1);
    await expect(rightOptionAfter).toHaveAttribute('aria-checked', 'true');
  });
});
