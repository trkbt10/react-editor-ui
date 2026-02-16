/**
 * @file LocalFontList component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { LocalFontList } from "./LocalFontList";

describe("LocalFontList", () => {
  it("renders panel title", () => {
    render(
      <LocalFontList selectedFont="" onSelectFont={() => {}} />
    );
    expect(screen.getByText("Local Fonts")).toBeInTheDocument();
  });

  it("shows permission request button when API is not supported", () => {
    render(
      <LocalFontList selectedFont="" onSelectFont={() => {}} />
    );
    // When API is not supported, it shows the not-supported message
    expect(screen.getByText(/Local Font Access API is not supported/)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const tracker = { closeCalled: false };
    const handleClose = () => {
      tracker.closeCalled = true;
    };
    render(
      <LocalFontList
        selectedFont=""
        onSelectFont={() => {}}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(tracker.closeCalled).toBe(true);
  });

  it("calls onSettings when settings button is clicked", () => {
    const tracker = { settingsCalled: false };
    const handleSettings = () => {
      tracker.settingsCalled = true;
    };
    render(
      <LocalFontList
        selectedFont=""
        onSelectFont={() => {}}
        onSettings={handleSettings}
      />
    );

    const settingsButton = screen.getByLabelText("Font settings");
    fireEvent.click(settingsButton);

    expect(tracker.settingsCalled).toBe(true);
  });

  it("does not render close button when onClose is not provided", () => {
    render(
      <LocalFontList selectedFont="" onSelectFont={() => {}} />
    );
    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });

  it("does not render settings button when onSettings is not provided", () => {
    render(
      <LocalFontList selectedFont="" onSelectFont={() => {}} />
    );
    expect(screen.queryByLabelText("Font settings")).not.toBeInTheDocument();
  });

  it("applies custom width", () => {
    const { container } = render(
      <LocalFontList
        selectedFont=""
        onSelectFont={() => {}}
        width={400}
      />
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("400px");
  });

  it("applies custom width as string", () => {
    const { container } = render(
      <LocalFontList
        selectedFont=""
        onSelectFont={() => {}}
        width="50%"
      />
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe("50%");
  });

  it("applies custom maxHeight", () => {
    const { container } = render(
      <LocalFontList
        selectedFont=""
        onSelectFont={() => {}}
        maxHeight={500}
      />
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.maxHeight).toBe("500px");
  });

  it("applies className when provided", () => {
    const { container } = render(
      <LocalFontList
        selectedFont=""
        onSelectFont={() => {}}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
