/**
 * @file FontsPanel component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { FontsPanel, type FontItem } from "./FontsPanel";

describe("FontsPanel", () => {
  const sampleFonts: FontItem[] = [
    { name: "SF Pro", family: "'SF Pro', sans-serif", category: "sans-serif" },
    { name: "SF Pro Rounded", family: "'SF Pro Rounded', sans-serif", category: "sans-serif" },
    { name: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
    { name: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
    { name: "Playfair Display", family: "'Playfair Display', serif", category: "serif" },
    { name: "Georgia", family: "'Georgia', serif", category: "serif" },
    { name: "Fira Code", family: "'Fira Code', monospace", category: "monospace" },
    { name: "Dancing Script", family: "'Dancing Script', cursive", category: "handwriting" },
  ];

  it("renders panel title", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );
    expect(screen.getByText("Fonts")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );
    expect(screen.getByLabelText("Search fonts")).toBeInTheDocument();
  });

  it("renders category filter", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );
    expect(screen.getByLabelText("Font category")).toBeInTheDocument();
  });

  it("renders all fonts in list", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    sampleFonts.forEach((font) => {
      expect(screen.getByText(font.name)).toBeInTheDocument();
    });
  });

  it("marks selected font with aria-selected", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="Inter" onSelectFont={() => {}} />
    );

    const interOption = screen.getByRole("option", { name: "Inter" });
    expect(interOption).toHaveAttribute("aria-selected", "true");

    const sfProOption = screen.getByRole("option", { name: "SF Pro" });
    expect(sfProOption).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelectFont when font is clicked", () => {
    const ref = { value: "" };
    const handleSelectFont = (fontName: string) => {
      ref.value = fontName;
    };
    render(
      <FontsPanel
        fonts={sampleFonts}
        selectedFont="SF Pro"
        onSelectFont={handleSelectFont}
      />
    );

    const robotoOption = screen.getByText("Roboto");
    fireEvent.click(robotoOption);

    expect(ref.value).toBe("Roboto");
  });

  it("filters fonts by search query", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    const searchInput = screen.getByLabelText("Search fonts");
    fireEvent.change(searchInput, { target: { value: "Pro" } });

    expect(screen.getByText("SF Pro")).toBeInTheDocument();
    expect(screen.getByText("SF Pro Rounded")).toBeInTheDocument();
    expect(screen.queryByText("Inter")).not.toBeInTheDocument();
    expect(screen.queryByText("Roboto")).not.toBeInTheDocument();
  });

  it("filters fonts by category", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    // Click the category dropdown
    const categorySelect = screen.getByLabelText("Font category");
    fireEvent.click(categorySelect);

    // Select "Serif" category
    const serifOption = screen.getByRole("option", { name: "Serif" });
    fireEvent.click(serifOption);

    expect(screen.getByText("Playfair Display")).toBeInTheDocument();
    expect(screen.getByText("Georgia")).toBeInTheDocument();
    expect(screen.queryByText("SF Pro")).not.toBeInTheDocument();
    expect(screen.queryByText("Fira Code")).not.toBeInTheDocument();
  });

  it("shows 'No fonts found' when search has no results", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    const searchInput = screen.getByLabelText("Search fonts");
    fireEvent.change(searchInput, { target: { value: "NonexistentFont" } });

    expect(screen.getByText("No fonts found")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const ref = { called: false };
    const handleClose = () => {
      ref.called = true;
    };
    render(
      <FontsPanel
        fonts={sampleFonts}
        selectedFont="SF Pro"
        onSelectFont={() => {}}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(ref.called).toBe(true);
  });

  it("calls onSettings when settings button is clicked", () => {
    const ref = { called: false };
    const handleSettings = () => {
      ref.called = true;
    };
    render(
      <FontsPanel
        fonts={sampleFonts}
        selectedFont="SF Pro"
        onSelectFont={() => {}}
        onSettings={handleSettings}
      />
    );

    const settingsButton = screen.getByLabelText("Font settings");
    fireEvent.click(settingsButton);

    expect(ref.called).toBe(true);
  });

  it("does not render close button when onClose is not provided", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );
    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });

  it("does not render settings button when onSettings is not provided", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );
    expect(screen.queryByLabelText("Font settings")).not.toBeInTheDocument();
  });

  it("combines search and category filters", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    // First filter by category
    const categorySelect = screen.getByLabelText("Font category");
    fireEvent.click(categorySelect);
    const sansSerifOption = screen.getByRole("option", { name: "Sans Serif" });
    fireEvent.click(sansSerifOption);

    // Then search
    const searchInput = screen.getByLabelText("Search fonts");
    fireEvent.change(searchInput, { target: { value: "SF" } });

    // Should only show sans-serif fonts matching "SF"
    expect(screen.getByText("SF Pro")).toBeInTheDocument();
    expect(screen.getByText("SF Pro Rounded")).toBeInTheDocument();
    expect(screen.queryByText("Inter")).not.toBeInTheDocument();
  });

  it("search is case insensitive", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    const searchInput = screen.getByLabelText("Search fonts");
    fireEvent.change(searchInput, { target: { value: "sf pro" } });

    expect(screen.getByText("SF Pro")).toBeInTheDocument();
    expect(screen.getByText("SF Pro Rounded")).toBeInTheDocument();
  });

  it("applies custom width", () => {
    const { container } = render(
      <FontsPanel
        fonts={sampleFonts}
        selectedFont="SF Pro"
        onSelectFont={() => {}}
        width={400}
      />
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("400px");
  });

  it("applies custom width as string", () => {
    const { container } = render(
      <FontsPanel
        fonts={sampleFonts}
        selectedFont="SF Pro"
        onSelectFont={() => {}}
        width="50%"
      />
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("50%");
  });

  it("applies custom maxHeight", () => {
    const { container } = render(
      <FontsPanel
        fonts={sampleFonts}
        selectedFont="SF Pro"
        onSelectFont={() => {}}
        maxHeight={500}
      />
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.maxHeight).toBe("500px");
  });

  it("displays fonts in their own font family", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    const interText = screen.getByText("Inter");
    expect(interText).toHaveStyle({ fontFamily: "'Inter', sans-serif" });
  });

  it("clears search when clear button is clicked", () => {
    render(
      <FontsPanel fonts={sampleFonts} selectedFont="SF Pro" onSelectFont={() => {}} />
    );

    const searchInput = screen.getByLabelText("Search fonts");
    fireEvent.change(searchInput, { target: { value: "SF" } });

    // The clearable input should show a clear button
    const clearButton = screen.getByLabelText("Clear");
    fireEvent.click(clearButton);

    // All fonts should be visible again
    sampleFonts.forEach((font) => {
      expect(screen.getByText(font.name)).toBeInTheDocument();
    });
  });
});
