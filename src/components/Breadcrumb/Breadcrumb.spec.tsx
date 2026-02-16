/**
 * @file Breadcrumb component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  const defaultItems = [
    { label: "Home" },
    { label: "Projects" },
    { label: "Current" },
  ];

  it("renders all breadcrumb items", () => {
    render(<Breadcrumb items={defaultItems} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("renders with navigation role", () => {
    render(<Breadcrumb items={defaultItems} />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("calls onItemClick when item is clicked", () => {
    const handleClick = vi.fn();
    render(<Breadcrumb items={defaultItems} onItemClick={handleClick} />);

    fireEvent.click(screen.getByText("Home"));

    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it("does not call onItemClick for last item", () => {
    const handleClick = vi.fn();
    render(<Breadcrumb items={defaultItems} onItemClick={handleClick} />);

    fireEvent.click(screen.getByText("Current"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders with icons", () => {
    const itemsWithIcons = [
      { label: "Home", icon: <span data-testid="home-icon">H</span> },
      { label: "Projects", icon: <span data-testid="projects-icon">P</span> },
    ];
    render(<Breadcrumb items={itemsWithIcons} />);

    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByTestId("projects-icon")).toBeInTheDocument();
  });

  it("renders with custom separator", () => {
    render(
      <Breadcrumb
        items={defaultItems}
        separator={<span data-testid="custom-separator">/</span>}
      />,
    );

    const separators = screen.getAllByTestId("custom-separator");
    expect(separators).toHaveLength(2);
  });

  it("truncates items when maxItems is set", () => {
    const manyItems = [
      { label: "A" },
      { label: "B" },
      { label: "C" },
      { label: "D" },
      { label: "E" },
    ];
    render(<Breadcrumb items={manyItems} maxItems={3} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Breadcrumb items={defaultItems} className="custom-class" />);

    expect(screen.getByRole("navigation")).toHaveClass("custom-class");
  });

  it("renders link when href is provided", () => {
    const itemsWithHref = [
      { label: "Home", href: "/home" },
      { label: "Current" },
    ];
    render(<Breadcrumb items={itemsWithHref} />);

    const link = screen.getByText("Home").closest("a");
    expect(link).toHaveAttribute("href", "/home");
  });
});
