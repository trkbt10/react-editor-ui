/**
 * @file SizeSection mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { SizeSection } from "../../SizeSection/SizeSection";
import type { SizeData } from "../../SizeSection/types";

/**
 * SizeSection mount page for E2E testing.
 */
export default function SizeMount() {
  const [data, setData] = useState<SizeData>({
    width: "200",
    height: "100",
  });

  const handleChange = useCallback((newData: SizeData) => {
    setData(newData);
  }, []);

  return (
    <div className="section-mount">
      <h1>SizeSection E2E</h1>

      <div className="section" data-testid="section">
        <SizeSection data={data} onChange={handleChange} />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
