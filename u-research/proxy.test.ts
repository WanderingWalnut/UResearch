import { expect, it, vi } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "./proxy";

vi.mock("@/lib/supabase/proxy", () => ({ updateSession: vi.fn() }));

it("keeps public design pages independent of auth without exempting application routes", () => {
  for (const url of ["/", "/?preview=1", "/design-system", "/design-system/", "/fonts/material-symbols-ui.ttf"]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(false);
  }
  for (const url of ["/discover", "/conversations", "/api/outreach", "/design-system-private", "/design-system/private"]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(true);
  }
});
