import styles from "./BridalMakeupPage.module.css";

type BridalMakeupCtaProps = {
  id: string;
  title: string;
  text: string;
  buttonLabel: string;
  href: string;
  tone?: "primary" | "secondary" | "neutral";
};

export default function BridalMakeupCta({
  id,
  title,
  text,
  buttonLabel,
  href,
  tone = "primary",
}: BridalMakeupCtaProps) {
  const toneClass =
    tone === "secondary" ? styles.ctaSecondary : tone === "neutral" ? styles.ctaNeutral : styles.ctaPrimary;

  return (
    <section id={id} className={`${styles.cta} ${toneClass}`}>
      <h2>{title}</h2>
      <p>{text}</p>
      <a className={`${styles.btn} ${styles.btnPrimary}`} href={href}>
        {buttonLabel}
      </a>
    </section>
  );
}


