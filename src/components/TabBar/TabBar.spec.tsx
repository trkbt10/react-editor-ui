/**
 * @file TabBar component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { TabBar } from "./TabBar";

describe("TabBar", () => {
  const defaultTabs = [
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
    { id: "tab3", label: "Tab 3" },
  ];

  it("renders all tabs", () => {
    render(<TabBar tabs={defaultTabs} activeTab="tab1" onChange={() => {}} />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();
  });

  it("marks active tab with aria-selected", () => {
    render(<TabBar tabs={defaultTabs} activeTab="tab2" onChange={() => {}} />);

    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    const tab2 = screen.getByRole("tab", { name: "Tab 2" });

    expect(tab1).toHaveAttribute("aria-selected", "false");
    expect(tab2).toHaveAttribute("aria-selected", "true");
  });

  it("calls onChange when tab is clicked", () => {
    const handleChange = vi.fn();
    render(<TabBar tabs={defaultTabs} activeTab="tab1" onChange={handleChange} />);

    fireEvent.click(screen.getByText("Tab 2"));

    expect(handleChange).toHaveBeenCalledWith("tab2");
  });

  it("does not call onChange when disabled tab is clicked", () => {
    const handleChange = vi.fn();
    const tabs = [
      { id: "tab1", label: "Tab 1" },
      { id: "tab2", label: "Tab 2", disabled: true },
    ];

    render(<TabBar tabs={tabs} activeTab="tab1" onChange={handleChange} />);

    fireEvent.click(screen.getByText("Tab 2"));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("renders with tablist role", () => {
    render(<TabBar tabs={defaultTabs} activeTab="tab1" onChange={() => {}} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <TabBar
        tabs={defaultTabs}
        activeTab="tab1"
        onChange={() => {}}
        className="custom-class"
      />,
    );

    expect(screen.getByRole("tablist")).toHaveClass("custom-class");
  });

  describe("files variant", () => {
    const fileTabs = [
      { id: "file1", label: "index.tsx", closable: true },
      { id: "file2", label: "styles.css", closable: true },
    ];

    it("renders file tabs", () => {
      render(
        <TabBar
          variant="files"
          tabs={fileTabs}
          activeTab="file1"
          onChange={() => {}}
        />,
      );

      expect(screen.getByText("index.tsx")).toBeInTheDocument();
      expect(screen.getByText("styles.css")).toBeInTheDocument();
    });

    it("shows close button on closable tabs", () => {
      render(
        <TabBar
          variant="files"
          tabs={fileTabs}
          activeTab="file1"
          onChange={() => {}}
          onClose={() => {}}
        />,
      );

      // Close buttons have aria-label "Close tab" (both tabs + file tabs themselves)
      const closeButtons = screen.getAllByLabelText("Close tab");
      expect(closeButtons).toHaveLength(2);
    });

    it("calls onClose when close button is clicked", () => {
      const handleClose = vi.fn();
      render(
        <TabBar
          variant="files"
          tabs={fileTabs}
          activeTab="file1"
          onChange={() => {}}
          onClose={handleClose}
        />,
      );

      const closeButtons = screen.getAllByLabelText("Close tab");
      fireEvent.click(closeButtons[0]);

      expect(handleClose).toHaveBeenCalledWith("file1");
    });

    it("shows dirty indicator for dirty files", () => {
      const dirtyTabs = [
        { id: "file1", label: "index.tsx", closable: true, isDirty: true },
      ];
      const { container } = render(
        <TabBar
          variant="files"
          tabs={dirtyTabs}
          activeTab="file1"
          onChange={() => {}}
        />,
      );

      // Dirty indicator is a small circle (uses RADIUS_FULL token which renders as CSS var)
      const dirtyIndicator = container.querySelector('span[style*="border-radius"][style*="9999px"]');
      expect(dirtyIndicator).toBeInTheDocument();
    });
  });

  describe("icons variant", () => {
    const iconTabs = [
      { id: "folder", label: "Files", icon: <span data-testid="folder-icon">F</span> },
      { id: "search", label: "Search", icon: <span data-testid="search-icon">S</span> },
    ];

    it("renders icon tabs", () => {
      render(
        <TabBar
          variant="icons"
          tabs={iconTabs}
          activeTab="folder"
          onChange={() => {}}
        />,
      );

      expect(screen.getByTestId("folder-icon")).toBeInTheDocument();
      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });

    it("has aria-label on icon tabs", () => {
      render(
        <TabBar
          variant="icons"
          tabs={iconTabs}
          activeTab="folder"
          onChange={() => {}}
        />,
      );

      expect(screen.getByRole("tab", { name: "Files" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Search" })).toBeInTheDocument();
    });

    it("calls onChange when icon tab is clicked", () => {
      const handleChange = vi.fn();
      render(
        <TabBar
          variant="icons"
          tabs={iconTabs}
          activeTab="folder"
          onChange={handleChange}
        />,
      );

      fireEvent.click(screen.getByRole("tab", { name: "Search" }));

      expect(handleChange).toHaveBeenCalledWith("search");
    });
  });
});
