/**
 * @file TextJustifySelect component - Text justification selector
 *
 * @description
 * A segmented control for selecting text justification options including
 * left, center, right, and various justify modes.
 *
 * @example
 * ```tsx
 * import { TextJustifySelect } from "react-editor-ui/TextJustifySelect";
 *
 * const [justify, setJustify] = useState<TextJustify>("left");
 *
 * <TextJustifySelect value={justify} onChange={setJustify} />
 * ```
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
} from "../../icons";

export type TextJustify =
  | "left"
  | "center"
  | "right"
  | "justify"
  | "justify-left"
  | "justify-center"
  | "justify-all";

export type TextJustifySelectProps = {
  value: TextJustify;
  onChange: (value: TextJustify) => void;
  /** Show extended justify options (justify-left, justify-center, justify-all) */
  extended?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const basicOptions = [
  { value: "left" as const, icon: <TextAlignLeftIcon />, "aria-label": "Align left" },
  { value: "center" as const, icon: <TextAlignCenterIcon />, "aria-label": "Align center" },
  { value: "right" as const, icon: <TextAlignRightIcon />, "aria-label": "Align right" },
  { value: "justify" as const, icon: <TextAlignJustifyIcon />, "aria-label": "Justify" },
];

const extendedOptions = [
  { value: "left" as const, icon: <TextAlignLeftIcon />, "aria-label": "Align left" },
  { value: "center" as const, icon: <TextAlignCenterIcon />, "aria-label": "Align center" },
  { value: "right" as const, icon: <TextAlignRightIcon />, "aria-label": "Align right" },
  { value: "justify-left" as const, icon: <TextAlignJustifyIcon />, label: "L", "aria-label": "Justify left" },
  { value: "justify-center" as const, icon: <TextAlignJustifyIcon />, label: "C", "aria-label": "Justify center" },
  { value: "justify" as const, icon: <TextAlignJustifyIcon />, label: "R", "aria-label": "Justify right" },
  { value: "justify-all" as const, icon: <TextAlignJustifyIcon />, label: "A", "aria-label": "Justify all" },
];

/** Segmented control for text justification */
export function TextJustifySelect({
  value,
  onChange,
  extended = false,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: TextJustifySelectProps) {
  const options = extended ? extendedOptions : basicOptions;

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as TextJustify)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Text justification"
    />
  );
}
