/**
 * @file LayerItem demo page
 */

import { useState, useCallback, useMemo, useRef } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  DemoMutedText,
  FrameLayerIcon,
  TextLayerIcon,
  ImageLayerIcon,
  ComponentLayerIcon,
} from "../../components";
import { LayerItem } from "../../../components/LayerItem/LayerItem";
import { Badge } from "../../../components/Badge/Badge";

type LayerData = {
  id: string;
  label: string;
  type: "frame" | "text" | "image" | "component";
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  order: number;
};

type DropInfo = {
  targetId: string;
  position: "before" | "inside" | "after";
} | null;

// Optimized layer tree utilities using Map for O(1) lookups
function createLayerMap(layers: LayerData[]): Map<string, LayerData> {
  return new Map(layers.map((l) => [l.id, l]));
}

function createChildrenMap(layers: LayerData[]): Map<string | null, LayerData[]> {
  const map = new Map<string | null, LayerData[]>();
  for (const layer of layers) {
    const children = map.get(layer.parentId) ?? [];
    children.push(layer);
    map.set(layer.parentId, children);
  }
  // Sort children by order
  for (const [, children] of map) {
    children.sort((a, b) => a.order - b.order);
  }
  return map;
}

function getDepthWithMap(id: string, layerMap: Map<string, LayerData>): number {
  const layer = layerMap.get(id);
  if (!layer || !layer.parentId) {
    return 0;
  }
  return getDepthWithMap(layer.parentId, layerMap) + 1;
}

function isDescendantWithMap(childId: string, ancestorId: string, layerMap: Map<string, LayerData>): boolean {
  const child = layerMap.get(childId);
  if (!child || !child.parentId) {
    return false;
  }
  if (child.parentId === ancestorId) {
    return true;
  }
  return isDescendantWithMap(child.parentId, ancestorId, layerMap);
}

function getVisibleLayersOrdered(
  childrenMap: Map<string | null, LayerData[]>,
  expandedIds: Set<string>,
  parentId: string | null = null,
): LayerData[] {
  const result: LayerData[] = [];
  const children = childrenMap.get(parentId) ?? [];
  for (const child of children) {
    result.push(child);
    if (expandedIds.has(child.id)) {
      result.push(...getVisibleLayersOrdered(childrenMap, expandedIds, child.id));
    }
  }
  return result;
}

function DragStatusDisplay({
  selectedIds,
  draggedId,
  dropInfo,
  layerMap,
  layers,
}: {
  selectedIds: Set<string>;
  draggedId: string;
  dropInfo: DropInfo;
  layerMap: Map<string, LayerData>;
  layers: LayerData[];
}) {
  const getDragLabel = () => {
    if (selectedIds.size > 1) {
      return `${selectedIds.size} layers`;
    }
    return layerMap.get(draggedId)?.label ?? "";
  };

  const getDropTarget = () => {
    if (!dropInfo) {
      return "";
    }
    const targetLabel = layers.find((l) => l.id === dropInfo.targetId)?.label ?? "";
    return ` → ${dropInfo.position} "${targetLabel}"`;
  };

  return (
    <div style={{ color: "var(--rei-color-primary)", fontSize: 11 }}>
      Dragging: {getDragLabel()}
      {getDropTarget()}
    </div>
  );
}

