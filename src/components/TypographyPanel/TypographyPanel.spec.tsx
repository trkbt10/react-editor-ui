/**
 * @file TypographyPanel component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { TypographyPanel, type TypographySettings } from "./TypographyPanel";

describe("TypographyPanel", () => {
  const defaultSettings: TypographySettings = {
    fontFamily: "SF Pro",
    fontWeight: "400",
    fontSize: "28",
    lineHeight: "Auto",
    letterSpacing: "0px",
    textAlign: "left",
    verticalAlign: "top",
  };

  it("renders typography section header", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByText("Typography")).toBeInTheDocument();
  });

  it("renders font family selector", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByLabelText("Font family")).toBeInTheDocument();
  });

  it("renders font weight selector", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByLabelText("Font weight")).toBeInTheDocument();
  });

  it("renders font size input", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByLabelText("Font size")).toBeInTheDocument();
  });

  it("renders line height input", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByLabelText("Line height")).toBeInTheDocument();
  });

  it("renders letter spacing input", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByLabelText("Letter spacing")).toBeInTheDocument();
  });

  it("renders horizontal alignment controls", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByLabelText("Horizontal alignment")).toBeInTheDocument();
    expect(screen.getByLabelText("Align left")).toBeInTheDocument();
    expect(screen.getByLabelText("Align center")).toBeInTheDocument();
    expect(screen.getByLabelText("Align right")).toBeInTheDocument();
  });

  it("renders vertical alignment controls", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);
    expect(screen.getByLabelText("Vertical alignment")).toBeInTheDocument();
    expect(screen.getByLabelText("Align top")).toBeInTheDocument();
    expect(screen.getByLabelText("Align middle")).toBeInTheDocument();
    expect(screen.getByLabelText("Align bottom")).toBeInTheDocument();
  });

  it("calls onChange when font size is changed", () => {
    let capturedSettings: TypographySettings | null = null;
    const handleChange = (settings: TypographySettings) => {
      capturedSettings = settings;
    };
    render(<TypographyPanel settings={defaultSettings} onChange={handleChange} />);

    const fontSizeInput = screen.getByLabelText("Font size");
    fireEvent.focus(fontSizeInput);
    fireEvent.change(fontSizeInput, { target: { value: "32px" } });
    fireEvent.blur(fontSizeInput);

    expect(capturedSettings).toEqual({
      ...defaultSettings,
      fontSize: "32px",
    });
  });

  it("calls onChange when text alignment is changed", () => {
    let capturedSettings: TypographySettings | null = null;
    const handleChange = (settings: TypographySettings) => {
      capturedSettings = settings;
    };
    render(<TypographyPanel settings={defaultSettings} onChange={handleChange} />);

    const centerButton = screen.getByLabelText("Align center");
    fireEvent.click(centerButton);

    expect(capturedSettings).toEqual({
      ...defaultSettings,
      textAlign: "center",
    });
  });

  it("calls onChange when vertical alignment is changed", () => {
    let capturedSettings: TypographySettings | null = null;
    const handleChange = (settings: TypographySettings) => {
      capturedSettings = settings;
    };
    render(<TypographyPanel settings={defaultSettings} onChange={handleChange} />);

    const middleButton = screen.getByLabelText("Align middle");
    fireEvent.click(middleButton);

    expect(capturedSettings).toEqual({
      ...defaultSettings,
      verticalAlign: "middle",
    });
  });

  it("collapses content when header is clicked", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);

    const header = screen.getByRole("button", { name: /typography/i });
    expect(screen.getByLabelText("Font family")).toBeInTheDocument();

    fireEvent.click(header);

    expect(screen.queryByLabelText("Font family")).not.toBeInTheDocument();
  });

  it("expands content when collapsed header is clicked", () => {
    render(<TypographyPanel settings={defaultSettings} onChange={() => {}} />);

    const header = screen.getByRole("button", { name: /typography/i });
    fireEvent.click(header); // collapse
    fireEvent.click(header); // expand

    expect(screen.getByLabelText("Font family")).toBeInTheDocument();
  });

  it("calls onOpenFontsPanel when font icon is clicked", () => {
    let fontsPanelOpened = false;
    const handleOpenFontsPanel = () => {
      fontsPanelOpened = true;
    };
    render(
      <TypographyPanel
        settings={defaultSettings}
        onChange={() => {}}
        onOpenFontsPanel={handleOpenFontsPanel}
      />
    );

    // Font is available, so shows "A" icon
    const fontIcon = screen.getByTestId("font-icon");
    fireEvent.click(fontIcon);

    expect(fontsPanelOpened).toBe(true);
  });

  it("shows A? icon when font is not in options list", () => {
    const missingFontSettings = { ...defaultSettings, fontFamily: "Unknown Font" };
    render(
      <TypographyPanel
        settings={missingFontSettings}
        onChange={() => {}}
      />
    );

    expect(screen.getByTestId("font-icon-missing")).toBeInTheDocument();
  });

  it("shows A icon when font is in options list", () => {
    render(
      <TypographyPanel
        settings={defaultSettings}
        onChange={() => {}}
      />
    );

    expect(screen.getByTestId("font-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("font-icon-missing")).not.toBeInTheDocument();
  });

  it("calls onOpenSettings when settings button is clicked", () => {
    let settingsOpened = false;
    const handleOpenSettings = () => {
      settingsOpened = true;
    };
    render(
      <TypographyPanel
        settings={defaultSettings}
        onChange={() => {}}
        onOpenSettings={handleOpenSettings}
      />
    );

    const settingsButton = screen.getByLabelText("Advanced settings");
    fireEvent.click(settingsButton);

    expect(settingsOpened).toBe(true);
  });

  it("uses custom font options when provided", () => {
    const customFonts = [
      { value: "Custom Font", label: "Custom Font" },
      { value: "Another Font", label: "Another Font" },
    ];

    render(
      <TypographyPanel
        settings={{ ...defaultSettings, fontFamily: "Custom Font" }}
        onChange={() => {}}
        fontOptions={customFonts}
      />
    );

    const fontSelect = screen.getByLabelText("Font family");
    expect(fontSelect).toHaveTextContent("Custom Font");
  });

  it("uses custom weight options when provided", () => {
    const customWeights = [
      { value: "300", label: "Light" },
      { value: "700", label: "Bold" },
    ];

    render(
      <TypographyPanel
        settings={{ ...defaultSettings, fontWeight: "700" }}
        onChange={() => {}}
        weightOptions={customWeights}
      />
    );

    const weightSelect = screen.getByLabelText("Font weight");
    expect(weightSelect).toHaveTextContent("Bold");
  });

  it("applies className when provided", () => {
    const { container } = render(
      <TypographyPanel
        settings={defaultSettings}
        onChange={() => {}}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
