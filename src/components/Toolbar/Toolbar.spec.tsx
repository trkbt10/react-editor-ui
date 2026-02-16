/**
 * @file Toolbar tests
 */

import { render, screen } from "@testing-library/react";
import { Toolbar } from "./Toolbar";
import { ToolbarGroup } from "./ToolbarGroup";
import { ToolbarDivider } from "./ToolbarDivider";

describe("Toolbar", () => {
  it("renders children", () => {
    render(
      <Toolbar>
        <button>Button 1</button>
        <button>Button 2</button>
      </Toolbar>,
    );

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText("Button 1")).toBeInTheDocument();
    expect(screen.getByText("Button 2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Toolbar className="custom-toolbar">Content</Toolbar>);
    expect(screen.getByRole("toolbar")).toHaveClass("custom-toolbar");
  });

  it("applies default variant with bottom border", () => {
    render(
      <Toolbar>
        <button>Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.style.borderBottom).toContain("solid");
  });

  it("applies floating variant with shadow and rounded corners", () => {
    render(
      <Toolbar variant="floating">
        <button>Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.style.borderRadius).toBe("var(--rei-radius-lg, 10px)");
    expect(toolbar.style.boxShadow).toBe(
      "var(--rei-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.07))",
    );
    // Floating variant should not have bottom border
    expect(toolbar.style.borderBottom).toBe("");
  });

  it("applies fitContent prop with inline-flex and fit-content width", () => {
    render(
      <Toolbar fitContent>
        <button>Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.style.display).toBe("inline-flex");
    expect(toolbar.style.width).toBe("fit-content");
  });

  it("can combine floating variant with fitContent", () => {
    render(
      <Toolbar variant="floating" fitContent>
        <button>Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.style.display).toBe("inline-flex");
    expect(toolbar.style.width).toBe("fit-content");
    expect(toolbar.style.borderRadius).toBe("var(--rei-radius-lg, 10px)");
  });

  it("applies vertical orientation with column direction", () => {
    render(
      <Toolbar orientation="vertical">
        <button>Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.style.flexDirection).toBe("column");
    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
    expect(toolbar.style.borderRight).toContain("solid");
  });

  it("applies vertical orientation with fitContent", () => {
    render(
      <Toolbar orientation="vertical" fitContent>
        <button>Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.style.flexDirection).toBe("column");
    expect(toolbar.style.height).toBe("fit-content");
  });

  it("can combine vertical orientation with floating variant", () => {
    render(
      <Toolbar orientation="vertical" variant="floating" fitContent>
        <button>Button</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.style.flexDirection).toBe("column");
    expect(toolbar.style.borderRadius).toBe("var(--rei-radius-lg, 10px)");
    expect(toolbar.style.boxShadow).toBe(
      "var(--rei-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.07))",
    );
  });
});

describe("ToolbarGroup", () => {
  it("renders children in a group", () => {
    render(
      <ToolbarGroup>
        <button>Item 1</button>
        <button>Item 2</button>
      </ToolbarGroup>,
    );

    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ToolbarGroup className="custom-group">Content</ToolbarGroup>);
    expect(screen.getByRole("group")).toHaveClass("custom-group");
  });
});

describe("ToolbarDivider", () => {
  it("renders as a separator", () => {
    render(<ToolbarDivider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("has vertical orientation", () => {
    render(<ToolbarDivider />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("applies custom className", () => {
    render(<ToolbarDivider className="custom-divider" />);
    expect(screen.getByRole("separator")).toHaveClass("custom-divider");
  });
});

describe("Toolbar composition", () => {
  it("composes Toolbar with groups and dividers", () => {
    render(
      <Toolbar>
        <ToolbarGroup>
          <button>File</button>
          <button>Edit</button>
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <button>View</button>
        </ToolbarGroup>
      </Toolbar>,
    );

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});
