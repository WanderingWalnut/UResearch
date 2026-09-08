import { afterEach, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "./proxy";

vi.mock("@/lib/supabase/proxy", () => ({ updateSession: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

it.each(["/discover", "/api/outreach", "/future-route?bypass=true"])("redirects %s before session work when waitlist-only is on", async (path) => {
  vi.stubEnv("WAITLIST_ONLY", "true");
  const response = await proxy(new NextRequest(`https://www.uresearch.app${path}`));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://www.uresearch.app/");
  expect(updateSession).not.toHaveBeenCalled();
});

it.each(["false", undefined])("keeps session behavior when WAITLIST_ONLY is %s", async (flag) => {
  vi.stubEnv("WAITLIST_ONLY", flag);
  const request = new NextRequest("https://www.uresearch.app/discover");
  const response = NextResponse.next();
  vi.mocked(updateSession).mockResolvedValue(response);
  expect(await proxy(request)).toBe(response);
  expect(response.headers.get("location")).toBeNull();
  expect(updateSession).toHaveBeenCalledWith(request);
});

it("keeps public design pages independent of auth without exempting application routes", () => {
  for (const url of ["/", "/?preview=1", "/design-system", "/design-system/", "/fonts/material-symbols-ui.ttf"]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(false);
  }
  for (const url of ["/discover", "/conversations", "/api/outreach", "/design-system-private", "/design-system/private"]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(true);
  }
});
