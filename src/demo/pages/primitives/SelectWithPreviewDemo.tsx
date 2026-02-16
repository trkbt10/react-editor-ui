/**
 * @file SelectWithPreview demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { Select } from "../../../components/Select/Select";
import type { SelectOption } from "../../../components/Select/Select";

function WidthProfilePreview({ variant = "uniform" }: { variant?: "uniform" | "taper" }) {
  return (
    <div style={{ width: "100%", height: "8px", display: "flex", alignItems: "center" }}>
      <svg width="100%" height="8" viewBox="0 0 160 8" preserveAspectRatio="none">
        <path
          d={variant === "uniform" ? "M0 4 L160 4" : "M0 4 Q40 2 80 4 Q120 6 160 4"}
          fill="none"
          stroke="currentColor"
          strokeWidth={variant === "uniform" ? "4" : "3"}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function getBrushDemoPath(type: "smooth" | "rough"): string {
  if (type === "rough") {
    return "M0 12 Q10 8 20 12 Q30 16 40 12 Q50 8 60 12 Q70 16 80 12 Q90 8 100 12 Q110 16 120 12 Q130 8 140 12 Q150 16 160 12 Q170 8 180 12 Q190 16 200 12";
  }
  return "M0 12 Q50 6 100 12 Q150 18 200 12";
}

function BrushPreviewDemo({ type = "smooth" }: { type?: "smooth" | "rough" }) {
  return (
    <div style={{ width: "100%", height: "24px", display: "flex", alignItems: "center" }}>
      <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
        <path
          d={getBrushDemoPath(type)}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function SelectWithPreviewDemo() {
  const [widthProfile, setWidthProfile] = useState("uniform");
  const [brushType, setBrushType] = useState("smooth");
  const [selectedFruit, setSelectedFruit] = useState("apple");

  const widthOptions: SelectOption<string>[] = [
    { value: "uniform", preview: <WidthProfilePreview variant="uniform" /> },
    { value: "taper", preview: <WidthProfilePreview variant="taper" /> },
  ];

  const brushOptions: SelectOption<string>[] = [
    { value: "smooth", preview: <BrushPreviewDemo type="smooth" /> },
    { value: "rough", preview: <BrushPreviewDemo type="rough" /> },
  ];

  const fruitOptions: SelectOption<string>[] = [
    { value: "apple", label: "Apple", preview: <span style={{ fontSize: "20px" }}>&#127822;</span> },
    { value: "banana", label: "Banana", preview: <span style={{ fontSize: "20px" }}>&#127820;</span> },
    { value: "cherry", label: "Cherry", preview: <span style={{ fontSize: "20px" }}>&#127826;</span> },
  ];

  return (
    <DemoContainer title="Select with Preview">
      <DemoSection label="Width Profile (Preview Only)">
        <div style={{ width: "200px" }}>
          <Select
            options={widthOptions}
            value={widthProfile}
            onChange={setWidthProfile}
            aria-label="Width profile"
          />
        </div>
      </DemoSection>

      <DemoSection label="Brush Type (Large Preview)">
        <div style={{ width: "250px" }}>
          <Select
            options={brushOptions}
            value={brushType}
            onChange={setBrushType}
            size="lg"
            aria-label="Brush type"
          />
        </div>
      </DemoSection>

      <DemoSection label="With Preview and Label">
        <div style={{ width: "200px" }}>
          <Select
            options={fruitOptions}
            value={selectedFruit}
            onChange={setSelectedFruit}
            aria-label="Select fruit"
          />
        </div>
      </DemoSection>

      <DemoSection label="Disabled">
        <div style={{ width: "200px" }}>
          <Select
            options={widthOptions}
            value="uniform"
            onChange={() => {}}
            disabled
            aria-label="Disabled select"
          />
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
