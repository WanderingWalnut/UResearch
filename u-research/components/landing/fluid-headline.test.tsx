import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FluidHeadline } from "./fluid-headline";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("keeps the prefix mounted while cycling and respects pause, visibility, and reduced motion", () => {
  vi.useFakeTimers();
  const media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal("matchMedia", () => media);
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnect; });
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: new Promise(() => {}) } });
  let hidden = false;
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  const { container, unmount } = render(<FluidHeadline />);
  const prefix = screen.getAllByText("Find your").find(node => node.textContent === "Find your")!;
  const active = () => container.querySelector('[data-active="true"]')?.textContent;
  const tick = () => act(() => { vi.advanceTimersByTime(4000); });
  expect(active()).toBe("research direction.");
  tick(); expect(active()).toBe("research opportunity.");
  expect(container.contains(prefix)).toBe(true);
  tick(); expect(active()).toBe("research community.");
  tick(); expect(active()).toBe("research direction.");
  fireEvent.click(screen.getByRole("checkbox", { name: "Pause headline animation" }));
  tick(); expect(active()).toBe("research direction.");
  fireEvent.click(screen.getByRole("checkbox", { name: "Pause headline animation" }));
  act(() => { hidden = true; document.dispatchEvent(new Event("visibilitychange")); });
  tick(); expect(active()).toBe("research direction.");
  act(() => { hidden = false; document.dispatchEvent(new Event("visibilitychange")); });
  tick(); expect(active()).toBe("research opportunity.");
  act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
  tick(); expect(active()).toBe("research opportunity.");
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Keep every conversation in view.");
  unmount(); expect(vi.getTimerCount()).toBe(0); expect(disconnect).toHaveBeenCalledOnce();
});
