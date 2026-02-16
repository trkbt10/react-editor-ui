/**
 * @file ProjectMenu component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectMenu } from "./ProjectMenu";

describe("ProjectMenu", () => {
  it("renders project name", () => {
    render(<ProjectMenu name="My Project" />);

    expect(screen.getByText("My Project")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(
      <ProjectMenu
        name="My Project"
        icon={<span data-testid="project-icon">P</span>}
      />,
    );

    expect(screen.getByTestId("project-icon")).toBeInTheDocument();
  });

  it("renders badges", () => {
    render(
      <ProjectMenu
        name="My Project"
        badges={[
          { label: "Draft" },
          { label: "Free", variant: "accent" },
        ]}
      />,
    );

    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <ProjectMenu name="My Project" description="A sample project" />,
    );

    expect(screen.getByText("A sample project")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<ProjectMenu name="My Project" onClick={handleClick} />);

    fireEvent.click(screen.getByText("My Project"));

    expect(handleClick).toHaveBeenCalled();
  });

  it("shows chevron when onClick is provided", () => {
    const { container } = render(
      <ProjectMenu name="My Project" onClick={() => {}} />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not show chevron when onClick is not provided", () => {
    render(<ProjectMenu name="My Project" />);

    // No button role when not clickable
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <ProjectMenu
        name="My Project"
        action={<button type="button">Settings</button>}
      />,
    );

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("action click does not trigger main onClick", () => {
    const handleClick = vi.fn();
    const handleAction = vi.fn();
    render(
      <ProjectMenu
        name="My Project"
        onClick={handleClick}
        action={<button type="button" onClick={handleAction}>Settings</button>}
      />,
    );

    fireEvent.click(screen.getByText("Settings"));

    expect(handleAction).toHaveBeenCalled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ProjectMenu name="My Project" className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders badge with icon", () => {
    render(
      <ProjectMenu
        name="My Project"
        badges={[{ label: "Branch", icon: <span data-testid="branch-icon">B</span> }]}
      />,
    );

    expect(screen.getByTestId("branch-icon")).toBeInTheDocument();
  });
});
