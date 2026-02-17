/**
 * @file LibraryBrowser mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { LibraryBrowser } from "../../LibraryBrowser";
import type { LibraryNode, LibraryLeafItem } from "../../types";

// Sample hierarchical data for testing
const sampleItems: LibraryNode[] = [
  {
    id: "basic",
    type: "category",
    label: "Basic Shapes",
    children: [
      { id: "rectangle", type: "item", label: "Rectangle", metadata: { type: "rectangle" } },
      { id: "circle", type: "item", label: "Circle", metadata: { type: "circle" } },
      { id: "triangle", type: "item", label: "Triangle", metadata: { type: "triangle" } },
    ],
  },
  {
    id: "flowchart",
    type: "category",
    label: "Flowchart",
    children: [
      {
        id: "flowchart-basic",
        type: "category",
        label: "Basic",
        children: [
          { id: "process", type: "item", label: "Process", metadata: { type: "process" } },
          { id: "decision", type: "item", label: "Decision", metadata: { type: "decision" } },
        ],
      },
      {
        id: "flowchart-connectors",
        type: "category",
        label: "Connectors",
        children: [
          { id: "arrow", type: "item", label: "Arrow", metadata: { type: "arrow" } },
          { id: "line", type: "item", label: "Line", metadata: { type: "line" } },
        ],
      },
    ],
  },
  {
    id: "icons",
    type: "category",
    label: "Icons",
    children: [
      { id: "star", type: "item", label: "Star", metadata: { type: "star" } },
      { id: "heart", type: "item", label: "Heart", metadata: { type: "heart" } },
      { id: "check", type: "item", label: "Check", metadata: { type: "check" } },
      { id: "cross", type: "item", label: "Cross", metadata: { type: "cross" } },
    ],
  },
];

/**
 * LibraryBrowser mount page for E2E testing.
 */
export default function LibraryBrowserMount() {
  const [lastAction, setLastAction] = useState<string>("none");
  const [lastItem, setLastItem] = useState<string>("none");
  const [dragCount, setDragCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  const handleDragStart = useCallback((item: LibraryLeafItem) => {
    setLastAction("drag-start");
    setLastItem(item.label);
    setDragCount((prev) => prev + 1);
  }, []);

  const handleItemClick = useCallback((item: LibraryLeafItem) => {
    setLastAction("click");
    setLastItem(item.label);
    setClickCount((prev) => prev + 1);
  }, []);

  const handleFilterClick = useCallback(() => {
    setLastAction("filter-click");
  }, []);

  return (
    <div className="library-mount">
      <div>
        <h1>LibraryBrowser E2E</h1>
        <div className="library-container" data-testid="library-browser">
          <LibraryBrowser
            items={sampleItems}
            searchPlaceholder="Search items..."
            showFilterButton
            onFilterClick={handleFilterClick}
            onDragStart={handleDragStart}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
      <div className="info-panel" data-testid="info-panel">
        <h2>Test Info</h2>
        <p>Last action: <span data-testid="last-action">{lastAction}</span></p>
        <p>Last item: <span data-testid="last-item">{lastItem}</span></p>
        <p>Drag count: <span data-testid="drag-count">{dragCount}</span></p>
        <p>Click count: <span data-testid="click-count">{clickCount}</span></p>
      </div>
    </div>
  );
}
