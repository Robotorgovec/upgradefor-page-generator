import styles from "./WeddingHairstylesPage.module.css";

type WeddingHairstylesCtaProps = {
  id: string;
  title: string;
  text: string;
  buttonLabel: string;
  href: string;
  tone?: "primary" | "secondary" | "neutral";
  buttonTone?: "primary" | "secondary";
  buttonAriaLabel?: string;
  eyebrow?: string;
  compact?: boolean;
};

export default function WeddingHairstylesCta({
  id,
  title,
  text,
  buttonLabel,
  href,
  tone = "primary",
  buttonTone = "primary",
  buttonAriaLabel,
  eyebrow,
  compact = false,
}: WeddingHairstylesCtaProps) {
  const toneClass =
    tone === "secondary" ? styles.ctaSecondary : tone === "neutral" ? styles.ctaNeutral : styles.ctaPrimary;
  const buttonClass = buttonTone === "secondary" ? styles.btnSecondary : styles.btnPrimary;
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      className={`${styles.cta} ${toneClass} ${compact ? styles.ctaCompact : ""}`}
      aria-labelledby={titleId}
    >
      <div className={styles.ctaCopy}>
        {eyebrow ? <p className={styles.ctaEyebrow}>{eyebrow}</p> : null}
        <h2 id={titleId}>{title}</h2>
        <p>{text}</p>
      </div>
      <a className={`${styles.btn} ${buttonClass}`} href={href} aria-label={buttonAriaLabel}>
        {buttonLabel}
      </a>
    </section>
  );
}
