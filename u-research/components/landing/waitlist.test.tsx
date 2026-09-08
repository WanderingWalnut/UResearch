import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { joinWaitlist } from "@/app/waitlist-action";
import { Waitlist } from "./waitlist";

vi.mock("@/app/waitlist-action", () => ({ joinWaitlist: vi.fn() }));
afterEach(cleanup);

it("focuses the email field, keeps invalid input, and replaces the form after a successful retry", async () => {
  vi.mocked(joinWaitlist)
    .mockResolvedValueOnce({ success: false, error: "Enter a valid email address." })
    .mockResolvedValueOnce({ success: true });
  render(<Waitlist />);
  fireEvent.click(screen.getByRole("button", { name: "Join waitlist" }));
  const input = screen.getByRole("textbox", { name: "Email address" });
  expect(document.activeElement).toBe(input);
  fireEvent.change(input, { target: { value: "invalid" } });
  await act(async () => fireEvent.submit(input.closest("form")!));
  expect(await screen.findByText("Enter a valid email address.")).toBeTruthy();
  expect((input as HTMLInputElement).value).toBe("invalid");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  fireEvent.change(input, { target: { value: "person@example.com" } });
  await act(async () => fireEvent.submit(input.closest("form")!));
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("You’re on the list. We’ll email you when UResearch launches."));
  expect(screen.queryByRole("textbox")).toBeNull();
});
