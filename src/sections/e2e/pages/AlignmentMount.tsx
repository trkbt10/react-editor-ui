/**
 * @file AlignmentSection mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { AlignmentSection } from "../../AlignmentSection/AlignmentSection";
import type { AlignmentData } from "../../AlignmentSection/types";

/**
 * AlignmentSection mount page for E2E testing.
 */
export default function AlignmentMount() {
  const [data, setData] = useState<AlignmentData>({
    horizontal: "left",
    vertical: "top",
  });

  const handleChange = useCallback((newData: AlignmentData) => {
    setData(newData);
  }, []);

  return (
    <div className="section-mount">
      <h1>AlignmentSection E2E</h1>

      <div className="section" data-testid="section">
        <AlignmentSection data={data} onChange={handleChange} />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
