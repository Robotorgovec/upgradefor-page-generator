"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./SportpitPreview.module.css";

type Goal = "mass" | "fat" | "energy" | "recovery";
type ModalType = "video" | "article" | null;

type Product = {
  id: number;
  title: string;
  price: string;
  rating: number;
  image: string;
  tags: Goal[];
};

const navItems = [
  { id: "catalog", label: "Каталог", icon: "🧪" },
  { id: "goals", label: "Подбор", icon: "🎯" },
  { id: "popular", label: "Бестселлеры", icon: "🔥" },
  { id: "about", label: "О нас", icon: "🏆" },
  { id: "reviews", label: "Отзывы", icon: "💬" },
  { id: "blog", label: "Блог", icon: "📰" },
];

const products: Product[] = [
  { id: 1, title: "100% Whey Protein", price: "3 490 ₽", rating: 4.9, image: "/sportpit/whey.svg", tags: ["mass", "recovery"] },
  { id: 2, title: "BCAA Power", price: "2 090 ₽", rating: 4.8, image: "/sportpit/bcaa.svg", tags: ["energy", "recovery"] },
  { id: 3, title: "Fat Burner", price: "2 790 ₽", rating: 4.7, image: "/sportpit/fat-burner.svg", tags: ["fat", "energy"] },
  { id: 4, title: "Omega 3", price: "1 690 ₽", rating: 4.9, image: "/sportpit/omega.svg", tags: ["recovery", "fat"] },
];

const goalLabels: Record<Goal, string> = {
  mass: "Набор массы",
  fat: "Сжигание жира",
  energy: "Энергия",
  recovery: "Восстановление",
};

