/**
 * @file BoxModelSection demo page
 */

import { useState } from "react";
import { BoxModelSection } from "../../../sections/BoxModelSection/BoxModelSection";
import type { BoxModelData } from "../../../components/BoxModelEditor/types";

const initialData: BoxModelData = {
  margin: { top: 16, right: 16, bottom: 1, left: 16 },
  border: { top: 2, right: 2, bottom: 2, left: 2 },
  padding: { top: 16, right: 8, bottom: 16, left: 8 },
  borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
  contentSize: { width: 100, height: 60 },
};

export function BoxModelSectionDemo() {
  const [data, setData] = useState<BoxModelData>(initialData);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section>
        <h3>Default (Proportional)</h3>
        <div style={{ maxWidth: 360 }}>
          <BoxModelSection data={data} onChange={setData} />
        </div>
        <pre style={{ marginTop: 16, fontSize: 12 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </section>

      <section>
        <h3>Auto-size Mode</h3>
        <div style={{ display: "inline-block" }}>
          <BoxModelSection data={data} onChange={setData} displayMode="auto" />
        </div>
      </section>

      <section>
        <h3>Fixed Display Mode</h3>
        <div style={{ maxWidth: 360 }}>
          <BoxModelSection data={data} onChange={setData} displayMode="fixed" />
        </div>
      </section>

      <section>
        <h3>Padding Only</h3>
        <div style={{ maxWidth: 320 }}>
          <BoxModelSection
            data={data}
            onChange={setData}
            editable={{ margin: false, border: false, padding: true, radius: false, contentSize: false }}
          />
        </div>
      </section>

      <section>
        <h3>Margin and Radius Only</h3>
        <div style={{ maxWidth: 320 }}>
          <BoxModelSection
            data={data}
            onChange={setData}
            editable={{ margin: true, border: false, padding: false, radius: true, contentSize: false }}
          />
        </div>
      </section>
    </div>
  );
}
