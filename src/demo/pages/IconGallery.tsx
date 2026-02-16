/**
 * @file Icon gallery for visual testing
 */

import * as Icons from "../../icons";

const iconList = [
  // Transform
  { name: "FlipHorizontalIcon", Component: Icons.FlipHorizontalIcon },
  { name: "FlipVerticalIcon", Component: Icons.FlipVerticalIcon },
  { name: "RotationIcon", Component: Icons.RotationIcon },

  // Fill
  { name: "FillSolidIcon", Component: Icons.FillSolidIcon },
  { name: "FillGradientIcon", Component: Icons.FillGradientIcon },
  { name: "FillImageIcon", Component: Icons.FillImageIcon },
  { name: "FillPatternIcon", Component: Icons.FillPatternIcon },
  { name: "FillVideoIcon", Component: Icons.FillVideoIcon },
  { name: "GradientLinearIcon", Component: Icons.GradientLinearIcon },
  { name: "GradientRadialIcon", Component: Icons.GradientRadialIcon },
  { name: "GradientAngularIcon", Component: Icons.GradientAngularIcon },
  { name: "GradientDiamondIcon", Component: Icons.GradientDiamondIcon },

  // Layer
  { name: "EyeIcon", Component: Icons.EyeIcon },
  { name: "LockIcon", Component: Icons.LockIcon },
  { name: "DragHandleIcon", Component: Icons.DragHandleIcon },

  // Navigation
  { name: "ChevronDownIcon", Component: Icons.ChevronDownIcon },
  { name: "ChevronUpIcon", Component: Icons.ChevronUpIcon },
  { name: "ChevronRightIcon", Component: Icons.ChevronRightIcon },
  { name: "ChevronLeftIcon", Component: Icons.ChevronLeftIcon },
  { name: "ArrowLeftIcon", Component: Icons.ArrowLeftIcon },
  { name: "ArrowRightIcon", Component: Icons.ArrowRightIcon },

  // Alignment
  { name: "AlignLeftIcon", Component: Icons.AlignLeftIcon },
  { name: "AlignCenterHIcon", Component: Icons.AlignCenterHIcon },
  { name: "AlignRightIcon", Component: Icons.AlignRightIcon },
  { name: "AlignTopIcon", Component: Icons.AlignTopIcon },
  { name: "AlignMiddleIcon", Component: Icons.AlignMiddleIcon },
  { name: "AlignBottomIcon", Component: Icons.AlignBottomIcon },
  { name: "ConstraintToggleIcon", Component: Icons.ConstraintToggleIcon },
  { name: "AlignStartIcon", Component: Icons.AlignStartIcon },
  { name: "AlignEndIcon", Component: Icons.AlignEndIcon },

  // Typography
  { name: "TextAlignLeftIcon", Component: Icons.TextAlignLeftIcon },
  { name: "TextAlignCenterIcon", Component: Icons.TextAlignCenterIcon },
  { name: "TextAlignRightIcon", Component: Icons.TextAlignRightIcon },
  { name: "TextAlignTopIcon", Component: Icons.TextAlignTopIcon },
  { name: "TextAlignMiddleIcon", Component: Icons.TextAlignMiddleIcon },
  { name: "TextAlignBottomIcon", Component: Icons.TextAlignBottomIcon },

  // Action
  { name: "CloseIcon", Component: Icons.CloseIcon },
  { name: "CheckIcon", Component: Icons.CheckIcon },
  { name: "SearchIcon", Component: Icons.SearchIcon },
  { name: "SettingsIcon", Component: Icons.SettingsIcon },
  { name: "ResetIcon", Component: Icons.ResetIcon },
  { name: "RefreshIcon", Component: Icons.RefreshIcon },
  { name: "SwapIcon", Component: Icons.SwapIcon },
  { name: "LinkIcon", Component: Icons.LinkIcon },
  { name: "GridIcon", Component: Icons.GridIcon },

  // Stroke - Cap
  { name: "CapButtIcon", Component: Icons.CapButtIcon },
  { name: "CapRoundIcon", Component: Icons.CapRoundIcon },
  { name: "CapSquareIcon", Component: Icons.CapSquareIcon },

  // Stroke - Join
  { name: "JoinMiterIcon", Component: Icons.JoinMiterIcon },
  { name: "JoinRoundIcon", Component: Icons.JoinRoundIcon },
  { name: "JoinBevelIcon", Component: Icons.JoinBevelIcon },

  // Stroke - Align
  { name: "StrokeAlignInsideIcon", Component: Icons.StrokeAlignInsideIcon },
  { name: "StrokeAlignCenterIcon", Component: Icons.StrokeAlignCenterIcon },
  { name: "StrokeAlignOutsideIcon", Component: Icons.StrokeAlignOutsideIcon },

  // Stroke - Arrow
  { name: "ArrowNoneIcon", Component: Icons.ArrowNoneIcon },
  { name: "ArrowTriangleIcon", Component: Icons.ArrowTriangleIcon },
  { name: "ArrowOpenIcon", Component: Icons.ArrowOpenIcon },
  { name: "ArrowCircleIcon", Component: Icons.ArrowCircleIcon },
  { name: "ArrowSquareIcon", Component: Icons.ArrowSquareIcon },
  { name: "ArrowDiamondIcon", Component: Icons.ArrowDiamondIcon },
  { name: "ArrowBarIcon", Component: Icons.ArrowBarIcon },

  // Stroke - Other
  { name: "FrequencyIcon", Component: Icons.FrequencyIcon },
  { name: "WiggleIcon", Component: Icons.WiggleIcon },
  { name: "SmoothIcon", Component: Icons.SmoothIcon },
  { name: "MiterAngleIcon", Component: Icons.MiterAngleIcon },
];

export function IconGallery() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Icon Gallery</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 16,
        }}
      >
        {iconList.map(({ name, Component }) => (
          <div
            key={name}
            data-icon={name}
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
              <Component size={24} />
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
  );
}
