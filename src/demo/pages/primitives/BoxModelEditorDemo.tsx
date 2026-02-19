/**
 * @file BoxModelEditor demo page
 */

import { useState } from "react";
import {
  BoxModelEditor,
  type BoxModelData,
} from "../../../components/BoxModelEditor/BoxModelEditor";

const initialData: BoxModelData = {
  margin: { top: 16, right: 16, bottom: 1, left: 16 },
  padding: { top: 16, right: 8, bottom: 16, left: 8 },
  borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
  contentSize: { width: 344, height: 100 },
};

export function BoxModelEditorDemo() {
  const [data, setData] = useState<BoxModelData>(initialData);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section>
        <h3>Default</h3>
        <div style={{ maxWidth: 320 }}>
          <BoxModelEditor value={data} onChange={setData} />
        </div>
        <pre style={{ marginTop: 16, fontSize: 12 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </section>

      <section>
        <h3>Without Margin Layer</h3>
        <div style={{ maxWidth: 320 }}>
          <BoxModelEditor
            value={data}
            onChange={setData}
            showMargin={false}
          />
        </div>
      </section>

      <section>
        <h3>Without Border Radius</h3>
        <div style={{ maxWidth: 320 }}>
          <BoxModelEditor
            value={data}
            onChange={setData}
            showRadius={false}
          />
        </div>
      </section>

      <section>
        <h3>Disabled</h3>
        <div style={{ maxWidth: 320 }}>
          <BoxModelEditor value={data} onChange={setData} disabled />
        </div>
      </section>
    </div>
  );
}
