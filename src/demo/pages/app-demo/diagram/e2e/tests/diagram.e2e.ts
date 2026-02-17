/**
 * @file Diagram E2E tests - Basic interactions
 */

import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Helper to dispatch pointer events on SVG elements with proper coordinates.
 * Playwright's dispatchEvent doesn't properly pass clientX/clientY for PointerEvents on SVG.
 */
async function dispatchPointerEvent(
  locator: Locator,
  type: "pointerdown" | "pointermove" | "pointerup",
  clientX: number,
  clientY: number,
): Promise<void> {
  await locator.evaluate(
    (el, { type, clientX, clientY }) => {
      const event = new PointerEvent(type, {
        clientX,
        clientY,
        pointerId: 1,
        button: type === "pointerup" ? 0 : 0,
        buttons: type === "pointerup" ? 0 : 1,
        isPrimary: true,
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
      });
      el.dispatchEvent(event);
    },
    { type, clientX, clientY },
  );
}

/**
 * Helper to enter drawing mode and draw on canvas.
 * This replaces the old behavior where clicking the button immediately added a shape.
 */
async function drawOnCanvas(page: Page): Promise<void> {
  // Wait for cursor to change to crosshair (drawing mode active)
  const canvas = page.locator('[role="application"]');
  await expect(async () => {
    const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(cursor).toBe("crosshair");
  }).toPass({ timeout: 2000 });

  // Get the SVG element
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
 * Helper to add a shape by entering drawing mode and drawing on canvas.
 */
async function addShapeByDrawing(page: Page): Promise<void> {
  // Click the main shape button to enter drawing mode
  const mainButton = page.locator('button[aria-label="Add shape"]');
  await mainButton.click();
  await drawOnCanvas(page);
}

/**
 * Helper to add a text node by entering drawing mode and drawing on canvas.
 */
async function addTextByDrawing(page: Page): Promise<void> {
  // Select Text from dropdown first
  const dropdownToggle = page.locator('button[aria-label="Open menu"]').first();
  await dropdownToggle.click();
  const textOption = page.locator('[role="option"]:has-text("Text")');
  await expect(textOption).toBeVisible();
  await textOption.click();

  // Click the main shape button to enter drawing mode
  const mainButton = page.locator('button[aria-label="Add shape"]');
  await mainButton.click();
  await drawOnCanvas(page);
}

test.describe("Diagram Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/diagram");
    // Wait for the canvas to be rendered
    await page.waitForSelector('[data-testid="canvas-svg"]');
  });

  test("should render initial nodes", async ({ page }) => {
    // Check that the canvas SVG is present
    const canvas = page.locator('[data-testid="canvas-svg"]');
    await expect(canvas).toBeVisible();

    // Check that canvas content exists (it has 0 width/height but children are visible via transform)
    const canvasContent = page.locator('[data-testid="canvas-content"]');
    await expect(canvasContent).toBeAttached();

    // Check nodes are present in the DOM
    const nodes = page.locator('[data-testid="canvas-content"] > div');
    await expect(nodes.first()).toBeAttached();
  });

  test("should select a node on click", async ({ page }) => {
    // Find the actual rendered node - the wrapper div is 0x0 but contains
    // an absolutely positioned div with the node styling
    const nodeWrapper = page.locator('[data-testid="canvas-content"] > div').first();
    await expect(nodeWrapper).toBeAttached();

    // Get the actual node element (first div child with position: absolute)
    const actualNode = nodeWrapper.locator('div').first();

    // Get the node's bounding box
    const nodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Click at the node's center
    await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);

    // Verify bounding box appears
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });

  test("should deselect node on canvas background click", async ({ page }) => {
    // First select a node
    const nodeWrapper = page.locator('[data-testid="canvas-content"] > div').first();
    await expect(nodeWrapper).toBeAttached();

    const actualNode = nodeWrapper.locator('div').first();
    const nodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Click to select
    await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);

    // Verify bounding box appears
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Click on canvas background - find an empty spot
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (!canvasBox) return;

    // Click near top-left corner of canvas which should be empty
    await page.mouse.click(canvasBox.x + 30, canvasBox.y + 30);

    // Verify bounding box disappears
    await expect(boundingBox).not.toBeVisible();
  });

  test("should move node by dragging bounding box", async ({ page }) => {
    // Select a node by clicking on it
    const nodeWrapper = page.locator('[data-testid="canvas-content"] > div').first();
    await expect(nodeWrapper).toBeAttached();

    const actualNode = nodeWrapper.locator('div').first();
    const nodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Click to select
    await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);

    // Verify bounding box appears
    const boundingBox = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(boundingBox).toBeVisible();

    // Record initial node position
    const initialNodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // Get the bounding box position (in SVG, we need the screen coordinates)
    const box = await boundingBox.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Drag the bounding box by 50px in x and y (larger than gridSize=20 to overcome snap)
    // Use our helper to dispatch pointer events on SVG elements
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await dispatchPointerEvent(boundingBox, "pointerdown", centerX, centerY);
    await dispatchPointerEvent(boundingBox, "pointermove", centerX + 50, centerY + 50);
    await dispatchPointerEvent(boundingBox, "pointerup", centerX + 50, centerY + 50);

    // Wait for state update
    await page.waitForTimeout(100);

    // Check that the node has moved
    const newNodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // The position should have changed
    // Note: With snap enabled (gridSize=20), expect movement in grid increments
    expect(newNodeBox.x).not.toBe(initialNodeBox.x);
    expect(newNodeBox.y).not.toBe(initialNodeBox.y);
  });

  test("should resize node by dragging handle", async ({ page }) => {
    // First add a new rectangle node so we have a resizable node
    const dropdownToggle = page.locator('button[aria-label="Open menu"]').first();
    await dropdownToggle.click();
    const rectOption = page.getByRole("option", { name: "Rectangle R", exact: true });
    await rectOption.click();

    // Add shape by drawing on canvas
    await addShapeByDrawing(page);

    // The newly added node should be selected
    const boundingBoxVisible = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBoxVisible).toBeVisible();

    // Get initial bounding box size (this represents the node size)
    const boundingBoxBorder = page.locator('[data-testid="bounding-box-border"]');
    const initialBoxSize = await boundingBoxBorder.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    // Get the bottom-right resize handle
    const handle = page.locator('[data-testid="bounding-box-handle-bottom-right"]');
    await expect(handle).toBeVisible();

    // Get handle position
    const handleBox = await handle.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Drag the handle using our helper (SVG elements need direct event dispatch)
    const centerX = handleBox.x + handleBox.width / 2;
    const centerY = handleBox.y + handleBox.height / 2;

    await dispatchPointerEvent(handle, "pointerdown", centerX, centerY);
    await page.waitForTimeout(50);
    await dispatchPointerEvent(handle, "pointermove", centerX + 40, centerY + 40);
    await page.waitForTimeout(50);
    await dispatchPointerEvent(handle, "pointerup", centerX + 40, centerY + 40);

    // Wait for state update
    await page.waitForTimeout(100);

    // Check that the bounding box size has changed
    const newBoxSize = await boundingBoxBorder.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    // The size should have increased
    expect(newBoxSize.width).toBeGreaterThan(initialBoxSize.width);
    expect(newBoxSize.height).toBeGreaterThan(initialBoxSize.height);
  });

  test("should select connection line on click", async ({ page }) => {
    // Find a connection line group
    const connectionGroup = page.locator('[data-connection-id]').first();

    // Check if connections exist
    const count = await connectionGroup.count();
    if (count === 0) {
      test.skip();
      return;
    }

    // Get the clickable path (first path inside the connection group - the invisible thick one)
    const clickablePath = connectionGroup.locator("path").first();
    await expect(clickablePath).toBeAttached();

    // Dispatch click event directly on the path element using page.evaluate
    // This is needed because SVG paths inside a parent with pointer-events: none
    // don't receive normal click events through Playwright's click()
    await clickablePath.evaluate((el) => {
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      el.dispatchEvent(event);
    });

    // Wait for selection to update
    await page.waitForTimeout(100);

    // Verify the inspector shows "Connection Properties"
    const connectionHeader = page.locator('text=Connection Properties');
    await expect(connectionHeader).toBeVisible();
  });

  test("should marquee select multiple nodes", async ({ page }) => {
    // Start drag from empty area
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (!canvasBox) return;

    // Drag from top-left to a point that should cover multiple nodes
    const startX = canvasBox.x + 50;
    const startY = canvasBox.y + 50;
    const endX = startX + 300;
    const endY = startY + 400;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);

    // Check marquee is visible during drag
    const marquee = page.locator('[data-testid="marquee-selection"]');
    await expect(marquee).toBeVisible();

    await page.mouse.up();

    // Marquee should disappear after mouse up
    await expect(marquee).not.toBeVisible();
  });

  test("Theme tab should be accessible", async ({ page }) => {
    // Find the Theme tab
    const themeTab = page.locator('button:has-text("Theme")');
    await expect(themeTab).toBeVisible();

    // Click on Theme tab
    await themeTab.click();

    // Verify theme editor content is visible
    const nodeDefaultsSection = page.locator('text=Node Defaults');
    await expect(nodeDefaultsSection).toBeVisible();
  });

  test("Export tab should auto-detect frames", async ({ page }) => {
    // Find the Export tab
    const exportTab = page.locator('button:has-text("Export")');
    await expect(exportTab).toBeVisible();

    // Click on Export tab
    await exportTab.click();

    // Verify export section is visible (frames are auto-detected)
    const scaleSelect = page.locator('button:has-text("1x")');
    await expect(scaleSelect).toBeVisible();

    // Verify format select is visible (PNG by default)
    const formatSelect = page.locator('button:has-text("PNG")');
    await expect(formatSelect).toBeVisible();

    // Verify export button shows "Export Frame" (there's 1 frame in mockData)
    const exportButton = page.locator('button:has-text("Export Frame")');
    await expect(exportButton).toBeVisible();

    // Verify Preview section is visible (use first() to avoid strict mode violation)
    const previewHeader = page.locator('text=Preview').first();
    await expect(previewHeader).toBeVisible();

    // Verify preview image is rendered (SVG preview of the first frame)
    const previewImage = page.locator('img[alt="Export preview"]');
    await expect(previewImage).toBeVisible();

    // Verify the preview image has valid content
    const src = await previewImage.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src).toContain("data:image/svg+xml");

    // Take screenshot for visual verification
    await page.screenshot({ path: "test-results/export-frame-preview.png" });
  });

  test("should edit text on double-click with position maintained", async ({ page }) => {
    // First add a text node by drawing
    await addTextByDrawing(page);

    // The newly added text node should be selected
    const boundingBox = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(boundingBox).toBeVisible();

    // Find the text content display span before editing
    const textDisplay = page.locator('[data-testid="text-content-display"]');
    await expect(textDisplay).toBeVisible();

    // Get the text position before editing
    const textPositionBefore = await textDisplay.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Double-click on the bounding box to start editing
    const box = await boundingBox.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);

    // Wait for edit mode to activate
    await page.waitForTimeout(100);

    // Check if contentEditable span is visible
    const editableSpan = page.locator('[data-testid="text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Get the editable span position - should match the original text position
    const editablePosition = await editableSpan.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Verify the text position is maintained (within 2px tolerance)
    expect(Math.abs(editablePosition.x - textPositionBefore.x)).toBeLessThan(2);
    expect(Math.abs(editablePosition.y - textPositionBefore.y)).toBeLessThan(2);

    // Select all existing text and type new text
    await page.keyboard.press("Control+a");
    await page.keyboard.type("New Label");
    await page.keyboard.press("Enter");

    // Wait for edit to complete
    await page.waitForTimeout(100);

    // Verify the text content was actually changed
    const updatedTextDisplay = page.locator('[data-testid="text-content-display"]');
    await expect(updatedTextDisplay).toContainText("New Label");

    // Verify inspector shows "Text Properties" for text nodes
    const propsHeader = page.locator('text=Text Properties');
    await expect(propsHeader).toBeVisible();
  });

  test("should move multiple selected nodes together", async ({ page }) => {
    // First add two shape nodes so we have shapes to multi-select
    const dropdownToggle = page.locator('button[aria-label="Open menu"]').first();

    // Add first rectangle by drawing
    await dropdownToggle.click();
    await page.getByRole("option", { name: "Rectangle R", exact: true }).click();
    await addShapeByDrawing(page);

    // Click somewhere else to deselect
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (!canvasBox) return;
    await page.mouse.click(canvasBox.x + 400, canvasBox.y + 400);
    await page.waitForTimeout(50);

    // Add second rectangle by drawing
    await addShapeByDrawing(page);

    // Click somewhere else to deselect
    await page.mouse.click(canvasBox.x + 400, canvasBox.y + 400);
    await page.waitForTimeout(100);

    // Get initial bounding box positions of shapes (they're at known positions)
    const boundingBoxBorder = page.locator('[data-testid="bounding-box-border"]');

    // Marquee select both shapes
    const startX = canvasBox.x + 150;
    const startY = canvasBox.y + 150;
    const endX = startX + 200;
    const endY = startY + 200;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Check if bounding box appears (indicates selection)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Get initial bounding box position
    const initialBox = await boundingBoxBorder.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // Get bounding box position for dragging
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    const box = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Drag all selected nodes using our helper (SVG elements need direct event dispatch)
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await dispatchPointerEvent(moveArea, "pointerdown", centerX, centerY);
    await dispatchPointerEvent(moveArea, "pointermove", centerX + 60, centerY + 60);
    await dispatchPointerEvent(moveArea, "pointerup", centerX + 60, centerY + 60);

    await page.waitForTimeout(100);

    // Verify that the bounding box moved
    const finalBox = await boundingBoxBorder.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // The bounding box should have moved
    expect(Math.round(finalBox.x)).not.toBe(Math.round(initialBox.x));
    expect(Math.round(finalBox.y)).not.toBe(Math.round(initialBox.y));
  });

  test("should show multi-selection inspector", async ({ page }) => {
    // Need to add ShapeNodes (not instances) for multi-selection inspector to show
    const dropdownToggle = page.locator('button[aria-label="Open menu"]').first();

    // Add first rectangle by drawing at bottom-right
    await dropdownToggle.click();
    await page.getByRole("option", { name: "Rectangle R", exact: true }).click();

    // Click main button and draw first shape
    const mainButton = page.locator('button[aria-label="Add shape"]');
    await mainButton.click();

    // Wait for cursor to change
    const canvas = page.locator('[role="application"]');
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Get SVG box and draw first shape
    const canvasSvg = page.locator('[data-testid="canvas-svg"]');
    const svgBox = await canvasSvg.boundingBox();
    if (!svgBox) throw new Error("Could not get SVG bounding box");

    // Draw first shape at position 1
    const pos1X = svgBox.x + svgBox.width - 400;
    const pos1Y = svgBox.y + svgBox.height - 300;
    await page.mouse.move(pos1X, pos1Y);
    await page.mouse.down();
    await page.mouse.move(pos1X + 100, pos1Y + 60);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Click somewhere to deselect
    await page.mouse.click(svgBox.x + 50, svgBox.y + 50);
    await page.waitForTimeout(50);

    // Add second rectangle - enter drawing mode
    await mainButton.click();
    await expect(async () => {
      const cursor = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
      expect(cursor).toBe("crosshair");
    }).toPass({ timeout: 2000 });

    // Draw second shape at position 2 (below the first)
    const pos2X = svgBox.x + svgBox.width - 400;
    const pos2Y = svgBox.y + svgBox.height - 200;
    await page.mouse.move(pos2X, pos2Y);
    await page.mouse.down();
    await page.mouse.move(pos2X + 100, pos2Y + 60);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Click somewhere to deselect
    await page.mouse.click(svgBox.x + 50, svgBox.y + 50);
    await page.waitForTimeout(50);

    // Now marquee select both shapes
    const startX = pos1X - 20;
    const startY = pos1Y - 20;
    const endX = pos2X + 150;
    const endY = pos2Y + 100;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Check inspector shows multi-selection header
    const multiSelectHeader = page.locator('text=/\\d+ Shapes Selected/');
    await expect(multiSelectHeader).toBeVisible();
  });

  test("should direct drag unselected node", async ({ page }) => {
    // Find a node that's not selected
    const nodeWrapper = page.locator('[data-testid="canvas-content"] > div').first();
    await expect(nodeWrapper).toBeAttached();

    const actualNode = nodeWrapper.locator("div").first();
    const nodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Record initial position
    const initialPos = { x: nodeBox.x, y: nodeBox.y };

    // Directly drag the node without pre-selecting
    const centerX = nodeBox.x + nodeBox.width / 2;
    const centerY = nodeBox.y + nodeBox.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    // Move more than the drag threshold (4px)
    await page.mouse.move(centerX + 60, centerY + 60);
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Verify node moved
    const newBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    expect(newBox.x).not.toBe(initialPos.x);
    expect(newBox.y).not.toBe(initialPos.y);

    // Verify node is now selected (bounding box visible)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });

  test("should add text node from toolbar", async ({ page }) => {
    // Add text node by drawing
    await addTextByDrawing(page);

    // Verify a bounding box appears (new node is selected)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Verify inspector shows "Text Properties" for text nodes
    const propsHeader = page.locator('text=Text Properties');
    await expect(propsHeader).toBeVisible();
  });

  test("should edit text on direct double-click (without pre-selection)", async ({ page }) => {
    // First add a text node by drawing
    await addTextByDrawing(page);

    // Verify text node is selected
    const boundingBox = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(boundingBox).toBeVisible();

    // Click on canvas background to deselect (bottom-right corner area)
    const canvas = page.locator('[data-testid="canvas-content"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (!canvasBox) return;

    // Click far from the text node (which is centered at ~360, ~370)
    // Click bottom right corner of canvas
    await page.mouse.click(canvasBox.x + canvasBox.width - 50, canvasBox.y + canvasBox.height - 50);
    await page.waitForTimeout(200);

    // Verify bounding box is hidden (node deselected)
    await expect(boundingBox).not.toBeVisible({ timeout: 2000 });

    // Find the text content span (now unselected)
    const textDisplay = page.locator('[data-testid="text-content-display"]');
    await expect(textDisplay).toBeVisible();

    // Get the text element's position
    const textBox = await textDisplay.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Direct double-click on the unselected text to enter edit mode
    await page.mouse.dblclick(textBox.x + textBox.width / 2, textBox.y + textBox.height / 2);
    await page.waitForTimeout(100);

    // Verify contentEditable is now visible (edit mode activated)
    const editableSpan = page.locator('[data-testid="text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Type new content
    await page.keyboard.type("Edited Text");
    await page.keyboard.press("Enter");

    // Verify the text was changed
    await page.waitForTimeout(100);
    const updatedText = page.locator('[data-testid="text-content-display"]');
    await expect(updatedText).toContainText("Edited Text");
  });

  test("should allow text selection and cursor positioning in edit mode", async ({ page }) => {
    // Add a text node by drawing
    await addTextByDrawing(page);

    // Double-click to enter edit mode
    const boundingBox = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(boundingBox).toBeVisible();
    const box = await boundingBox.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(100);

    // Verify edit mode is active
    const editableSpan = page.locator('[data-testid="text-content-editable"]');
    await expect(editableSpan).toBeVisible();

    // Verify contentEditable is actually editable
    const isEditable = await editableSpan.evaluate((el) => (el as HTMLElement).isContentEditable);
    expect(isEditable).toBe(true);

    // Verify focus is on the editable span
    const hasFocus = await editableSpan.evaluate((el) => document.activeElement === el);
    expect(hasFocus).toBe(true);

    // Get the original text content (text should already be selected by useEffect)
    const originalText = await editableSpan.textContent();
    expect(originalText).toBe("Text");

    // The useEffect should have already selected all text, so just type to replace
    await page.keyboard.type("Hello World");

    // Verify text was replaced
    const textContent = await editableSpan.textContent();
    expect(textContent).toBe("Hello World");

    // Get edit box position for clicking
    const editBox = await editableSpan.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Click inside the editable area to position cursor (deselects text)
    await page.mouse.click(editBox.x + 5, editBox.y + editBox.height / 2);
    await page.waitForTimeout(50);

    // Verify focus is maintained after click
    const stillHasFocus = await editableSpan.evaluate((el) => document.activeElement === el);
    expect(stillHasFocus).toBe(true);

    // Use Control+A keyboard shortcut to select all text
    await page.keyboard.press("Control+a");
    await page.waitForTimeout(50);

    // Verify selection was made (type to replace)
    await page.keyboard.type("Selected All");
    const afterSelectAll = await editableSpan.textContent();
    expect(afterSelectAll).toBe("Selected All");

    // Triple-click to select all text (standard text selection behavior)
    await page.mouse.click(editBox.x + editBox.width / 2, editBox.y + editBox.height / 2, { clickCount: 3 });
    await page.waitForTimeout(50);

    // Type replacement text (this should replace the selected text)
    await page.keyboard.type("Replaced");

    // Finish editing
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);

    // Verify the text was replaced
    const finalText = page.locator('[data-testid="text-content-display"]');
    await expect(finalText).toContainText("Replaced");
  });

  test("should undo and redo document changes", async ({ page }) => {
    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();

    const initialCount = await getNodeCount();

    // Add a new shape by drawing
    const dropdownToggle = page.locator('button[aria-label="Open menu"]').first();
    await dropdownToggle.click();
    await page.getByRole("option", { name: "Rectangle R", exact: true }).click();
    await addShapeByDrawing(page);

    // Verify node was added
    const afterAddCount = await getNodeCount();
    expect(afterAddCount).toBe(initialCount + 1);

    // Use keyboard shortcut to undo (Cmd+Z or Ctrl+Z)
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(100);

    // Verify node was removed (undo worked)
    const afterUndoCount = await getNodeCount();
    expect(afterUndoCount).toBe(initialCount);

    // Use keyboard shortcut to redo (Cmd+Shift+Z)
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(100);

    // Verify node was restored (redo worked)
    const afterRedoCount = await getNodeCount();
    expect(afterRedoCount).toBe(initialCount + 1);
  });

  test("should undo/redo via toolbar buttons", async ({ page }) => {
    // Get initial node count
    const getNodeCount = () =>
      page.locator('[data-testid="canvas-content"] > div').count();

    const initialCount = await getNodeCount();

    // Add a new shape by drawing
    await addShapeByDrawing(page);

    const afterAddCount = await getNodeCount();
    expect(afterAddCount).toBe(initialCount + 1);

    // Click undo button
    const undoButton = page.locator('button[aria-label="Undo"]');
    await expect(undoButton).toBeEnabled();
    await undoButton.click();
    await page.waitForTimeout(100);

    // Verify node was removed
    const afterUndoCount = await getNodeCount();
    expect(afterUndoCount).toBe(initialCount);

    // Click redo button
    const redoButton = page.locator('button[aria-label="Redo"]');
    await expect(redoButton).toBeEnabled();
    await redoButton.click();
    await page.waitForTimeout(100);

    // Verify node was restored
    const afterRedoCount = await getNodeCount();
    expect(afterRedoCount).toBe(initialCount + 1);
  });

  test("should track cursor accurately with snap enabled", async ({ page }) => {
    // First add a new rectangle node by drawing (will be placed at grid-aligned position)
    const dropdownToggle = page.locator('button[aria-label="Open menu"]').first();
    await dropdownToggle.click();
    await page.getByRole("option", { name: "Rectangle R", exact: true }).click();
    await addShapeByDrawing(page);

    // Get the bounding box (the newly added node is already selected)
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    // Get initial bounding box position
    const boundingBoxBorder = page.locator('[data-testid="bounding-box-border"]');
    const initialBox = await boundingBoxBorder.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Perform multiple small drags (simulating slow mouse movement)
    // This tests that snap doesn't accumulate drift
    // Use our helper for SVG elements
    const startX = initialBox.x + initialBox.width / 2;
    const startY = initialBox.y + initialBox.height / 2;

    await dispatchPointerEvent(moveArea, "pointerdown", startX, startY);

    // Move in small increments (5px each, 10 times = 50px total)
    for (let i = 1; i <= 10; i++) {
      await dispatchPointerEvent(moveArea, "pointermove", startX + i * 5, startY + i * 5);
      await page.waitForTimeout(16); // ~60fps
    }

    await dispatchPointerEvent(moveArea, "pointerup", startX + 50, startY + 50);
    await page.waitForTimeout(100);

    // Get final bounding box position
    const finalBox = await boundingBoxBorder.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // The total movement should be approximately 50px (snapped to grid)
    // With gridSize=20, we expect 40 or 60 pixels of movement (2 or 3 grid units)
    const deltaX = finalBox.x - initialBox.x;
    const deltaY = finalBox.y - initialBox.y;

    // Should be snapped to multiples of 20 (with small tolerance for floating point)
    // Round to nearest integer before checking
    const roundedDeltaX = Math.round(deltaX);
    const roundedDeltaY = Math.round(deltaY);
    expect(roundedDeltaX % 20).toBe(0);
    expect(roundedDeltaY % 20).toBe(0);

    // Should have moved a reasonable amount (not stuck at 0, not way off)
    expect(Math.abs(roundedDeltaX)).toBeGreaterThanOrEqual(20);
    expect(Math.abs(roundedDeltaX)).toBeLessThanOrEqual(80);
    expect(Math.abs(roundedDeltaY)).toBeGreaterThanOrEqual(20);
    expect(Math.abs(roundedDeltaY)).toBeLessThanOrEqual(80);
  });

  // =============================================================================
  // Connection Property Editing Tests
  // =============================================================================

  test.describe("Connection Properties", () => {
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

    test("should edit connection label", async ({ page }) => {
      const connection = await selectConnection(page);
      if (!connection) {
        test.skip();
        return;
      }

      // Verify inspector shows connection properties
      const connectionHeader = page.locator('text=Connection Properties');
      await expect(connectionHeader).toBeVisible();

      // Find the label input
      const labelInput = page.locator('input[placeholder="Enter label..."]');
      await expect(labelInput).toBeVisible();

      // Enter a label
      await labelInput.fill("Test Label");
      await page.waitForTimeout(100);

      // Verify the label appears on the connection (in SVG)
      const labelText = page.locator('text:has-text("Test Label")');
      await expect(labelText).toBeVisible();
    });

    test("should change connection stroke width", async ({ page }) => {
      const connection = await selectConnection(page);
      if (!connection) {
        test.skip();
        return;
      }

      // Find the width input (UnitInput's internal input element)
      const widthInputContainer = page.locator('[data-testid="unit-input"]').first();
      await expect(widthInputContainer).toBeVisible();
      const widthInput = widthInputContainer.locator('input');
      await expect(widthInput).toBeVisible();

      // Get initial stroke width from the connection path
      const visiblePath = connection.locator("path").nth(2); // Third path is the visible one
      const initialWidth = await visiblePath.getAttribute("stroke-width");

      // Change the width
      await widthInput.fill("5");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);

      // Verify the stroke width changed
      const newWidth = await visiblePath.getAttribute("stroke-width");
      expect(newWidth).toBe("5");
      expect(newWidth).not.toBe(initialWidth);
    });

    test("should change connection stroke style to dashed", async ({ page }) => {
      const connection = await selectConnection(page);
      if (!connection) {
        test.skip();
        return;
      }

      // Find the stroke style select
      const styleSelect = page.locator('button[aria-label="Stroke style"]');
      await expect(styleSelect).toBeVisible();

      // Open the dropdown and select "Dashed"
      await styleSelect.click();
      const dashedOption = page.locator('[role="option"]:has-text("Dashed")');
      await expect(dashedOption).toBeVisible();
      await dashedOption.click();
      await page.waitForTimeout(100);

      // Verify the stroke-dasharray changed on the connection
      const visiblePath = connection.locator("path").nth(2);
      const dashArray = await visiblePath.getAttribute("stroke-dasharray");
      expect(dashArray).toBe("8,4");
    });

    test("should change connection stroke style to dotted", async ({ page }) => {
      const connection = await selectConnection(page);
      if (!connection) {
        test.skip();
        return;
      }

      // Find the stroke style select
      const styleSelect = page.locator('button[aria-label="Stroke style"]');
      await styleSelect.click();

      const dottedOption = page.locator('[role="option"]:has-text("Dotted")');
      await expect(dottedOption).toBeVisible();
      await dottedOption.click();
      await page.waitForTimeout(100);

      // Verify the stroke-dasharray changed
      const visiblePath = connection.locator("path").nth(2);
      const dashArray = await visiblePath.getAttribute("stroke-dasharray");
      expect(dashArray).toBe("2,4");
    });

    test("should change end arrowhead type", async ({ page }) => {
      const connection = await selectConnection(page);
      if (!connection) {
        test.skip();
        return;
      }

      // Find the end arrowhead select
      const arrowSelect = page.locator('button[aria-label="End arrowhead"]');
      await expect(arrowSelect).toBeVisible();

      // Open dropdown and select "Triangle"
      await arrowSelect.click();
      const triangleOption = page.locator('[role="option"]:has-text("Triangle")');
      await expect(triangleOption).toBeVisible();
      await triangleOption.click();
      await page.waitForTimeout(100);

      // Verify the marker-end changed on the connection
      const visiblePath = connection.locator("path").nth(2);
      const markerEnd = await visiblePath.getAttribute("marker-end");
      expect(markerEnd).toContain("arrow-triangle");
    });

    test("should change start arrowhead type", async ({ page }) => {
      const connection = await selectConnection(page);
      if (!connection) {
        test.skip();
        return;
      }

      // Find the start arrowhead select
      const arrowSelect = page.locator('button[aria-label="Start arrowhead"]');
      await expect(arrowSelect).toBeVisible();

      // Open dropdown and select "Circle"
      await arrowSelect.click();
      const circleOption = page.locator('[role="option"]:has-text("Circle")');
      await expect(circleOption).toBeVisible();
      await circleOption.click();
      await page.waitForTimeout(100);

      // Verify the marker-start changed on the connection
      const visiblePath = connection.locator("path").nth(2);
      const markerStart = await visiblePath.getAttribute("marker-start");
      expect(markerStart).toContain("arrow-circle");
    });

    test("should delete connection", async ({ page }) => {
      // Get initial connection count
      const initialCount = await page.locator('[data-connection-id]').count();

      const connection = await selectConnection(page);
      if (!connection) {
        test.skip();
        return;
      }

      // Click the delete button
      const deleteButton = page.locator('button[aria-label="Delete connection"]');
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();
      await page.waitForTimeout(100);

      // Verify connection was deleted
      const newCount = await page.locator('[data-connection-id]').count();
      expect(newCount).toBe(initialCount - 1);

      // Verify inspector shows empty state
      const emptyState = page.locator('text=Select a shape or connection');
      await expect(emptyState).toBeVisible();
    });
  });
});
