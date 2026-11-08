import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnvelopeReveal } from "./EnvelopeReveal.js";

describe("EnvelopeReveal", () => {
  it("renders its defaults and opens and closes the letter", async () => {
    const user = userEvent.setup();
    const { container } = render(<EnvelopeReveal />);
    const trigger = screen.getByRole("button", { name: "Open the letter" });
    const letter = container.querySelector('[role="region"]');

    expect(screen.getByText("You're invited")).toBeInTheDocument();
    expect(screen.getByText("A little something, just for you.")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(letter).toHaveAttribute("hidden");

    await user.click(trigger);

    expect(screen.getByRole("button", { name: "Close the letter" })).toHaveAttribute("aria-expanded", "true");
    expect(letter).not.toHaveAttribute("hidden");
    expect(letter).toHaveTextContent("A LETTER FOR YOU. You're invited. A little something, just for you.");

    await user.click(screen.getByRole("button", { name: "Close the letter" }));
    expect(screen.getByRole("button", { name: "Open the letter" })).toHaveAttribute("aria-expanded", "false");
    expect(letter).toHaveAttribute("hidden");
  });

  it("updates text and colors without interpreting text as HTML", () => {
    const { container, rerender } = render(<EnvelopeReveal title="First title" envelopeColor="#123456" />);

    rerender(<EnvelopeReveal title={'<img src=x onerror="alert(1)">'} envelopeColor="#654321" />);

    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".fc-envelope")).toHaveStyle({ "--fc-envelope-color": "#654321" });
  });

  it("supports keyboard activation and notifies the latest callback", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<EnvelopeReveal onOpenChange={onOpenChange} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Open the letter" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Close the letter" })).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);

    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Open the letter" })).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it("leaves one component under StrictMode and removes it on unmount", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const view = render(
      <StrictMode>
        <EnvelopeReveal onOpenChange={onOpenChange} />
      </StrictMode>,
    );

    expect(view.container.querySelectorAll(".fc-envelope")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Open the letter" }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);

    view.unmount();
    expect(view.container.querySelectorAll(".fc-envelope")).toHaveLength(0);
  });
});
