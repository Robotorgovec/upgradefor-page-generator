import styles from "./WeddingHairstylesPage.module.css";

type WeddingHairstylesCtaProps = {
  id: string;
  title: string;
  text: string;
  buttonLabel: string;
  href: string;
  tone?: "primary" | "secondary";
};

export default function WeddingHairstylesCta({
  id,
  title,
  text,
  buttonLabel,
  href,
  tone = "primary",
}: WeddingHairstylesCtaProps) {
  const toneClass = tone === "secondary" ? styles.ctaSecondary : styles.ctaPrimary;

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
