import styles from "./WeddingHairstylesPage.module.css";

type WeddingHairstylesCtaProps = {
  id: string;
  title: string;
  text: string;
  buttonLabel: string;
  href: string;
  tone?: "primary" | "secondary" | "neutral";
  buttonTone?: "primary" | "secondary";
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
  eyebrow,
  compact = false,
}: WeddingHairstylesCtaProps) {
  const toneClass =
    tone === "secondary" ? styles.ctaSecondary : tone === "neutral" ? styles.ctaNeutral : styles.ctaPrimary;
  const buttonClass = buttonTone === "secondary" ? styles.btnSecondary : styles.btnPrimary;

  return (
    <section id={id} className={`${styles.cta} ${toneClass} ${compact ? styles.ctaCompact : ""}`}>
      <div className={styles.ctaCopy}>
        {eyebrow ? <p className={styles.ctaEyebrow}>{eyebrow}</p> : null}
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <a className={`${styles.btn} ${buttonClass}`} href={href}>
        {buttonLabel}
      </a>
    </section>
  );
}