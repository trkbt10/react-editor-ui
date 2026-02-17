/**
 * @file Shared E2E test utilities for Editor tests
 */

import type { Page, Locator } from "@playwright/test";

export type EditorType = "text" | "code";

export type EditorLocators = {
  container: Locator;
  textarea: Locator;
  svg: Locator;
};

/**
 * Get the editor container that handles pointer events.
 */
export function getEditorContainer(page: Page): Locator {
  return page.locator("div:has(> svg:has(text))").first();
}

/**
 * Get the hidden textarea used for input.
 */
export function getEditorTextarea(page: Page): Locator {
  return page.locator('textarea[aria-label="Text editor"], textarea[aria-label="Code editor"]').first();
}

/**
 * Get the editor SVG element.
 */
export function getEditorSvg(page: Page): Locator {
  return page.locator("svg:has(text)").first();
}

/**
 * Get all editor locators.
 */
export function getEditorLocators(page: Page, type: EditorType): EditorLocators {
  const ariaLabel = type === "text" ? "Text editor" : "Code editor";
  return {
    container: page.locator("div:has(> svg:has(text))").first(),
    textarea: page.locator(`textarea[aria-label="${ariaLabel}"]`).first(),
    svg: page.locator("svg:has(text)").first(),
  };
}

/**
 * Get readonly editor locators.
 */
export function getReadOnlyEditorLocators(page: Page, type: EditorType): EditorLocators {
  const ariaLabel = type === "text" ? "Text editor" : "Code editor";
  const textarea = page.locator(`textarea[aria-label="${ariaLabel}"][readonly]`).first();

  return {
    container: textarea.locator("..").locator(".."),
    textarea,
    svg: textarea.locator("..").locator("svg").first(),
  };
}

/**
 * Setup editor and wait for it to render.
 */
export async function setupEditor(page: Page, route: string, type: EditorType): Promise<EditorLocators> {
  await page.goto(route);
  await page.waitForSelector("svg text");
  return getEditorLocators(page, type);
}

/**
 * Focus the editor by clicking.
 */
export async function focusEditor(page: Page, locators: EditorLocators): Promise<void> {
  await locators.container.click({ position: { x: 50, y: 20 }, force: true });
  await page.waitForTimeout(100);
}

/**
 * Set editor content.
 */
export async function setEditorContent(page: Page, locators: EditorLocators, content: string): Promise<void> {
  await focusEditor(page, locators);
  await page.keyboard.press("Meta+a");
  if (content === "") {
    await page.keyboard.press("Backspace");
  } else {
    await page.keyboard.type(content);
  }
  await page.waitForTimeout(100);
}

/**
 * Get editor content.
 */
export async function getEditorContent(locators: EditorLocators): Promise<string> {
  return locators.textarea.inputValue();
}

/**
 * Get selection range.
 */
export async function getSelection(locators: EditorLocators): Promise<{ start: number; end: number }> {
  return locators.textarea.evaluate((el: HTMLTextAreaElement) => ({
    start: el.selectionStart,
    end: el.selectionEnd,
  }));
}

/**
 * Go to document start (macOS).
 */
export async function goToDocumentStart(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Meta+ArrowLeft");
}

/**
 * Go to document end (macOS).
 */
export async function goToDocumentEnd(page: Page): Promise<void> {
  await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.press("Meta+ArrowRight");
}

/**
 * Simulate IME input using Playwright's insertText.
 */
export async function simulateIMEInput(
  page: Page,
  locators: EditorLocators,
  finalText: string
): Promise<void> {
  const textarea = locators.textarea;

  // Start composition
  await textarea.evaluate((el) => {
    el.dispatchEvent(new CompositionEvent("compositionstart", { data: "" }));
  });
  await page.waitForTimeout(50);

  // Update composition
  for (const char of finalText) {
    await textarea.evaluate((el, text) => {
      el.dispatchEvent(new CompositionEvent("compositionupdate", { data: text }));
    }, char);
    await page.waitForTimeout(30);
  }

  // Insert text
  await page.keyboard.insertText(finalText);
  await page.waitForTimeout(50);

  // End composition
  await textarea.evaluate((el, text) => {
    el.dispatchEvent(new CompositionEvent("compositionend", { data: text }));
  }, finalText);
  await page.waitForTimeout(100);
}
