/**
 * @file LibraryBrowser demo page
 */

import { useState, useCallback } from "react";
import { DemoContainer, DemoSection, DemoSurface } from "../../components";
import { LibraryBrowser } from "../../../components/LibraryBrowser/LibraryBrowser";
import type {
  LibraryNode,
  LibraryLeafItem,
} from "../../../components/LibraryBrowser/types";

// Sample hierarchical data
const sampleItems: LibraryNode[] = [
  {
    id: "basic",
    type: "category",
    label: "Basic Shapes",
    children: [
      {
        id: "rectangle",
        type: "item",
        label: "Rectangle",
        metadata: { type: "rectangle" },
      },
      {
        id: "circle",
        type: "item",
        label: "Circle",
        metadata: { type: "circle" },
      },
      {
        id: "triangle",
        type: "item",
        label: "Triangle",
        metadata: { type: "triangle" },
      },
      {
        id: "ellipse",
        type: "item",
        label: "Ellipse",
        metadata: { type: "ellipse" },
      },
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
          {
            id: "process",
            type: "item",
            label: "Process",
            metadata: { type: "process" },
          },
          {
            id: "decision",
            type: "item",
            label: "Decision",
            metadata: { type: "decision" },
          },
          {
            id: "terminal",
            type: "item",
            label: "Terminal",
            metadata: { type: "terminal" },
          },
        ],
      },
      {
        id: "flowchart-connectors",
        type: "category",
        label: "Connectors",
        children: [
          {
            id: "arrow",
            type: "item",
            label: "Arrow",
            metadata: { type: "arrow" },
          },
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
  {
    id: "arrows",
    type: "category",
    label: "Arrows & Pointers",
    children: [
      {
        id: "arrow-right",
        type: "item",
        label: "Arrow Right",
        metadata: { type: "arrow-right" },
      },
      {
        id: "arrow-left",
        type: "item",
        label: "Arrow Left",
        metadata: { type: "arrow-left" },
      },
      {
        id: "chevron",
        type: "item",
        label: "Chevron",
        metadata: { type: "chevron" },
      },
    ],
  },
];

export function LibraryBrowserDemo() {
  const [lastAction, setLastAction] = useState<string>("none");
  const [lastItem, setLastItem] = useState<string>("none");

  const handleDragStart = useCallback((item: LibraryLeafItem) => {
    setLastAction("drag-start");
    setLastItem(item.label);
  }, []);

  const handleItemClick = useCallback((item: LibraryLeafItem) => {
    setLastAction("click");
    setLastItem(item.label);
  }, []);

  const handleFilterClick = useCallback(() => {
    setLastAction("filter-click");
    setLastItem("none");
  }, []);

  return (
    <DemoContainer title="LibraryBrowser">
      <DemoSection label="Hierarchical Navigation">
        <div style={{ height: 400, borderRadius: 4, overflow: "hidden" }}>
          <DemoSurface>
            <LibraryBrowser
              items={sampleItems}
              searchPlaceholder="Search items..."
              showFilterButton
              onFilterClick={handleFilterClick}
              onDragStart={handleDragStart}
              onItemClick={handleItemClick}
            />
          </DemoSurface>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          Last action: <strong>{lastAction}</strong>
          {lastItem !== "none" && (
            <>
              {" "}
              | Item: <strong>{lastItem}</strong>
            </>
          )}
        </p>
      </DemoSection>

      <DemoSection label="Without Filter Button">
        <div style={{ height: 300, borderRadius: 4, overflow: "hidden" }}>
          <DemoSurface>
            <LibraryBrowser
              items={sampleItems.slice(0, 2)}
              searchPlaceholder="Search shapes..."
              showFilterButton={false}
              onItemClick={handleItemClick}
            />
          </DemoSurface>
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
