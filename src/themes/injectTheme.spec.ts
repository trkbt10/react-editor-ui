/**
 * @file injectTheme tests
 */

import { injectTheme, clearTheme, getThemeCss } from "./injectTheme";

describe("injectTheme", () => {
  afterEach(() => {
    clearTheme();
  });

  it("injects theme CSS into document head", () => {
    injectTheme("light");

    const style = document.getElementById("rei-theme-vars");
    expect(style).toBeInTheDocument();
    expect(style?.textContent).toContain("--rei-color-surface: #ffffff");
  });

  it("injects dark theme", () => {
    injectTheme("dark");

    const style = document.getElementById("rei-theme-vars");
    expect(style?.textContent).toContain("--rei-color-surface: #1e1f24");
  });

  it("injects custom tokens", () => {
    injectTheme({ "color-primary": "#ff0000" });

    const style = document.getElementById("rei-theme-vars");
    expect(style?.textContent).toContain("--rei-color-primary: #ff0000");
  });

  it("uses :root selector by default", () => {
    injectTheme("light");

    const style = document.getElementById("rei-theme-vars");
    expect(style?.textContent).toContain(":root {");
  });

  it("uses custom selector", () => {
    injectTheme("light", ".my-container");

    const style = document.getElementById("rei-theme-vars");
    expect(style?.textContent).toContain(".my-container {");
  });

  it("replaces existing theme on re-inject", () => {
    injectTheme("light");
    injectTheme("dark");

    const styles = document.querySelectorAll("#rei-theme-vars");
    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain("--rei-color-surface: #1e1f24");
  });

  it("sets data-theme attribute on document element", () => {
    injectTheme("dark");

    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("does not set data-theme for custom tokens", () => {
    injectTheme({ "color-primary": "#ff0000" });

    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("does not set data-theme for non-root selectors", () => {
    injectTheme("dark", ".my-container");

    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});

describe("clearTheme", () => {
  it("removes injected style element", () => {
    injectTheme("light");
    expect(document.getElementById("rei-theme-vars")).toBeInTheDocument();

    clearTheme();
    expect(document.getElementById("rei-theme-vars")).not.toBeInTheDocument();
  });

  it("removes data-theme attribute", () => {
    injectTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    clearTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("does nothing if no theme injected", () => {
    expect(() => clearTheme()).not.toThrow();
  });
});

describe("getThemeCss", () => {
  it("returns CSS text for theme", () => {
    const css = getThemeCss("dark");

    expect(css).toContain(":root {");
    expect(css).toContain("--rei-color-surface: #1e1f24");
    expect(css).toContain("}");
  });

  it("returns CSS text with custom selector", () => {
    const css = getThemeCss("light", ".container");

    expect(css).toContain(".container {");
    expect(css).toContain("--rei-color-surface: #ffffff");
  });

  it("returns CSS text for custom tokens", () => {
    const css = getThemeCss({ "color-primary": "#00ff00" });

    expect(css).toContain("--rei-color-primary: #00ff00");
  });
});
