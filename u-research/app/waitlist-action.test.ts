import { beforeEach, expect, it, vi } from "vitest";
import { neon } from "@neondatabase/serverless";
import { joinWaitlist } from "./waitlist-action";

const { sql } = vi.hoisted(() => ({ sql: vi.fn() }));
vi.mock("@neondatabase/serverless", () => ({ neon: vi.fn(() => sql) }));

beforeEach(() => {
  vi.clearAllMocks();
  sql.mockResolvedValue([]);
});

function submit(email?: string | File) {
  const data = new FormData();
  if (email !== undefined) data.set("email", email);
  return joinWaitlist({ success: false }, data);
}

it.each([undefined, "", "  ", "invalid", "name@", "a@b", "a b@example.com", "a@example..com", `${"a".repeat(255)}@example.com`])("rejects invalid email %s before database access", async (email) => {
  expect(await submit(email)).toMatchObject({ success: false, error: "Enter a valid email address." });
  expect(neon).not.toHaveBeenCalled();
});

it("rejects a file instead of an email", async () => {
  expect(await submit(new File(["email"], "email.txt"))).toMatchObject({ success: false });
  expect(neon).not.toHaveBeenCalled();
});

it("normalizes and inserts a new email", async () => {
  expect(await submit("  Person+Research@Example.COM  ")).toEqual({ success: true });
  expect(sql).toHaveBeenCalledExactlyOnceWith(
    ["insert into public.waitlist_signups (email) values (", ") on conflict (email) do nothing"],
    "person+research@example.com",
  );
});

it("returns the same success for a duplicate", async () => {
  const first = await submit("person@example.com");
  sql.mockResolvedValue([]);
  expect(await submit("person@example.com")).toEqual(first);
});

it("returns a retry message for database errors without exposing details", async () => {
  sql.mockRejectedValue({ code: "42501", message: "private database detail" });
  expect(await submit("person@example.com")).toEqual({ success: false, error: "We couldn’t save your email. Please try again." });
});

it("handles a failed connection", async () => {
  sql.mockRejectedValue(new Error("private connection detail"));
  expect(await submit("person@example.com")).toMatchObject({ success: false, error: "We couldn’t save your email. Please try again." });
});
