import styles from "./CuAlLocalContactsBlock.module.css";

const regions = [
  { name: "UAE / Dubai", note: "Английский и арабский, экспортные поставки и тендерные запросы." },
  { name: "Türkiye", note: "Турецкий и английский, OEM и серийные поставки." },
  { name: "EU", note: "English, проектные запросы и подбор аналогов." },
  { name: "CIS", note: "Русский, подбор по шильдику и замена существующих секций." },
] as const;

export default function CuAlLocalContactsBlock() {
  return (
    <section id="contacts" className={styles.section}>
      <div className={styles.grid}>
        <article className={styles.card}>
          <h2>Контакты и быстрый старт</h2>
          <p className={styles.lead}>
            Для Cu-Al проектов удобнее всего отправить параметры через форму. Если данных пока мало, достаточно описать задачу и оставить контактный канал.
          </p>

          <div className={styles.contactLine}>
            <div className={styles.icon} aria-hidden="true">
              @
            </div>
            <div>
              <strong>info@upgradefor.com</strong>
              <p>Ответим по поставке, документам и подходящему исполнению для HVAC-проекта.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#request">
              Оставить заявку
            </a>
            <a className={styles.secondaryButton} href="mailto:info@upgradefor.com">
              Написать на email
            </a>
          </div>

          <p className={styles.note}>
            Телефон и удобный канал связи уточним после получения параметров задачи, чтобы сразу подключить нужного инженера или поставщика.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Регионы поставки</h2>
          <p className={styles.lead}>
            Поддерживаем проекты для HVAC, retrofit и OEM по нескольким регионам без переключения на общие глобальные страницы.
          </p>

          <ul className={styles.regionList}>
            {regions.map((region) => (
              <li key={region.name} className={styles.regionItem}>
                <strong>{region.name}</strong>
                <span>{region.note}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
