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
  ChatIcon,
  FactoryIcon,
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
  VitIcon,
} from "./ui/icons";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { id: string; label: string; icon: IconComp };
type CategoryItem = { id: string; label: string; icon: IconComp };

const navItems: NavItem[] = [
  { id: "top", label: "Главная", icon: HomeIcon },
  { id: "protocols", label: "Протоколы", icon: TargetIcon },
  { id: "catalog", label: "Каталог", icon: CatalogIcon },
  { id: "quality", label: "Качество", icon: LabIcon },
  { id: "reviews", label: "Отзывы", icon: ChatIcon },
  { id: "education", label: "База знаний", icon: NewsIcon },
];

const protocolItems: CategoryItem[] = [
  { id: "energy", label: "ENERGY", icon: FlameIcon },
  { id: "focus", label: "FOCUS", icon: TargetIcon },
  { id: "recovery", label: "RECOVERY", icon: LabIcon },
  { id: "hormone", label: "HORMONE", icon: HomeIcon },
  { id: "longevity", label: "LONGEVITY", icon: GlobeIcon },
  { id: "performance", label: "PERFORMANCE", icon: FactoryIcon },
];

const categoryItems: CategoryItem[] = [
  { id: "protein", label: "Протеины", icon: ProteinIcon },
  { id: "amino", label: "Аминокислоты", icon: AminoIcon },
  { id: "gainer", label: "Гейнеры", icon: GainerIcon },
  { id: "fatburn", label: "Жиросжигатели", icon: FlameIcon },
  { id: "prebio", label: "Пребиотики", icon: PrebioIcon },
  { id: "vit", label: "Витамины", icon: VitIcon },
  { id: "joints", label: "Для суставов", icon: JointsIcon },
  { id: "acc", label: "Аксессуары", icon: AccessoriesIcon },
];

const topMenu = [
  { label: "Протоколы", target: "protocols" },
  { label: "Каталог", target: "catalog" },
  { label: "Подбор", target: "how" },
  { label: "Лаборатория", target: "quality" },
  { label: "Блог", target: "education" },
  { label: "Доставка", target: "subscribe" },
  { label: "Контакты", target: "footer" },
];

