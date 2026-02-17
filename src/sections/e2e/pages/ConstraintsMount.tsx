/**
 * @file ConstraintsSection mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { ConstraintsSection } from "../../ConstraintsSection/ConstraintsSection";
import type { ConstraintsData } from "../../ConstraintsSection/types";

/**
 * ConstraintsSection mount page for E2E testing.
 */
export default function ConstraintsMount() {
  const [data, setData] = useState<ConstraintsData>({
    horizontal: "left",
    vertical: "top",
  });

  const handleChange = useCallback((newData: ConstraintsData) => {
    setData(newData);
  }, []);

  return (
    <div className="section-mount">
      <h1>ConstraintsSection E2E</h1>

      <div className="section" data-testid="section">
        <ConstraintsSection data={data} onChange={handleChange} />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
