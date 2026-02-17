/**
 * @file DiagramToolbar - Simple title bar for the diagram editor with undo/redo
 */

import { memo, useContext, type CSSProperties } from "react";
import { LuUndo2, LuRedo2 } from "react-icons/lu";

import { IconButton } from "../../../../../components/IconButton/IconButton";
import { Tooltip } from "../../../../../components/Tooltip/Tooltip";
import { HistoryContext } from "../contexts";

// =============================================================================
// Styles
// =============================================================================

const toolbarContainerStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  backgroundColor: "var(--rei-color-surface)",
  borderBottom: "1px solid var(--rei-color-border)",
  gap: 8,
};

const titleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--rei-color-text)",
};

const spacerStyle: CSSProperties = {
  flex: 1,
};

const historyGroupStyle: CSSProperties = {
  display: "flex",
  gap: 4,
};

// =============================================================================
// Component
// =============================================================================

export const DiagramToolbar = memo(function DiagramToolbar() {
  const historyCtx = useContext(HistoryContext);

  return (
    <div style={toolbarContainerStyle}>
      <span style={titleStyle}>Diagram Editor</span>
      <div style={spacerStyle} />
      {historyCtx && (
        <div style={historyGroupStyle}>
          <Tooltip content="Undo (Cmd+Z)" placement="bottom">
            <IconButton
              icon={<LuUndo2 size={16} />}
              aria-label="Undo"
              size="sm"
              variant="minimal"
              disabled={!historyCtx.canUndo}
              onClick={historyCtx.undo}
            />
          </Tooltip>
          <Tooltip content="Redo (Cmd+Shift+Z)" placement="bottom">
            <IconButton
              icon={<LuRedo2 size={16} />}
              aria-label="Redo"
              size="sm"
              variant="minimal"
              disabled={!historyCtx.canRedo}
              onClick={historyCtx.redo}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
});
