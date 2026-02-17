/**
 * @file Tests for build-readme.ts
 */

import { describe, it, expect } from "vitest";
import { parseJSDocComment, parseTokensFile } from "./build-readme";

describe("parseJSDocComment", () => {
  it("extracts @file tag from simple comment", () => {
    const content = `/**
 * @file Button component - Text button with optional icons
 */`;

    const result = parseJSDocComment(content);

    expect(result.file).toBe("Button component - Text button with optional icons");
  });

  it("extracts @file tag with multiline content", () => {
    const content = `/**
 * @file Button component - Text button with optional icons
 * Figma-style design with clean aesthetics
 */`;

    const result = parseJSDocComment(content);

    expect(result.file).toBe("Button component - Text button with optional icons");
  });

  it("extracts @description tag", () => {
    const content = `/**
 * @file Button component
 *
 * @description
 * Figma-style design with clean, minimal aesthetics.
 * Supports primary, secondary, ghost, and danger variants.
 */`;

    const result = parseJSDocComment(content);

    expect(result.description).toBe(
      "Figma-style design with clean, minimal aesthetics. Supports primary, secondary, ghost, and danger variants."
    );
  });

  it("extracts @example tag with code block", () => {
    const content = `/**
 * @file Button component
 *
 * @example
 * \`\`\`tsx
 * import { Button } from "react-editor-ui/Button";
 *
 * <Button variant="primary">Click me</Button>
 * \`\`\`
 */`;

    const result = parseJSDocComment(content);

    expect(result.example).toContain('import { Button } from "react-editor-ui/Button"');
    expect(result.example).toContain("<Button variant");
  });

  it("extracts all tags from complex comment", () => {
    const content = `/**
 * @file IconButton component - A button with only an icon
 *
 * @description
 * Compact button for toolbar actions and icon-only interactions.
 * Supports multiple sizes and variants including ghost and filled.
 *
 * @example
 * \`\`\`tsx
 * import { IconButton } from "react-editor-ui/IconButton";
 * import { FiPlus } from "react-icons/fi";
 *
 * <IconButton
 *   icon={<FiPlus />}
 *   aria-label="Add item"
 *   onClick={() => console.log("add")}
 * />
 * \`\`\`
 */`;

    const result = parseJSDocComment(content);

    expect(result.file).toBe("IconButton component - A button with only an icon");
    expect(result.description).toContain("Compact button for toolbar actions");
    expect(result.example).toContain("IconButton");
    expect(result.example).toContain("FiPlus");
  });

  it("returns empty object when no JSDoc comment exists", () => {
    const content = `// Regular comment
import { memo } from "react";

export const Button = memo(function Button() {});`;

    const result = parseJSDocComment(content);

    expect(result).toEqual({});
  });

  it("handles @file without description", () => {
    const content = `/**
 * @file Checkbox component
 */`;

    const result = parseJSDocComment(content);

    expect(result.file).toBe("Checkbox component");
    expect(result.description).toBeUndefined();
    expect(result.example).toBeUndefined();
  });

  it("handles @description without @example", () => {
    const content = `/**
 * @file Slider component
 *
 * @description
 * Draggable slider supporting horizontal and vertical orientations.
 */`;

    const result = parseJSDocComment(content);

    expect(result.file).toBe("Slider component");
    expect(result.description).toBe(
      "Draggable slider supporting horizontal and vertical orientations."
    );
    expect(result.example).toBeUndefined();
  });
});

describe("parseTokensFile", () => {
  it("extracts BaseTokens groups and tokens", () => {
    const content = `
export type BaseTokens = {
  // -------------------------------------------------------------------------
  // @group Spacing
  // Consistent spacing scale
  // -------------------------------------------------------------------------

  /** Extra small spacing (2px) */
  "space-xs": string;
  /** Small spacing (4px) */
  "space-sm": string;

  // -------------------------------------------------------------------------
  // @group Font Sizes
  // Typography scale
  // -------------------------------------------------------------------------

  /** Extra small font (9px) */
  "size-font-xs": string;
};

export const baseTokens: BaseTokens = {
  "space-xs": "2px",
  "space-sm": "4px",
  "size-font-xs": "9px",
};
`;

    const result = parseTokensFile(content);

    expect(result.baseTokens.groups).toHaveLength(2);
    expect(result.baseTokens.groups[0].name).toBe("Spacing");
    expect(result.baseTokens.groups[0].description).toBe("Consistent spacing scale");
    expect(result.baseTokens.groups[0].tokens).toHaveLength(2);
    expect(result.baseTokens.groups[0].tokens[0]).toEqual({
      name: "space-xs",
      cssVar: "--rei-space-xs",
      description: "Extra small spacing (2px)",
      defaultValue: "2px",
    });
    expect(result.baseTokens.groups[1].name).toBe("Font Sizes");
  });

  it("extracts ColorTokens groups and tokens", () => {
    const content = `
export type ColorTokens = {
  // -------------------------------------------------------------------------
  // @group Primary Colors
  // Brand and accent colors
  // -------------------------------------------------------------------------

  /** Primary brand color */
  "color-primary": string;
  /** Primary hover state */
  "color-primary-hover": string;
};
`;

    const result = parseTokensFile(content);

    expect(result.colorTokens.groups).toHaveLength(1);
    expect(result.colorTokens.groups[0].name).toBe("Primary Colors");
    expect(result.colorTokens.groups[0].tokens).toHaveLength(2);
    expect(result.colorTokens.groups[0].tokens[0]).toEqual({
      name: "color-primary",
      cssVar: "--rei-color-primary",
      description: "Primary brand color",
    });
  });

  it("handles empty content", () => {
    const content = "";

    const result = parseTokensFile(content);

    expect(result.baseTokens.groups).toHaveLength(0);
    expect(result.colorTokens.groups).toHaveLength(0);
  });

  it("extracts default values from baseTokens const", () => {
    const content = `
export type BaseTokens = {
  // @group Radius
  // Corner rounding
  /** Small radius */
  "radius-sm": string;
  /** Full radius */
  "radius-full": string;
};

export const baseTokens: BaseTokens = {
  "radius-sm": "5px",
  "radius-full": "9999px",
};
`;

    const result = parseTokensFile(content);

    expect(result.baseTokens.groups[0].tokens[0].defaultValue).toBe("5px");
    expect(result.baseTokens.groups[0].tokens[1].defaultValue).toBe("9999px");
  });
});
