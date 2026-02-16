/**
 * @file PositionPanel component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import {
  PositionPanel,
  createDefaultPositionSettings,
  type PositionSettings,
} from "./PositionPanel";

describe("PositionPanel", () => {
  const defaultSettings = createDefaultPositionSettings();

  it("renders with default settings", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByRole("heading", { name: "Position" })).toBeInTheDocument();
    expect(screen.getByText("Alignment")).toBeInTheDocument();
    expect(screen.getByText("Constraints")).toBeInTheDocument();
    expect(screen.getByText("Rotation")).toBeInTheDocument();
  });

  it("renders X and Y position inputs", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByLabelText("X position")).toBeInTheDocument();
    expect(screen.getByLabelText("Y position")).toBeInTheDocument();
  });

  it("updates X position when input changes", () => {
    const ref = { settings: undefined as PositionSettings | undefined };
    render(<PositionPanel settings={defaultSettings} onChange={(s) => { ref.settings = s; }} />);

    const xInput = screen.getByLabelText("X position");
    fireEvent.change(xInput, { target: { value: "100" } });

    expect(ref.settings).toBeDefined();
    expect(ref.settings!.x).toBe("100");
  });

  it("updates Y position when input changes", () => {
    const ref = { settings: undefined as PositionSettings | undefined };
    render(<PositionPanel settings={defaultSettings} onChange={(s) => { ref.settings = s; }} />);

    const yInput = screen.getByLabelText("Y position");
    fireEvent.change(yInput, { target: { value: "200" } });

    expect(ref.settings).toBeDefined();
    expect(ref.settings!.y).toBe("200");
  });

  it("renders rotation input with degree suffix", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByLabelText("Rotation")).toBeInTheDocument();
    expect(screen.getByText("°")).toBeInTheDocument();
  });

  it("updates rotation when input changes", () => {
    const ref = { settings: undefined as PositionSettings | undefined };
    render(<PositionPanel settings={defaultSettings} onChange={(s) => { ref.settings = s; }} />);

    const rotationInput = screen.getByLabelText("Rotation");
    fireEvent.change(rotationInput, { target: { value: "45" } });

    expect(ref.settings).toBeDefined();
    expect(ref.settings!.rotation).toBe("45");
  });

  it("renders horizontal constraint select", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByLabelText("Horizontal constraint")).toBeInTheDocument();
  });

  it("renders vertical constraint select", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByLabelText("Vertical constraint")).toBeInTheDocument();
  });

  it("renders horizontal alignment controls", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByLabelText("Horizontal alignment")).toBeInTheDocument();
    expect(screen.getByLabelText("Align left")).toBeInTheDocument();
    expect(screen.getByLabelText("Align center")).toBeInTheDocument();
    expect(screen.getByLabelText("Align right")).toBeInTheDocument();
  });

  it("renders vertical alignment controls", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByLabelText("Vertical alignment")).toBeInTheDocument();
    expect(screen.getByLabelText("Align top")).toBeInTheDocument();
    expect(screen.getByLabelText("Align middle")).toBeInTheDocument();
    expect(screen.getByLabelText("Align bottom")).toBeInTheDocument();
  });

  it("updates horizontal alignment when clicked", () => {
    const ref = { settings: undefined as PositionSettings | undefined };
    render(<PositionPanel settings={defaultSettings} onChange={(s) => { ref.settings = s; }} />);

    const centerButton = screen.getByLabelText("Align center");
    fireEvent.click(centerButton);

    expect(ref.settings).toBeDefined();
    expect(ref.settings!.horizontalAlign).toBe("center");
  });

  it("updates vertical alignment when clicked", () => {
    const ref = { settings: undefined as PositionSettings | undefined };
    render(<PositionPanel settings={defaultSettings} onChange={(s) => { ref.settings = s; }} />);

    const middleButton = screen.getByLabelText("Align middle");
    fireEvent.click(middleButton);

    expect(ref.settings).toBeDefined();
    expect(ref.settings!.verticalAlign).toBe("middle");
  });

  it("calls onClose when close button is clicked", () => {
    const ref = { count: 0 };
    render(
      <PositionPanel settings={defaultSettings} onChange={() => {}} onClose={() => { ref.count += 1; }} />,
    );

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(ref.count).toBe(1);
  });

  it("calls onToggleConstraints when constraint toggle is clicked", () => {
    const ref = { count: 0 };
    render(
      <PositionPanel
        settings={defaultSettings}
        onChange={() => {}}
        onToggleConstraints={() => { ref.count += 1; }}
      />,
    );

    const toggleButton = screen.getByLabelText("Toggle constraints");
    fireEvent.click(toggleButton);

    expect(ref.count).toBe(1);
  });

  it("calls onTransformAction when transform button is clicked", () => {
    const ref = { action: null as string | null };
    render(
      <PositionPanel
        settings={defaultSettings}
        onChange={() => {}}
        onTransformAction={(action) => { ref.action = action; }}
      />,
    );

    const flipHButton = screen.getByLabelText("Flip horizontal");
    fireEvent.click(flipHButton);

    expect(ref.action).toBe("flip-horizontal");
  });

  it("applies custom width", () => {
    const { container } = render(
      <PositionPanel settings={defaultSettings} onChange={() => {}} width={400} />,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("400px");
  });

  it("applies custom className", () => {
    const { container } = render(
      <PositionPanel
        settings={defaultSettings}
        onChange={() => {}}
        className="custom-class"
      />,
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.classList.contains("custom-class")).toBe(true);
  });

  describe("createDefaultPositionSettings", () => {
    it("returns default settings", () => {
      const settings = createDefaultPositionSettings();

      expect(settings).toEqual({
        horizontalAlign: "left",
        verticalAlign: "top",
        x: "0",
        y: "0",
        horizontalConstraint: "left",
        verticalConstraint: "top",
        rotation: "0",
      });
    });
  });

  describe("constraint visualization", () => {
    it("renders constraint visualization", () => {
      render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

      const panel = screen.getByText("Constraints").closest("div");
      expect(panel).toBeInTheDocument();
    });

    it("updates constraint visualization when constraints change", () => {
      const settings: PositionSettings = {
        ...defaultSettings,
        horizontalConstraint: "center",
        verticalConstraint: "center",
      };
      render(<PositionPanel settings={settings} onChange={() => {}} />);

      const panel = screen.getByText("Constraints").closest("div");
      expect(panel).toBeInTheDocument();
    });
  });

  describe("layout overflow prevention", () => {
    it("segmented controls have minWidth: 0 wrapper to allow shrinking", () => {
      render(
        <PositionPanel settings={defaultSettings} onChange={() => {}} width={320} />,
      );

      const horizontalAlignment = screen.getByLabelText("Horizontal alignment");
      const verticalAlignment = screen.getByLabelText("Vertical alignment");

      const hWrapper = horizontalAlignment.parentElement;
      const vWrapper = verticalAlignment.parentElement;

      expect(hWrapper?.style.minWidth).toBe("0");
      expect(vWrapper?.style.minWidth).toBe("0");
    });

    it("constraint visualization has flexShrink: 0", () => {
      render(
        <PositionPanel settings={defaultSettings} onChange={() => {}} width={320} />,
      );

      const constraintsSection = screen.getByText("Constraints").closest("div")?.parentElement;
      const visualization = constraintsSection?.querySelector('[style*="width: 100px"]') as HTMLElement;

      expect(visualization).not.toBeNull();
      expect(visualization.style.flexShrink).toBe("0");
    });

    it("position grid wrapper has minWidth: 0", () => {
      render(
        <PositionPanel settings={defaultSettings} onChange={() => {}} width={320} />,
      );

      const xInput = screen.getByLabelText("X position");
      // grid wrapper is the parent of the input's container
      const gridWrapper = xInput.closest('[style*="display: grid"]');

      expect(gridWrapper).not.toBeNull();
      expect((gridWrapper as HTMLElement).style.minWidth).toBe("0");
    });

    it("rotation input wrapper has minWidth: 0", () => {
      render(
        <PositionPanel settings={defaultSettings} onChange={() => {}} width={320} />,
      );

      const rotationInput = screen.getByLabelText("Rotation");
      // The wrapper div around the input
      const inputContainer = rotationInput.closest('[style*="display: flex"]');
      const wrapper = inputContainer?.parentElement;

      expect(wrapper).not.toBeNull();
      expect((wrapper as HTMLElement).style.minWidth).toBe("0");
    });

    it("constraints selects column has minWidth: 0", () => {
      render(
        <PositionPanel settings={defaultSettings} onChange={() => {}} width={320} />,
      );

      const hConstraint = screen.getByLabelText("Horizontal constraint");
      // Navigate up to the column container
      const selectsColumn = hConstraint.closest('[style*="flex-direction: column"]');

      expect(selectsColumn).not.toBeNull();
      expect((selectsColumn as HTMLElement).style.minWidth).toBe("0");
    });
  });
});
