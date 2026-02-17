/**
 * @file FramePresetPicker - Dropdown for selecting frame presets
 */

import {
  memo,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffectEvent,
  useLayoutEffect,
  type CSSProperties,
} from "react";
import { LuFrame } from "react-icons/lu";
import { createPortal } from "react-dom";

import { IconButton } from "../../../../../components/IconButton/IconButton";
import { Tooltip } from "../../../../../components/Tooltip/Tooltip";
import { calculateFloatingPosition, rectToAnchor, useFloatingInteractions } from "../../../../../hooks";
import type { FramePreset } from "../types";
import { framePresets, framePresetCategories } from "../mockData";

// =============================================================================
// Styles
// =============================================================================

const dropdownStyle: CSSProperties = {
  position: "fixed",
  backgroundColor: "var(--rei-color-surface-raised)",
  border: "1px solid var(--rei-color-border)",
  borderRadius: "var(--rei-radius-lg)",
  boxShadow: "var(--rei-shadow-md)",
  padding: "8px",
  minWidth: "200px",
  zIndex: 1000,
};

const categoryHeaderStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--rei-color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: "8px 12px 4px",
};

const presetItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--rei-color-text)",
  cursor: "pointer",
  borderRadius: "var(--rei-radius-sm)",
  border: "none",
  background: "transparent",
  width: "100%",
  textAlign: "left",
};

const presetItemHoverStyle: CSSProperties = {
  ...presetItemStyle,
  backgroundColor: "var(--rei-color-hover)",
};

const presetSizeStyle: CSSProperties = {
  fontSize: 11,
  color: "var(--rei-color-text-muted)",
};

// =============================================================================
// Component
// =============================================================================

type FramePresetPickerProps = {
  onSelect: (preset: FramePreset) => void;
};

type PresetItemProps = {
  preset: FramePreset;
  onSelect: (preset: FramePreset) => void;
};

const PresetItem = memo(function PresetItem({ preset, onSelect }: PresetItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const info = framePresets[preset];

  const handleClick = useCallback(() => {
    onSelect(preset);
  }, [preset, onSelect]);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <button
      type="button"
      style={isHovered ? presetItemHoverStyle : presetItemStyle}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <span>{info.label}</span>
      <span style={presetSizeStyle}>{info.width} × {info.height}</span>
    </button>
  );
});

const DROPDOWN_ESTIMATED_HEIGHT = 300;

export const FramePresetPicker = memo(function FramePresetPicker({
  onSelect,
}: FramePresetPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useEffectEvent(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const anchor = rectToAnchor(rect);
      const { x, y } = calculateFloatingPosition({
        anchor,
        floatingWidth: 200, // minWidth from dropdownStyle
        floatingHeight: DROPDOWN_ESTIMATED_HEIGHT,
        placement: "bottom",
        offset: 4,
        includeScrollOffset: false, // Using position: fixed
      });
      setPosition({ top: y, left: x });
    }
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useFloatingInteractions({
    isOpen,
    onClose: handleClose,
    anchorRef: buttonRef,
    floatingRef: dropdownRef,
    onReposition: updatePosition,
  });

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSelect = useCallback((preset: FramePreset) => {
    onSelect(preset);
    setIsOpen(false);
  }, [onSelect]);

  const dropdownPositionStyle = useMemo<CSSProperties>(() => ({
    ...dropdownStyle,
    top: position.top,
    left: position.left,
  }), [position.top, position.left]);

  return (
    <>
      <div ref={buttonRef}>
        <Tooltip content="Add Frame (F)" placement="bottom">
          <IconButton
            icon={<LuFrame size={16} />}
            aria-label="Add Frame"
            aria-expanded={isOpen}
            aria-haspopup="menu"
            size="sm"
            onClick={handleToggle}
          />
        </Tooltip>
      </div>
      {isOpen && createPortal(
        <div ref={dropdownRef} style={dropdownPositionStyle} role="menu">
          {framePresetCategories.map((category) => (
            <div key={category.id}>
              <div style={categoryHeaderStyle}>{category.label}</div>
              {category.presets.map((preset) => (
                <PresetItem
                  key={preset}
                  preset={preset}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
});
