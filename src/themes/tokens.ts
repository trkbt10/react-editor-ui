/**
 * @file Theme token type definitions and base tokens
 *
 * This file contains only token types and theme-independent base values.
 * Theme-specific color tokens are in ./presets/
 */

/**
 * Base tokens - theme-independent structural values
 * @category spacing
 */
export type BaseTokens = {
  // -------------------------------------------------------------------------
  // @group Spacing
  // Consistent spacing scale for margins, paddings, and gaps
  // -------------------------------------------------------------------------

  /** 2x extra small spacing (1px) - hairline gaps, minimal separators */
  "space-2xs": string;
  /** Extra small spacing (2px) - tight spacing for dense UIs */
  "space-xs": string;
  /** Small spacing (4px) - default gap between related elements */
  "space-sm": string;
  /** Medium spacing (8px) - standard padding and margins */
  "space-md": string;
  /** Large spacing (12px) - section separators */
  "space-lg": string;
  /** Extra large spacing (16px) - major section breaks */
  "space-xl": string;
  /** 2x extra large spacing (24px) - page-level spacing */
  "space-2xl": string;

  // -------------------------------------------------------------------------
  // @group Font Sizes
  // Typography scale for consistent text hierarchy
  // -------------------------------------------------------------------------

  /** Extra small font (9px) - labels, badges, timestamps */
  "size-font-xs": string;
  /** Small font (11px) - secondary text, captions */
  "size-font-sm": string;
  /** Medium font (12px) - default body text */
  "size-font-md": string;
  /** Large font (14px) - headings, emphasis */
  "size-font-lg": string;

  // -------------------------------------------------------------------------
  // @group Icon Sizes
  // Standardized icon dimensions for visual consistency
  // -------------------------------------------------------------------------

  /** Small icon (12px) - inline icons, indicators */
  "size-icon-sm": string;
  /** Medium icon (14px) - default button icons */
  "size-icon-md": string;
  /** Large icon (18px) - toolbar icons, prominent actions */
  "size-icon-lg": string;
  /** Extra large icon (24px) - hero icons, empty states */
  "size-icon-xl": string;

  // -------------------------------------------------------------------------
  // @group Component Heights
  // Standard heights for interactive elements
  // -------------------------------------------------------------------------

  /** Extra small height (14px) - badges, micro elements */
  "size-height-xs": string;
  /** Small height (22px) - compact buttons, inputs */
  "size-height-sm": string;
  /** Medium height (28px) - default buttons, inputs */
  "size-height-md": string;
  /** Large height (32px) - emphasized actions */
  "size-height-lg": string;
  /** Extra large height (40px) - primary CTAs, hero elements */
  "size-height-xl": string;

  // -------------------------------------------------------------------------
  // @group Border Radius
  // Corner rounding for visual softness
  // -------------------------------------------------------------------------

  /** Small radius (5px) - subtle rounding */
  "radius-sm": string;
  /** Medium radius (6px) - default component rounding */
  "radius-md": string;
  /** Large radius (10px) - cards, modals */
  "radius-lg": string;
  /** Full radius (9999px) - pills, circular elements */
  "radius-full": string;

  // -------------------------------------------------------------------------
  // @group Z-Index
  // Layering hierarchy for overlapping elements
  // -------------------------------------------------------------------------

  /** Dropdown z-index (1000) - select menus, autocomplete */
  "z-dropdown": string;
  /** Sticky z-index (1100) - sticky headers, toolbars */
  "z-sticky": string;
  /** Modal z-index (1200) - dialogs, modal overlays */
  "z-modal": string;
  /** Popover z-index (1300) - popovers, floating panels */
  "z-popover": string;
  /** Tooltip z-index (1400) - tooltips (topmost layer) */
  "z-tooltip": string;

  // -------------------------------------------------------------------------
  // @group Transition Duration
  // Animation timing for smooth interactions
  // -------------------------------------------------------------------------

  /** Fast transition (100ms) - hover states, micro-interactions */
  "duration-fast": string;
  /** Normal transition (200ms) - standard animations */
  "duration-normal": string;
  /** Slow transition (300ms) - complex animations, modals */
  "duration-slow": string;

  // -------------------------------------------------------------------------
  // @group Transition Easing
  // Animation curves for natural motion
  // -------------------------------------------------------------------------

  /** Default easing - smooth acceleration and deceleration */
  "easing-default": string;
  /** Ease-in - accelerating from zero velocity */
  "easing-in": string;
  /** Ease-out - decelerating to zero velocity */
  "easing-out": string;

  // -------------------------------------------------------------------------
  // @group Component Sizes
  // Fixed dimensions for specific UI components
  // -------------------------------------------------------------------------

  /** Toolbar height (44px) - main application toolbar */
  "size-toolbar-height": string;
  /** Tab bar height (32px) - tab navigation */
  "size-tabbar-height": string;
  /** Status bar height (24px) - bottom status bar */
  "size-statusbar-height": string;
  /** Panel header height (40px) - collapsible panel headers */
  "size-panel-header-height": string;
  /** Tree indent (16px) - hierarchical tree view indentation */
  "size-tree-indent": string;
  /** Property label width (100px) - form label column */
  "size-property-label": string;
  /** Small checkbox (12px) - compact checkbox size */
  "size-checkbox-sm": string;
  /** Medium checkbox (14px) - default checkbox size */
  "size-checkbox-md": string;
  /** Small color swatch (14px) - inline color indicators */
  "size-color-swatch-sm": string;
  /** Medium color swatch (18px) - default color picker swatch */
  "size-color-swatch-md": string;
  /** Large color swatch (22px) - prominent color selection */
  "size-color-swatch-lg": string;
  /** Divider width (1px) - separator line thickness */
  "size-divider-width": string;
  /** Small badge (14px) - compact badge height */
  "size-badge-sm": string;
  /** Medium badge (18px) - default badge height */
  "size-badge-md": string;
  /** Small thumbnail (32px) - inline asset previews */
  "size-thumbnail-sm": string;
  /** Medium thumbnail (48px) - default asset previews */
  "size-thumbnail-md": string;
  /** Large thumbnail (64px) - expanded asset previews */
  "size-thumbnail-lg": string;
  /** Canvas ruler size (20px) - ruler bar width/height */
  "canvas-ruler-size": string;
  /** Bounding box handle size (8px) - resize handle dimensions */
  "bounding-box-handle-size": string;
  /** Bounding box stroke width (1px) - selection outline thickness */
  "bounding-box-stroke-width": string;
  /** Action button size (20px) - small icon buttons in panels */
  "size-action-button": string;
  /** Expander button size (16px) - tree expand/collapse toggle */
  "size-expander": string;
  /** Close button size (16px) - tab/panel close buttons */
  "size-close-button": string;
  /** Dirty indicator size (8px) - unsaved changes dot */
  "size-dirty-indicator": string;
  /** Drag handle size (14px) - reorder handle width */
  "size-drag-handle": string;
  /** Layer item min height (28px) - tree item row height */
  "size-layer-item-height": string;

  // -------------------------------------------------------------------------
  // @group Font Weights
  // Typography weight scale
  // -------------------------------------------------------------------------

  /** Normal weight (400) - default body text */
  "font-weight-normal": string;
  /** Medium weight (500) - slight emphasis */
  "font-weight-medium": string;
  /** Semibold weight (600) - strong emphasis, headings */
  "font-weight-semibold": string;
  /** Bold weight (700) - maximum emphasis */
  "font-weight-bold": string;
};

