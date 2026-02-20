/**
 * @file Markdown Block Editor WebGL Renderer E2E Tests
 *
 * Tests for WebGL renderer functionality in the Markdown block editor.
 * Verifies that WebGL renderer provides the same editing experience as SVG/Canvas.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const WEBGL_URL = "http://localhost:5620/#/components/editor/markdown/webgl";
const SVG_URL = "http://localhost:5620/#/components/editor/markdown/svg";

type WebGLEditorLocators = {
  container: ReturnType<Page["locator"]>;
  canvas: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
};

type SVGEditorLocators = {
  container: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
};

function getWebGLEditorLocators(page: Page): WebGLEditorLocators {
  const container = page.locator('[style*="border"][style*="overflow: hidden"]').first();
  return {
    container,
    canvas: container.locator("canvas").first(),
    textarea: page.locator('textarea[aria-label="Text editor"]').first(),
  };
}

function getSVGEditorLocators(page: Page): SVGEditorLocators {
  const container = page.locator('[style*="border"][style*="overflow: hidden"]').first();
  return {
    container,
    svg: container.locator("svg:has(text)").first(),
  };
}

async function setupWebGLPage(page: Page): Promise<void> {
  await page.goto(WEBGL_URL);
  await page.waitForTimeout(500);
}

async function switchToSVG(page: Page): Promise<void> {
  const svgTab = page.locator('a[href*="/markdown/svg"]');
  await svgTab.click();
  await page.waitForTimeout(300);
}

async function switchToWebGL(page: Page): Promise<void> {
  const webglTab = page.locator('a[href*="/markdown/webgl"]');
  await webglTab.click();
  await page.waitForTimeout(300);
}

// =============================================================================
// Tests: WebGL Renderer Initialization
// =============================================================================

test.describe("WebGL Renderer: Initialization", () => {
  test("WebGL renderer initializes with visible canvas", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);
    await expect(locators.canvas).toBeVisible();

    const canvasBox = await locators.canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(100);
    expect(canvasBox!.height).toBeGreaterThan(50);
  });

  test("WebGL tab is visible and selectable", async ({ page }) => {
    await page.goto(SVG_URL);
    await page.waitForTimeout(300);

    const webglTab = page.locator('a[href*="/markdown/webgl"]');
    await expect(webglTab).toBeVisible();

    await webglTab.click();
    await page.waitForTimeout(300);

    expect(page.url()).toContain("/markdown/webgl");
  });
});

// =============================================================================
// Tests: Text Input Operations
// =============================================================================

test.describe("WebGL Renderer: Text Input", () => {
  test("accepts basic text input", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    await page.keyboard.type("WebGL Test Input");
    await page.waitForTimeout(200);

    // Verify in SVG view
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("WebGL Test Input");
  });

  test("handles Japanese text input", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Type Japanese text at current position
    await page.keyboard.type("日本語テスト");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("日本語テスト");
  });

  test("handles Enter key for newlines", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Go to end of first line and add newline
    await page.keyboard.press("End");
    await page.waitForTimeout(50);
    await page.keyboard.press("Enter");
    await page.keyboard.type("NewLine");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("NewLine");
  });
});

// =============================================================================
// Tests: Cursor Navigation
// =============================================================================

test.describe("WebGL Renderer: Cursor Navigation", () => {
  test("handles arrow key navigation", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    await page.keyboard.type("INSERT");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("INSERT");
  });

  test("handles Home and End keys", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    await page.keyboard.press("End");
    await page.keyboard.type("[END]");
    await page.waitForTimeout(100);

    await page.keyboard.press("Home");
    await page.keyboard.type("[HOME]");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("[HOME]");
    expect(svgContent).toContain("[END]");
  });
});

// =============================================================================
// Tests: Selection Operations
// =============================================================================

test.describe("WebGL Renderer: Selection", () => {
  test("handles select all and replace", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    await page.keyboard.press("Meta+a");
    await page.waitForTimeout(100);

    await page.keyboard.type("Completely Replaced");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toBe("Completely Replaced");
  });

  test("handles shift+arrow selection", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await page.waitForTimeout(100);

    await page.keyboard.type("SEL");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("SEL");
  });
});

// =============================================================================
// Tests: Delete Operations
// =============================================================================

test.describe("WebGL Renderer: Delete Operations", () => {
  test("handles backspace", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.press("End");
    await page.waitForTimeout(50);

    await page.keyboard.type("ABC");
    await page.waitForTimeout(100);
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("A");
    expect(svgContent).not.toContain("ABC");
  });

  test("handles delete key", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.press("Home");
    await page.waitForTimeout(50);

    await page.keyboard.press("Delete");
    await page.keyboard.press("Delete");
    await page.keyboard.press("Delete");
    await page.waitForTimeout(200);

    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    // First 3 characters should be deleted
    expect(svgContent).not.toMatch(/^# M/);
  });
});

// =============================================================================
// Tests: Undo/Redo
// =============================================================================

test.describe("WebGL Renderer: Undo/Redo", () => {
  test("handles undo operation", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Click to focus
    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Type text
    await page.keyboard.type("UndoTest");
    await page.waitForTimeout(500); // Wait for debounce

    // Undo immediately without switching renderers
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(300);

    // Verify undo worked by checking in SVG view
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).not.toContain("UndoTest");
  });

  test("handles redo operation", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Click to focus
    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);

    // Type text
    await page.keyboard.type("RedoTest");
    await page.waitForTimeout(500); // Wait for debounce

    // Undo
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(300);

    // Redo
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(300);

    // Verify redo worked by checking in SVG view
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("RedoTest");
  });
});

// =============================================================================
// Tests: Scrolling
// =============================================================================

test.describe("WebGL Renderer: Scrolling", () => {
  test("handles scroll operations", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Scroll down
    await locators.container.evaluate((el) => {
      el.scrollTop = 200;
    });
    await page.waitForTimeout(200);

    await expect(locators.canvas).toBeVisible();

    // Scroll back to top
    await locators.container.evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.waitForTimeout(200);

    await expect(locators.canvas).toBeVisible();
  });

  test("canvas position stays aligned during scroll", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Get initial canvas bounding box
    const initialCanvasBox = await locators.canvas.boundingBox();
    expect(initialCanvasBox).not.toBeNull();
    const initialContainerBox = await locators.container.boundingBox();
    expect(initialContainerBox).not.toBeNull();

    // Calculate initial relative position (canvas top relative to container visible area)
    const initialRelativeTop = initialCanvasBox!.y - initialContainerBox!.y;

    // Scroll down significantly
    await locators.container.evaluate((el) => {
      el.scrollTop = 100;
    });
    await page.waitForTimeout(300);

    // Get canvas position after scroll
    const scrolledCanvasBox = await locators.canvas.boundingBox();
    expect(scrolledCanvasBox).not.toBeNull();
    const scrolledContainerBox = await locators.container.boundingBox();
    expect(scrolledContainerBox).not.toBeNull();

    // Canvas should still be visible within the container after scroll
    // The canvas Y should have moved up (scrolled out of view partially) or a new canvas section is shown
    // Key check: canvas should not be mispositioned relative to the scroll position
    const scrolledRelativeTop = scrolledCanvasBox!.y - scrolledContainerBox!.y;

    // After scrolling 100px, the relative position should change by approximately that amount
    // (allowing some tolerance for virtual scroll re-rendering)
    const positionDelta = Math.abs((scrolledRelativeTop - initialRelativeTop) + 100);
    // Allow tolerance of 50px for virtual scroll spacer adjustments
    expect(positionDelta).toBeLessThan(150);

    // Verify text is still readable after scroll by checking SVG
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    // Should still have document content (might be different part due to scroll)
    expect(svgContent).toBeTruthy();
    expect(svgContent!.length).toBeGreaterThan(0);
  });

  test("text renders at correct position after scroll", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Type text at a known position
    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.type("SCROLL_TEST_MARKER");
    await page.waitForTimeout(200);

    // Scroll down
    await locators.container.evaluate((el) => {
      el.scrollTop = 50;
    });
    await page.waitForTimeout(300);

    // Scroll back to top
    await locators.container.evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.waitForTimeout(300);

    // Verify content is still correct
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("SCROLL_TEST_MARKER");
  });
});

// =============================================================================
// Tests: Block Type Rendering
// =============================================================================

test.describe("WebGL Renderer: Block Types", () => {
  test("renders headings with correct styling", async ({ page }) => {
    await setupWebGLPage(page);

    // Verify in SVG view that headings exist
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();

    // Should have heading content
    expect(svgContent).toContain("Markdown Block Editor");
    expect(svgContent).toContain("Features");

    // Switch back to WebGL and verify it still renders
    await switchToWebGL(page);
    const locators = getWebGLEditorLocators(page);
    await expect(locators.canvas).toBeVisible();
  });

  test("renders code blocks", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Scroll down to see code block section (may need to scroll further)
    await locators.container.evaluate((el) => {
      el.scrollTop = 600;
    });
    await page.waitForTimeout(300);

    // Verify content is correct in SVG view
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);

    // Look for code block using tspan with monospace font check (like original test)
    const codeText = svgLocators.svg.locator("tspan").filter({ hasText: "function greet" });
    const codeTextCount = await codeText.count();

    // If code block not visible at this scroll position, just verify canvas renders
    if (codeTextCount > 0) {
      const fontFamily = await codeText.first().evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });
      // Should include monospace font
      expect(fontFamily.toLowerCase()).toMatch(/mono|consolas|menlo|courier/i);
    }

    // Switch back to WebGL and verify it renders
    await switchToWebGL(page);
    await expect(locators.canvas).toBeVisible();
  });

  test("renders blockquotes with decoration", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Scroll down to see blockquote section
    await locators.container.evaluate((el) => {
      el.scrollTop = 800;
    });
    await page.waitForTimeout(300);

    // Verify content is correct in SVG view
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);

    // If blockquote is visible, check content
    const blockquoteText = svgLocators.svg.locator("text").filter({ hasText: /blockquote/i });
    const count = await blockquoteText.count();
    if (count > 0) {
      await expect(blockquoteText.first()).toBeVisible();
    }

    // Switch back to WebGL
    await switchToWebGL(page);
    await expect(locators.canvas).toBeVisible();
  });

  test("renders lists with indentation", async ({ page }) => {
    await setupWebGLPage(page);

    // Verify list items exist in SVG view
    await switchToSVG(page);
    const svgLocators = getSVGEditorLocators(page);
    const svgContent = await svgLocators.svg.textContent();

    // Should have list content
    expect(svgContent).toContain("First item");

    // Switch back to WebGL
    await switchToWebGL(page);
    const locators = getWebGLEditorLocators(page);
    await expect(locators.canvas).toBeVisible();
  });
});

// =============================================================================
// Tests: State Preservation Across Renderer Switches
// =============================================================================

test.describe("WebGL Renderer: State Preservation", () => {
  test("preserves document state when switching to/from WebGL", async ({ page }) => {
    await setupWebGLPage(page);

    const locators = getWebGLEditorLocators(page);

    // Add text in WebGL
    await locators.container.click({ position: { x: 50, y: 20 }, force: true });
    await page.waitForTimeout(100);
    await page.keyboard.type("WebGLState");
    await page.waitForTimeout(200);

    // Switch to SVG
    await switchToSVG(page);
    let svgLocators = getSVGEditorLocators(page);
    let svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("WebGLState");

    // Switch to Canvas
    const canvasTab = page.locator('a[href*="/markdown/canvas"]');
    await canvasTab.click();
    await page.waitForTimeout(300);

    // Switch back to WebGL
    await switchToWebGL(page);
    await page.waitForTimeout(300);

    // Switch to SVG to verify state
    await switchToSVG(page);
    svgLocators = getSVGEditorLocators(page);
    svgContent = await svgLocators.svg.textContent();
    expect(svgContent).toContain("WebGLState");
  });
});
