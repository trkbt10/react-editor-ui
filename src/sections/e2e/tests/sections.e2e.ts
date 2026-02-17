/**
 * @file Sections E2E tests
 */

import { test, expect } from "@playwright/test";

test.describe("Section components", () => {
  test.describe("AlignmentSection", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/alignment");
    });

    test("renders with alignment controls", async ({ page }) => {
      const section = page.getByTestId("section");
      await expect(section.getByText("Alignment")).toBeVisible();
      await expect(section.getByLabel("Horizontal alignment")).toBeVisible();
      await expect(section.getByLabel("Vertical alignment")).toBeVisible();
    });

    test("updates alignment on click", async ({ page }) => {
      const section = page.getByTestId("section");
      await section.getByLabel("Align center").click();
      await expect(section.getByText('"horizontal": "center"')).toBeVisible();
    });
  });

  test.describe("PositionSection", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/position");
    });

    test("renders with position inputs", async ({ page }) => {
      const section = page.getByTestId("section");
      await expect(section.getByText("Position")).toBeVisible();
      await expect(section.getByLabel("X position")).toHaveValue("100");
      await expect(section.getByLabel("Y position")).toHaveValue("200");
    });

    test("updates position on input change", async ({ page }) => {
      const section = page.getByTestId("section");
      await section.getByLabel("X position").fill("300");
      await expect(section.getByText('"x": "300"')).toBeVisible();
    });
  });

  test.describe("SizeSection", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/size");
    });

    test("renders with size inputs", async ({ page }) => {
      const section = page.getByTestId("section");
      await expect(section.getByText("Size")).toBeVisible();
      await expect(section.getByLabel("Width")).toHaveValue("200");
      await expect(section.getByLabel("Height")).toHaveValue("100");
    });
  });

  test.describe("RotationSection", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/rotation");
    });

    test("renders with rotation input", async ({ page }) => {
      const section = page.getByTestId("section");
      await expect(section.getByText("Rotation", { exact: true })).toBeVisible();
      await expect(section.locator("input")).toHaveValue("45");
    });

    test("renders transform buttons", async ({ page }) => {
      const section = page.getByTestId("section");
      await expect(section.getByLabel("Reset rotation")).toBeVisible();
      await expect(section.getByLabel("Flip horizontal")).toBeVisible();
      await expect(section.getByLabel("Flip vertical")).toBeVisible();
    });

    test("resets rotation on reset button click", async ({ page }) => {
      const section = page.getByTestId("section");
      await section.getByLabel("Reset rotation").click();
      await expect(section.getByText('"rotation": "0"')).toBeVisible();
    });
  });

  test.describe("ConstraintsSection", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#/constraints");
    });

    test("renders with selects and visualization", async ({ page }) => {
      const section = page.getByTestId("section");
      await expect(section.getByText("Constraints")).toBeVisible();
      await expect(section.getByLabel("Horizontal constraint")).toBeVisible();
      await expect(section.getByLabel("Vertical constraint")).toBeVisible();
      await expect(section.getByLabel("Toggle left constraint")).toBeVisible();
    });

    test("updates constraints via visualization", async ({ page }) => {
      const section = page.getByTestId("section");
      await section.getByLabel("Toggle right constraint").click();
      await expect(section.getByText('"horizontal": "left-right"')).toBeVisible();
    });
  });
});
