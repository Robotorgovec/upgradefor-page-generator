"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ComponentType, PropsWithChildren, SVGProps } from "react";
import { useEffect, useState } from "react";
import styles from "./SportpitShell.module.css";
import {
  AccessoriesIcon,
  AminoIcon,
  CartIcon,
  CatalogIcon,
  FactoryIcon,
  FatburnIcon,
  FilterIcon,
  FlameIcon,
  GainerIcon,
  GlobeIcon,
  HomeIcon,
  JointsIcon,
  LabIcon,
  NewsIcon,
  PrebioIcon,
  PriceIcon,
  ProteinIcon,
  TargetIcon,
  ChatIcon,
  VitIcon,
} from "./ui/icons";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { id: string; label: string; icon: IconComp };
type CategoryItem = { id: string; label: string; icon: IconComp };

const navItems: NavItem[] = [
  { id: "top", label: "Главная", icon: HomeIcon },
  { id: "catalog", label: "Каталог", icon: CatalogIcon },
  { id: "goals", label: "Подбор", icon: TargetIcon },
  { id: "popular", label: "Бестселлеры", icon: FlameIcon },
  { id: "about", label: "О нас", icon: LabIcon },
  { id: "reviews", label: "Отзывы", icon: ChatIcon },
  { id: "blog", label: "Блог", icon: NewsIcon },
];

