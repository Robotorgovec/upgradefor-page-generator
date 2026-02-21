"use client";

import { usePathname } from "next/navigation";
import type { ComponentType, PropsWithChildren, SVGProps } from "react";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import styles from "./SportpitShell.module.css";
import {
  AccessoriesIcon,
  AminoIcon,
  CartIcon,
  FactoryIcon,
  FatburnIcon,
  FilterIcon,
  GlobeIcon,
  JointsIcon,
  PrebioIcon,
  PriceIcon,
  ProteinIcon,
  TargetIcon,
  VitIcon,
  GainerIcon,
} from "./ui/icons";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { id: string; label: string };
type CategoryItem = { id: string; label: string; icon: IconComp };

const MOBILE_BREAKPOINT = 768;

const navItems: NavItem[] = [
  { id: "top", label: "Главная" },
  { id: "catalog", label: "Каталог" },
  { id: "goals", label: "Подбор" },
  { id: "popular", label: "Бестселлеры" },
  { id: "about", label: "О нас" },
  { id: "reviews", label: "Отзывы" },
  { id: "blog", label: "Блог" },
  { id: "popular", label: "Акции" },
  { id: "subscribe", label: "Доставка" },
  { id: "subscribe", label: "Контакты" },
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

export default function SportpitShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isMainPage = pathname === "/sandbox/sportpit";

  const [cartCount, setCartCount] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [activeCategory, setActiveCategory] = useState("protein");
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= MOBILE_BREAKPOINT : true
  );
  const [filterToast, setFilterToast] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const prevIsMobileRef = useRef<boolean | null>(null);

  const [priceMin, setPriceMin] = useState(900);
  const [priceMax, setPriceMax] = useState(2600);
  const [priceRange, setPriceRange] = useState(2600);
  const [ratingMin, setRatingMin] = useState<number | null>(4);

  const uniqueHeaderNav = useMemo(
    () => navItems.filter((item, idx, arr) => arr.findIndex((x) => x.label === item.label) === idx),
    []
  );

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobileViewport(mobile);

      if (prevIsMobileRef.current === null) {
        setIsSidebarOpen(!mobile);
      } else if (prevIsMobileRef.current !== mobile) {
        setIsSidebarOpen(!mobile);
      }

      prevIsMobileRef.current = mobile;
    };

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
    ["top", "catalog", "goals", "popular", "about", "reviews", "blog", "subscribe"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isMainPage]);

  useEffect(() => {
    if (!filterToast) return;
    const timer = setTimeout(() => setFilterToast(false), 1500);
    return () => clearTimeout(timer);
  }, [filterToast]);

  useEffect(() => {
    if (!isSearchOpen) return;
    searchInputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSearchOpen(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!searchWrapRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [isSearchOpen]);

  const onBurgerClick = () => setIsSidebarOpen((prev) => !prev);

  const goToSection = (id: string) => {
    if (!isMainPage) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    if (isMobileViewport) setIsSidebarOpen(false);
    setIsSearchOpen(false);
  };

  const onCategoryClick = (id: string) => {
    setActiveCategory(id);
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

  const applyFilters = () => setFilterToast(true);

  const onStarClick = (star: number, event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickedHalf = event.clientX - rect.left < rect.width / 2;
    const nextValue = clickedHalf ? star - 0.5 : star;
    setRatingMin((prev) => (prev === nextValue ? null : nextValue));
  };

  return (
    <div className={styles.page} data-sidebar-open={isSidebarOpen ? "true" : "false"}>
      <a className={styles.skip} href="#sportpit-main">
        К содержанию
      </a>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={`${styles.burger} ${isSidebarOpen ? styles.burgerOpen : ""}`}
            onClick={onBurgerClick}
            aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
            aria-controls="sportpit-sidebar"
            aria-expanded={isSidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <button type="button" className={styles.logo} onClick={() => goToSection("top")}>
            <span className={styles.wordmark}>
              <span>Active</span>
              <span>Code</span>
            </span>
          </button>
        </div>

        <nav className={styles.topNav} aria-label="Верхнее меню">
          {uniqueHeaderNav.map((item) => (
            <a
              key={`${item.label}-${item.id}`}
              href={`#${item.id}`}
              className={styles.topNavLink}
              onClick={(e) => {
                e.preventDefault();
                goToSection(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.headerActions} ref={searchWrapRef}>
          <button
            type="button"
            className={styles.searchToggle}
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-expanded={isSearchOpen}
            aria-controls="sportpit-search-panel"
            aria-label="Поиск"
          >
            ⌕
          </button>
          <button type="button">RU</button>
          <button type="button" className={styles.cartIcon} aria-label="Корзина">
            <CartIcon className={styles.headerIcon} /> <span>{cartCount}</span>
          </button>

          <div
            id="sportpit-search-panel"
            className={`${styles.searchPanel} ${isSearchOpen ? styles.searchPanelOpen : ""}`}
          >
            <input ref={searchInputRef} type="search" placeholder="Поиск протеинов, БАДов…" aria-label="Поиск товаров" />
          </div>
        </div>
      </header>

      <div className={styles.appShell}>
        <button
          type="button"
          className={`${styles.sidebarOverlay} ${isMobileViewport && isSidebarOpen ? styles.sidebarOverlayVisible : ""}`}
          aria-label="Закрыть меню"
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside
          id="sportpit-sidebar"
          className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarMobileOpen : ""}`}
          aria-label="Каталог и фильтр"
        >
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
                  <Icon className={styles.sidebarIcon} />
                  <em>{item.label}</em>
                </button>
              );
            })}
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
                <option>ActiveCode Labs</option>
                <option>PowerFuel</option>
                <option>Sport Origin</option>
              </select>
            </div>

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

            <div className={styles.filterBlock}>
              <h4>
                <TargetIcon className={styles.smallIcon} /> Рейтинг
              </h4>
              <div className={styles.ratingRow}>
                <div className={styles.starGroup}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const full = ratingMin !== null && ratingMin >= star;
                    const half = ratingMin !== null && ratingMin === star - 0.5;
                    return (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Рейтинг ${star}`}
                        className={`${styles.starBtn} ${full ? styles.starOn : ""} ${half ? styles.starHalf : ""} ${
                          !full && !half ? styles.starOff : ""
                        }`}
                        onClick={(event) => onStarClick(star, event)}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <span className={styles.ratingNote}>{ratingMin === null ? "Любой" : ratingMin.toFixed(1)}</span>
              </div>
            </div>

            <button type="button" className={styles.showBtn} onClick={applyFilters}>
              Показать
            </button>
          </div>
        </aside>

        <main id="sportpit-main" className={styles.content}>
          <div className={styles.banner}>SportPit Sandbox · {pathname}</div>
          {children}
        </main>
      </div>

      {filterToast && (
        <div className={styles.toast}>
          Фильтр применён: {priceMin}–{priceMax} ₽, рейтинг {ratingMin === null ? "любой" : ratingMin.toFixed(1)}
        </div>
      )}
    </div>
  );
}
