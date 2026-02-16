/**
 * @file AlignmentSelect components tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ObjectHorizontalAlignSelect } from "./ObjectHorizontalAlignSelect";
import { ObjectVerticalAlignSelect } from "./ObjectVerticalAlignSelect";
import { TextHorizontalAlignSelect } from "./TextHorizontalAlignSelect";
import { TextVerticalAlignSelect } from "./TextVerticalAlignSelect";

describe("ObjectHorizontalAlignSelect", () => {
  it("renders three alignment options", () => {
    render(
      <ObjectHorizontalAlignSelect value="left" onChange={() => {}} />,
    );

    expect(screen.getByRole("radio", { name: "Align left" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align center" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align right" })).toBeInTheDocument();
  });

  it("calls onChange with correct value", () => {
    const ref = { value: "" };
    const handleChange = (v: string) => {
      ref.value = v;
    };

    render(
      <ObjectHorizontalAlignSelect value="left" onChange={handleChange} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Align center" }));
    expect(ref.value).toBe("center");
  });

  it("applies disabled state", () => {
    render(
      <ObjectHorizontalAlignSelect value="left" onChange={() => {}} disabled />,
    );

    expect(screen.getByRole("radio", { name: "Align left" })).toBeDisabled();
  });
});

describe("ObjectVerticalAlignSelect", () => {
  it("renders three alignment options", () => {
    render(
      <ObjectVerticalAlignSelect value="top" onChange={() => {}} />,
    );

    expect(screen.getByRole("radio", { name: "Align top" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align middle" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align bottom" })).toBeInTheDocument();
  });

  it("calls onChange with correct value", () => {
    const ref = { value: "" };
    const handleChange = (v: string) => {
      ref.value = v;
    };

    render(
      <ObjectVerticalAlignSelect value="top" onChange={handleChange} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Align middle" }));
    expect(ref.value).toBe("middle");
  });
});

describe("TextHorizontalAlignSelect", () => {
  it("renders three alignment options", () => {
    render(
      <TextHorizontalAlignSelect value="left" onChange={() => {}} />,
    );

    expect(screen.getByRole("radio", { name: "Align left" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align center" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align right" })).toBeInTheDocument();
  });

  it("calls onChange with correct value", () => {
    const ref = { value: "" };
    const handleChange = (v: string) => {
      ref.value = v;
    };

    render(
      <TextHorizontalAlignSelect value="left" onChange={handleChange} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Align right" }));
    expect(ref.value).toBe("right");
  });
});

describe("TextVerticalAlignSelect", () => {
  it("renders three alignment options", () => {
    render(
      <TextVerticalAlignSelect value="top" onChange={() => {}} />,
    );

    expect(screen.getByRole("radio", { name: "Align top" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align middle" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Align bottom" })).toBeInTheDocument();
  });

  it("calls onChange with correct value", () => {
    const ref = { value: "" };
    const handleChange = (v: string) => {
      ref.value = v;
    };

    render(
      <TextVerticalAlignSelect value="top" onChange={handleChange} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Align bottom" }));
    expect(ref.value).toBe("bottom");
  });
});