export function LayerItemDemo() {
  const [layers, setLayers] = useState<LayerData[]>([
    { id: "1", label: "Main Frame", type: "frame", visible: true, locked: false, parentId: null, order: 0 },
    { id: "2", label: "Header", type: "frame", visible: true, locked: false, parentId: "1", order: 0 },
    { id: "3", label: "Logo", type: "image", visible: true, locked: false, parentId: "2", order: 0 },
    { id: "4", label: "Navigation", type: "text", visible: true, locked: false, parentId: "2", order: 1 },
    { id: "5", label: "Content", type: "frame", visible: true, locked: false, parentId: "1", order: 1 },
    { id: "6", label: "Card", type: "component", visible: false, locked: false, parentId: "5", order: 0 },
    { id: "7", label: "Footer", type: "text", visible: true, locked: true, parentId: "1", order: 2 },
    { id: "8", label: "Background", type: "frame", visible: true, locked: false, parentId: null, order: 1 },
  ]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["1", "2", "5"]));
  // Multi-selection support
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["1"]));
  const [lastClickedId, setLastClickedId] = useState<string | null>("1");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropInfo, setDropInfo] = useState<DropInfo>(null);
  const [lastAction, setLastAction] = useState<string>("");

  // Precompute maps for O(1) lookups (memoized to avoid recomputation on unrelated state changes)
  const layerMap = useMemo(() => createLayerMap(layers), [layers]);
  const childrenMap = useMemo(() => createChildrenMap(layers), [layers]);
  const visibleLayers = useMemo(
    () => getVisibleLayersOrdered(childrenMap, expandedIds),
    [childrenMap, expandedIds]
  );

  // Memoized icon elements to avoid creating new references each render
  const iconMap = useMemo(() => ({
    frame: <FrameLayerIcon />,
    text: <TextLayerIcon />,
    image: <ImageLayerIcon />,
    component: <ComponentLayerIcon />,
  }), []);

  const getIcon = useCallback((type: LayerData["type"]) => iconMap[type], [iconMap]);

  // Memoized component badge
  const componentBadge = useMemo(() => <Badge size="sm" variant="primary">C</Badge>, []);

  // Stable no-op handler for static examples
  const noopHandler = useCallback(() => {}, []);

  const canHaveChildren = (type: LayerData["type"]) => type === "frame";

  const hasChildren = (id: string): boolean => {
    return (childrenMap.get(id)?.length ?? 0) > 0;
  };

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Selection handlers with Shift and Cmd/Ctrl support
  const handlePointerDownForSelection = (id: string, e: React.PointerEvent) => {
    const isMeta = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // Right-click on selected item: preserve selection for context menu
    if (e.button === 2 && selectedIds.has(id)) {
      return;
    }

    if (isShift && lastClickedId) {
      // Shift+click: range selection
      const startIdx = visibleLayers.findIndex((l) => l.id === lastClickedId);
      const endIdx = visibleLayers.findIndex((l) => l.id === id);
      if (startIdx !== -1 && endIdx !== -1) {
        const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        const rangeIds = visibleLayers.slice(from, to + 1).map((l) => l.id);

        if (isMeta) {
          // Shift+Cmd/Ctrl: add range to existing selection
          setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
        } else {
          // Shift only: replace selection with range
          setSelectedIds(new Set(rangeIds));
        }
        setLastAction(`Selected ${rangeIds.length} layers (range)`);
      }
    } else if (isMeta) {
      // Cmd/Ctrl+click: toggle selection
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      setLastClickedId(id);
      setLastAction(`Toggle selection: ${layerMap.get(id)?.label}`);
    } else {
      // Normal click: single selection
      setSelectedIds(new Set([id]));
      setLastClickedId(id);
    }
  };

  const handleVisibilityChange = (id: string, visible: boolean) => {
    // Apply to all selected if this layer is selected
    const idsToUpdate = selectedIds.has(id) ? [...selectedIds] : [id];
    setLayers((prev) =>
      prev.map((l) => (idsToUpdate.includes(l.id) ? { ...l, visible } : l))
    );
    setLastAction(`Set visibility=${visible} for ${idsToUpdate.length} layer(s)`);
  };

  const handleLockChange = (id: string, locked: boolean) => {
    // Apply to all selected if this layer is selected
    const idsToUpdate = selectedIds.has(id) ? [...selectedIds] : [id];
    setLayers((prev) =>
      prev.map((l) => (idsToUpdate.includes(l.id) ? { ...l, locked } : l))
    );
    setLastAction(`Set locked=${locked} for ${idsToUpdate.length} layer(s)`);
  };

  const handleRename = (id: string, newLabel: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, label: newLabel } : l))
    );
  };

  const handleDelete = (id: string) => {
    // Delete selected layers and all their descendants
    const idsToDelete = selectedIds.has(id) ? [...selectedIds] : [id];
    const toDelete = new Set<string>(idsToDelete);

    // Add all descendants
    let changed = true;
    while (changed) {
      changed = false;
      for (const layer of layers) {
        if (layer.parentId && toDelete.has(layer.parentId) && !toDelete.has(layer.id)) {
          toDelete.add(layer.id);
          changed = true;
        }
      }
    }

    setLayers((prev) => prev.filter((l) => !toDelete.has(l.id)));
    setSelectedIds(new Set());
    setLastClickedId(null);
    setLastAction(`Deleted ${toDelete.size} layer(s)`);
  };

  const handleContextMenu = (id: string, action: string) => {
    switch (action) {
      case "delete":
        handleDelete(id);
        break;
      case "duplicate": {
        // Duplicate all selected layers
        const idsToDuplicate = selectedIds.has(id) ? [...selectedIds] : [id];
        const newLayers: LayerData[] = [];

        for (const dupId of idsToDuplicate) {
          const layer = layerMap.get(dupId);
          if (layer) {
            const siblings = childrenMap.get(layer.parentId) ?? [];
            const maxOrder = Math.max(...siblings.map((l) => l.order), -1);
            newLayers.push({
              ...layer,
              id: `${Date.now()}-${dupId}`,
              label: `${layer.label} Copy`,
              order: maxOrder + 1 + newLayers.length,
            });
          }
        }

        setLayers((prev) => [...prev, ...newLayers]);
        setLastAction(`Duplicated ${newLayers.length} layer(s)`);
        break;
      }
      case "selectAll": {
        setSelectedIds(new Set(visibleLayers.map((l) => l.id)));
        setLastAction("Selected all visible layers");
        break;
      }
      case "deselectAll": {
        setSelectedIds(new Set());
        setLastClickedId(null);
        setLastAction("Deselected all");
        break;
      }
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    // If dragging an unselected item, select only that item
    if (!selectedIds.has(id)) {
      setSelectedIds(new Set([id]));
      setLastClickedId(id);
    }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || selectedIds.has(targetId)) {
      // Only update if currently has a value
      if (dropInfo !== null) {
        setDropInfo(null);
      }
      return;
    }

    // Prevent dropping onto descendants of any selected item
    for (const selId of selectedIds) {
      if (isDescendantWithMap(targetId, selId, layerMap)) {
        if (dropInfo !== null) {
          setDropInfo(null);
        }
        return;
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const targetLayer = layerMap.get(targetId);

    // Determine drop position based on mouse position
    let newPosition: "before" | "inside" | "after";
    if (y < height * 0.25) {
      newPosition = "before";
    } else if (y > height * 0.75) {
      newPosition = "after";
    } else if (targetLayer && canHaveChildren(targetLayer.type)) {
      newPosition = "inside";
    } else {
      newPosition = y < height * 0.5 ? "before" : "after";
    }

    // Only update state if the value actually changed
    if (dropInfo?.targetId !== targetId || dropInfo?.position !== newPosition) {
      setDropInfo({ targetId, position: newPosition });
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || !dropInfo || selectedIds.has(targetId)) {
      setDropInfo(null);
      setDraggedId(null);
      return;
    }

    const targetLayer = layerMap.get(targetId);
    if (!targetLayer) {
      setDropInfo(null);
      setDraggedId(null);
      return;
    }

    // Move all selected layers
    setLayers((prev) => {
      const newLayers = prev.filter((l) => !selectedIds.has(l.id));
      const movedLayers = prev.filter((l) => selectedIds.has(l.id)).map((l) => ({ ...l }));

      if (dropInfo.position === "inside") {
        // Insert as children of target
        const existingChildren = newLayers.filter((l) => l.parentId === targetId);
        let orderOffset = existingChildren.length;

        for (const moved of movedLayers) {
          moved.parentId = targetId;
          moved.order = orderOffset++;
        }

        setExpandedIds((prev) => new Set([...prev, targetId]));
        setLastAction(`Moved ${movedLayers.length} layer(s) into "${targetLayer.label}"`);
      } else {
        // Insert before or after target at same level
        const siblings = newLayers.filter((l) => l.parentId === targetLayer.parentId);
        const targetOrder = targetLayer.order;
        const insertOrder = dropInfo.position === "before" ? targetOrder : targetOrder + 1;

        // Shift orders of items at or after insert position
        for (const sibling of siblings) {
          if (sibling.order >= insertOrder) {
            sibling.order += movedLayers.length;
          }
        }

        let orderOffset = 0;
        for (const moved of movedLayers) {
          moved.parentId = targetLayer.parentId;
          moved.order = insertOrder + orderOffset++;
        }

        const getParentLabel = () => {
          if (!targetLayer.parentId) {
            return "root";
          }
          return layerMap.get(targetLayer.parentId)?.label ?? "unknown";
        };
        setLastAction(
          `Moved ${movedLayers.length} layer(s) ${dropInfo.position} "${targetLayer.label}" (in ${getParentLabel()})`
        );
      }

      return [...newLayers, ...movedLayers];
    });

    setDropInfo(null);
    setDraggedId(null);
  };

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropInfo(null);
  }, []);

  // Store the latest handlers in refs so cached callbacks can access current versions
  const handlersRef = useRef({
    handleToggle,
    handlePointerDownForSelection,
    handleVisibilityChange,
    handleLockChange,
    handleRename,
    handleContextMenu,
    handleDragStart,
    handleDragOver,
    handleDrop,
  });
  // Update refs on every render to keep handlers current
  handlersRef.current = {
    handleToggle,
    handlePointerDownForSelection,
    handleVisibilityChange,
    handleLockChange,
    handleRename,
    handleContextMenu,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };

  // Memoized callback factory for stable references
  // Callbacks access handlers via ref to always get current versions
  const callbackCache = useRef(new Map<string, {
    onToggle: () => void;
    onPointerDown: (e: React.PointerEvent) => void;
    onVisibilityChange: (v: boolean) => void;
    onLockChange: (l: boolean) => void;
    onRename: (newLabel: string) => void;
    onContextMenu: (action: string) => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  }>());

  const getCallbacks = useCallback((id: string) => {
    if (!callbackCache.current.has(id)) {
      callbackCache.current.set(id, {
        onToggle: () => handlersRef.current.handleToggle(id),
        onPointerDown: (e: React.PointerEvent) => handlersRef.current.handlePointerDownForSelection(id, e),
        onVisibilityChange: (v: boolean) => handlersRef.current.handleVisibilityChange(id, v),
        onLockChange: (l: boolean) => handlersRef.current.handleLockChange(id, l),
        onRename: (newLabel: string) => handlersRef.current.handleRename(id, newLabel),
        onContextMenu: (action: string) => handlersRef.current.handleContextMenu(id, action),
        onDragStart: (e: React.DragEvent) => handlersRef.current.handleDragStart(e, id),
        onDragOver: (e: React.DragEvent) => handlersRef.current.handleDragOver(e, id),
        onDrop: (e: React.DragEvent) => handlersRef.current.handleDrop(e, id),
      });
    }
    return callbackCache.current.get(id)!;
  }, []);

  const contextMenuItems = useMemo(() => [
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: `Duplicate${selectedIds.size > 1 ? ` (${selectedIds.size})` : ""}` },
    { id: "divider1", label: "", divider: true },
    { id: "selectAll", label: "Select All" },
    { id: "deselectAll", label: "Deselect All", disabled: selectedIds.size === 0 },
    { id: "divider2", label: "", divider: true },
    { id: "delete", label: `Delete${selectedIds.size > 1 ? ` (${selectedIds.size})` : ""}`, danger: true },
  ], [selectedIds.size]);

  return (
    <DemoContainer title="LayerItem">
      <DemoSection label="Figma-style Layer Panel (Full DnD)">
        <DemoMutedText>
          Click to select. Shift+click for range. Cmd/Ctrl+click for multi-select. Drag to reorder.
        </DemoMutedText>
        <DemoSurface>
          <div style={{ width: "300px" }}>
            {visibleLayers.map((layer) => {
              const parent = layer.parentId ? layerMap.get(layer.parentId) : null;
              const isDimmed = parent ? !parent.visible : false;
              const depth = getDepthWithMap(layer.id, layerMap);
              const isContainer = canHaveChildren(layer.type);
              const layerHasChildren = hasChildren(layer.id);
              const currentDropPosition = dropInfo?.targetId === layer.id ? dropInfo.position : null;
              const isSelected = selectedIds.has(layer.id);
              const callbacks = getCallbacks(layer.id);

              return (
                <LayerItem
                  key={layer.id}
                  id={layer.id}
                  label={layer.label}
                  icon={getIcon(layer.type)}
                  depth={depth}
                  hasChildren={layerHasChildren}
                  expanded={expandedIds.has(layer.id)}
                  onToggle={callbacks.onToggle}
                  selected={isSelected}
                  onPointerDown={callbacks.onPointerDown}
                  visible={layer.visible}
                  onVisibilityChange={callbacks.onVisibilityChange}
                  locked={layer.locked}
                  onLockChange={callbacks.onLockChange}
                  renamable
                  onRename={callbacks.onRename}
                  contextMenuItems={contextMenuItems}
                  onContextMenu={callbacks.onContextMenu}
                  dimmed={isDimmed}
                  badge={layer.type === "component" ? componentBadge : undefined}
                  draggable
                  canHaveChildren={isContainer}
                  dropPosition={currentDropPosition}
                  onDragStart={callbacks.onDragStart}
                  onDragOver={callbacks.onDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={callbacks.onDrop}
                />
              );
            })}
          </div>
        </DemoSurface>
        <DemoMutedText>
          Selected: {selectedIds.size} layer(s)
          {lastAction ? ` | Last: ${lastAction}` : ""}
        </DemoMutedText>
        {draggedId && (
          <DragStatusDisplay
            selectedIds={selectedIds}
            draggedId={draggedId}
            dropInfo={dropInfo}
            layerMap={layerMap}
            layers={layers}
          />
        )}
      </DemoSection>

      <DemoSection label="States">
        <DemoSurface>
          <div style={{ width: "280px" }}>
            <LayerItem
              id="state-1"
              label="Selected"
              icon={iconMap.frame}
              selected
              visible
              onVisibilityChange={noopHandler}
            />
            <LayerItem
              id="state-2"
              label="Hidden Layer"
              icon={iconMap.image}
              visible={false}
              onVisibilityChange={noopHandler}
            />
            <LayerItem
              id="state-3"
              label="Locked Layer"
              icon={iconMap.text}
              visible
              locked
              onLockChange={noopHandler}
            />
            <LayerItem
              id="state-4"
              label="Dimmed Layer"
              icon={iconMap.frame}
              dimmed
              visible
            />
          </div>
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Minimal (no toggles)">
        <DemoSurface>
          <div style={{ width: "280px" }}>
            <LayerItem
              id="minimal-1"
              label="Simple Layer"
              icon={iconMap.frame}
              showVisibilityToggle={false}
              showLockToggle={false}
            />
          </div>
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
