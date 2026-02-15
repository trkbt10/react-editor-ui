/**
 * @file LayerItem component tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayerItem } from "./LayerItem";

describe("LayerItem", () => {
  it("renders with label", () => {
    render(<LayerItem id="layer-1" label="Frame 1" />);
    expect(screen.getByText("Frame 1")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    const icon = <span data-testid="icon">Icon</span>;
    render(<LayerItem id="layer-1" label="Frame 1" icon={icon} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies selected style", () => {
    const { container } = render(<LayerItem id="layer-1" label="Frame 1" selected />);
    const item = container.querySelector('[role="treeitem"]');
    expect(item).toHaveAttribute("aria-selected", "true");
  });

  it("calls onPointerDown when pointer down occurs", () => {
    const onPointerDown = vi.fn();
    render(<LayerItem id="layer-1" label="Frame 1" onPointerDown={onPointerDown} />);
    fireEvent.pointerDown(screen.getByRole("treeitem"));
    expect(onPointerDown).toHaveBeenCalled();
  });

  it("passes modifier keys in onPointerDown event", () => {
    const onPointerDown = vi.fn();
    render(<LayerItem id="layer-1" label="Frame 1" onPointerDown={onPointerDown} />);

    // Shift+click
    fireEvent.pointerDown(screen.getByRole("treeitem"), { shiftKey: true });
    expect(onPointerDown).toHaveBeenCalled();
    expect(onPointerDown.mock.calls[0][0].shiftKey).toBe(true);

    // Cmd/Ctrl+click
    onPointerDown.mockClear();
    fireEvent.pointerDown(screen.getByRole("treeitem"), { metaKey: true });
    expect(onPointerDown.mock.calls[0][0].metaKey).toBe(true);

    // Cmd/Ctrl+Shift+click
    onPointerDown.mockClear();
    fireEvent.pointerDown(screen.getByRole("treeitem"), { metaKey: true, shiftKey: true });
    expect(onPointerDown.mock.calls[0][0].metaKey).toBe(true);
    expect(onPointerDown.mock.calls[0][0].shiftKey).toBe(true);
  });

  it("toggles visibility when eye icon clicked", () => {
    const onVisibilityChange = vi.fn();
    const { container } = render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        visible={true}
        onVisibilityChange={onVisibilityChange}
      />
    );

    // Hover to show buttons
    const item = container.querySelector('[role="treeitem"]') as HTMLElement;
    fireEvent.pointerEnter(item);

    // Click visibility button
    const visibilityBtn = screen.getByTestId("visibility-toggle");
    fireEvent.pointerUp(visibilityBtn);

    expect(onVisibilityChange).toHaveBeenCalledWith(false);
  });

  it("toggles lock when lock icon clicked", () => {
    const onLockChange = vi.fn();
    const { container } = render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        locked={false}
        onLockChange={onLockChange}
      />
    );

    // Hover to show buttons
    const item = container.querySelector('[role="treeitem"]') as HTMLElement;
    fireEvent.pointerEnter(item);

    // Click lock button
    const lockBtn = screen.getByTestId("lock-toggle");
    fireEvent.pointerUp(lockBtn);

    expect(onLockChange).toHaveBeenCalledWith(true);
  });

  it("shows expand button for items with children", () => {
    render(
      <LayerItem
        id="layer-1"
        label="Group"
        hasChildren
        expanded={false}
      />
    );
    expect(screen.getByRole("button", { name: /expand/i })).toBeInTheDocument();
  });

  it("calls onToggle when expander clicked", () => {
    const onToggle = vi.fn();
    render(
      <LayerItem
        id="layer-1"
        label="Group"
        hasChildren
        expanded={false}
        onToggle={onToggle}
      />
    );

    const expandBtn = screen.getByRole("button", { name: /expand/i });
    fireEvent.click(expandBtn);

    expect(onToggle).toHaveBeenCalled();
  });

  it("enters edit mode on double pointer tap when renamable", () => {
    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        renamable
        onRename={() => {}}
      />
    );

    const item = screen.getByRole("treeitem");
    // Simulate double tap by firing two pointerUp events quickly
    fireEvent.pointerUp(item);
    fireEvent.pointerUp(item);

    expect(screen.getByTestId("layer-name-input")).toBeInTheDocument();
  });

  it("does not enter edit mode when locked", () => {
    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        renamable
        locked
        onRename={() => {}}
      />
    );

    const item = screen.getByRole("treeitem");
    fireEvent.pointerUp(item);
    fireEvent.pointerUp(item);

    expect(screen.queryByTestId("layer-name-input")).not.toBeInTheDocument();
  });

  it("calls onRename when editing is completed", () => {
    const onRename = vi.fn();
    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        renamable
        onRename={onRename}
      />
    );

    // Enter edit mode
    const item = screen.getByRole("treeitem");
    fireEvent.pointerUp(item);
    fireEvent.pointerUp(item);

    const input = screen.getByTestId("layer-name-input");

    // Change value
    fireEvent.change(input, { target: { value: "New Name" } });

    // Press Enter
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onRename).toHaveBeenCalledWith("New Name");
  });

  it("cancels editing on Escape", () => {
    const onRename = vi.fn();
    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        renamable
        onRename={onRename}
      />
    );

    // Enter edit mode
    const item = screen.getByRole("treeitem");
    fireEvent.pointerUp(item);
    fireEvent.pointerUp(item);

    const input = screen.getByTestId("layer-name-input");

    // Change value
    fireEvent.change(input, { target: { value: "New Name" } });

    // Press Escape
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.queryByTestId("layer-name-input")).not.toBeInTheDocument();
    expect(screen.getByText("Frame 1")).toBeInTheDocument();
  });

  it("applies dimmed style when dimmed prop is true", () => {
    render(<LayerItem id="layer-1" label="Frame 1" dimmed />);
    const item = screen.getByTestId("layer-item-layer-1");
    expect(item.style.opacity).toBe("0.5");
  });

  it("applies dimmed style when not visible", () => {
    render(<LayerItem id="layer-1" label="Frame 1" visible={false} />);
    const item = screen.getByTestId("layer-item-layer-1");
    expect(item.style.opacity).toBe("0.5");
  });

  it("renders badge", () => {
    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        badge={<span data-testid="badge">Badge</span>}
      />
    );
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("supports depth for indentation", () => {
    render(<LayerItem id="layer-1" label="Frame 1" depth={2} />);
    const item = screen.getByTestId("layer-item-layer-1");
    expect(item.style.paddingLeft).toContain("2");
  });

  it("sets draggable attribute when draggable prop is true", () => {
    render(<LayerItem id="layer-1" label="Frame 1" draggable />);
    const item = screen.getByTestId("layer-item-layer-1");
    expect(item.draggable).toBe(true);
  });

  it("shows context menu on right click", () => {
    const contextMenuItems = [
      { id: "rename", label: "Rename" },
      { id: "delete", label: "Delete", danger: true },
    ];

    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        contextMenuItems={contextMenuItems}
        onContextMenu={() => {}}
      />
    );

    fireEvent.contextMenu(screen.getByRole("treeitem"));

    expect(screen.getByTestId("context-menu")).toBeInTheDocument();
    expect(screen.getByTestId("context-menu-item-rename")).toBeInTheDocument();
    expect(screen.getByTestId("context-menu-item-delete")).toBeInTheDocument();
  });

  it("calls onContextMenu when menu item clicked", () => {
    const onContextMenu = vi.fn();
    const contextMenuItems = [
      { id: "rename", label: "Rename" },
    ];

    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        contextMenuItems={contextMenuItems}
        onContextMenu={onContextMenu}
      />
    );

    // Open context menu
    fireEvent.contextMenu(screen.getByRole("treeitem"));

    // Click menu item
    fireEvent.click(screen.getByTestId("context-menu-item-rename"));

    expect(onContextMenu).toHaveBeenCalledWith("rename");
  });

  it("shows drop indicator when dropPosition is before", () => {
    render(<LayerItem id="layer-1" label="Frame 1" dropPosition="before" />);
    expect(screen.getByTestId("drop-indicator-before")).toBeInTheDocument();
  });

  it("shows drop indicator when dropPosition is after", () => {
    render(<LayerItem id="layer-1" label="Frame 1" dropPosition="after" />);
    expect(screen.getByTestId("drop-indicator-after")).toBeInTheDocument();
  });

  it("highlights when dropPosition is inside", () => {
    render(<LayerItem id="layer-1" label="Frame 1" dropPosition="inside" />);
    const item = screen.getByTestId("layer-item-layer-1");
    expect(item.style.outline).toContain("2px solid");
  });

  it("fires drag events", () => {
    const onDragStart = vi.fn();
    const onDragOver = vi.fn();
    const onDrop = vi.fn();
    const onDragEnd = vi.fn();

    render(
      <LayerItem
        id="layer-1"
        label="Frame 1"
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />
    );

    const item = screen.getByTestId("layer-item-layer-1");

    fireEvent.dragStart(item);
    expect(onDragStart).toHaveBeenCalled();

    fireEvent.dragOver(item);
    expect(onDragOver).toHaveBeenCalled();

    fireEvent.drop(item);
    expect(onDrop).toHaveBeenCalled();

    fireEvent.dragEnd(item);
    expect(onDragEnd).toHaveBeenCalled();
  });
});
