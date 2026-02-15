/**
 * @file Badge tests
 */

import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveStyle({
      backgroundColor: "var(--rei-color-surface-raised, #f9fafb)",
    });
  });

  it("applies primary variant", () => {
    render(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText("Primary")).toHaveStyle({
      backgroundColor: "var(--rei-color-primary, #2563eb)",
    });
  });

  it("applies success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveStyle({
      backgroundColor: "var(--rei-color-success, #16a34a)",
    });
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toHaveStyle({
      backgroundColor: "var(--rei-color-warning, #d97706)",
    });
  });

  it("applies error variant", () => {
    render(<Badge variant="error">Error</Badge>);
    expect(screen.getByText("Error")).toHaveStyle({
      backgroundColor: "var(--rei-color-error, #dc2626)",
    });
  });

  it("applies sm size", () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small")).toHaveStyle({
      fontSize: "var(--rei-size-font-xs, 9px)",
    });
  });

  it("applies md size", () => {
    render(<Badge size="md">Medium</Badge>);
    expect(screen.getByText("Medium")).toHaveStyle({
      fontSize: "var(--rei-size-font-sm, 11px)",
    });
  });

  it("renders numeric content", () => {
    render(<Badge>42</Badge>);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom-class");
  });
});
