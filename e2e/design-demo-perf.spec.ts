/**
 * E2E test to measure React re-renders in DesignDemo using react-scan logs
 */
import { test, expect } from "@playwright/test";

test.describe("DesignDemo performance", () => {
  test("clicking sidebar tab should only re-render Sidebar components", async ({ page }) => {
    const renderLogs: string[] = [];

    // Capture console logs from react-scan
    page.on("console", (msg) => {
      const text = msg.text();
      // react-scan logs render info
      if (text.includes("render") || text.includes("Render") || text.includes("×")) {
        renderLogs.push(text);
      }
    });

    await page.goto("http://localhost:5620/#/app-demo/design");
    await page.waitForSelector('[data-testid="bounding-box"]', { timeout: 10000 });

    // Wait for initial renders to settle
    await page.waitForTimeout(500);

    // Clear logs before action
    renderLogs.length = 0;

    // Click on "Assets" tab
    const assetsTab = page.locator('button:has-text("Assets"), [role="tab"]:has-text("Assets")').first();
    if (await assetsTab.isVisible()) {
      await assetsTab.click();
      await page.waitForTimeout(300);
    }

    console.log("Render logs after tab click:", renderLogs);

    // Check that Canvas/Inspector components did NOT re-render
    const canvasRenders = renderLogs.filter(log =>
      log.includes("Canvas") || log.includes("BoundingBox") || log.includes("CanvasArea")
    );
    const inspectorRenders = renderLogs.filter(log =>
      log.includes("Inspector")
    );

    console.log("Canvas renders:", canvasRenders.length);
    console.log("Inspector renders:", inspectorRenders.length);

    // Canvas and Inspector should not re-render when sidebar tab changes
    expect(canvasRenders.length).toBe(0);
    expect(inspectorRenders.length).toBe(0);
  });

  test("selecting a layer should not re-render unrelated sidebar items", async ({ page }) => {
    const renderLogs: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("render") || text.includes("Render") || text.includes("×") || text.includes("LayerItem")) {
        renderLogs.push(text);
      }
    });

    await page.goto("http://localhost:5620/#/app-demo/design");
    await page.waitForSelector('[data-testid="bounding-box"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Clear logs
    renderLogs.length = 0;

    // Click on a different layer (Background)
    const backgroundLayer = page.locator('div').filter({ hasText: /^Background$/ }).first();
    if (await backgroundLayer.isVisible()) {
      await backgroundLayer.click();
      await page.waitForTimeout(300);
    }

    console.log("Render logs after layer selection:", renderLogs);

    // Count LayerItem renders - should only be 2 items (old selected + new selected)
    // Each item renders: LayerItemWrapper + LayerItem (potentially twice due to strict mode)
    // So expect ~6 logs for 2 items
    const layerItemRenders = renderLogs.filter(log => log.includes("LayerItem"));
    console.log("LayerItem renders:", layerItemRenders.length);

    // If all 10+ LayerItems re-render, this would be 30+
    // We expect only 2 items to re-render, so max ~10 with strict mode
    expect(layerItemRenders.length).toBeLessThanOrEqual(10);
  });

  test("dragging canvas element should not re-render sidebar", async ({ page }) => {
    const renderLogs: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("Sidebar") || text.includes("LayerItem") || text.includes("Inspector")) {
        renderLogs.push(text);
      }
    });

    await page.goto("http://localhost:5620/#/app-demo/design");
    await page.waitForSelector('[data-testid="bounding-box"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    renderLogs.length = 0;

    // Perform drag
    const boundingBox = page.locator('[data-testid="bounding-box-move-area"]');
    const box = await boundingBox.boundingBox();
    if (!box) throw new Error("Could not get bounding box");

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(startX + i * 5, startY + i * 5);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await page.waitForTimeout(100);

    console.log("Render logs after drag:", renderLogs);

    // Sidebar and Inspector should NOT re-render during canvas drag
    const sidebarRenders = renderLogs.filter(log => log.includes("Sidebar") || log.includes("LayerItem"));
    const inspectorRenders = renderLogs.filter(log => log.includes("Inspector"));

    console.log("Sidebar renders:", sidebarRenders.length);
    console.log("Inspector renders:", inspectorRenders.length);

    expect(sidebarRenders.length).toBe(0);
    expect(inspectorRenders.length).toBe(0);
  });
});
