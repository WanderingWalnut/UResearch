import type { Metadata } from "next";
import Link from "next/link";
import { ActionLink, Avatar, Button, Icon, StatusBadge, TemplateVariable, Wordmark, type IconName } from "@/components/ui/primitives";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "UResearch design system", robots: { index: false, follow: false } };
const colors = ["canvas", "surface-subtle", "surface-lane", "ink", "muted", "border", "action", "selection", "success-surface", "warning-surface", "danger-surface", "search-highlight"];
const icons: IconName[] = ["arrow_forward", "arrow_upward", "bookmark", "check", "forum", "near_me", "pause", "play_arrow", "space_dashboard", "travel_explore"];

export default function DesignSystem() {
  return (
    <main className={styles.gallery}>
      <header><Link href="/" aria-label="UResearch home"><Wordmark /></Link><ActionLink href="/" variant="secondary">View landing page</ActionLink></header>
      <h1>Design system</h1><p>Approved iteration 04. Shared components and tokens used by the landing page.</p>
      <section><h2>Color roles</h2><div className={styles.swatches}>{colors.map((color) => <div key={color}><span style={{ background: `var(--${color})` }} /><code>--{color}</code></div>)}</div></section>
      <section><h2>Typography</h2><h3>Find your research direction.</h3><p>Inter body text keeps Professor details and Outreach Threads easy to read.</p><small>Caption · 12px · secondary information</small></section>
      <section><h2>Actions</h2><p>Primary, secondary, ghost, and disabled. Use Tab to check keyboard focus. Buttons here demonstrate appearance only.</p><div className={styles.row}><Button>Review campaign</Button><Button variant="secondary">Save draft</Button><Button variant="ghost">Cancel</Button><Button disabled>Sending…</Button><ActionLink href="/">Explore the workspace <Icon name="arrow_forward" /></ActionLink></div></section>
      <section><h2>People and status</h2><div className={styles.row}><Avatar initials="SN" /><span>Dr. Sarah Nguyen</span><Avatar initials="MK" tone="purple" /><span>Dr. Michael Kim</span><Avatar initials="AP" tone="green" /><span>Dr. Aisha Patel</span><Avatar initials="DC" tone="peach" /><span>Dr. Daniel Chen</span></div><div className={styles.row}><StatusBadge status="sent" /><StatusBadge status="opened" /><StatusBadge status="replied" /></div></section>
      <section><h2>Meaningful highlights</h2><p>Dear <TemplateVariable>Professor name</TemplateVariable>, I’m interested in your work on <mark>computational biology</mark>.</p><div className={styles.row}><span className={styles.success}>Reply sent</span><span className={styles.warning}>Follow-up due</span><span className={styles.error}>Message could not be sent</span></div></section>
      <section><h2>Icons</h2><p>Material Symbols Outlined. Labels supply meaning; icons assist scanning.</p><div className={styles.icons}>{icons.map((name) => <span key={name}><Icon name={name} /><code>{name}</code></span>)}</div></section>
      <section><h2>Motion</h2><p>The landing demonstration loops automatically. It pauses when hidden or off-screen, and pauses on hover or keyboard focus. Reduced motion shows a static conversation.</p><ActionLink href="/#product-tour" variant="secondary">View product demonstration</ActionLink></section>
    </main>
  );
}