/**
 * Color tokens - theme-dependent values
 * These are overridden by each theme preset (light, dark, etc.)
 */
export type ColorTokens = {
  // -------------------------------------------------------------------------
  // @group Primary Colors
  // Brand and accent colors for key actions
  // -------------------------------------------------------------------------

  /** Primary brand color - buttons, links, focus states */
  "color-primary": string;
  /** Primary hover - slightly darker/lighter on hover */
  "color-primary-hover": string;
  /** Primary active - pressed/active state */
  "color-primary-active": string;

  // -------------------------------------------------------------------------
  // @group Surface Colors
  // Background colors for containers and layers
  // -------------------------------------------------------------------------

  /** Base surface - main background color */
  "color-surface": string;
  /** Raised surface - cards, elevated panels */
  "color-surface-raised": string;
  /** Overlay surface - modals, dropdowns */
  "color-surface-overlay": string;

  // -------------------------------------------------------------------------
  // @group Text Colors
  // Typography colors for readability hierarchy
  // -------------------------------------------------------------------------

  /** Primary text - main content, headings */
  "color-text": string;
  /** Muted text - secondary info, descriptions */
  "color-text-muted": string;
  /** Disabled text - inactive elements */
  "color-text-disabled": string;
  /** Text on emphasis - text on primary/accent backgrounds */
  "color-text-on-emphasis": string;
  /** Text on warning - text on warning backgrounds */
  "color-text-on-warning": string;

  // -------------------------------------------------------------------------
  // @group Border Colors
  // Stroke colors for boundaries and separation
  // -------------------------------------------------------------------------

  /** Default border - containers, dividers */
  "color-border": string;
  /** Focus border - keyboard focus indicator */
  "color-border-focus": string;

  // -------------------------------------------------------------------------
  // @group State Colors
  // Semantic colors for feedback and status
  // -------------------------------------------------------------------------

  /** Success state - confirmations, completed actions */
  "color-success": string;
  /** Warning state - cautions, important notices */
  "color-warning": string;
  /** Error state - errors, destructive actions */
  "color-error": string;

  // -------------------------------------------------------------------------
  // @group Error State Colors
  // Extended error palette for complex error UIs
  // -------------------------------------------------------------------------

  /** Error background - subtle error container */
  "color-error-bg": string;
  /** Error background hover - error element hover */
  "color-error-bg-hover": string;
  /** Error background active - error element pressed */
  "color-error-bg-active": string;
  /** Error border - error container stroke */
  "color-error-border": string;
  /** Error border hover - error hover stroke */
  "color-error-border-hover": string;

  // -------------------------------------------------------------------------
  // @group Backdrop
  // Overlay colors for modals and dialogs
  // -------------------------------------------------------------------------

  /** Modal backdrop - semi-transparent overlay */
  "color-backdrop": string;

  // -------------------------------------------------------------------------
  // @group Interactive State Colors
  // Colors for hover, active, and selection states
  // -------------------------------------------------------------------------

  /** Hover state - subtle highlight on hover */
  "color-hover": string;
  /** Active state - pressed/active highlight */
  "color-active": string;
  /** Selected state - selected items highlight */
  "color-selected": string;
  /** Subtle selected - lighter selection for backgrounds */
  "color-selected-subtle": string;
  /** Drop target - drag-and-drop target highlight */
  "color-drop-target": string;
  /** Focus ring - keyboard focus outline */
  "color-focus-ring": string;

  // -------------------------------------------------------------------------
  // @group Icon Colors
  // Colors for iconography
  // -------------------------------------------------------------------------

  /** Default icon - neutral icon color */
  "color-icon": string;
  /** Icon hover - icon on hover */
  "color-icon-hover": string;
  /** Icon active - active/selected icon */
  "color-icon-active": string;

  // -------------------------------------------------------------------------
  // @group Divider Colors
  // Separator and rule colors
  // -------------------------------------------------------------------------

  /** Divider line - horizontal/vertical separators */
  "color-divider": string;

  // -------------------------------------------------------------------------
  // @group Input Colors
  // Form input styling
  // -------------------------------------------------------------------------

  /** Input background - text field background */
  "color-input-bg": string;
  /** Input border - text field stroke */
  "color-input-border": string;
  /** Input border focus - focused input stroke */
  "color-input-border-focus": string;

  // -------------------------------------------------------------------------
  // @group Log Level Colors
  // Console/log output styling
  // -------------------------------------------------------------------------

  /** Info log - informational messages */
  "color-log-info": string;
  /** Warning log - warning messages */
  "color-log-warning": string;
  /** Error log - error messages */
  "color-log-error": string;
  /** Debug log - debug messages */
  "color-log-debug": string;
  /** Success log - success messages */
  "color-log-success": string;

  // -------------------------------------------------------------------------
  // @group Tooltip Colors
  // Tooltip styling
  // -------------------------------------------------------------------------

  /** Tooltip background - tooltip container */
  "tooltip-bg": string;
  /** Tooltip text - tooltip content color */
  "tooltip-color": string;

  // -------------------------------------------------------------------------
  // @group Canvas Colors
  // Canvas/artboard specific colors
  // -------------------------------------------------------------------------

  /** Ruler background - canvas ruler bar */
  "canvas-ruler-bg": string;
  /** Ruler text - ruler numbers */
  "canvas-ruler-text": string;
  /** Ruler tick - ruler tick marks */
  "canvas-ruler-tick": string;
  /** Ruler indicator - current position marker */
  "canvas-ruler-indicator": string;
  /** Grid major - primary grid lines */
  "canvas-grid-major": string;
  /** Grid minor - secondary grid lines */
  "canvas-grid-minor": string;
  /** Grid origin - origin axis lines */
  "canvas-grid-origin": string;
  /** Guide lines - alignment guides */
  "canvas-guide": string;
  /** Checker light - transparency pattern light */
  "canvas-checker-light": string;
  /** Checker dark - transparency pattern dark */
  "canvas-checker-dark": string;

  // -------------------------------------------------------------------------
  // @group Shadows
  // Elevation and depth effects
  // -------------------------------------------------------------------------

  /** Small shadow - subtle elevation */
  "shadow-sm": string;
  /** Medium shadow - cards, dropdowns */
  "shadow-md": string;
  /** Large shadow - modals, popovers */
  "shadow-lg": string;
  /** Thumb shadow - slider/scrollbar thumbs */
  "shadow-thumb": string;

  // -------------------------------------------------------------------------
  // @group Bounding Box Colors
  // Selection and transform handle styling
  // -------------------------------------------------------------------------

  /** Bounding box stroke - selection outline color */
  "bounding-box-stroke": string;
  /** Handle fill - resize handle background */
  "bounding-box-handle-fill": string;
  /** Handle stroke - resize handle border */
  "bounding-box-handle-stroke": string;
  /** Label background - dimension label background */
  "bounding-box-label-bg": string;
  /** Label text - dimension label text color */
  "bounding-box-label-text": string;

  // -------------------------------------------------------------------------
  // @group Box Model Editor Colors
  // Visual box model editor styling
  // -------------------------------------------------------------------------

  /** Margin layer background - outer box background */
  "box-model-margin-bg": string;
  /** Margin layer stroke - outer box border */
  "box-model-margin-stroke": string;
  /** Border layer background - border box background */
  "box-model-border-bg": string;
  /** Border layer stroke - border box border */
  "box-model-border-stroke": string;
  /** Padding layer background - inner box background */
  "box-model-padding-bg": string;
  /** Padding layer stroke - inner box border */
  "box-model-padding-stroke": string;
  /** Content area background - center content area */
  "box-model-content-bg": string;
  /** Content area stroke - center content border */
  "box-model-content-stroke": string;
  /** Border indicator - dashed border line color (deprecated, use layer-specific strokes) */
  "box-model-border": string;
  /** Handle color - drag handle indicators */
  "box-model-handle": string;
  /** Handle hover color - drag handle on hover */
  "box-model-handle-hover": string;
};

