/**
 * @file LibraryBrowser tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { LibraryBrowser } from "./LibraryBrowser";
import type { LibraryNode } from "./types";

const mockItems: LibraryNode[] = [
  {
    id: "shapes",
    type: "category",
    label: "Basic Shapes",
    children: [
      { id: "rect", type: "item", label: "Rectangle" },
      { id: "circle", type: "item", label: "Circle" },
    ],
  },
  {
    id: "icons",
    type: "category",
    label: "Icons",
    children: [
      { id: "arrow", type: "item", label: "Arrow" },
      { id: "star", type: "item", label: "Star" },
    ],
  },
];

const flatItems: LibraryNode[] = [
  { id: "item1", type: "item", label: "Item One" },
  { id: "item2", type: "item", label: "Item Two" },
];

describe("LibraryBrowser", () => {
  it("renders search input", () => {
    render(<LibraryBrowser items={mockItems} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("renders with custom search placeholder", () => {
    render(
      <LibraryBrowser items={mockItems} searchPlaceholder="Find items..." />,
    );
    expect(screen.getByPlaceholderText("Find items...")).toBeInTheDocument();
  });

  it("renders categories in list view", () => {
    render(<LibraryBrowser items={mockItems} />);
    expect(screen.getByText("Basic Shapes")).toBeInTheDocument();
    expect(screen.getByText("Icons")).toBeInTheDocument();
  });

  it("renders flat items in grid view", () => {
    render(<LibraryBrowser items={flatItems} />);
    expect(screen.getByText("Item One")).toBeInTheDocument();
    expect(screen.getByText("Item Two")).toBeInTheDocument();
  });

  it("navigates into category on click", () => {
    render(<LibraryBrowser items={mockItems} />);

    fireEvent.click(screen.getByText("Basic Shapes"));

    // Should show children
    expect(screen.getByText("Rectangle")).toBeInTheDocument();
    expect(screen.getByText("Circle")).toBeInTheDocument();
    // Should not show other categories
    expect(screen.queryByText("Icons")).not.toBeInTheDocument();
  });

  it("shows back button after navigating", () => {
    render(<LibraryBrowser items={mockItems} />);

    // Initially no back button
    expect(screen.queryByLabelText("Go back")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Basic Shapes"));

    // Back button should appear
    expect(screen.getByLabelText("Go back")).toBeInTheDocument();
  });

  it("navigates back on back button click", () => {
    render(<LibraryBrowser items={mockItems} />);

    fireEvent.click(screen.getByText("Basic Shapes"));
    expect(screen.getByText("Rectangle")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Go back"));

    // Should show categories again
    expect(screen.getByText("Basic Shapes")).toBeInTheDocument();
    expect(screen.getByText("Icons")).toBeInTheDocument();
  });

  it("filters items by search query", () => {
    render(<LibraryBrowser items={mockItems} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "rect" },
    });

    expect(screen.getByText("Rectangle")).toBeInTheDocument();
    expect(screen.queryByText("Circle")).not.toBeInTheDocument();
    expect(screen.queryByText("Basic Shapes")).not.toBeInTheDocument();
  });

  it("shows empty state when no items match search", () => {
    render(
      <LibraryBrowser
        items={mockItems}
        searchEmptyMessage="Nothing found"
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "xyz" },
    });

    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });

  it("shows empty state when items array is empty", () => {
    render(
      <LibraryBrowser items={[]} emptyMessage="No items available" />,
    );

    expect(screen.getByText("No items available")).toBeInTheDocument();
  });

  it("calls onItemClick when leaf item is clicked", () => {
    const clickHistory: string[] = [];
    const handleItemClick = (item: { id: string }) => {
      clickHistory.push(item.id);
    };

    render(<LibraryBrowser items={flatItems} onItemClick={handleItemClick} />);

    fireEvent.click(screen.getByText("Item One"));

    expect(clickHistory).toEqual(["item1"]);
  });

  it("shows filter button when showFilterButton is true", () => {
    render(<LibraryBrowser items={mockItems} showFilterButton />);
    expect(screen.getByLabelText("Filter")).toBeInTheDocument();
  });

  it("calls onFilterClick when filter button is clicked", () => {
    const ref = { filterClicked: false };
    const handleFilterClick = () => {
      ref.filterClicked = true;
    };

    render(
      <LibraryBrowser
        items={mockItems}
        showFilterButton
        onFilterClick={handleFilterClick}
      />,
    );

    fireEvent.click(screen.getByLabelText("Filter"));

    expect(ref.filterClicked).toBe(true);
  });

  it("applies custom className", () => {
    const { container } = render(
      <LibraryBrowser items={mockItems} className="custom-browser" />,
    );
    expect(container.firstChild).toHaveClass("custom-browser");
  });

  it("includes all items from matching category in search", () => {
    render(<LibraryBrowser items={mockItems} />);

    // Search for category name
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "basic" },
    });

    // Should show all children of matching category
    expect(screen.getByText("Rectangle")).toBeInTheDocument();
    expect(screen.getByText("Circle")).toBeInTheDocument();
  });
});
