"use server";

import { neon } from "@neondatabase/serverless";

export type WaitlistState = { success: boolean; error?: string };

export async function joinWaitlist(_previousState: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const value = formData.get("email");
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`insert into public.waitlist_signups (email) values (${email}) on conflict (email) do nothing`;
    return { success: true };
  } catch {
    // Keep configuration and service errors out of the public response.
  }

  return { success: false, error: "We couldn’t save your email. Please try again." };
}
