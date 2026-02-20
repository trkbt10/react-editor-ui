/**
 * @file Panel component tests - Verifies deprecated alias works correctly
 */

import { render, screen } from "@testing-library/react";
import { Panel } from "./Panel";

describe("Panel (deprecated alias)", () => {
  it("renders via deprecated Panel alias", () => {
    render(<Panel title="Test Panel">Content</Panel>);

    expect(screen.getByText("Test Panel")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
