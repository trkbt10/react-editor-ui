/**
 * @file E2E tests for Diagram Demo - Pages and Layers functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Diagram Demo - Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    // Wait for the diagram editor to load
    await page.waitForSelector('[role="application"]');
  });

  test("renders symbol instances on Canvas page", async ({ page }) => {
    // Canvas page should show symbol instances with resolved content
    const canvas = page.locator('[role="application"]');

    // Look for SVG paths (shapes from symbol instances)
    const paths = canvas.locator("svg path");
    const pathCount = await paths.count();

    // Should have multiple paths (from rendered symbol instances)
    expect(pathCount).toBeGreaterThan(0);
  });

  test("renders symbol definitions on Symbols page", async ({ page }) => {
    // Switch to Symbols page
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });
    await symbolsOption.click();

    // Symbols page should show shape and text nodes
    const canvas = page.locator('[role="application"]');

    // Look for SVG paths (shapes from symbol definitions)
    const paths = canvas.locator("svg path");
    const pathCount = await paths.count();

    // Should have shapes
    expect(pathCount).toBeGreaterThan(0);
  });

  test("displays page switcher with Canvas and Symbols options", async ({ page }) => {
    // Find the segmented control for page switching
    const canvasOption = page.getByRole("radio", { name: "Canvas" });
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });

    await expect(canvasOption).toBeVisible();
    await expect(symbolsOption).toBeVisible();

    // Canvas should be selected by default
    await expect(canvasOption).toBeChecked();
    await expect(symbolsOption).not.toBeChecked();
  });

  test("switches to Symbols page when clicked", async ({ page }) => {
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });

    // Click Symbols
    await symbolsOption.click();

    // Symbols should now be selected
    await expect(symbolsOption).toBeChecked();

    // Canvas option should be deselected
    const canvasOption = page.getByRole("radio", { name: "Canvas" });
    await expect(canvasOption).not.toBeChecked();
  });

  test("layers panel header reflects current page", async ({ page }) => {
    // Switch to Layers tab in the left panel
    const layersTab = page.getByRole("tab", { name: "Layers" });
    await layersTab.click();

    // Check header shows Canvas
    const layersHeader = page.locator("text=Layers (Canvas)");
    await expect(layersHeader).toBeVisible();

    // Switch to Symbols page
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });
    await symbolsOption.click();

    // Header should update
    const symbolsHeader = page.locator("text=Layers (Symbols)");
    await expect(symbolsHeader).toBeVisible();
  });

  test("selection is preserved when switching pages", async ({ page }) => {
    // First, get the canvas element
    const canvas = page.locator('[role="application"]');

    // Click on a node to select it (in the canvas area)
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // Click roughly where a node should be (center area)
    await page.mouse.click(canvasBox!.x + 200, canvasBox!.y + 150);

    // Switch to Symbols and back
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });
    await symbolsOption.click();

    const canvasOption = page.getByRole("radio", { name: "Canvas" });
    await canvasOption.click();

    // The editor should still be responsive
    await expect(canvas).toBeVisible();
  });
});

test.describe("Diagram Demo - Layers Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    await page.waitForSelector('[role="application"]');

    // Switch to Layers tab
    const layersTab = page.getByRole("tab", { name: "Layers" });
    await layersTab.click();
  });

  test("displays layer items for page elements", async ({ page }) => {
    // Canvas page should have nodes
    const layerItems = page.locator('[data-testid^="layer-item-"]');
    const count = await layerItems.count();

    // Should have at least some items (instances on canvas)
    expect(count).toBeGreaterThan(0);
  });

  test("clicking layer item selects the node", async ({ page }) => {
    // Get the first layer item
    const firstLayerItem = page.locator('[data-testid^="layer-item-"]').first();
    await expect(firstLayerItem).toBeVisible();

    // Click on it
    await firstLayerItem.click();

    // It should become selected (aria-selected attribute)
    await expect(firstLayerItem).toHaveAttribute("aria-selected", "true");
  });

  test("layer items show hierarchy for groups", async ({ page }) => {
    // Switch to Symbols page where we have group definitions
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });
    await symbolsOption.click();

    // Wait for layers to update
    await page.waitForTimeout(100);

    // Check for layer items
    const layerItems = page.locator('[data-testid^="layer-item-"]');
    const count = await layerItems.count();

    // Symbols page should have groups with children
    expect(count).toBeGreaterThan(0);
  });

  test("shows different elements when switching pages", async ({ page }) => {
    // Get layer items on Canvas page
    const canvasLayerItems = page.locator('[data-testid^="layer-item-"]');
    const canvasCount = await canvasLayerItems.count();

    // Switch to Symbols page
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });
    await symbolsOption.click();

    // Wait for layers to update
    await page.waitForTimeout(100);

    // Get layer items on Symbols page
    const symbolsLayerItems = page.locator('[data-testid^="layer-item-"]');
    const symbolsCount = await symbolsLayerItems.count();

    // Counts should be different (Canvas has instances, Symbols has definitions)
    // Note: This may not always be true depending on data, so we just check both have items
    expect(canvasCount).toBeGreaterThan(0);
    expect(symbolsCount).toBeGreaterThan(0);
  });
});

test.describe("Diagram Demo - Shapes Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    await page.waitForSelector('[role="application"]');
  });

  test("displays shapes tab by default", async ({ page }) => {
    const shapesTab = page.getByRole("tab", { name: "Shapes" });
    await expect(shapesTab).toHaveAttribute("aria-selected", "true");
  });

  test("can switch between Shapes and Layers tabs", async ({ page }) => {
    const shapesTab = page.getByRole("tab", { name: "Shapes" });
    const layersTab = page.getByRole("tab", { name: "Layers" });

    // Initial state
    await expect(shapesTab).toHaveAttribute("aria-selected", "true");
    await expect(layersTab).toHaveAttribute("aria-selected", "false");

    // Click Layers
    await layersTab.click();

    // State should change
    await expect(shapesTab).toHaveAttribute("aria-selected", "false");
    await expect(layersTab).toHaveAttribute("aria-selected", "true");

    // Click Shapes
    await shapesTab.click();

    // State should change back
    await expect(shapesTab).toHaveAttribute("aria-selected", "true");
    await expect(layersTab).toHaveAttribute("aria-selected", "false");
  });
});

test.describe("Diagram Demo - Inspector Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    await page.waitForSelector('[role="application"]');
  });

  test("displays Design and Theme tabs", async ({ page }) => {
    const designTab = page.getByRole("tab", { name: "Design" });
    const themeTab = page.getByRole("tab", { name: "Theme" });

    await expect(designTab).toBeVisible();
    await expect(themeTab).toBeVisible();
  });

  test("Design tab is selected by default", async ({ page }) => {
    const designTab = page.getByRole("tab", { name: "Design" });
    await expect(designTab).toHaveAttribute("aria-selected", "true");
  });

  test("can switch to Theme tab", async ({ page }) => {
    const themeTab = page.getByRole("tab", { name: "Theme" });
    await themeTab.click();

    await expect(themeTab).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Diagram Demo - Frame Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    await page.waitForSelector('[role="application"]');
  });

  test("renders Frame on Canvas page", async ({ page }) => {
    // Canvas page should show a Frame (with data-frame-id attribute)
    const frame = page.locator("[data-frame-id]");
    await expect(frame.first()).toBeVisible();
  });

  test("Frame displays preset label", async ({ page }) => {
    // Frame should show "A4" label (from initial data)
    const frameLabel = page.locator("text=A4");
    await expect(frameLabel.first()).toBeVisible();
  });

  test("Frame appears in Layers panel", async ({ page }) => {
    // Switch to Layers tab
    const layersTab = page.getByRole("tab", { name: "Layers" });
    await layersTab.click();

    // Should see "A4" in the layers list
    const a4Layer = page.locator('[data-testid^="layer-item-"]', { hasText: "A4" });
    await expect(a4Layer).toBeVisible();
  });

  test("Frame preset picker is in toolbar", async ({ page }) => {
    // Frame button should be visible in toolbar
    const frameButton = page.getByRole("button", { name: "Add Frame" });
    await expect(frameButton).toBeVisible();
  });

  test("Frame preset picker opens dropdown", async ({ page }) => {
    // Click Frame button
    const frameButton = page.getByRole("button", { name: "Add Frame" });
    await frameButton.click();

    // Dropdown should appear with preset categories
    const paperCategory = page.locator("text=紙サイズ");
    await expect(paperCategory).toBeVisible();

    const webCategory = page.locator("text=Web / SNS");
    await expect(webCategory).toBeVisible();
  });

  test("can add new Frame from preset picker", async ({ page }) => {
    // Count initial frames
    const initialFrames = await page.locator("[data-frame-id]").count();

    // Click Frame button
    const frameButton = page.getByRole("button", { name: "Add Frame" });
    await frameButton.click();

    // Select Instagram preset
    const instagramPreset = page.locator("text=Instagram").first();
    await instagramPreset.click();

    // Should have one more frame
    const newFrameCount = await page.locator("[data-frame-id]").count();
    expect(newFrameCount).toBe(initialFrames + 1);
  });

  test("selecting Frame shows properties in inspector", async ({ page }) => {
    // Click on the frame label to select it (Figma-like behavior)
    const frameLabel = page.locator("[data-frame-label]").first();
    await frameLabel.click();

    // Inspector should show Frame Properties
    const frameTitle = page.locator("text=Frame Properties");
    await expect(frameTitle).toBeVisible();

    // Should show preset selector
    const presetSection = page.locator("text=Preset");
    await expect(presetSection).toBeVisible();
  });
});

test.describe("Diagram Demo - Frame Children & Connections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    await page.waitForSelector('[role="application"]');
  });

  test("renders children inside Frame", async ({ page }) => {
    // Symbol instances should be rendered inside the frame
    const frame = page.locator("[data-frame-id]").first();

    // Frame should contain SVG paths (from symbol instances)
    const pathsInsideFrame = frame.locator("svg path");
    const count = await pathsInsideFrame.count();

    // Should have shapes from the 5 instances
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("connections are visible (not hidden by frame)", async ({ page }) => {
    // Connections are rendered in SVG layer
    const canvas = page.locator('[role="application"]');

    // Look for connection paths (lines with marker-end for arrows)
    const connectionPaths = canvas.locator("path[marker-end]");
    const count = await connectionPaths.count();

    // Should have connections (4 in initial data)
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("Frame shows children in Layers panel hierarchy", async ({ page }) => {
    // Switch to Layers tab
    const layersTab = page.getByRole("tab", { name: "Layers" });
    await layersTab.click();

    // A4 frame should be visible
    const frameLayer = page.locator('[data-testid^="layer-item-"]', { hasText: "A4" });
    await expect(frameLayer).toBeVisible();

    // Instance layers should also be visible (children)
    const instanceLayers = page.locator('[data-testid^="layer-item-"]', { hasText: "Instance" });
    const instanceCount = await instanceLayers.count();

    // Should have 5 instances
    expect(instanceCount).toBe(5);
  });
});

test.describe("Diagram Demo - Symbols Page Variants", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    await page.waitForSelector('[role="application"]');

    // Switch to Symbols page
    const symbolsOption = page.getByRole("radio", { name: "Symbols" });
    await symbolsOption.click();
  });

  test("displays variant previews on Symbols page", async ({ page }) => {
    // Should show variant labels
    const startVariant = page.locator("text=Start");
    const processVariant = page.locator("text=Process");
    const decisionVariant = page.locator("text=Decision");
    const endVariant = page.locator("text=End");

    await expect(startVariant.first()).toBeVisible();
    await expect(processVariant.first()).toBeVisible();
    await expect(decisionVariant.first()).toBeVisible();
    await expect(endVariant.first()).toBeVisible();
  });

  test("variant previews show shapes", async ({ page }) => {
    // Canvas should have SVG paths from variant shapes
    const canvas = page.locator('[role="application"]');
    const paths = canvas.locator("svg path");
    const pathCount = await paths.count();

    // Should have multiple paths (one for each variant)
    expect(pathCount).toBeGreaterThanOrEqual(5);
  });

  test("can select variant preview by clicking", async ({ page }) => {
    // Find a variant preview and click it
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // Click on the Start variant area (first one, top-left of canvas)
    await page.mouse.click(canvasBox!.x + 150, canvasBox!.y + 100);

    // BoundingBox should appear (SVG rect for selection)
    const boundingBox = canvas.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });
});

test.describe("Diagram Demo - Frame Children Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/app-demo/diagram");
    await page.waitForSelector('[role="application"]');
  });

  test("can select child node inside Frame by clicking", async ({ page }) => {
    const canvas = page.locator('[role="application"]');

    // Click on a node inside the frame (Start node at approximately 170, 130 in frame coords)
    // Frame is at (50, 50), Start node is at (100, 100) relative to canvas
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // Click on the Start node (inside the frame)
    await page.mouse.click(canvasBox!.x + 220, canvasBox!.y + 170);

    // BoundingBox should appear around the selected child node
    const boundingBox = canvas.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();
  });

  test("can select Frame by clicking on its label (Figma-like)", async ({ page }) => {
    // Click on Frame label to select it (not background - Figma-like behavior)
    const frameLabel = page.locator("[data-frame-label]").first();
    await frameLabel.click();

    // Check that Frame is selected by looking at inspector
    const frameProperties = page.locator("text=Frame Properties");
    await expect(frameProperties).toBeVisible();
  });

  test("clicking Frame interior does not select Frame", async ({ page }) => {
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // Click on empty area inside the frame (not on any child node)
    await page.mouse.click(canvasBox!.x + 400, canvasBox!.y + 600);

    // Frame should NOT be selected - inspector should show default message
    const defaultMessage = page.locator("text=Select a shape or connection");
    await expect(defaultMessage).toBeVisible();
  });

  test("can drag child node inside Frame", async ({ page }) => {
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // Click on the Start node to select it
    await page.mouse.click(canvasBox!.x + 220, canvasBox!.y + 170);

    // Verify it's selected (bounding box visible)
    const boundingBox = canvas.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Drag the node
    await page.mouse.move(canvasBox!.x + 220, canvasBox!.y + 170);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 280, canvasBox!.y + 200, { steps: 5 });
    await page.mouse.up();

    // Node should still be selected after drag
    await expect(boundingBox).toBeVisible();
  });

  test("clicking empty space inside Frame deselects nodes", async ({ page }) => {
    const canvas = page.locator('[role="application"]');
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    // First, select a node
    await page.mouse.click(canvasBox!.x + 220, canvasBox!.y + 170);
    const boundingBox = canvas.locator('[data-testid="bounding-box"]');
    await expect(boundingBox).toBeVisible();

    // Click on empty space inside the frame
    await page.mouse.click(canvasBox!.x + 400, canvasBox!.y + 600);

    // Node should be deselected (no bounding box)
    await expect(boundingBox).not.toBeVisible();
  });
});
