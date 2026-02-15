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
