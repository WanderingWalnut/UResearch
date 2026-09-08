import { beforeEach, expect, it, vi } from "vitest";
import { createAdminClient } from "@/lib/supabase/admin";
import { joinWaitlist } from "./waitlist-action";

const { insert, from } = vi.hoisted(() => {
  const insert = vi.fn();
  return { insert, from: vi.fn(() => ({ insert })) };
});
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn(() => ({ from })) }));

beforeEach(() => {
  vi.clearAllMocks();
  insert.mockResolvedValue({ error: null });
});

function submit(email?: string | File) {
  const data = new FormData();
  if (email !== undefined) data.set("email", email);
  return joinWaitlist({ success: false }, data);
}

it.each([undefined, "", "  ", "invalid", "name@", "a@b", "a b@example.com", "a@example..com", `${"a".repeat(255)}@example.com`])("rejects invalid email %s before database access", async (email) => {
  expect(await submit(email)).toMatchObject({ success: false, error: "Enter a valid email address." });
  expect(createAdminClient).not.toHaveBeenCalled();
});

it("rejects a file instead of an email", async () => {
  expect(await submit(new File(["email"], "email.txt"))).toMatchObject({ success: false });
  expect(createAdminClient).not.toHaveBeenCalled();
});

it("normalizes and inserts a new email", async () => {
  expect(await submit("  Person+Research@Example.COM  ")).toEqual({ success: true });
  expect(from).toHaveBeenCalledWith("waitlist_signups");
  expect(insert).toHaveBeenCalledExactlyOnceWith({ email: "person+research@example.com" });
});

it("returns the same success for a duplicate", async () => {
  const first = await submit("person@example.com");
  insert.mockResolvedValue({ error: { code: "23505", message: "private database detail" } });
  expect(await submit("person@example.com")).toEqual(first);
});

it("returns a retry message for database errors without exposing details", async () => {
  insert.mockResolvedValue({ error: { code: "42501", message: "private database detail" } });
  expect(await submit("person@example.com")).toEqual({ success: false, error: "We couldn’t save your email. Please try again." });
});

it("handles a failed connection", async () => {
  insert.mockRejectedValue(new Error("private connection detail"));
  expect(await submit("person@example.com")).toMatchObject({ success: false, error: "We couldn’t save your email. Please try again." });
});
