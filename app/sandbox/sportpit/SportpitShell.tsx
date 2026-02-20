"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import styles from "./SportpitShell.module.css";

type NavItem = { id: string; label: string; icon: string };
type CategoryItem = { label: string; icon: string };

const navItems: NavItem[] = [
  { id: "top", label: "Главная", icon: "🏁" },
  { id: "catalog", label: "Каталог", icon: "🥤" },
  { id: "goals", label: "Подбор", icon: "🎯" },
  { id: "popular", label: "Бестселлеры", icon: "🔥" },
  { id: "about", label: "О нас", icon: "🧪" },
  { id: "reviews", label: "Отзывы", icon: "💬" },
  { id: "blog", label: "Блог", icon: "📰" },
];

const categories: CategoryItem[] = [
  { label: "Протеины", icon: "🥛" },
  { label: "BCAA/EAA", icon: "⚡" },
  { label: "Жиросжигатели", icon: "🔥" },
  { label: "Витамины", icon: "💊" },
  { label: "Омега", icon: "🫧" },
  { label: "Предтренировочные", icon: "🏋️" },
  { label: "Восстановление", icon: "🌙" },
  { label: "Акции", icon: "🎁" },
  { label: "Бренды", icon: "🏷️" },
];

export default function SportpitShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isMainPage = pathname === "/sandbox/sportpit";

  const [cartCount, setCartCount] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const syncCart = () => setCartCount(Number(window.sessionStorage.getItem("sp-cart-count") || "0"));
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("sp-cart-changed", syncCart as EventListener);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("sp-cart-changed", syncCart as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isMainPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { threshold: 0.4 }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMainPage]);

  const onBurgerClick = () => {
    if (isMobileViewport) {
      setIsSidebarOpen((prev) => !prev);
      return;
    }
    setIsCollapsed((prev) => !prev);
  };

  const goToSection = (id: string) => {
    if (!isMainPage) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#sportpit-main">
        К содержанию
      </a>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={`${styles.burger} ${isSidebarOpen ? styles.burgerOpen : ""}`}
            onClick={onBurgerClick}
            aria-label="Открыть меню"
            aria-controls="sportpit-sidebar"
            aria-expanded={isMobileViewport ? isSidebarOpen : !isCollapsed}
          >
            <span />
            <span />
            <span />
          </button>
          <button type="button" className={styles.logo} onClick={() => goToSection("top")}>
            {/* TODO: заменить на финальный SVG/PNG логотип */}
            <span className={styles.logoMark}>S</span>
            <span className={styles.logoText}>SportPit</span>
          </button>
        </div>

        <label className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input type="search" placeholder="Поиск протеинов, БАДов…" aria-label="Поиск товаров" />
        </label>

        <div className={styles.headerActions}>
          <button type="button">RU</button>
          <Link href="/sandbox/sportpit/login">Вход</Link>
          <Link href="/sandbox/sportpit/register">Регистрация</Link>
          <button type="button" className={styles.cart}>
            Корзина <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <div className={styles.appShell}>
        <button
          type="button"
          className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.sidebarOverlayVisible : ""}`}
          aria-label="Закрыть меню"
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside
          id="sportpit-sidebar"
          className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${
            isSidebarOpen ? styles.sidebarMobileOpen : ""
          }`}
          aria-label="Основная навигация"
        >
          <div className={styles.sidebarSectionLabel}>НАВИГАЦИЯ</div>
          <div className={styles.sidebarNav}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeSection === item.id && isMainPage ? styles.menuItemActive : ""}
                onClick={() => goToSection(item.id)}
                title={item.label}
              >
                <span>{item.icon}</span>
                <em>{item.label}</em>
              </button>
            ))}
          </div>

          <div className={styles.sidebarSectionLabel}>КАТЕГОРИИ</div>
          <div className={styles.sidebarNav}>
            {categories.map((item) => (
              <button key={item.label} type="button" onClick={() => console.log(`Категория: ${item.label}`)} title={item.label}>
                <span>{item.icon}</span>
                <em>{item.label}</em>
              </button>
            ))}
          </div>

          <button type="button" className={styles.collapseBtn} onClick={() => setIsCollapsed((prev) => !prev)}>
            {isCollapsed ? "Развернуть меню" : "Свернуть меню"}
          </button>
        </aside>

        <main id="sportpit-main" className={styles.content}>
          <div className={styles.banner}>Sandbox: SportPit (noindex)</div>
          {children}
        </main>
      </div>
    </div>
  );
}
