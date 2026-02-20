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
    const ref = { value: null as TypographySettings | null };
    const handleChange = (settings: TypographySettings) => {
      ref.value = settings;
    };
    render(<TypographyPanel settings={defaultSettings} onChange={handleChange} />);

    const fontSizeInput = screen.getByLabelText("Font size");
    fireEvent.focus(fontSizeInput);
    fireEvent.change(fontSizeInput, { target: { value: "32px" } });
    fireEvent.blur(fontSizeInput);

    expect(ref.value).toEqual({
      ...defaultSettings,
      fontSize: "32px",
    });
  });

  it("calls onChange when text alignment is changed", () => {
    const ref = { value: null as TypographySettings | null };
    const handleChange = (settings: TypographySettings) => {
      ref.value = settings;
    };
    render(<TypographyPanel settings={defaultSettings} onChange={handleChange} />);

    const centerButton = screen.getByLabelText("Align center");
    fireEvent.click(centerButton);

    expect(ref.value).toEqual({
      ...defaultSettings,
      textAlign: "center",
    });
  });

  it("calls onChange when vertical alignment is changed", () => {
    const ref = { value: null as TypographySettings | null };
    const handleChange = (settings: TypographySettings) => {
      ref.value = settings;
    };
    render(<TypographyPanel settings={defaultSettings} onChange={handleChange} />);

    const middleButton = screen.getByLabelText("Align middle");
    fireEvent.click(middleButton);

    expect(ref.value).toEqual({
      ...defaultSettings,
      verticalAlign: "middle",
    });
  });

  it("calls onOpenFontsPanel when font icon is clicked", () => {
    const ref = { value: false };
    const handleOpenFontsPanel = () => {
      ref.value = true;
    };
    render(
      <TypographyPanel
        settings={defaultSettings}
        onChange={() => {}}
        onOpenFontsPanel={handleOpenFontsPanel}
      />
    );

    // Font is not in defaultFontOptions, so shows "A?" icon (font-icon-missing)
    const fontIcon = screen.getByTestId("font-icon-missing");
    fireEvent.click(fontIcon);

    expect(ref.value).toBe(true);
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
    // Provide fontOptions that include the settings fontFamily
    const fontOptions = [{ value: "SF Pro", label: "SF Pro" }];
    render(
      <TypographyPanel
        settings={defaultSettings}
        onChange={() => {}}
        fontOptions={fontOptions}
      />
    );

    expect(screen.getByTestId("font-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("font-icon-missing")).not.toBeInTheDocument();
  });

  it("calls onOpenSettings when settings button is clicked", () => {
    const ref = { value: false };
    const handleOpenSettings = () => {
      ref.value = true;
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

    expect(ref.value).toBe(true);
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