export type ThemeTokens = BaseTokens & ColorTokens;

/**
 * Base tokens - shared across all themes
 */
export const baseTokens: BaseTokens = {
  // Spacing
  "space-2xs": "1px",
  "space-xs": "2px",
  "space-sm": "4px",
  "space-md": "8px",
  "space-lg": "12px",
  "space-xl": "16px",
  "space-2xl": "24px",

  // Font sizes
  "size-font-xs": "9px",
  "size-font-sm": "11px",
  "size-font-md": "12px",
  "size-font-lg": "14px",

  // Icon sizes
  "size-icon-sm": "12px",
  "size-icon-md": "14px",
  "size-icon-lg": "18px",
  "size-icon-xl": "24px",

  // Component heights
  "size-height-xs": "14px",
  "size-height-sm": "22px",
  "size-height-md": "28px",
  "size-height-lg": "32px",
  "size-height-xl": "40px",

  // Border radius
  "radius-sm": "5px",
  "radius-md": "6px",
  "radius-lg": "10px",
  "radius-full": "9999px",

  // Z-index
  "z-dropdown": "1000",
  "z-sticky": "1100",
  "z-modal": "1200",
  "z-popover": "1300",
  "z-tooltip": "1400",

  // Transitions - Duration
  "duration-fast": "100ms",
  "duration-normal": "200ms",
  "duration-slow": "300ms",

  // Transitions - Easing
  "easing-default": "cubic-bezier(0.4, 0, 0.2, 1)",
  "easing-in": "cubic-bezier(0.4, 0, 1, 1)",
  "easing-out": "cubic-bezier(0, 0, 0.2, 1)",

  // Component-specific sizes
  "size-toolbar-height": "44px",
  "size-tabbar-height": "32px",
  "size-statusbar-height": "24px",
  "size-panel-header-height": "40px",
  "size-tree-indent": "16px",
  "size-property-label": "100px",
  "size-checkbox-sm": "12px",
  "size-checkbox-md": "14px",
  "size-color-swatch-sm": "14px",
  "size-color-swatch-md": "18px",
  "size-color-swatch-lg": "22px",
  "size-divider-width": "1px",
  "size-badge-sm": "14px",
  "size-badge-md": "18px",
  "size-thumbnail-sm": "32px",
  "size-thumbnail-md": "48px",
  "size-thumbnail-lg": "64px",
  "canvas-ruler-size": "20px",
  "bounding-box-handle-size": "8px",
  "bounding-box-stroke-width": "1px",
  "size-action-button": "20px",
  "size-expander": "16px",
  "size-close-button": "16px",
  "size-dirty-indicator": "8px",
  "size-drag-handle": "14px",
  "size-layer-item-height": "28px",

  // Font weights
  "font-weight-normal": "400",
  "font-weight-medium": "500",
  "font-weight-semibold": "600",
  "font-weight-bold": "700",
};
