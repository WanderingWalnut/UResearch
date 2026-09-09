import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (process.env.WAITLIST_ONLY === "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return updateSession(request);
}

// Public marketing, design reference, and fonts do not use a Student session.
export const config = {
  matcher: [
    "/((?!$|design-system/?$|fonts/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
