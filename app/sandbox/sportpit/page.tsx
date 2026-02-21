"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./SportpitPreview.module.css";

type Protocol = "energy" | "focus" | "recovery" | "hormone" | "longevity" | "performance";
type ReviewTab = "Отзывы" | "Видео" | "Кейсы";

const protocols: { key: Protocol; title: string; desc: string; tags: string[] }[] = [
  { key: "energy", title: "ENERGY", desc: "Энергия и выносливость", tags: ["митохондрии", "метаболизм"] },
  { key: "focus", title: "FOCUS", desc: "Концентрация и ноотропы", tags: ["нейромедиаторы", "внимание"] },
  { key: "recovery", title: "RECOVERY", desc: "Восстановление и сон", tags: ["сон", "антистресс"] },
  { key: "hormone", title: "HORMONE", desc: "Поддержка мужского здоровья", tags: ["тестостерон", "баланс"] },
  { key: "longevity", title: "LONGEVITY", desc: "Долголетие и защита клеток", tags: ["антиоксиданты", "биомаркеры"] },
  { key: "performance", title: "PERFORMANCE", desc: "Спортивная производительность", tags: ["сила", "выносливость"] },
];

const products = [
  { id: 1, title: "ActiveCode Core Protein", price: "8 500 ₸", rating: 4.9, image: "/sportpit/whey.svg", tags: ["performance", "recovery"] },
  { id: 2, title: "Neuro Focus Stack", price: "11 490 ₸", rating: 4.8, image: "/sportpit/bcaa.svg", tags: ["focus", "energy"] },
  { id: 3, title: "Sleep Recovery Complex", price: "9 390 ₸", rating: 4.7, image: "/sportpit/omega.svg", tags: ["recovery", "longevity"] },
  { id: 4, title: "Hormone Balance Formula", price: "12 990 ₸", rating: 4.9, image: "/sportpit/fat-burner.svg", tags: ["hormone", "performance"] },
];

