"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, Icon, StatusBadge, type IconName } from "@/components/ui/primitives";
import styles from "./landing.module.css";

const captions = [
  "From first outreach to a real conversation.",
  "Open an Outreach Thread from your board.",
  "Read the full email exchange in one place.",
  "Write a thoughtful reply with the context in view.",
  "Keep the conversation moving.",
];
const navigation: [IconName, string][] = [
  ["travel_explore", "Discover"], ["bookmark", "Saved"],
  ["space_dashboard", "Outreach"], ["forum", "Conversations"],
];

export function ProductDemo() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const paused = hovered || focused || motionPaused;

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (reducedMotion.matches) {
        setStep(2);
      } else if (inView && !document.hidden && !paused) {
        timer = setInterval(() => setStep((current) => (current + 1) % captions.length), 2000);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: 0.1 });
    observer.observe(root.current!);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  return (
    <section ref={root} id="product-tour" className={styles.demo} aria-label="Product demonstration" aria-describedby="demo-description" tabIndex={0} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <p id="demo-description" className="sr-only">Illustrative demo: an Outreach Board leads to a full email exchange with a Professor. No email is sent. Focus this demonstration to pause it temporarily. Use the Pause animation checkbox to keep it paused.</p>
      <div className={styles.demoHeader}>
        <strong><Icon name="space_dashboard" />Your research workspace</strong>
        <span>Fall research outreach</span>
      </div>
      <div className={styles.canvas} data-step={step} aria-hidden="true">
        <div className={styles.rail}>
          {navigation.map(([icon, label]) => <span key={label} className={label === "Outreach" ? styles.selected : undefined}><Icon name={icon} />{label}</span>)}
        </div>
        <div className={styles.board}>
          <div className={styles.lane}>
            <div className={styles.laneHeading}><StatusBadge status="sent" /><small>2</small></div>
            <div className={`${styles.card} ${styles.target}`}><Avatar initials="SN" /><div><b>Dr. Sarah Nguyen</b><small>Research introduction · 2 days ago</small></div></div>
            <div className={styles.card}><Avatar initials="MK" tone="purple" /><div><b>Dr. Michael Kim</b><small>Robotics · Yesterday</small></div></div>
          </div>
          <div className={styles.lane}>
            <div className={styles.laneHeading}><StatusBadge status="opened" /><small>1</small></div>
            <div className={styles.card}><Avatar initials="AP" tone="green" /><div><b>Dr. Aisha Patel</b><small>Research introduction · Today</small></div></div>
          </div>
          <div className={styles.lane}>
            <div className={styles.laneHeading}><StatusBadge status="replied" /><small>1</small></div>
            <div className={styles.card}><Avatar initials="DC" tone="peach" /><div><b>Dr. Daniel Chen</b><small>Let’s arrange a time.</small></div></div>
          </div>
        </div>
        <div className={styles.exchange}>
          <div className={styles.mailHeading}><b>Dr. Sarah Nguyen</b><span>Research introduction</span></div>
          <div className={styles.mail}><small>You · Monday</small><p>I’m interested in your research. Are you taking on students this summer?</p></div>
          <div className={`${styles.mail} ${styles.received}`}><small>Dr. Nguyen · Today</small><p>Thanks for reaching out. Could you share your availability?</p></div>
          <div className={styles.reply}><span className={styles.typed}>I’m available from May through August.</span><span className={styles.send}>Send reply <Icon name="arrow_upward" /></span></div>
          <span className={styles.sent}><Icon name="check" />Reply sent</span>
        </div>
        <div className={styles.cursor}><Icon name="near_me" /><span>You</span></div>
      </div>
      <div className={styles.demoFooter}>
        <span aria-hidden="true">{captions[step]}</span>
        <label className={styles.motionSetting}><input type="checkbox" checked={motionPaused} onChange={(event) => setMotionPaused(event.target.checked)} />Pause animation</label>

      </div>
    </section>
  );
}
