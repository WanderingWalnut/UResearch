import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProductDemo } from "./product-demo";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("loops automatically and respects pause, visibility, reduced motion, and unmount", () => {
  vi.useFakeTimers();
  let inView = true;
  let notifyVisibility: (entries: { isIntersecting: boolean }[]) => void;
  let hidden = false;
  const media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal("matchMedia", () => media);
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof notifyVisibility) { notifyVisibility = callback; }
    observe() { notifyVisibility([{ isIntersecting: inView }]); }
    disconnect() {}
  });
  const { container, unmount } = render(<ProductDemo />);
  const step = () => container.querySelector("[data-step]")?.getAttribute("data-step");
  const tick = (ms = 2000) => act(() => { vi.advanceTimersByTime(ms); });
  expect(step()).toBe("0");
  tick(); expect(step()).toBe("1");
  tick(8000); expect(step()).toBe("0");
  fireEvent.focus(screen.getByRole("region", { name: "Product demonstration" }));
  tick(); expect(step()).toBe("0");
  fireEvent.blur(screen.getByRole("region", { name: "Product demonstration" }));
  tick(); expect(step()).toBe("1");
  const demo = screen.getByRole("region", { name: "Product demonstration" });
  fireEvent.mouseEnter(demo); tick(); expect(step()).toBe("1");
  fireEvent.focus(demo); fireEvent.mouseLeave(demo); tick(); expect(step()).toBe("1");
  fireEvent.blur(demo);
  expect(screen.queryByRole("button")).toBeNull();
  const motion = screen.getByRole("checkbox", { name: "Pause animation" });
  fireEvent.click(motion); fireEvent.blur(demo); tick(); expect(step()).toBe("1");
  fireEvent.click(motion);
  act(() => { inView = false; notifyVisibility([{ isIntersecting: inView }]); });
  tick(); expect(step()).toBe("1");
  act(() => { inView = true; notifyVisibility([{ isIntersecting: inView }]); });
  tick(); expect(step()).toBe("2");
  act(() => { hidden = true; document.dispatchEvent(new Event("visibilitychange")); });
  tick(); expect(step()).toBe("2");
  act(() => { hidden = false; document.dispatchEvent(new Event("visibilitychange")); });
  tick(); expect(step()).toBe("3");
  act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
  tick(10000); expect(step()).toBe("2");
  act(() => { media.matches = false; media.dispatchEvent(new Event("change")); });
  tick(); expect(step()).toBe("3");
  expect(container.querySelector('[data-step] button, [data-step] a')).toBeNull();
  unmount(); expect(vi.getTimerCount()).toBe(0);
});
