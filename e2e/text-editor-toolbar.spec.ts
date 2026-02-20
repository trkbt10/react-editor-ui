/**
 * @file Selection Toolbar E2E Tests for TextEditorWithToolbar
 *
 * Tests for TextEditorWithToolbar selection toolbar integration.
 * Verifies toolbar display, positioning, and operation execution.
 *
 * Note: We use dispatchEvent('click') instead of Playwright's click() because
 * Playwright's click simulation doesn't trigger React's onClick handlers correctly
 * when the toolbar has onPointerDown with preventDefault() for text deselection prevention.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// Test Utilities
// =============================================================================

const BASE_URL = "http://localhost:5620/#/components/editor/text-editor";

type EditorLocators = {
  section: ReturnType<Page["locator"]>;
  container: ReturnType<Page["locator"]>;
  textarea: ReturnType<Page["locator"]>;
  svg: ReturnType<Page["locator"]>;
};

function getEditorLocators(page: Page): EditorLocators {
  // Find the "With Selection Toolbar" section
  const section = page.locator('text="With Selection Toolbar"').locator('xpath=..');
  return {
    section,
    container: section.locator("div:has(> svg:has(text))").first(),
    textarea: section.locator('textarea[aria-label="Text editor"]').first(),
    svg: section.locator("svg:has(text)").first(),
  };
}

function getSelectionToolbar(page: Page) {
  return page.locator('[role="toolbar"][aria-label="Selection toolbar"]');
}

async function focusEditor(page: Page, locators: EditorLocators): Promise<void> {
  await locators.container.click({ position: { x: 50, y: 20 }, force: true });
  await page.waitForTimeout(100);
}

async function selectAllText(page: Page): Promise<void> {
  await page.keyboard.press("Meta+a");
  await page.waitForTimeout(200);
}

async function getSelection(locators: EditorLocators): Promise<{ start: number; end: number }> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
    start: el.selectionStart,
    end: el.selectionEnd,
  }));
}

async function setupPage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.waitForSelector("svg text");
  await page.waitForTimeout(300);
}

/**
 * Click a toolbar button.
 */
async function clickToolbarButton(button: ReturnType<Page["locator"]>): Promise<void> {
  await button.click();
}

// =============================================================================
// Tests: Basic Toolbar Visibility
// =============================================================================

test.describe("TextEditorWithToolbar: Visibility", () => {
  test("toolbar is hidden when no text is selected", async ({ page }) => {
    await setupPage(page);

    const toolbar = getSelectionToolbar(page);
    await expect(toolbar).not.toBeVisible();
  });

  test("toolbar appears when text is selected via keyboard", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);
    await selectAllText(page);

    const toolbar = getSelectionToolbar(page);
    await expect(toolbar).toBeVisible();
  });

  test("toolbar disappears when selection is cleared", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);
    await selectAllText(page);

    const toolbar = getSelectionToolbar(page);
    await expect(toolbar).toBeVisible();

    // Press Escape and click to clear selection
    await page.keyboard.press("Escape");
    await focusEditor(page, locators);
    await page.waitForTimeout(200);

    await expect(toolbar).not.toBeVisible();
  });
});

// =============================================================================
// Tests: Toolbar Operations
// =============================================================================

test.describe("TextEditorWithToolbar: Operations", () => {
  test("toolbar shows enabled formatting buttons", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);
    await selectAllText(page);

    const toolbar = getSelectionToolbar(page);
    await expect(toolbar).toBeVisible();

    // Check default enabled buttons exist
    const boldButton = toolbar.locator('button[aria-label="Bold"]');
    const italicButton = toolbar.locator('button[aria-label="Italic"]');
    const underlineButton = toolbar.locator('button[aria-label="Underline"]');

    await expect(boldButton).toBeVisible();
    await expect(italicButton).toBeVisible();
    await expect(underlineButton).toBeVisible();
  });

  test("clicking bold button does not deselect text", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);
    await selectAllText(page);

    const selBefore = await getSelection(locators);
    expect(selBefore.end).toBeGreaterThan(selBefore.start);

    const toolbar = getSelectionToolbar(page);
    const boldButton = toolbar.locator('button[aria-label="Bold"]');
    await clickToolbarButton(boldButton);
    await page.waitForTimeout(200);

    // Selection should be preserved
    const selAfter = await getSelection(locators);
    expect(selAfter.end).toBeGreaterThan(selAfter.start);

    // Toolbar should still be visible
    await expect(toolbar).toBeVisible();
  });
});

// =============================================================================
// Tests: Style Application
// =============================================================================

