import { ActionLink, Icon, Wordmark } from "@/components/ui/primitives";
import { ProductDemo } from "@/components/landing/product-demo";
import styles from "@/components/landing/landing.module.css";

export default function Home() {
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <a href="#main" aria-label="UResearch home"><Wordmark /></a>
        <ActionLink href="#product-tour">Explore the workspace</ActionLink>
      </header>
      <main id="main">
        <section className={styles.hero}>
          <h1>
            <span className="sr-only">Find your research direction.</span>
            <span className={styles.rotatingPhrase} aria-hidden="true">
              <span>Find your <mark>research direction.</mark></span>
              <span>Find your <mark>research opportunity.</mark></span>
              <span>Find your <mark>research community.</mark></span>
            </span>
            Keep every conversation in view.
          </h1>
          <label className={styles.motionSetting}>
            <input type="checkbox" />Pause headline animation
          </label>
          <p>Find Professors, write thoughtful outreach, and continue the conversation—all in one workspace.</p>
          <ActionLink href="#product-tour">See how it works <Icon name="arrow_forward" /></ActionLink>
        </section>
        <ProductDemo />
      </main>
    </div>
  );
}