export default function SportpitPreviewPage() {
  const [cartCount, setCartCount] = useState(0);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [toast, setToast] = useState<{ open: boolean; text: string }>({ open: false, text: "" });
  const [modal, setModal] = useState<{ open: boolean; type: ModalType; payload?: string }>({ open: false, type: null });
  const [activeSection, setActiveSection] = useState("catalog");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    if (!activeGoal) return products;
    return [...products].sort((a, b) => Number(b.tags.includes(activeGoal)) - Number(a.tags.includes(activeGoal)));
  }, [activeGoal]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { threshold: 0.35 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!toast.open) return;
    const timer = setTimeout(() => setToast({ open: false, text: "" }), 1600);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (id: number) => {
    setCartCount((prev) => prev + 1);
    setAddedId(id);
    setToast({ open: true, text: "Добавлено в корзину" });
    setTimeout(() => setAddedId(null), 800);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>СПОРТПИТ</div>
        <nav className={styles.menu}>
          <button onClick={() => scrollToSection("catalog")}>Каталог</button>
          <button onClick={() => scrollToSection("popular")}>Акции</button>
          <button onClick={() => scrollToSection("why")}>Доставка</button>
          <button onClick={() => scrollToSection("subscribe")}>Контакты</button>
        </nav>
        <div className={styles.headerActions}>
          <button>RU</button>
          <button>Вход</button>
          <button className={styles.cart}>🛒<span>{cartCount}</span></button>
          <button className={styles.burger} onClick={() => setMobileNavOpen((v) => !v)}>☰</button>
        </div>
      </header>

      <aside className={styles.sidebar}>
        {navItems.map((item) => (
          <button key={item.id} className={activeSection === item.id ? styles.active : ""} onClick={() => scrollToSection(item.id)}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      {mobileNavOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileNavOpen(false)}>
          <div className={styles.mobilePanel} onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)}>{item.label}</button>
            ))}
          </div>
        </div>
      )}

      <main className={styles.content}>
        <section id="top" className={styles.hero}>
          <div>
            <h1>РЕЗУЛЬТАТ НАЧИНАЕТСЯ С ПРАВИЛЬНОГО ТОПЛИВА</h1>
            <p>Протеины, аминокислоты и БАДы нового поколения для силы, выносливости и восстановления.</p>
            <div className={styles.heroButtons}>
              <button onClick={() => scrollToSection("catalog")}>Выбрать продукт</button>
              <button className={styles.secondary} onClick={() => scrollToSection("goals")}>Пройти подбор</button>
            </div>
            <div className={styles.trust}>★ 4.9/5 | 10 000+ клиентов | GMP | ISO</div>
          </div>
          <div className={styles.heroVisual}>
            <Image src="/sportpit/hero-can.svg" alt="Банка протеина" width={260} height={320} />
            <Image src="/sportpit/hero-athlete.svg" alt="Атлет" width={260} height={320} />
          </div>
        </section>

        <section id="goals" className={styles.section}>
          <h2>ПОДБЕРИТЕ ПОД СВОЮ ЦЕЛЬ</h2>
          <div className={styles.goals}>
            {(Object.keys(goalLabels) as Goal[]).map((goal) => (
              <button
                key={goal}
                className={activeGoal === goal ? styles.goalActive : ""}
                onClick={() => {
                  setActiveGoal(goal);
                  scrollToSection("popular");
                }}
              >
                {goalLabels[goal]}
              </button>
            ))}
          </div>
        </section>

        <section id="catalog" className={styles.section}>
          <h2>КАТАЛОГ</h2>
          <p className={styles.muted}>TODO: добавить полноценные категории каталога.</p>
        </section>

        <section id="popular" className={styles.section}>
          <h2>ПОПУЛЯРНЫЕ ПРОДУКТЫ</h2>
          {activeGoal && <p className={styles.muted}>Акцент по цели: {goalLabels[activeGoal]}</p>}
          <div className={styles.products}>
            {filteredProducts.map((product) => {
              const isHighlighted = activeGoal && product.tags.includes(activeGoal);
              return (
                <article key={product.id} className={`${styles.productCard} ${isHighlighted ? styles.highlighted : ""}`}>
                  <Image src={product.image} alt={product.title} width={220} height={160} />
                  <h3>{product.title}</h3>
                  <p>★ {product.rating}</p>
                  <strong>{product.price}</strong>
                  <button onClick={() => addToCart(product.id)}>{addedId === product.id ? "Добавлено ✓" : "В КОРЗИНУ"}</button>
                </article>
              );
            })}
          </div>
        </section>

        <section id="about" className={styles.section}>
          <h2>ПРОВЕРЕНО ЛАБОРАТОРИЕЙ. ПОДТВЕРЖДЕНО РЕЗУЛЬТАТОМ.</h2>
          <div className={styles.gallery}>
            <Image src="/sportpit/lab-1.svg" alt="Лаборатория 1" width={280} height={160} />
            <Image src="/sportpit/lab-2.svg" alt="Лаборатория 2" width={280} height={160} />
            <Image src="/sportpit/lab-3.svg" alt="Лаборатория 3" width={280} height={160} />
          </div>
          <div className={styles.badges}><span>GMP</span><span>ISO</span><span>LAB TESTED</span><span>NO BANNED</span><span>SHIELD</span></div>
        </section>

        <section id="why" className={styles.section}>
          <h2>ПОЧЕМУ МЫ</h2>
          <div className={styles.whyGrid}>
            <div>🧬 Чистый состав</div><div>🌍 Производство ЕС/США</div><div>🚚 Быстрая доставка</div><div>🛡️ Гарантия возврата</div>
          </div>
        </section>

        <section id="reviews" className={styles.section}>
          <h2>ОТЗЫВЫ</h2>
          <div className={styles.reviews}>
            <button className={styles.videoCard} onClick={() => setModal({ open: true, type: "video" })}>▶ Видео-отзыв</button>
            <article className={styles.reviewCard}><p>"Минус 6 кг за 2 месяца и отличное самочувствие."</p><strong>Ирина, ★★★★★</strong></article>
          </div>
        </section>

        <section id="blog" className={styles.section}>
          <h2>СОВЕТЫ ЭКСПЕРТА / БЛОГ</h2>
          <div className={styles.blogGrid}>
            <Image src="/sportpit/expert.svg" alt="Эксперт" width={220} height={220} />
            {["Как пить протеин", "BCAA до или после", "Омега-3 для восстановления"].map((article) => (
              <button key={article} onClick={() => setModal({ open: true, type: "article", payload: article })}>{article}</button>
            ))}
          </div>
        </section>

        <section id="subscribe" className={styles.section}>
          <h2>-10% НА ПЕРВЫЙ ЗАКАЗ</h2>
          <form
            className={styles.subscribe}
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const email = String(data.get("email") || "");
              const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
              if (!valid) {
                setToast({ open: true, text: "Введите корректный email" });
                return;
              }
              setToast({ open: true, text: "Готово!" });
              e.currentTarget.reset();
            }}
          >
            <input type="email" name="email" placeholder="Ваш email" required />
            <button type="submit">Подписаться</button>
          </form>
        </section>

        <footer className={styles.footer}>
          <div>Категории</div><div>Доставка и оплата</div><div>Политика</div><div>Контакты</div>
          <div className={styles.copy}>© SportPit, 2026</div>
        </footer>
      </main>

      {toast.open && <div className={styles.toast}>{toast.text}</div>}

      {modal.open && (
        <div className={styles.modalOverlay} onClick={() => setModal({ open: false, type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal({ open: false, type: null })}>✕</button>
            {modal.type === "video" ? <p>Фейковое видео-окно для демо.</p> : <p>{modal.payload}: короткий текст статьи для preview.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
