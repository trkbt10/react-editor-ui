/**
 * @file Tooltip component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders children", () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByRole("button", { name: "Hover me" })).toBeInTheDocument();
  });

  it("renders tooltip element with hidden state initially", () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toHaveAttribute("aria-hidden", "true");
  });

  it("shows tooltip immediately when delay is 0 on pointer enter", () => {
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" }).parentElement!;

    fireEvent.pointerEnter(trigger);

    // With delay=0, tooltip shows immediately
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toHaveAttribute("aria-hidden", "false");
  });

  it("hides tooltip on pointer leave", () => {
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" }).parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });

    fireEvent.pointerEnter(trigger);
    expect(tooltip).toHaveAttribute("aria-hidden", "false");

    fireEvent.pointerLeave(trigger);
    expect(tooltip).toHaveAttribute("aria-hidden", "true");
  });

  it("does not show tooltip when disabled", () => {
    render(
      <Tooltip content="Tooltip content" delay={0} disabled>
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" }).parentElement!;

    fireEvent.pointerEnter(trigger);

    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toHaveAttribute("aria-hidden", "true");
  });

  it("renders with different placements", () => {
    const placements = ["top", "bottom", "left", "right"] as const;

    placements.forEach((placement) => {
      const { unmount } = render(
        <Tooltip content={`Tooltip ${placement}`} placement={placement}>
          <button>Button</button>
        </Tooltip>,
      );

      expect(screen.getByRole("tooltip", { hidden: true })).toBeInTheDocument();
      unmount();
    });
  });

  it("renders custom ReactNode content", () => {
    render(
      <Tooltip
        content={
          <span>
            <strong>Bold</strong> content
          </span>
        }
        delay={0}
      >
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" }).parentElement!;

    fireEvent.pointerEnter(trigger);

    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies custom className to wrapper", () => {
    render(
      <Tooltip content="Content" className="custom-tooltip">
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = screen.getByRole("button").parentElement!;
    expect(wrapper).toHaveClass("custom-tooltip");
  });

  it("contains tooltip content text", () => {
    render(
      <Tooltip content="My tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toHaveTextContent("My tooltip text");
  });

  it("renders SVG element for tooltip background", () => {
    render(
      <Tooltip content="Content" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button").parentElement!;
    fireEvent.pointerEnter(trigger);

    const tooltip = screen.getByRole("tooltip", { hidden: true });
    const svg = tooltip.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders SVG path element for tooltip shape", () => {
    render(
      <Tooltip content="Content" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button").parentElement!;
    fireEvent.pointerEnter(trigger);

    const tooltip = screen.getByRole("tooltip", { hidden: true });
    const path = tooltip.querySelector("svg path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("d");
    expect(path).toHaveAttribute("fill", "var(--rei-tooltip-bg, #1f2937)");
  });

  it("accepts custom arrowSize prop", () => {
    render(
      <Tooltip content="Content" delay={0} arrowSize={10}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button").parentElement!;
    fireEvent.pointerEnter(trigger);

    // Tooltip should render without errors with custom arrow size
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toBeInTheDocument();
  });
});
