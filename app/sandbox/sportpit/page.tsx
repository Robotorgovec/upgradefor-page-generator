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

const products: Product[] = [
  { id: 1, title: "Набор массы", price: "2 500 ₽", rating: 4.9, image: "/sportpit/whey.svg", tags: ["mass", "recovery"] },
  { id: 2, title: "Сжигание жира", price: "1 490 ₽", rating: 4.8, image: "/sportpit/fat-burner.svg", tags: ["fat", "energy"] },
  { id: 3, title: "Энергия", price: "1 390 ₽", rating: 4.7, image: "/sportpit/bcaa.svg", tags: ["energy", "mass"] },
  { id: 4, title: "Восстановление", price: "990 ₽", rating: 4.9, image: "/sportpit/omega.svg", tags: ["recovery", "fat"] },
];

const goalLabels: Record<Goal, string> = {
  mass: "Набор массы",
  fat: "Сжигание жира",
  energy: "Энергия",
  recovery: "Восстановление",
};

export default function SportpitPreviewPage() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [toast, setToast] = useState<{ open: boolean; text: string }>({ open: false, text: "" });
  const [modal, setModal] = useState<{ open: boolean; type: ModalType; payload?: string }>({ open: false, type: null });
  const [addedId, setAddedId] = useState<number | null>(null);

  const orderedProducts = useMemo(() => {
    if (!activeGoal) return products;
    return [...products].sort((a, b) => Number(b.tags.includes(activeGoal)) - Number(a.tags.includes(activeGoal)));
  }, [activeGoal]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!toast.open) return;
    const timer = setTimeout(() => setToast({ open: false, text: "" }), 1700);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (id: number) => {
    const next = Number(window.sessionStorage.getItem("sp-cart-count") || "0") + 1;
    window.sessionStorage.setItem("sp-cart-count", String(next));
    window.dispatchEvent(new Event("sp-cart-changed"));

    setAddedId(id);
    setToast({ open: true, text: "Добавлено в корзину" });
    setTimeout(() => setAddedId(null), 800);
  };

  return (
    <>
      <section id="top" className={styles.hero}>
        <div>
          <p className={styles.badge}>Премиальное спортивное питание</p>
          <h1>РЕЗУЛЬТАТ НАЧИНАЕТСЯ С ПРАВИЛЬНОГО ТОПЛИВА</h1>
          <p>Протеины, аминокислоты и БАДы нового поколения для силы, выносливости и восстановления.</p>
          <div className={styles.heroButtons}>
            <button type="button" className={styles.primaryBtn} onClick={() => scrollToSection("catalog")}>
              Выбрать продукт
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={() => scrollToSection("goals")}>
              Пройти подбор
            </button>
          </div>
          <div className={styles.trust}>★ 4.9/5 · 10 000+ клиентов · GMP · ISO</div>
        </div>
        <div className={styles.heroVisual}>
<Image src="/sportpit/img/hero/protein.svg" alt="Банка протеина" width={250} height={320} />
<Image src="/sportpit/img/hero/athlete.svg" alt="Атлет" width={250} height={320} />
        </div>
      </section>

      <section id="goals" className={styles.section}>
        <h2>ПОДБЕРИТЕ ПОД СВОЮ ЦЕЛЬ</h2>
        <div className={styles.goals}>
          {(Object.keys(goalLabels) as Goal[]).map((goal) => (
            <button
              key={goal}
              type="button"
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
        <p className={styles.muted}>Карточки в стиле Strong Preview.</p>
        {activeGoal && <p className={styles.muted}>Акцент по цели: {goalLabels[activeGoal]}</p>}
        <div className={styles.products}>
          {orderedProducts.map((product) => {
            const highlighted = activeGoal && product.tags.includes(activeGoal);
            return (
              <article key={product.id} className={`${styles.productCard} ${highlighted ? styles.highlighted : ""}`}>
                <Image src={product.image} alt={product.title} width={220} height={160} />
                <h3>{product.title}</h3>
                <p>★ {product.rating}</p>
                <strong>{product.price}</strong>
                <button type="button" className={styles.primaryBtn} onClick={() => addToCart(product.id)}>
                  {addedId === product.id ? "Добавлено ✓" : "В корзину"}
                </button>
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
        <div className={styles.badges}>
          <span>GMP</span>
          <span>ISO</span>
          <span>LAB TESTED</span>
          <span>NO BANNED</span>
          <span>SHIELD</span>
        </div>
      </section>

      <section id="why" className={styles.section}>
        <h2>ПОЧЕМУ МЫ</h2>
        <div className={styles.whyGrid}>
          <div>🧬 Чистый состав</div>
          <div>🌍 Производство ЕС/США</div>
          <div>🚚 Быстрая доставка</div>
          <div>🛡️ Гарантия возврата</div>
        </div>
      </section>

      <section id="reviews" className={styles.section}>
        <h2>ОТЗЫВЫ</h2>
        <div className={styles.reviews}>
          <button type="button" className={styles.videoCard} onClick={() => setModal({ open: true, type: "video" })}>
            ▶ Видео-отзыв
          </button>
          <article className={styles.reviewCard}>
            <p>"Минус 6 кг за 2 месяца и отличное самочувствие."</p>
            <strong>Ирина, ★★★★★</strong>
          </article>
        </div>
      </section>

      <section id="blog" className={styles.section}>
        <h2>СОВЕТЫ ЭКСПЕРТА / БЛОГ</h2>
        <div className={styles.blogGrid}>
          <Image src="/sportpit/expert.svg" alt="Эксперт" width={220} height={220} />
          {["Как пить протеин", "BCAA до или после", "Омега-3 для восстановления"].map((article) => (
            <button key={article} type="button" className={styles.secondaryBtn} onClick={() => setModal({ open: true, type: "article", payload: article })}>
              {article}
            </button>
          ))}
        </div>
      </section>

      <section id="subscribe" className={styles.section}>
        <h2>-10% НА ПЕРВЫЙ ЗАКАЗ</h2>
        <form
          className={styles.subscribe}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = String(formData.get("email") || "");
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
          <button type="submit" className={styles.primaryBtn}>
            Подписаться
          </button>
        </form>
      </section>

      <footer className={styles.footer}>
        <div>Категории</div>
        <div>Доставка и оплата</div>
        <div>Политика</div>
        <div>Контакты</div>
        <div className={styles.copy}>© SportPit, 2026</div>
      </footer>

      {toast.open && <div className={styles.toast}>{toast.text}</div>}

      {modal.open && (
        <div className={styles.modalOverlay} onClick={() => setModal({ open: false, type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setModal({ open: false, type: null })}>
              ✕
            </button>
            {modal.type === "video" ? <p>Фейковое видео-окно для демо.</p> : <p>{modal.payload}: краткое содержание статьи.</p>}
          </div>
        </div>
      )}
    </>
  );
}