export default function SportpitPreviewPage() {
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [toast, setToast] = useState<{ open: boolean; text: string }>({ open: false, text: "" });
  const [reviewTab, setReviewTab] = useState<ReviewTab>("Отзывы");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const goal = new URLSearchParams(window.location.search).get("goal") as Protocol | null;
    if (!goal) return;
    const isKnown = protocols.some((item) => item.key === goal);
    if (!isKnown) return;
    setActiveProtocol(goal);
    requestAnimationFrame(() => {
      document.getElementById("popular")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const orderedProducts = useMemo(() => {
    if (!activeProtocol) return products;
    return [...products].sort((a, b) => Number(b.tags.includes(activeProtocol)) - Number(a.tags.includes(activeProtocol)));
  }, [activeProtocol]);

  useEffect(() => {
    if (!toast.open) return;
    const timer = setTimeout(() => setToast({ open: false, text: "" }), 1700);
    return () => clearTimeout(timer);
  }, [toast]);

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <section id="top" className={styles.hero}>
        <div>
          <p className={styles.badge}>ACTIVE CODE / HUMAN UPGRADE SYSTEM</p>
          <h1>Управляй своим биологическим кодом</h1>
          <p>Научно обоснованные модули для энергии, фокуса и восстановления — без инфо-шума.</p>
          <div className={styles.heroButtons}>
            <button type="button" className={styles.primaryBtn} onClick={() => scrollToSection("how")}>Подобрать протокол</button>
            <button type="button" className={styles.secondaryBtn} onClick={() => scrollToSection("popular")}>Смотреть модули</button>
          </div>
          <div className={styles.badges}><span>LAB TESTED</span><span>GMP</span><span>ISO</span><span>QUALITY SCREENED</span></div>
        </div>
        <div className={styles.heroVisual}>
          <Image src="/sportpit/hero-can.svg" alt="Модуль ActiveCode" width={220} height={260} />
          <Image src="/sportpit/lab-1.svg" alt="Лабораторный визуал" width={260} height={260} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>ActiveCode помогает управлять телом, мозгом и энергией</h2>
        <div className={styles.missionGrid}>
          <div className={styles.markerList}>
            {[
              "продуктивность",
              "долголетие",
              "физическая сила",
              "ментальная ясность",
              "устойчивость к стрессу",
              "восстановление",
            ].map((item) => <span key={item}>{item}</span>)}
          </div>
          <p className={styles.missionText}>Мы не продаём витамины. Мы даём инструменты управления ресурсом. Decode your limits.</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Философия</h2>
        <div className={styles.philosophyGrid}>
          <article><h3>Человек — система</h3><p>Решения строятся вокруг связки «сон, энергия, нагрузка, восстановление».</p></article>
          <article><h3>Осознанная продуктивность</h3><p>Фокус на устойчивом темпе, а не краткосрочных пиках.</p></article>
          <article><h3>Наука {">"} маркетинг</h3><p>Состав, дозировки и исследования важнее громких обещаний.</p></article>
          <article><h3>Сила без перегибов</h3><p>Протоколы адаптируются под ритм жизни, не ломая баланс.</p></article>
        </div>
      </section>

      <section id="how" className={styles.section}>
        <h2>Как это работает</h2>
        <div className={styles.steps}>
          <div><strong>1</strong><p>Выбираете цель</p></div>
          <div><strong>2</strong><p>Получаете протокол (модули + дозировки)</p></div>
          <div><strong>3</strong><p>Отслеживаете эффект (энергия / сон / фокус)</p></div>
        </div>
        <button type="button" className={styles.primaryBtn}>Пройти подбор за 60 секунд</button>
      </section>

      <section id="quality" className={styles.section}>
        <h2>Проверено лабораторией. Подтверждено результатом.</h2>
        <ul className={styles.qualityList}>
          <li>понятные дозировки</li>
          <li>прозрачность состава</li>
          <li>без инфо-шума</li>
          <li>контроль качества</li>
          <li>международные стандарты производства</li>
        </ul>
        <button type="button" className={styles.secondaryBtn} onClick={() => setToast({ open: true, text: "Сертификаты скоро" })}>Смотреть сертификаты</button>
      </section>

      <section id="catalog" className={styles.section}>
        <h2>Каталог модулей</h2>
        <p className={styles.muted}>Каждый продукт — модуль кода. Собирайте систему под задачу.</p>
        <div className={styles.chips}>{["Энергия", "Фокус", "Сон", "Антистресс", "Спорт", "Мужское здоровье"].map((chip) => <button key={chip} type="button">{chip}</button>)}</div>
      </section>

      <section id="popular" className={styles.section}>
        <h2>Популярные продукты</h2>
        <div className={styles.protocolButtons}>{protocols.map((item) => <button key={item.key} type="button" className={activeProtocol === item.key ? styles.goalActive : ""} onClick={() => {
              setActiveProtocol(item.key);
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.set("goal", item.key);
                window.history.replaceState({}, "", url.toString());
              }
            }}>{item.title}</button>)}</div>
        <div className={styles.products}>
          {orderedProducts.map((product) => {
            const highlighted = activeProtocol && product.tags.includes(activeProtocol);
            return (
              <article key={product.id} className={`${styles.productCard} ${highlighted ? styles.highlighted : ""}`}>
                <Image src={product.image} alt={product.title} width={180} height={130} />
                <h3>{product.title}</h3>
                <p>★ {product.rating}</p>
                <strong>{product.price}</strong>
                <button type="button" className={styles.secondaryBtn} onClick={() => setToast({ open: true, text: "Добавлено в корзину" })}>В корзину</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Почему ActiveCode</h2>
        <div className={styles.whyGrid}>
          <div>Чистая формуляция без перегруза добавками.</div>
          <div>Фокус на измеримом результате и самочувствии.</div>
          <div>Прозрачные спецификации компонентов.</div>
          <div>Сервис под долгую стратегию здоровья.</div>
        </div>
      </section>

      <section id="reviews" className={styles.section}>
        <h2>Отзывы</h2>
        <div className={styles.tabs}>{(["Отзывы", "Видео", "Кейсы"] as ReviewTab[]).map((tab) => <button key={tab} type="button" className={reviewTab === tab ? styles.goalActive : ""} onClick={() => setReviewTab(tab)}>{tab}</button>)}</div>
        <div className={styles.reviews}>
          <article className={styles.reviewCard}><p>«Через 3 недели ENERGY + FOCUS вернули рабочий ритм без перегрузки.»</p><strong>Арман, продуктовый менеджер</strong></article>
          <article className={styles.reviewCard}><p>«RECOVERY улучшил сон, восстановление после тренировок заметно быстрее.»</p><strong>Ержан, триатлет-любитель</strong></article>
          <article className={styles.reviewCard}><p>«Прозрачный состав и внятные дозировки — главный плюс платформы.»</p><strong>Диана, предприниматель</strong></article>
        </div>
      </section>

      <section id="education" className={styles.section}>
        <h2>Education / База знаний</h2>
        <p className={styles.muted}>Образовательная платформа о биомаркерах, протоколах и системном подходе. Upgrade your biology. Energy under control.</p>
      </section>

      <section id="subscribe" className={styles.section}>
        <h2>Персональные обновления протоколов</h2>
        <form className={styles.subscribe} onSubmit={(e) => { e.preventDefault(); setToast({ open: true, text: "Готово" }); }}>
          <input type="email" name="email" placeholder="Ваш email" required />
          <button type="submit" className={styles.primaryBtn}>Подписаться</button>
        </form>
      </section>

      <footer id="footer" className={styles.footer}>
        <div>О платформе</div><div>Доставка и оплата</div><div>Политика</div><div>Контакты</div>
        <div className={styles.copy}>© ActiveCode, 2026</div>
      </footer>

      {toast.open && <div className={styles.toast}>{toast.text}</div>}
    </>
  );
}
