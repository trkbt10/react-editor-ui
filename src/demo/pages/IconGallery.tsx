/**
 * @file Icon gallery for visual testing
 */

import * as Icons from "../../icons";

type IconEntry = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
  extraProps?: Record<string, unknown>;
};

type IconSection = {
  title: string;
  source: "react-icons" | "custom-svg";
  icons: IconEntry[];
};

const iconSections: IconSection[] = [
  // ============================================================================
  // react-icons (Lucide) - Standard icons
  // ============================================================================
  {
    title: "Action",
    source: "react-icons",
    icons: [
      { name: "CheckIcon", Component: Icons.CheckIcon },
      { name: "CloseIcon", Component: Icons.CloseIcon },
      { name: "SearchIcon", Component: Icons.SearchIcon },
      { name: "SettingsIcon", Component: Icons.SettingsIcon },
      { name: "ResetIcon", Component: Icons.ResetIcon },
      { name: "RefreshIcon", Component: Icons.RefreshIcon },
      { name: "SwapIcon", Component: Icons.SwapIcon },
      { name: "LinkIcon", Component: Icons.LinkIcon },
      { name: "GridIcon", Component: Icons.GridIcon },
    ],
  },
  {
    title: "Navigation",
    source: "react-icons",
    icons: [
      { name: "ChevronUpIcon", Component: Icons.ChevronUpIcon },
      { name: "ChevronDownIcon", Component: Icons.ChevronDownIcon },
      { name: "ChevronLeftIcon", Component: Icons.ChevronLeftIcon },
      { name: "ChevronRightIcon", Component: Icons.ChevronRightIcon },
      { name: "ArrowLeftIcon", Component: Icons.ArrowLeftIcon },
      { name: "ArrowRightIcon", Component: Icons.ArrowRightIcon },
    ],
  },
  {
    title: "Layer",
    source: "react-icons",
    icons: [
      { name: "EyeIcon (visible)", Component: Icons.EyeIcon, extraProps: { visible: true } },
      { name: "EyeIcon (hidden)", Component: Icons.EyeIcon, extraProps: { visible: false } },
      { name: "LockIcon (locked)", Component: Icons.LockIcon, extraProps: { locked: true } },
      { name: "LockIcon (unlocked)", Component: Icons.LockIcon, extraProps: { locked: false } },
      { name: "DragHandleIcon", Component: Icons.DragHandleIcon },
    ],
  },
  {
    title: "Transform",
    source: "react-icons",
    icons: [
      { name: "FlipHorizontalIcon", Component: Icons.FlipHorizontalIcon },
      { name: "FlipVerticalIcon", Component: Icons.FlipVerticalIcon },
      { name: "RotationIcon", Component: Icons.RotationIcon },
    ],
  },
  {
    title: "Animation",
    source: "react-icons",
    icons: [
      { name: "ClockIcon", Component: Icons.ClockIcon },
      { name: "HourglassIcon", Component: Icons.HourglassIcon },
    ],
  },
  {
    title: "Alignment",
    source: "react-icons",
    icons: [
      { name: "AlignLeftIcon", Component: Icons.AlignLeftIcon },
      { name: "AlignCenterHIcon", Component: Icons.AlignCenterHIcon },
      { name: "AlignRightIcon", Component: Icons.AlignRightIcon },
      { name: "AlignTopIcon", Component: Icons.AlignTopIcon },
      { name: "AlignMiddleIcon", Component: Icons.AlignMiddleIcon },
      { name: "AlignBottomIcon", Component: Icons.AlignBottomIcon },
    ],
  },
  {
    title: "Text Alignment",
    source: "react-icons",
    icons: [
      { name: "TextAlignLeftIcon", Component: Icons.TextAlignLeftIcon },
      { name: "TextAlignCenterIcon", Component: Icons.TextAlignCenterIcon },
      { name: "TextAlignRightIcon", Component: Icons.TextAlignRightIcon },
    ],
  },

  // ============================================================================
  // Fill Types - from react-icons (Material Design / Lucide)
  // ============================================================================
  {
    title: "Fill Types",
    source: "react-icons",
    icons: [
      { name: "FillSolidIcon", Component: Icons.FillSolidIcon },
      { name: "FillGradientIcon", Component: Icons.FillGradientIcon },
      { name: "FillImageIcon", Component: Icons.FillImageIcon },
      { name: "FillPatternIcon", Component: Icons.FillPatternIcon },
      { name: "FillVideoIcon", Component: Icons.FillVideoIcon },
    ],
  },
  // ============================================================================
  // Custom SVGs - Domain-specific icons
  // ============================================================================
  {
    title: "Gradient Types",
    source: "custom-svg",
    icons: [
      { name: "GradientLinearIcon", Component: Icons.GradientLinearIcon },
      { name: "GradientRadialIcon", Component: Icons.GradientRadialIcon },
      { name: "GradientAngularIcon", Component: Icons.GradientAngularIcon },
      { name: "GradientDiamondIcon", Component: Icons.GradientDiamondIcon },
    ],
  },
  {
    title: "Stroke Cap",
    source: "custom-svg",
    icons: [
      { name: "CapButtIcon", Component: Icons.CapButtIcon },
      { name: "CapRoundIcon", Component: Icons.CapRoundIcon },
      { name: "CapSquareIcon", Component: Icons.CapSquareIcon },
    ],
  },
  {
    title: "Stroke Join",
    source: "custom-svg",
    icons: [
      { name: "JoinMiterIcon", Component: Icons.JoinMiterIcon },
      { name: "JoinRoundIcon", Component: Icons.JoinRoundIcon },
      { name: "JoinBevelIcon", Component: Icons.JoinBevelIcon },
    ],
  },
  {
    title: "Stroke Align",
    source: "custom-svg",
    icons: [
      { name: "StrokeAlignInsideIcon", Component: Icons.StrokeAlignInsideIcon },
      { name: "StrokeAlignCenterIcon", Component: Icons.StrokeAlignCenterIcon },
      { name: "StrokeAlignOutsideIcon", Component: Icons.StrokeAlignOutsideIcon },
    ],
  },
  {
    title: "Arrowheads",
    source: "custom-svg",
    icons: [
      { name: "ArrowNoneIcon", Component: Icons.ArrowNoneIcon },
      { name: "ArrowTriangleIcon", Component: Icons.ArrowTriangleIcon },
      { name: "ArrowOpenIcon", Component: Icons.ArrowOpenIcon },
      { name: "ArrowCircleIcon", Component: Icons.ArrowCircleIcon },
      { name: "ArrowSquareIcon", Component: Icons.ArrowSquareIcon },
      { name: "ArrowDiamondIcon", Component: Icons.ArrowDiamondIcon },
      { name: "ArrowBarIcon", Component: Icons.ArrowBarIcon },
    ],
  },
  {
    title: "Dynamic Stroke (Custom)",
    source: "custom-svg",
    icons: [
      { name: "SmoothIcon", Component: Icons.SmoothIcon },
    ],
  },
  {
    title: "Dynamic Stroke",
    source: "react-icons",
    icons: [
      { name: "FrequencyIcon", Component: Icons.FrequencyIcon },
      { name: "WiggleIcon", Component: Icons.WiggleIcon },
      { name: "MiterAngleIcon", Component: Icons.MiterAngleIcon },
    ],
  },
  {
    title: "Vertical Text Alignment",
    source: "react-icons",
    icons: [
      { name: "TextAlignTopIcon", Component: Icons.TextAlignTopIcon },
      { name: "TextAlignMiddleIcon", Component: Icons.TextAlignMiddleIcon },
      { name: "TextAlignBottomIcon", Component: Icons.TextAlignBottomIcon },
    ],
  },
  {
    title: "Typography Details",
    source: "react-icons",
    icons: [
      { name: "KerningIcon", Component: Icons.KerningIcon },
      { name: "TrackingIcon", Component: Icons.TrackingIcon },
      { name: "BaselineShiftIcon", Component: Icons.BaselineShiftIcon },
    ],
  },
  {
    title: "Typography Scale/Rotation",
    source: "react-icons",
    icons: [
      { name: "ScaleVerticalIcon", Component: Icons.ScaleVerticalIcon },
      { name: "ScaleHorizontalIcon", Component: Icons.ScaleHorizontalIcon },
      { name: "TextRotationIcon", Component: Icons.TextRotationIcon },
    ],
  },
  {
    title: "Alignment Target (Custom)",
    source: "custom-svg",
    icons: [
      { name: "ConstraintToggleIcon", Component: Icons.ConstraintToggleIcon },
      { name: "AlignStartIcon", Component: Icons.AlignStartIcon },
      { name: "AlignEndIcon", Component: Icons.AlignEndIcon },
    ],
  },
  {
    title: "Alignment Target",
    source: "react-icons",
    icons: [
      { name: "AlignToSelectionIcon", Component: Icons.AlignToSelectionIcon },
      { name: "AlignToKeyObjectIcon", Component: Icons.AlignToKeyObjectIcon },
      { name: "AlignToArtboardIcon", Component: Icons.AlignToArtboardIcon },
    ],
  },
];

export function IconGallery() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Icon Gallery</h1>

      {iconSections.map((section) => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 16,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {section.title}
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 4,
                background: section.source === "react-icons" ? "#2563eb" : "#16a34a",
                color: "#fff",
              }}
            >
              {section.source === "react-icons" ? "Lucide" : "Custom SVG"}
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 12,
            }}
          >
            {section.icons.map(({ name, Component, extraProps }) => (
              <div
                key={name}
                data-icon={name.replace(/ \(.*\)/, "")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 12,
                  border: "1px solid #333",
                  borderRadius: 8,
                  background: "#1a1a1a",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <Component size={24} {...extraProps} />
                </div>
                <span
                  style={{
                    marginTop: 8,
                    fontSize: 10,
                    color: "#888",
                    textAlign: "center",
                    wordBreak: "break-all",
                  }}
                >
                  {name.replace("Icon", "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
