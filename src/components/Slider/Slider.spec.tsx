/**
 * @file Slider component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("renders with default props", () => {
    render(<Slider value={0.5} onChange={() => {}} aria-label="Test slider" />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuenow", "50");
  });

  it("displays correct aria values", () => {
    render(<Slider value={0.75} onChange={() => {}} aria-label="Test slider" />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuenow", "75");
  });

  it("applies custom background", () => {
    const background = "linear-gradient(to right, red, blue)";
    const { container } = render(
      <Slider value={0.5} onChange={() => {}} background={background} />,
    );
    const track = container.firstChild as HTMLElement;
    expect(track.style.background).toBe(background);
  });

  it("handles disabled state", () => {
    render(
      <Slider value={0.5} onChange={() => {}} disabled aria-label="Test slider" />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).toHaveAttribute("tabIndex", "-1");
  });

  it("does not call onChange when disabled", () => {
    const ref = { callCount: 0 };
    const handleChange = () => {
      ref.callCount++;
    };
    const { container } = render(
      <Slider value={0.5} onChange={handleChange} disabled aria-label="Test slider" />,
    );
    const track = container.firstChild as HTMLElement;

    fireEvent.pointerDown(track, { clientX: 75, clientY: 5 });
    expect(ref.callCount).toBe(0);
  });

  it("applies custom height", () => {
    const { container } = render(
      <Slider value={0.5} onChange={() => {}} height={20} />,
    );
    const track = container.firstChild as HTMLElement;
    expect(track.style.height).toBe("20px");
  });
});