test.describe("TextEditorWithToolbar: Style Application", () => {
  test("bold button applies bold style to selected text", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);

    // Select first line
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);

    const toolbar = getSelectionToolbar(page);
    await expect(toolbar).toBeVisible();

    // Check that bold tspan doesn't exist initially
    const boldTspansBefore = await locators.svg.locator('tspan[font-weight="bold"]').count();

    // Click bold button
    const boldButton = toolbar.locator('button[aria-label="Bold"]');
    await clickToolbarButton(boldButton);
    await page.waitForTimeout(500);

    // Check that bold tspan now exists
    const boldTspansAfter = await locators.svg.locator('tspan[font-weight="bold"]').count();
    expect(boldTspansAfter).toBeGreaterThan(boldTspansBefore);
  });

  test("italic button applies italic style to selected text", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);

    // Select text
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);

    const toolbar = getSelectionToolbar(page);

    // Check that italic tspan doesn't exist initially
    const italicTspansBefore = await locators.svg.locator('tspan[font-style="italic"]').count();

    // Click italic button
    const italicButton = toolbar.locator('button[aria-label="Italic"]');
    await clickToolbarButton(italicButton);
    await page.waitForTimeout(300);

    // Check that italic tspan now exists
    const italicTspansAfter = await locators.svg.locator('tspan[font-style="italic"]').count();
    expect(italicTspansAfter).toBeGreaterThan(italicTspansBefore);
  });

  test("multiple style applications work correctly", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);

    // Select text
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);

    const toolbar = getSelectionToolbar(page);

    // Apply bold
    const boldButton = toolbar.locator('button[aria-label="Bold"]');
    await clickToolbarButton(boldButton);
    await page.waitForTimeout(300);

    const boldTspans = await locators.svg.locator('tspan[font-weight="bold"]').count();
    expect(boldTspans).toBeGreaterThan(0);

    // Refocus editor and reselect for italic
    await focusEditor(page, locators);
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);

    // Wait for toolbar to reappear after reselection
    await expect(toolbar).toBeVisible();

    const italicButton = toolbar.locator('button[aria-label="Italic"]');
    await clickToolbarButton(italicButton);
    await page.waitForTimeout(300);

    // Both styles should now be applied
    const italicTspans = await locators.svg.locator('tspan[font-style="italic"]').count();
    expect(italicTspans).toBeGreaterThan(0);
  });
});

// =============================================================================
// Tests: Style Duplication Prevention
// =============================================================================

test.describe("TextEditorWithToolbar: No Text Duplication", () => {
  test("applying styles does not duplicate text content", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);

    // Get initial text content
    const initialTextContent = await locators.svg.textContent();

    // Select first line and apply bold
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);

    const toolbar = getSelectionToolbar(page);
    await expect(toolbar).toBeVisible();

    const boldButton = toolbar.locator('button[aria-label="Bold"]');
    await clickToolbarButton(boldButton);
    await page.waitForTimeout(300);

    // Get text content after bold
    const afterBoldTextContent = await locators.svg.textContent();

    // Text content should be the same (no duplication)
    expect(afterBoldTextContent).toBe(initialTextContent);
  });

  test("applying multiple overlapping styles does not duplicate text", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);

    // Get initial text content
    const initialTextContent = await locators.svg.textContent();

    // Select text and apply bold
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);

    const toolbar = getSelectionToolbar(page);
    const boldButton = toolbar.locator('button[aria-label="Bold"]');
    await clickToolbarButton(boldButton);
    await page.waitForTimeout(300);

    // Refocus and apply italic to the same range
    await focusEditor(page, locators);
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);

    await expect(toolbar).toBeVisible();
    const italicButton = toolbar.locator('button[aria-label="Italic"]');
    await clickToolbarButton(italicButton);
    await page.waitForTimeout(300);

    // Get text content after both styles
    const afterStylesTextContent = await locators.svg.textContent();

    // Text content should still be the same (no duplication)
    expect(afterStylesTextContent).toBe(initialTextContent);
  });
});

// =============================================================================
// Tests: Toolbar Positioning
// =============================================================================

test.describe("TextEditorWithToolbar: Positioning", () => {
  test("toolbar is positioned near the editor", async ({ page }) => {
    await setupPage(page);

    const locators = getEditorLocators(page);
    await focusEditor(page, locators);
    await selectAllText(page);

    const toolbar = getSelectionToolbar(page);
    await expect(toolbar).toBeVisible();

    const containerBox = await locators.container.boundingBox();
    const toolbarBox = await toolbar.boundingBox();

    expect(containerBox).not.toBeNull();
    expect(toolbarBox).not.toBeNull();

    // Toolbar should be within reasonable distance of container
    const maxDistanceY = 250;
    const containerCenterY = containerBox!.y + containerBox!.height / 2;
    const toolbarCenterY = toolbarBox!.y + toolbarBox!.height / 2;
    const distanceY = Math.abs(containerCenterY - toolbarCenterY);

    expect(distanceY).toBeLessThan(maxDistanceY);
  });
});
