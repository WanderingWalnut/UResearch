import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "./config";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export function createRouteClient(request: NextRequest) {
  const pendingCookies = new Map<string, CookieToSet>();
  const pendingHeaders = new Map<string, string>();

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach((cookie) => {
            pendingCookies.set(cookie.name, cookie);
            request.cookies.set(cookie.name, cookie.value);
          });

          Object.entries(headers).forEach(([name, value]) => {
            pendingHeaders.set(name, value);
          });
        },
      },
    },
  );

  function applyCookies(response: NextResponse) {
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    pendingHeaders.forEach((value, name) => {
      response.headers.set(name, value);
    });

    return response;
  }

  return { applyCookies, supabase };
}
