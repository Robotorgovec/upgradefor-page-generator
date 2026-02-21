"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentType, PropsWithChildren, SVGProps } from "react";
import { useEffect, useState } from "react";
import styles from "./SportpitShell.module.css";
import {
  AccessoriesIcon,
  AminoIcon,
  CartIcon,
  ChatIcon,
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
  VitIcon,
} from "./ui/icons";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { id: string; label: string; icon: IconComp };
type CategoryItem = { id: string; label: string; icon: IconComp };

const MAIN_ROUTE = "/sandbox/sportpit";
const USA_ROUTE = "/catalog/usa";
const PRICE_CAP = 5000;

const navItems: NavItem[] = [
  { id: "top", label: "Главная", icon: HomeIcon },
  { id: "quality", label: "Качество", icon: LabIcon },
  { id: "reviews", label: "Отзывы", icon: ChatIcon },
  { id: "education", label: "База знаний", icon: NewsIcon },
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
  { label: "Подбор", target: "how" },
  { label: "Лаборатория", target: "quality" },
  { label: "Блог", target: "education" },
  { label: "Доставка", target: "subscribe" },
  { label: "Контакты", target: "footer" },
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

export default function SportpitShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isMainPage = pathname === MAIN_ROUTE;
  const isUsaCatalog = pathname === USA_ROUTE;

  // ВАЖНО: useSearchParams() может давать новый объект часто.
  // Поэтому берём "строку" — это стабилизирует эффекты и убирает “петли”.
  const queryString = searchParams.toString();
  const origin = searchParams.get("origin");

  const isUsaChecked = isUsaCatalog || origin === "USA";

  const [cartCount, setCartCount] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [activeTypeNav, setActiveTypeNav] = useState("protein");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [filterToast, setFilterToast] = useState(false);

  const [priceMin, setPriceMin] = useState(900);
  const [priceMax, setPriceMax] = useState(2600);
  const [priceRange, setPriceRange] = useState(2600);
  const [ratingMin, setRatingMin] = useState<number | null>(4.0);

  // Viewport / mobile
  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Если ушли с мобилки на десктоп — закрываем мобильный оверлей
  useEffect(() => {
    if (!isMobileViewport) setIsSidebarOpen(false);
  }, [isMobileViewport]);

  // Синхронизация корзины (защита от SecurityError)
  useEffect(() => {
    const syncCart = () => {
      try {
        setCartCount(Number(window.sessionStorage.getItem("sp-cart-count") || "0"));
      } catch {
        setCartCount(0);
      }
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("sp-cart-changed", syncCart as EventListener);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("sp-cart-changed", syncCart as EventListener);
    };
  }, []);

  // Авто-скролл к #hash при переходах на главную
  useEffect(() => {
    if (!isMainPage) return;

    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(hash);
    }, 50);

    return () => window.clearTimeout(t);
  }, [isMainPage, pathname]);

  // Подсветка активной секции на главной (защита, если IntersectionObserver недоступен)
  useEffect(() => {
    if (!isMainPage) return;
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        const id = (visible?.target as HTMLElement | undefined)?.id;
        if (id) setActiveSection(id);
      },
      { threshold: 0.35 }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMainPage]);

  // Toast auto-hide
  useEffect(() => {
    if (!filterToast) return;
    const timer = setTimeout(() => setFilterToast(false), 1500);
    return () => clearTimeout(timer);
  }, [filterToast]);

  /**
   * НОРМАЛИЗАЦИЯ USA (без петли):
   * - Если origin=USA и мы НЕ на /catalog/usa => уводим на /catalog/usa с тем же query
   * - Если мы на /catalog/usa и origin != USA => проставляем origin=USA
   */
  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const qOrigin = params.get("origin");

    const mustGoUsa = qOrigin === "USA" && pathname !== USA_ROUTE;
    const mustSetOrigin = pathname === USA_ROUTE && qOrigin !== "USA";

    if (!mustGoUsa && !mustSetOrigin) return;

    if (!params.get("sort")) params.set("sort", "popular");
    if (!params.get("page")) params.set("page", "1");
    if (mustSetOrigin) params.set("origin", "USA");

    const next = `${USA_ROUTE}?${params.toString()}`;
    router.replace(next);
  }, [pathname, queryString, router]);

  const onBurgerClick = () => {
    if (isMobileViewport) {
      setIsSidebarOpen((prev) => !prev);
      return;
    }
    setIsCollapsed((prev) => !prev);
  };

  const goToSection = (id: string) => {
    // Если мы не на главной — уводим на главную с hash
    if (!isMainPage) {
      router.push(`${MAIN_ROUTE}#${id}`);
      setIsSidebarOpen(false);
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setIsSidebarOpen(false);
  };

  const onTypeClick = (id: string) => {
    setActiveTypeNav(id);
    goToSection("catalog");
  };

  const onPriceMinChange = (value: number) => {
    const nextMin = clamp(value, 0, Math.min(priceMax, PRICE_CAP));
    setPriceMin(nextMin);
    if (priceRange < nextMin) setPriceRange(nextMin);
  };

  const onPriceMaxChange = (value: number) => {
    const nextMax = clamp(value, priceMin, PRICE_CAP);
    setPriceMax(nextMax);
    setPriceRange(nextMax);
  };

  const onUsaToggle = (enabled: boolean) => {
    const params = new URLSearchParams(queryString);

    if (enabled) {
      params.set("origin", "USA");
      if (!params.get("sort")) params.set("sort", "popular");
      if (!params.get("page")) params.set("page", "1");
      router.push(`${USA_ROUTE}?${params.toString()}`);
      return;
    }

    // Выключаем USA: чистим специфичные параметры и возвращаем на MAIN_ROUTE
    params.delete("origin");
    params.delete("cat");
    params.delete("sub");
    params.delete("brand");

    const next = `${MAIN_ROUTE}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(next);
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
            aria-label={
              isMobileViewport
                ? isSidebarOpen
                  ? "Закрыть меню"
                  : "Открыть меню"
                : isCollapsed
                  ? "Открыть меню"
                  : "Свернуть меню"
            }
            aria-controls="sportpit-sidebar"
            aria-expanded={isMobileViewport ? isSidebarOpen : !isCollapsed}
          >
            <span />
            <span />
            <span />
          </button>

          <button type="button" className={styles.logo} onClick={() => goToSection("top")} aria-label="На главную">
            <Image src="/sportpit/activecode-logo.svg" alt="ActiveCode logo" width={208} height={64} priority />
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
          <input type="search" placeholder="Поиск продуктов" aria-label="Поиск товаров" />
        </label>

        <div className={styles.headerActions}>
          <button type="button">RU</button>
          <button type="button">KZ</button>
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
          className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${
            isSidebarOpen ? styles.sidebarMobileOpen : ""
          }`}
          aria-label="Основная навигация"
        >
          <div className={styles.sidebarTop}>
            <strong>Цели / продукты</strong>
          </div>

          <div className={styles.sidebarSectionLabel}>Навигация</div>
          <div className={styles.sidebarNav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id && isMainPage;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={active ? styles.menuItemActive : ""}
                  onClick={() => goToSection(item.id)}
                  title={item.label}
                >
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
              const active = activeTypeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={active ? styles.menuItemActive : ""}
                  onClick={() => onTypeClick(item.id)}
                  title={item.label}
                >
                  <Icon className={styles.sidebarIcon} />
                  <em>{item.label}</em>
                </button>
              );
            })}
          </div>

          <div className={styles.sidebarSectionLabel}>Фильтры</div>
          <div className={styles.filterCard}>
            <div className={styles.filterHead}>
              <FilterIcon className={styles.smallIcon} /> <span>Параметры</span>
            </div>

            <div className={styles.filterBlock}>
              <h4>
                <GlobeIcon className={styles.smallIcon} /> Страна
              </h4>

              <label>
                <input type="checkbox" checked={isUsaChecked} onChange={(e) => onUsaToggle(e.target.checked)} />{" "}
                Американское спортивное питание (USA)
              </label>

              <select defaultValue="kz" aria-label="Выбор страны">
                <option value="kz">Казахстан</option>
                <option value="ru">Россия</option>
                <option value="us">США</option>
              </select>
            </div>

            <div className={styles.filterBlock}>
              <h4>
                <GlobeIcon className={styles.smallIcon} /> Форма
              </h4>
              <label>
                <input type="checkbox" defaultChecked /> Капсулы
              </label>
              <label>
                <input type="checkbox" /> Порошок
              </label>
              <label>
                <input type="checkbox" /> Жидкость
              </label>
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
                  max={Math.min(priceMax, PRICE_CAP)}
                  onChange={(e) => onPriceMinChange(Number(e.target.value || 0))}
                  aria-label="Мин. цена"
                />
                <input
                  className={styles.priceInput}
                  type="number"
                  value={priceMax}
                  min={priceMin}
                  max={PRICE_CAP}
                  onChange={(e) => onPriceMaxChange(Number(e.target.value || priceMin))}
                  aria-label="Макс. цена"
                />
              </div>
              <input
                className={styles.range}
                type="range"
                min={priceMin}
                max={PRICE_CAP}
                value={priceRange}
                onChange={(e) => onPriceMaxChange(Number(e.target.value))}
                aria-label="Слайдер цены"
              />
            </div>

            <div className={styles.filterBlock}>
              <h4>
                <LabIcon className={styles.smallIcon} /> Рейтинг
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
                <input
                  className={styles.ratingSlider}
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={ratingMin ?? 0}
                  aria-label="Минимальный рейтинг"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setRatingMin(value === 0 ? null : value);
                  }}
                />
                <span className={styles.ratingNote}>{ratingMin !== null ? ratingMin.toFixed(1) : "Любой"}</span>
              </div>
            </div>

            <button type="button" className={styles.showBtn} onClick={() => setFilterToast(true)}>
              Показать
            </button>
          </div>
        </aside>

        <main id="sportpit-main" className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>

      {filterToast && (
        <div className={styles.toast}>
          Фильтр применён: {priceMin}–{priceMax} ₽, рейтинг {ratingMin !== null ? ratingMin.toFixed(1) : "любой"}
        </div>
      )}
    </div>
  );
}
