import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "./config";

describe("Supabase configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the documented runtime variables", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");

    expect(getSupabaseUrl()).toBe("https://example.supabase.co");
    expect(getSupabasePublishableKey()).toBe("publishable-key");
    expect(getSupabaseServiceRoleKey()).toBe("service-role-key");
  });

  it("fails fast when a required variable is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    expect(() => getSupabaseUrl()).toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL",
    );
  });
});