const categoryItems: CategoryItem[] = [
  { id: "protein", label: "Протеины", icon: ProteinIcon },
  { id: "amino", label: "Аминокислоты", icon: AminoIcon },
  { id: "gainer", label: "Гейнеры", icon: GainerIcon },
  { id: "fatburn", label: "Жиросжигатели", icon: FatburnIcon },
  { id: "prebio", label: "Пребиотики", icon: PrebioIcon },
  { id: "vit", label: "Витамины", icon: VitIcon },
  { id: "joints", label: "Для суставов", icon: JointsIcon },
  { id: "acc", label: "Аксессуары", icon: AccessoriesIcon },
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

  // Filters: price + rating (stars)
  const [priceMin, setPriceMin] = useState(900);
  const [priceMax, setPriceMax] = useState(2600);
  const [priceRange, setPriceRange] = useState(2600);
  const [ratingMin, setRatingMin] = useState<number | null>(4);

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
    const timer = setTimeout(() => setFilterToast(false), 1500);
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

  const onPriceMinChange = (value: number) => {
    const nextMin = Math.max(0, Math.min(value, priceMax));
    setPriceMin(nextMin);
    // keep slider value inside new bounds
    if (priceRange < nextMin) setPriceRange(nextMin);
  };

  const onPriceMaxChange = (value: number) => {
    const nextMax = Math.max(priceMin, value);
    setPriceMax(nextMax);
    setPriceRange(nextMax);
  };

  const applyFilters = () => {
    setFilterToast(true);
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

        {/* Top menu: NOT buttons — text links (Strong-like rows) */}
        <nav className={styles.topNav} aria-label="Верхнее меню">
          {topMenu.map((item) => (
            <a
              key={item.label}
              href={`#${item.target}`}
              className={styles.topNavLink}
              onClick={(e) => {
                e.preventDefault();
                goToSection(item.target);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <label className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input type="search" placeholder="Поиск протеинов, БАДов…" aria-label="Поиск товаров" />
        </label>

        <div className={styles.headerActions}>
          <button type="button">RU</button>
          <button type="button" className={styles.cartIcon} aria-label="Корзина">
            <CartIcon className={styles.headerIcon} /> <span>{cartCount}</span>
          </button>

          {/* ВАЖНО: Вход/Регистрация удалены по ТЗ */}
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
            <button
              type="button"
              className={styles.sidebarClose}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Закрыть меню"
            >
              ✕
            </button>
          </div>

          <div className={styles.sidebarSectionLabel}>ФИЛЬТР ПОИСКА</div>
          <div className={styles.filterCard}>
            <div className={styles.filterHead}>
              <FilterIcon className={styles.smallIcon} /> <span>Параметры</span>
            </div>

            <div className={styles.filterBlock}>
              <h4>
                <GlobeIcon className={styles.smallIcon} /> Страна
              </h4>
              <label>
                <input type="checkbox" defaultChecked /> Америка
              </label>
              <label>
                <input type="checkbox" /> Европа
              </label>
            </div>

            <div className={styles.filterBlock}>
              <h4>
                <FactoryIcon className={styles.smallIcon} /> Производитель
              </h4>
              <select defaultValue="">
                <option value="" disabled>
                  Выбрать
                </option>
                <option>Strong Labs</option>
                <option>PowerFuel</option>
                <option>Sport Origin</option>
              </select>
            </div>

            {/* Цена: два поля (min/max) + range */}
            <div className={styles.filterBlock}>
              <h4>
                <PriceIcon className={styles.smallIcon} /> Цена
              </h4>
              <div className={styles.priceRow}>
                <input
                  className={styles.priceInput}
                  type="number"
                  value={priceMin}
                  min={0}
                  onChange={(e) => onPriceMinChange(Number(e.target.value || 0))}
                  aria-label="Мин. цена"
                />
                <input
                  className={styles.priceInput}
                  type="number"
                  value={priceMax}
                  min={priceMin}
                  onChange={(e) => onPriceMaxChange(Number(e.target.value || priceMin))}
                  aria-label="Макс. цена"
                />
              </div>
              <input
                className={styles.range}
                type="range"
                min={priceMin}
                max={5000}
                value={priceRange}
                onChange={(e) => onPriceMaxChange(Number(e.target.value))}
                aria-label="Слайдер цены"
              />
            </div>

            {/* Рейтинг: кликабельные звезды */}
            <div className={styles.filterBlock}>
              <h4>
                <TargetIcon className={styles.smallIcon} /> Рейтинг
              </h4>
              <div className={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Рейтинг ${star}`}
                    className={`${styles.starBtn} ${
                      ratingMin !== null && star <= ratingMin ? styles.starOn : styles.starOff
                    }`}
                    onClick={() => setRatingMin((prev) => (prev === star ? null : star))}
                  >
                    ★
                  </button>
                ))}
                <span className={styles.ratingNote}>{ratingMin ? `${ratingMin}+` : "Любой"}</span>
              </div>
            </div>

            <button type="button" className={styles.showBtn} onClick={applyFilters}>
              Показать
            </button>
          </div>

          {isCollapsed && (
            <button type="button" className={styles.filterMini} title="Фильтр" onClick={applyFilters}>
              <FilterIcon className={styles.smallIcon} />
            </button>
          )}

          <div className={styles.sidebarSectionLabel}>НАВИГАЦИЯ</div>
          <div className={styles.sidebarNav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={activeSection === item.id && isMainPage ? styles.menuItemActive : ""}
                  onClick={() => goToSection(item.id)}
                  title={item.label}
                >
                  <span className={styles.iconCapsule}>
                    <Icon className={styles.sidebarIcon} />
                  </span>
                  <em>{item.label}</em>
                </button>
              );
            })}
          </div>

          <div className={styles.sidebarSectionLabel}>КАТАЛОГ</div>
          <div className={styles.sidebarNav}>
            {categoryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={activeCategory === item.id ? styles.menuItemActive : ""}
                  onClick={() => onCategoryClick(item.id)}
                  title={item.label}
                >
                  <span className={styles.iconCapsule}>
                    <Icon className={styles.sidebarIcon} />
                  </span>
                  <em>{item.label}</em>
                </button>
              );
            })}
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

      {filterToast && (
        <div className={styles.toast}>
          Фильтр применён: {priceMin}–{priceMax} ₽, рейтинг {ratingMin ? `${ratingMin}+` : "любой"}
        </div>
      )}
    </div>
  );
}