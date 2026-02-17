/**
 * @file PositionSection mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { PositionSection } from "../../PositionSection/PositionSection";
import type { PositionData } from "../../PositionSection/types";

/**
 * PositionSection mount page for E2E testing.
 */
export default function PositionMount() {
  const [data, setData] = useState<PositionData>({
    x: "100",
    y: "200",
  });

  const handleChange = useCallback((newData: PositionData) => {
    setData(newData);
  }, []);

  return (
    <div className="section-mount">
      <h1>PositionSection E2E</h1>

      <div className="section" data-testid="section">
        <PositionSection data={data} onChange={handleChange} />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
