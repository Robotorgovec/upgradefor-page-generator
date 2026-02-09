import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className="wrap hero">
      <div className="hero-content">
        <h1 className={styles.title}>
          <span className={styles.nowrap}>UPGRADE‑INNOVATIONS</span>
          <span>платформа, где технологии находят применение</span>
        </h1>
        <div className={styles.imageCard}>
          <div className={styles.imageWrap}>
            <img
              src="/assets/hero-character.png"
              alt="Изображение участника UPGRADE"
              className={styles.image}
            />
          </div>
        </div>
        <p className="lead">
          Публикуйте решения и исследования, объединяйтесь с партнёрами и запускайте пилоты.
          Статус и планы развития — здесь и сейчас.
        </p>
        <div className={`cta ${styles.cta}`}>
          <a className="btn" href="#join">
            Присоединиться
          </a>
        </div>
      </div>
    </section>
  );
}
