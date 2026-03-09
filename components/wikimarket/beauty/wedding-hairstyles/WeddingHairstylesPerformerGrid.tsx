import styles from "./WeddingHairstylesPage.module.css";
import type { PerformerCard, WeddingHairstylesPageData } from "./data";

type WeddingHairstylesPerformerGridProps = {
  section: WeddingHairstylesPageData["performersSection"];
};

const formatPrice = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

function PerformerItem({ performer }: { performer: PerformerCard }) {
  return (
    <article className={styles.performerCard}>
      <div className={styles.performerTop}>
        <span className={styles.placeholderIcon} aria-hidden="true">
          <span className="material-symbols-outlined">styler</span>
        </span>
        <div>
          <h3 className={styles.performerName}>{performer.displayName}</h3>
          <p className={styles.performerMeta}>
            {performer.performerType} • {performer.city}
          </p>
        </div>
      </div>

      <p className={styles.performerNote}>{performer.shortNote}</p>

      <ul className={styles.performerFacts}>
        <li>
          <span>Специализация:</span> {performer.specialization.join(", ")}
        </li>
        <li>
          <span>Длина волос:</span> {performer.hairLengths.join(", ")}
        </li>
        <li>
          <span>Формат работы:</span> {performer.serviceModes.join(", ")}
        </li>
        <li>
          <span>Опыт:</span> {performer.experienceYears} лет
        </li>
        <li>
          <span>Диапазон:</span> от {formatPrice(performer.priceFrom)} до {formatPrice(performer.priceTo)} ₽
        </li>
        <li>
          <span>Пробная прическа:</span> {performer.trialAvailable ? "Да" : "Нет"}
        </li>
      </ul>

      <p className={styles.performerMetaBottom}>
        Портфолио: {performer.portfolioCount} работ • Языки: {performer.languages.join(", ")} • Состояние профиля: {performer.profileState}
      </p>

      <a className={`${styles.btn} ${styles.btnPrimary}`} href={performer.ctaHref}>
        Оставить заявку
      </a>
    </article>
  );
}

export default function WeddingHairstylesPerformerGrid({ section }: WeddingHairstylesPerformerGridProps) {
  return (
    <section id="performers" className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.betaBadge}>{section.betaLabel}</p>
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
      </div>

      <div className={styles.performerGrid}>
        {section.performers.map((performer) => (
          <PerformerItem key={performer.id} performer={performer} />
        ))}
      </div>

      <a className={`${styles.btn} ${styles.btnSecondary}`} href={section.becomeFirstCta.href}>
        {section.becomeFirstCta.label}
      </a>
    </section>
  );
}
