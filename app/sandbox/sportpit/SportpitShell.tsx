"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import styles from "./SportpitShell.module.css";

type NavItem = { id: string; label: string; icon: string };
type CategoryItem = { id: string; label: string; icon: string };

const navItems: NavItem[] = [
  { id: "top", label: "Главная", icon: "🏁" },
  { id: "catalog", label: "Каталог", icon: "🥤" },
  { id: "goals", label: "Подбор", icon: "🎯" },
  { id: "popular", label: "Бестселлеры", icon: "🔥" },
  { id: "about", label: "О нас", icon: "🧪" },
  { id: "reviews", label: "Отзывы", icon: "💬" },
  { id: "blog", label: "Блог", icon: "📰" },
];

const categoryItems: CategoryItem[] = [
  { id: "protein", label: "Протеины", icon: "🥛" },
  { id: "amino", label: "Аминокислоты", icon: "⚡" },
  { id: "gainer", label: "Гейнеры", icon: "🏋️" },
  { id: "fatburn", label: "Жиросжигатели", icon: "🔥" },
  { id: "prebio", label: "Пребиотики", icon: "🧫" },
  { id: "vit", label: "Витамины", icon: "💊" },
  { id: "joints", label: "Для суставов", icon: "🦴" },
  { id: "acc", label: "Аксессуары", icon: "🎒" },
];

const topMenu = [
  { label: "Каталог", target: "catalog" },
  { label: "Акции", target: "popular" },
  { label: "Доставка", target: "subscribe" },
  { label: "Контакты", target: "subscribe" },
];

export default function SportpitShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isMainPage = pathname === "/sandbox/sportpit";

  const [cartCount, setCartCount] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [activeCategory, setActiveCategory] = useState("protein");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [filterToast, setFilterToast] = useState(false);

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

  useEffect(() => {
    if (!filterToast) return;
    const timer = setTimeout(() => setFilterToast(false), 1300);
    return () => clearTimeout(timer);
  }, [filterToast]);

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

  const onCategoryClick = (id: string) => {
    setActiveCategory(id);
    goToSection("catalog");
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
            <Image src="/sportpit/strong-logo.svg" alt="Strong" width={148} height={48} priority />
          </button>
        </div>

        <nav className={styles.topNav}>
          {topMenu.map((item) => (
            <button key={item.label} type="button" onClick={() => goToSection(item.target)}>
              {item.label}
            </button>
          ))}
        </nav>

        <label className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input type="search" placeholder="Поиск протеинов, БАДов…" aria-label="Поиск товаров" />
        </label>

        <div className={styles.headerActions}>
          <button type="button">RU</button>
          <button type="button" className={styles.cartIcon}>
            🛒 <span>{cartCount}</span>
          </button>
          <Link href="/sandbox/sportpit/login">Вход</Link>
          <Link href="/sandbox/sportpit/register">Регистрация</Link>
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
          className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${isSidebarOpen ? styles.sidebarMobileOpen : ""}`}
          aria-label="Основная навигация"
        >
          <div className={styles.sidebarTop}>
            <strong>Меню</strong>
            <button type="button" className={styles.sidebarClose} onClick={() => setIsSidebarOpen(false)} aria-label="Закрыть меню">
              ✕
            </button>
          </div>
          <div className={styles.sidebarSectionLabel}>ФИЛЬТР ПОИСКА</div>
          <div className={styles.filterCard}>
            <div className={styles.filterBlock}>
              <h4>Страна</h4>
              <label><input type="checkbox" defaultChecked /> Америка</label>
              <label><input type="checkbox" /> Европа</label>
            </div>
            <div className={styles.filterBlock}>
              <h4>Производитель</h4>
              <select defaultValue="">
                <option value="" disabled>Выбрать</option>
                <option>Strong Labs</option>
                <option>PowerFuel</option>
                <option>Sport Origin</option>
              </select>
            </div>
            <div className={styles.filterBlock}>
              <h4>Цена</h4>
              <div className={styles.rating}>★★★★★</div>
              <input type="range" min="900" max="5000" defaultValue="2600" />
            </div>
            <button type="button" className={styles.showBtn} onClick={() => setFilterToast(true)}>
              Показать
            </button>
          </div>

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

          <div className={styles.sidebarSectionLabel}>КАТАЛОГ</div>
          <div className={styles.sidebarNav}>
            {categoryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeCategory === item.id ? styles.menuItemActive : ""}
                onClick={() => onCategoryClick(item.id)}
                title={item.label}
              >
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
          <div className={styles.banner}>SportPit Sandbox · {pathname}</div>
          {children}
        </main>
      </div>

      {filterToast && <div className={styles.toast}>Фильтр применён</div>}
    </div>
  );
}
