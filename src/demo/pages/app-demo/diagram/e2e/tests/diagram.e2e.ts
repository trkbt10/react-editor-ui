/**
 * @file Diagram E2E tests - Basic interactions
 */

import { test, expect, type Page } from "@playwright/test";

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

    // Get the bounding box position (in SVG, we need the screen coordinates)
    const box = await boundingBox.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Record initial node position
    const initialNodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // Drag the bounding box by 50px in x and y (larger than gridSize=20 to overcome snap)
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = startX + 50;
    const endY = startY + 50;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();

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

    // Get the bottom-right resize handle
    const handle = page.locator('[data-testid="bounding-box-handle-bottom-right"]');
    await expect(handle).toBeVisible();

    // Get handle position
    const handleBox = await handle.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Record initial node dimensions
    const initialNodeSize = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    // Drag the handle - use a larger drag distance to overcome snap threshold
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    const endX = startX + 40;  // Larger than gridSize (20)
    const endY = startY + 40;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();

    // Wait for state update
    await page.waitForTimeout(100);

    // Check that the size has changed
    const newNodeSize = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    // The size should have increased
    expect(newNodeSize.width).toBeGreaterThan(initialNodeSize.width);
    expect(newNodeSize.height).toBeGreaterThan(initialNodeSize.height);
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

    // Get the connection's bounding box
    const connBox = await connectionGroup.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Click on the connection
    await page.mouse.click(connBox.x + connBox.width / 2, connBox.y + connBox.height / 2);

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

  test("should edit text on double-click", async ({ page }) => {
    // Find a text node (text nodes have a span with text content)
    // In the composable architecture, text nodes are rendered after groups and shapes
    const textSpans = page.locator('[data-testid="canvas-content"] > div span');
    const spanCount = await textSpans.count();

    // Skip if no text nodes found
    if (spanCount === 0) {
      test.skip();
      return;
    }

    // Get the first text span's parent wrapper
    const firstTextSpan = textSpans.first();
    const textWrapper = page.locator('[data-testid="canvas-content"] > div').filter({
      has: firstTextSpan,
    }).first();

    await expect(textWrapper).toBeAttached();

    const textBox = await firstTextSpan.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Click to select the text node
    await page.mouse.click(textBox.x + textBox.width / 2, textBox.y + textBox.height / 2);

    // Verify bounding box appears
    const boundingBox = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(boundingBox).toBeVisible();

    // Double-click on the bounding box to start editing
    const box = await boundingBox.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);

    // Wait for textarea to appear
    await page.waitForTimeout(100);

    // Check if textarea is visible
    const textarea = textWrapper.locator("textarea");
    await expect(textarea).toBeVisible();

    // Type new text
    await textarea.fill("New Label");
    await textarea.press("Enter");

    // Wait for edit to complete
    await page.waitForTimeout(100);

    // Verify the text changed
    const labelText = textWrapper.locator("span");
    await expect(labelText).toHaveText("New Label");
  });

  test("should move multiple selected nodes together", async ({ page }) => {
    // Select multiple nodes using marquee
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (!canvasBox) return;

    // Marquee select to get multiple nodes
    const startX = canvasBox.x + 50;
    const startY = canvasBox.y + 50;
    const endX = startX + 300;
    const endY = startY + 400;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Check if bounding box appears (indicates selection)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Get multiple nodes' initial positions
    const nodeWrappers = page.locator('[data-testid="canvas-content"] > div');
    const initialPositions: { x: number; y: number }[] = [];
    const nodeCount = await nodeWrappers.count();

    for (let i = 0; i < Math.min(nodeCount, 3); i++) {
      const node = nodeWrappers.nth(i).locator("div").first();
      const pos = await node.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      });
      initialPositions.push(pos);
    }

    // Get bounding box position
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    const box = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Drag all selected nodes
    const dragStartX = box.x + box.width / 2;
    const dragStartY = box.y + box.height / 2;
    const dragEndX = dragStartX + 60;
    const dragEndY = dragStartY + 60;

    await page.mouse.move(dragStartX, dragStartY);
    await page.mouse.down();
    await page.mouse.move(dragEndX, dragEndY);
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Verify that all nodes moved
    for (let i = 0; i < Math.min(nodeCount, 3); i++) {
      const node = nodeWrappers.nth(i).locator("div").first();
      const newPos = await node.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      });

      // All nodes should have moved
      expect(newPos.x).not.toBe(initialPositions[i].x);
      expect(newPos.y).not.toBe(initialPositions[i].y);
    }
  });

  test("should show multi-selection inspector", async ({ page }) => {
    // Marquee select multiple nodes
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (!canvasBox) return;

    const startX = canvasBox.x + 50;
    const startY = canvasBox.y + 50;
    const endX = startX + 300;
    const endY = startY + 400;

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
    // Find the Text button in the toolbar
    const textButton = page.locator('button[aria-label="Add Text"]');
    await expect(textButton).toBeVisible();

    // Click to add a text node
    await textButton.click();

    await page.waitForTimeout(100);

    // Verify a bounding box appears (new node is selected)
    const boundingBox = page.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Verify inspector shows "Text Properties" for text nodes
    const propsHeader = page.locator('text=Text Properties');
    await expect(propsHeader).toBeVisible();
  });

  test("should track cursor accurately with snap enabled", async ({ page }) => {
    // Select a node
    const nodeWrapper = page.locator('[data-testid="canvas-content"] > div').first();
    await expect(nodeWrapper).toBeAttached();

    const actualNode = nodeWrapper.locator("div").first();
    const nodeBox = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Click to select
    await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);

    // Get the bounding box
    const moveArea = page.locator('[data-testid="bounding-box-move-area"]');
    await expect(moveArea).toBeVisible();

    const box = await moveArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    // Record initial position
    const initialNodePos = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // Perform multiple small drags (simulating slow mouse movement)
    // This tests that snap doesn't accumulate drift
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Move in small increments (5px each, 10 times = 50px total)
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(startX + i * 5, startY + i * 5);
      await page.waitForTimeout(16); // ~60fps
    }

    await page.mouse.up();
    await page.waitForTimeout(100);

    // Get final position
    const finalNodePos = await actualNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });

    // The total movement should be approximately 50px (snapped to grid)
    // With gridSize=20, we expect 40 or 60 pixels of movement (2 or 3 grid units)
    const deltaX = finalNodePos.x - initialNodePos.x;
    const deltaY = finalNodePos.y - initialNodePos.y;

    // Should be snapped to multiples of 20
    expect(deltaX % 20).toBe(0);
    expect(deltaY % 20).toBe(0);

    // Should have moved a reasonable amount (not stuck at 0, not way off)
    expect(Math.abs(deltaX)).toBeGreaterThanOrEqual(20);
    expect(Math.abs(deltaX)).toBeLessThanOrEqual(80);
    expect(Math.abs(deltaY)).toBeGreaterThanOrEqual(20);
    expect(Math.abs(deltaY)).toBeLessThanOrEqual(80);
  });
});
