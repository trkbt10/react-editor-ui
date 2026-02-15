/**
 * @file ThemeSelector tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSelector, getThemeNames } from "./ThemeSelector";
import { clearTheme } from "./injectTheme";

describe("ThemeSelector", () => {
  afterEach(() => {
    clearTheme();
  });

  it("renders select with current theme", () => {
    render(<ThemeSelector value="light" onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Light");
  });

  it("shows all theme options", () => {
    render(<ThemeSelector value="light" onChange={() => {}} />);

    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Light");
    expect(options[1]).toHaveTextContent("Dark");
    expect(options[2]).toHaveTextContent("High Contrast");
  });

  it("calls onChange when theme selected", () => {
    let selectedTheme = "light";
    const handleChange = (theme: string) => {
      selectedTheme = theme;
    };

    render(
      <ThemeSelector
        value="light"
        onChange={handleChange as (theme: "light" | "dark" | "high-contrast-light") => void}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Dark"));
    expect(selectedTheme).toBe("dark");
  });

  it("injects theme CSS on mount", () => {
    render(<ThemeSelector value="dark" onChange={() => {}} />);

    const style = document.getElementById("rei-theme-vars");
    expect(style).toBeInTheDocument();
    expect(style?.textContent).toContain("--rei-color-surface: #1e1f24");
  });

  it("updates theme CSS when value changes", () => {
    const { rerender } = render(<ThemeSelector value="light" onChange={() => {}} />);

    const style = document.getElementById("rei-theme-vars");
    expect(style?.textContent).toContain("--rei-color-surface: #ffffff");

    rerender(<ThemeSelector value="dark" onChange={() => {}} />);
    expect(style?.textContent).toContain("--rei-color-surface: #1e1f24");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ThemeSelector value="light" onChange={() => {}} className="custom-selector" />,
    );

    expect(container.querySelector(".custom-selector")).toBeInTheDocument();
  });

  it("applies aria-label", () => {
    render(
      <ThemeSelector value="light" onChange={() => {}} aria-label="Choose theme" />,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute("aria-label", "Choose theme");
  });
});

describe("getThemeNames", () => {
  it("returns all theme names", () => {
    const names = getThemeNames();

    expect(names).toContain("light");
    expect(names).toContain("dark");
    expect(names).toContain("high-contrast-light");
  });
});
