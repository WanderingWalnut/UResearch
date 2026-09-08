"use client";

import { useActionState, useState } from "react";
import { joinWaitlist } from "@/app/waitlist-action";
import { Button, Icon } from "@/components/ui/primitives";
import styles from "./waitlist.module.css";

export function Waitlist() {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(joinWaitlist, { success: false });

  return (
    <div className={styles.waitlist} aria-live="polite">
      {state.success ? (
        <div role="status">You’re on the list. We’ll email you when UResearch launches.</div>
      ) : expanded ? (
        <form action={formAction} noValidate>
          <div className={styles.controls}>
            <input
              className={styles.input}
              aria-label="Email address"
              aria-invalid={Boolean(state.error)}
              aria-describedby={state.error ? "waitlist-error" : undefined}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              readOnly={pending}
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Joining…" : "Join waitlist"} <Icon name="arrow_forward" />
            </Button>
          </div>
          {state.error && <div id="waitlist-error" className={styles.error}>{state.error}</div>}
        </form>
      ) : (
        <Button onClick={() => setExpanded(true)}>Join waitlist <Icon name="arrow_forward" /></Button>
      )}
    </div>
  );
}