export default function SportpitShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isMainPage = pathname === "/sandbox/sportpit";

  const [cartCount, setCartCount] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [activeProtocolNav, setActiveProtocolNav] = useState("energy");
  const [activeTypeNav, setActiveTypeNav] = useState("protein");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [filterToast, setFilterToast] = useState(false);

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
      { threshold: 0.35 }
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

  const onProtocolClick = (id: string) => {
    setActiveProtocolNav(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("goal", id);
      window.history.replaceState({}, "", url.toString());
    }
    goToSection("protocols");
  };

  const onTypeClick = (id: string) => {
    setActiveTypeNav(id);
    goToSection("catalog");
  };

  const onPriceMinChange = (value: number) => {
    const nextMin = Math.max(0, Math.min(value, priceMax));
    setPriceMin(nextMin);
    if (priceRange < nextMin) setPriceRange(nextMin);
  };

  const onPriceMaxChange = (value: number) => {
    const nextMax = Math.max(priceMin, value);
    setPriceMax(nextMax);
    setPriceRange(nextMax);
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
            <Image src="/sportpit/activecode-logo.svg" alt="ActiveCode" width={148} height={48} priority />
          </button>
        </div>

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
          <input type="search" placeholder="Поиск модулей и протоколов" aria-label="Поиск товаров" />
        </label>

        <div className={styles.headerActions}>
          <button type="button">RU</button>
          <button type="button">KZ</button>
          <button type="button" className={styles.protocolCta} onClick={() => goToSection("how")}>
            Подобрать протокол
          </button>
          <button type="button" className={styles.cartIcon} aria-label="Корзина">
            <CartIcon className={styles.headerIcon} /> <span>{cartCount}</span>
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
          className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${isSidebarOpen ? styles.sidebarMobileOpen : ""}`}
          aria-label="Основная навигация"
        >
          <div className={styles.sidebarTop}>
            <strong>Цели / протоколы</strong>
            <button
              type="button"
              className={styles.sidebarClose}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Закрыть меню"
            >
              ✕
            </button>
          </div>

          <div className={styles.sidebarSectionLabel}>Фильтры</div>
          <div className={styles.filterCard}>
            <div className={styles.filterHead}>
              <FilterIcon className={styles.smallIcon} /> <span>Параметры</span>
            </div>
            <div className={styles.filterBlock}>
              <h4>
                <TargetIcon className={styles.smallIcon} /> Цель / Протокол
              </h4>
              <select defaultValue="">
                <option value="" disabled>Выбрать цель</option>
                {protocolItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterBlock}>
              <h4>
                <GlobeIcon className={styles.smallIcon} /> Форма
              </h4>
              <label><input type="checkbox" defaultChecked /> Капсулы</label>
              <label><input type="checkbox" /> Порошок</label>
              <label><input type="checkbox" /> Жидкость</label>
            </div>
            <div className={styles.filterBlock}>
              <h4>
                <PriceIcon className={styles.smallIcon} /> Цена
              </h4>
              <div className={styles.priceRow}>
                <input className={styles.priceInput} type="number" value={priceMin} min={0} onChange={(e) => onPriceMinChange(Number(e.target.value || 0))} aria-label="Мин. цена" />
                <input className={styles.priceInput} type="number" value={priceMax} min={priceMin} onChange={(e) => onPriceMaxChange(Number(e.target.value || priceMin))} aria-label="Макс. цена" />
              </div>
              <input className={styles.range} type="range" min={priceMin} max={5000} value={priceRange} onChange={(e) => onPriceMaxChange(Number(e.target.value))} aria-label="Слайдер цены" />
            </div>
            <div className={styles.filterBlock}>
              <h4>
                <FactoryIcon className={styles.smallIcon} /> Рейтинг
              </h4>
              <div className={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" aria-label={`Рейтинг ${star}`} className={`${styles.starBtn} ${ratingMin !== null && star <= ratingMin ? styles.starOn : styles.starOff}`} onClick={() => setRatingMin((prev) => (prev === star ? null : star))}>★</button>
                ))}
                <span className={styles.ratingNote}>{ratingMin ? `${ratingMin}+` : "Любой"}</span>
              </div>
            </div>
            <button type="button" className={styles.showBtn} onClick={() => setFilterToast(true)}>Показать</button>
          </div>

          <div className={styles.sidebarSectionLabel}>Навигация</div>
          <div className={styles.sidebarNav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" className={activeSection === item.id && isMainPage ? styles.menuItemActive : ""} onClick={() => goToSection(item.id)} title={item.label}>
                  <Icon className={styles.sidebarIcon} />
                  <em>{item.label}</em>
                </button>
              );
            })}
          </div>

          <div className={styles.sidebarSectionLabel}>Протоколы</div>
          <div className={styles.sidebarNav}>
            {protocolItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" className={activeProtocolNav === item.id ? styles.menuItemActive : ""} onClick={() => onProtocolClick(item.id)} title={item.label}>
                  <Icon className={styles.sidebarIcon} />
                  <em>{item.label}</em>
                </button>
              );
            })}
          </div>

          <div className={styles.sidebarSectionLabel}>Каталог (типы)</div>
          <div className={styles.sidebarNav}>
            {categoryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" className={activeTypeNav === item.id ? styles.menuItemActive : ""} onClick={() => onTypeClick(item.id)} title={item.label}>
                  <Icon className={styles.sidebarIcon} />
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
          {children}
        </main>
      </div>

      {filterToast && (
        <div className={styles.toast}>Фильтр применён: {priceMin}–{priceMax} ₽, рейтинг {ratingMin ? `${ratingMin}+` : "любой"}</div>
      )}
    </div>
  );
}
