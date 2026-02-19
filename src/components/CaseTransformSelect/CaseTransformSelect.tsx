/**
 * @file CaseTransformSelect component - Text case transformation selector
 *
 * @description
 * A segmented control for selecting text case transformations including
 * normal, small caps, and all caps. Also includes toggles for subscript,
 * superscript, underline, and strikethrough.
 *
 * @example
 * ```tsx
 * import { CaseTransformSelect, TextStyleSelect } from "react-editor-ui/CaseTransformSelect";
 *
 * const [caseStyle, setCaseStyle] = useState<CaseTransform>("normal");
 * const [styles, setStyles] = useState<TextStyle[]>([]);
 *
 * <CaseTransformSelect value={caseStyle} onChange={setCaseStyle} />
 * <TextStyleSelect value={styles} onChange={setStyles} />
 * ```
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  CaseUpperIcon,
  SuperscriptIcon,
  SubscriptIcon,
  UnderlineIcon,
  StrikethroughIcon,
} from "../../icons";

// ============================================================================
// CaseTransformSelect - Single select for case transformation
// ============================================================================

export type CaseTransform = "normal" | "small-caps" | "all-caps";

export type CaseTransformSelectProps = {
  value: CaseTransform;
  onChange: (value: CaseTransform) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const caseOptions = [
  { value: "normal" as const, label: "Aa", "aria-label": "Normal case" },
  { value: "small-caps" as const, label: "AA", "aria-label": "Small caps" },
  { value: "all-caps" as const, icon: <CaseUpperIcon />, "aria-label": "All caps" },
];

/** Segmented control for text case transformation */
export function CaseTransformSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: CaseTransformSelectProps) {
  return (
    <SegmentedControl
      options={caseOptions}
      value={value}
      onChange={(v) => onChange(v as CaseTransform)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Text case"
    />
  );
}

// ============================================================================
// TextStyleSelect - Multi-select for text decorations
// ============================================================================

export type TextStyle = "superscript" | "subscript" | "underline" | "strikethrough";

export type TextStyleSelectProps = {
  value: TextStyle[];
  onChange: (value: TextStyle[]) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const styleOptions = [
  { value: "superscript" as const, icon: <SuperscriptIcon />, "aria-label": "Superscript" },
  { value: "subscript" as const, icon: <SubscriptIcon />, "aria-label": "Subscript" },
  { value: "underline" as const, icon: <UnderlineIcon />, "aria-label": "Underline" },
  { value: "strikethrough" as const, icon: <StrikethroughIcon />, "aria-label": "Strikethrough" },
];

/** Multi-select segmented control for text decorations */
export function TextStyleSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: TextStyleSelectProps) {
  return (
    <SegmentedControl
      options={styleOptions}
      value={value}
      onChange={(v) => onChange(v as TextStyle[])}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      multiple
      aria-label="Text styles"
    />
  );
}
