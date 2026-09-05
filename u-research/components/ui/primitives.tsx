import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./primitives.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={`${styles.button} ${styles[variant]} ${className}`} {...props} />;
}

export function ActionLink({ variant = "primary", className = "", ...props }: ComponentPropsWithoutRef<"a"> & { variant?: ButtonVariant }) {
  return <a className={`${styles.button} ${styles[variant]} ${className}`} {...props} />;
}

export function Wordmark() {
  return <span className={styles.wordmark}>UResearch<span className={styles.period}>.</span></span>;
}

export type IconName = "arrow_forward" | "arrow_upward" | "bookmark" | "check" | "forum" | "near_me" | "pause" | "play_arrow" | "space_dashboard" | "travel_explore";

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`${styles.icon} ${className}`}>{name}</span>;
}

export function Avatar({ initials, tone = "blue" }: { initials: string; tone?: "blue" | "purple" | "green" | "peach" }) {
  return <span aria-hidden="true" className={`${styles.avatar} ${styles[tone]}`}>{initials}</span>;
}

export function StatusBadge({ status }: { status: "sent" | "opened" | "replied" }) {
  return <span className={`${styles.status} ${styles[status]}`}>{status[0].toUpperCase() + status.slice(1)}</span>;
}

export function TemplateVariable({ children }: { children: ReactNode }) {
  return <span className={styles.variable}>{children}</span>;
}
