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
    let capturedSettings: PositionSettings | undefined;
    const handleChange = (settings: PositionSettings) => {
      capturedSettings = settings;
    };
    render(<PositionPanel settings={defaultSettings} onChange={handleChange} />);

    const xInput = screen.getByLabelText("X position");
    fireEvent.change(xInput, { target: { value: "100" } });

    expect(capturedSettings).toBeDefined();
    expect(capturedSettings!.x).toBe("100");
  });

  it("updates Y position when input changes", () => {
    let capturedSettings: PositionSettings | undefined;
    const handleChange = (settings: PositionSettings) => {
      capturedSettings = settings;
    };
    render(<PositionPanel settings={defaultSettings} onChange={handleChange} />);

    const yInput = screen.getByLabelText("Y position");
    fireEvent.change(yInput, { target: { value: "200" } });

    expect(capturedSettings).toBeDefined();
    expect(capturedSettings!.y).toBe("200");
  });

  it("renders rotation input with degree suffix", () => {
    render(<PositionPanel settings={defaultSettings} onChange={() => {}} />);

    expect(screen.getByLabelText("Rotation")).toBeInTheDocument();
    expect(screen.getByText("°")).toBeInTheDocument();
  });

  it("updates rotation when input changes", () => {
    let capturedSettings: PositionSettings | undefined;
    const handleChange = (settings: PositionSettings) => {
      capturedSettings = settings;
    };
    render(<PositionPanel settings={defaultSettings} onChange={handleChange} />);

    const rotationInput = screen.getByLabelText("Rotation");
    fireEvent.change(rotationInput, { target: { value: "45" } });

    expect(capturedSettings).toBeDefined();
    expect(capturedSettings!.rotation).toBe("45");
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
    let capturedSettings: PositionSettings | undefined;
    const handleChange = (settings: PositionSettings) => {
      capturedSettings = settings;
    };
    render(<PositionPanel settings={defaultSettings} onChange={handleChange} />);

    const centerButton = screen.getByLabelText("Align center");
    fireEvent.click(centerButton);

    expect(capturedSettings).toBeDefined();
    expect(capturedSettings!.horizontalAlign).toBe("center");
  });

  it("updates vertical alignment when clicked", () => {
    let capturedSettings: PositionSettings | undefined;
    const handleChange = (settings: PositionSettings) => {
      capturedSettings = settings;
    };
    render(<PositionPanel settings={defaultSettings} onChange={handleChange} />);

    const middleButton = screen.getByLabelText("Align middle");
    fireEvent.click(middleButton);

    expect(capturedSettings).toBeDefined();
    expect(capturedSettings!.verticalAlign).toBe("middle");
  });

  it("calls onClose when close button is clicked", () => {
    let closeCount = 0;
    const handleClose = () => {
      closeCount += 1;
    };
    render(
      <PositionPanel settings={defaultSettings} onChange={() => {}} onClose={handleClose} />,
    );

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(closeCount).toBe(1);
  });

  it("calls onToggleConstraints when constraint toggle is clicked", () => {
    let toggleCount = 0;
    const handleToggle = () => {
      toggleCount += 1;
    };
    render(
      <PositionPanel
        settings={defaultSettings}
        onChange={() => {}}
        onToggleConstraints={handleToggle}
      />,
    );

    const toggleButton = screen.getByLabelText("Toggle constraints");
    fireEvent.click(toggleButton);

    expect(toggleCount).toBe(1);
  });

  it("calls onTransformAction when transform button is clicked", () => {
    let capturedAction: string | null = null;
    const handleTransformAction = (action: string) => {
      capturedAction = action;
    };
    render(
      <PositionPanel
        settings={defaultSettings}
        onChange={() => {}}
        onTransformAction={handleTransformAction}
      />,
    );

    const flipHButton = screen.getByLabelText("Flip horizontal");
    fireEvent.click(flipHButton);

    expect(capturedAction).toBe("flip-horizontal");
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
});
