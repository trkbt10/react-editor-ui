/**
 * @file BoxModelEditor demo page
 */

import { useState, useCallback } from "react";
import {
  BoxModelEditor,
  type BoxModelData,
  type BoxModelDisplayMode,
  type BoxModelEditableFeatures,
} from "../../../components/BoxModelEditor/BoxModelEditor";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { SegmentedControl } from "../../../components/SegmentedControl/SegmentedControl";

const initialData: BoxModelData = {
  margin: { top: 16, right: 16, bottom: 8, left: 16 },
  border: { top: 2, right: 2, bottom: 2, left: 2 },
  padding: { top: 12, right: 8, bottom: 12, left: 8 },
  borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
  contentSize: { width: 100, height: 60 },
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
  paddingBottom: 24,
  borderBottom: "1px solid var(--rei-color-border)",
};

const controlsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginBottom: 16,
  padding: 12,
  background: "var(--rei-color-surface-raised)",
  borderRadius: 8,
};

const controlRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--rei-color-text-muted)",
  minWidth: 80,
};

const displayModeOptions = [
  { value: "proportional", label: "Proportional" },
  { value: "fixed", label: "Fixed" },
  { value: "auto", label: "Auto-size" },
];

export function BoxModelEditorDemo() {
  const [data, setData] = useState<BoxModelData>(initialData);
  const [displayMode, setDisplayMode] = useState<BoxModelDisplayMode>("proportional");
  const [editable, setEditable] = useState<BoxModelEditableFeatures>({
    margin: true,
    border: true,
    padding: true,
    radius: true,
    contentSize: true,
  });

  const handleDisplayModeChange = useCallback((value: string | string[]) => {
    if (typeof value === "string") {
      setDisplayMode(value as BoxModelDisplayMode);
    }
  }, []);

  const handleEditableChange = useCallback((key: keyof BoxModelEditableFeatures) => {
    return (checked: boolean) => {
      setEditable((prev) => ({ ...prev, [key]: checked }));
    };
  }, []);

  const handleReset = useCallback(() => {
    setData(initialData);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section style={sectionStyle}>
        <h3>Interactive SVG Editor</h3>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
          Drag the values to adjust margin/border/padding. Drag corner zones to adjust border-radius.
          Drag content edges to resize content area.
        </p>

        <div style={controlsStyle}>
          <div style={controlRowStyle}>
            <span style={labelStyle}>Display Mode:</span>
            <SegmentedControl
              value={displayMode}
              onChange={handleDisplayModeChange}
              options={displayModeOptions}
              size="sm"
            />
          </div>
          <div style={controlRowStyle}>
            <span style={labelStyle}>Editable:</span>
            <Checkbox
              checked={editable.margin ?? true}
              onChange={handleEditableChange("margin")}
              label="Margin"
            />
            <Checkbox
              checked={editable.border ?? true}
              onChange={handleEditableChange("border")}
              label="Border"
            />
            <Checkbox
              checked={editable.padding ?? true}
              onChange={handleEditableChange("padding")}
              label="Padding"
            />
            <Checkbox
              checked={editable.radius ?? true}
              onChange={handleEditableChange("radius")}
              label="Radius"
            />
            <Checkbox
              checked={editable.contentSize ?? true}
              onChange={handleEditableChange("contentSize")}
              label="Content Size"
            />
          </div>
          <div style={controlRowStyle}>
            <button onClick={handleReset} style={{ fontSize: 12, padding: "4px 8px" }}>
              Reset Values
            </button>
          </div>
        </div>

        <div style={{ background: "var(--rei-color-surface)", padding: 8, borderRadius: 8 }}>
          <BoxModelEditor
            value={data}
            onChange={setData}
            width={400}
            height={280}
            displayMode={displayMode}
            editable={editable}
          />
        </div>
        <pre style={{ marginTop: 16, fontSize: 12 }}>{JSON.stringify(data, null, 2)}</pre>
      </section>

      <section style={sectionStyle}>
        <h3>Auto-size Mode</h3>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
          In auto-size mode, the editor expands/contracts based on actual values.
          Try changing the values to see the editor resize.
        </p>
        <div style={{ background: "var(--rei-color-surface)", padding: 8, borderRadius: 8, display: "inline-block" }}>
          <BoxModelEditor
            value={data}
            onChange={setData}
            displayMode="auto"
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <h3>Proportional Mode</h3>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
          Layer thickness is proportional to values within a fixed editor size.
        </p>
        <BoxModelEditor
          value={data}
          onChange={setData}
          width={360}
          height={240}
          displayMode="proportional"
        />
      </section>

      <section style={sectionStyle}>
        <h3>Fixed Mode</h3>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
          Constant layer thickness regardless of values.
        </p>
        <BoxModelEditor
          value={data}
          onChange={setData}
          width={360}
          height={240}
          displayMode="fixed"
        />
      </section>

      <section style={sectionStyle}>
        <h3>Compact Size</h3>
        <BoxModelEditor
          value={data}
          onChange={setData}
          width={280}
          height={180}
          displayMode="fixed"
        />
      </section>

      <section style={sectionStyle}>
        <h3>Margin and Radius Only</h3>
        <BoxModelEditor
          value={data}
          onChange={setData}
          width={320}
          height={200}
          editable={{ margin: true, border: false, padding: false, radius: true, contentSize: false }}
        />
      </section>

      <section>
        <h3>Disabled</h3>
        <BoxModelEditor
          value={data}
          onChange={setData}
          width={320}
          height={200}
          disabled
        />
      </section>
    </div>
  );
}
