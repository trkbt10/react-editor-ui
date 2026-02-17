/**
 * @file RotationSection mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { RotationSection } from "../../RotationSection/RotationSection";
import type { RotationData } from "../../RotationSection/types";

/**
 * RotationSection mount page for E2E testing.
 */
export default function RotationMount() {
  const [data, setData] = useState<RotationData>({
    rotation: "45",
  });

  const handleChange = useCallback((newData: RotationData) => {
    setData(newData);
  }, []);

  const handleTransformAction = useCallback((actionId: string) => {
    console.log("Transform action:", actionId);
    if (actionId === "reset") {
      setData({ rotation: "0" });
    }
  }, []);

  return (
    <div className="section-mount">
      <h1>RotationSection E2E</h1>

      <div className="section" data-testid="section">
        <RotationSection
          data={data}
          onChange={handleChange}
          onTransformAction={handleTransformAction}
        />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
