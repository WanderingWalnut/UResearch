"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./fluid-headline.module.css";
import landing from "./landing.module.css";

const phrases = ["research direction.", "research opportunity.", "research community."];
const colors = ["var(--highlight)", "var(--avatar-peach)", "var(--avatar-purple)"];

export function FluidHeadline() {
  const root = useRef<HTMLSpanElement>(null);
  const prefix = useRef<HTMLSpanElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sizes, setSizes] = useState({ prefix: 0, words: [0, 0, 0], gap: 0, stacked: false });

  useEffect(() => {
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const prefixWidth = prefix.current!.offsetWidth;
      const widths = words.current.map(word => word!.offsetWidth);
      const gap = parseFloat(getComputedStyle(root.current!).fontSize) * 0.25;
      setSizes({ prefix: prefixWidth, words: widths, gap, stacked: prefixWidth + gap + Math.max(...widths) > root.current!.clientWidth });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root.current!);
    document.fonts.ready.then(measure);
    return () => { disposed = true; observer.disconnect(); };
  }, []);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!paused && !motion.matches && !document.hidden) timer = setInterval(() => setIndex(i => (i + 1) % phrases.length), 4000);
    };
    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  const max = Math.max(...sizes.words);
  const width = sizes.words[index];
  const start = -(sizes.prefix + sizes.gap + width) / 2;

  return (
    <>
      <h1>
        <span className="sr-only">Find your research direction. Keep every conversation in view.</span>
        <span ref={root} className={styles.line} aria-hidden="true" data-ready={max > 0} data-stacked={sizes.stacked}>
          <span className={styles.fallback}>Find your <mark>research direction.</mark></span>
          <span ref={prefix} className={styles.prefix} style={{ transform: `translateX(${sizes.stacked ? -sizes.prefix / 2 : start}px)` }}>Find your</span>
          <span className={styles.highlight} style={{ transform: `translateX(${sizes.stacked ? -width / 2 : start + sizes.prefix + sizes.gap}px)`, width: max }}>
            <span className={styles.background} style={{ background: colors[index], transform: `scaleX(${max ? width / max : 1})` }} />
            {phrases.map((phrase, i) => <span key={phrase} ref={node => { words.current[i] = node; }} className={styles.word} data-active={index === i}>{phrase}</span>)}
          </span>
        </span>
        <span aria-hidden="true">Keep every conversation in view.</span>
      </h1>
      <label className={`${landing.motionSetting} ${styles.motionSetting}`}>
        <input type="checkbox" checked={paused} onChange={event => setPaused(event.target.checked)} />Pause headline animation
      </label>
    </>
  );
}
