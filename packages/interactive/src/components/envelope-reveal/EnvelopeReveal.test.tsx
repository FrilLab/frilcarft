import { StrictMode } from "react";
import type { CSSProperties } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnvelopeReveal } from "./EnvelopeReveal.js";

describe("EnvelopeReveal", () => {
  it("renders the defaults, semantic envelope layers, and accessible content", () => {
    const { container } = render(<EnvelopeReveal />);
    const root = container.querySelector('[data-component="envelope-reveal"]');
    const trigger = screen.getByRole("button", { name: "Open the letter" });
    const letter = container.querySelector('[role="region"]')!;

    expect(screen.getByText("You're invited")).toBeInTheDocument();
    expect(screen.getByText("A little something, just for you.")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", letter.id);
    expect(letter).toHaveAttribute("hidden");
    expect(root).toHaveAttribute("data-state", "closed");
    expect(container.querySelectorAll("[aria-hidden=true]")).toHaveLength(6);
    expect(trigger).toHaveClass("aspect-[1.45]");
    expect(container.querySelector('button > [aria-hidden="true"]:nth-child(4)')).toHaveClass("[transform:rotateX(0deg)]");
  });

  it("opens and closes the letter and reports each state transition", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(<EnvelopeReveal onOpenChange={onOpenChange} />);
    const root = container.querySelector<HTMLElement>('[data-component="envelope-reveal"]')!;
    const letter = container.querySelector('[role="region"]')!;

    await user.click(screen.getByRole("button", { name: "Open the letter" }));
    expect(screen.getByRole("button", { name: "Close the letter" })).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("data-state", "open");
    expect(letter).not.toHaveAttribute("hidden");
    expect(letter).toHaveTextContent("A LETTER FOR YOU. You're invited. A little something, just for you.");
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);

    await user.click(screen.getByRole("button", { name: "Close the letter" }));
    expect(screen.getByRole("button", { name: "Open the letter" })).toHaveAttribute("aria-expanded", "false");
    expect(letter).toHaveAttribute("hidden");
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it("supports initially open state and keyboard activation", async () => {
    const user = userEvent.setup();
    const firstView = render(<EnvelopeReveal initiallyOpen />);
    expect(screen.getByRole("button", { name: "Close the letter" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Letter contents" })).toBeVisible();

    firstView.unmount();
    render(<EnvelopeReveal />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Open the letter" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Close the letter" })).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Open the letter" })).toHaveAttribute("aria-expanded", "false");
  });

  it("updates text and colors without interpreting text as HTML", () => {
    const { container, rerender } = render(<EnvelopeReveal title="First title" envelopeColor="#123456" />);

    rerender(<EnvelopeReveal title={'<img src=x onerror="alert(1)">'} envelopeColor="#654321" accentColor="#223344" paperColor="#fefefe" />);

    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('[data-component="envelope-reveal"]')).toHaveStyle({
      "--fc-envelope-color": "#654321",
      "--fc-envelope-accent": "#223344",
      "--fc-envelope-paper": "#fefefe",
    });
  });

  it("merges consumer classes and keeps style overrides", () => {
    const style = { marginTop: "2rem", opacity: 0.8 } as CSSProperties;
    const { container } = render(<EnvelopeReveal className="w-72 max-w-none mt-4 text-red-700" style={style} />);
    const root = container.querySelector<HTMLElement>('[data-component="envelope-reveal"]')!;

    expect(root).toHaveClass("w-72", "max-w-none", "mt-4", "text-red-700");
    expect(root).not.toHaveClass("w-full", "max-w-[430px]", "text-[#433b40]");
    expect(root.style.marginTop).toBe("2rem");
    expect(root.style.opacity).toBe("0.8");
  });

  it("keeps reduced-motion utilities on each moving layer", () => {
    const { container } = render(<EnvelopeReveal />);

    expect(container.querySelector('[data-component="envelope-reveal"] [aria-hidden="true"]:nth-child(2)')).toHaveClass("motion-reduce:transition-none");
    expect(container.querySelector('[data-component="envelope-reveal"] [aria-hidden="true"]:nth-child(4)')).toHaveClass("motion-reduce:transition-none");
    expect(container.querySelector('[data-component="envelope-reveal"] [aria-hidden="true"]:nth-child(5)')).toHaveClass("motion-reduce:transition-none");
  });

  it("leaves one component under StrictMode and notifies once per activation", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const view = render(
      <StrictMode>
        <EnvelopeReveal onOpenChange={onOpenChange} />
      </StrictMode>,
    );

    expect(view.container.querySelectorAll('[data-component="envelope-reveal"]')).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Open the letter" }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);

    view.unmount();
    expect(view.container.querySelectorAll('[data-component="envelope-reveal"]')).toHaveLength(0);
  });
});
