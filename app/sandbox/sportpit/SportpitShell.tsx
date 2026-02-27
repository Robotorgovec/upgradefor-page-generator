"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import styles from "./SportpitShell.module.css";
import { CartIcon } from "./_components/icons";
import { Sidebar } from "./components/Sidebar";

const navSectionIds = ["top", "quality", "reviews", "education"] as const;

const topMenu = [
  { label: "Подбор", target: "how" },
  { label: "Лаборатория", target: "quality" },
  { label: "Блог", target: "education" },
  { label: "Доставка", target: "subscribe" },
  { label: "Контакты", target: "footer" },
];

export default function SportpitShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isMainPage = pathname === "/sandbox/sportpit";
  const isUsaContext = pathname.startsWith("/catalog/usa") || searchParams.get("origin") === "USA";

  const [cartCount, setCartCount] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [activeTypeNav, setActiveTypeNav] = useState("protein");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [filterToast, setFilterToast] = useState(false);
  const [country, setCountry] = useState<"kz" | "ru" | "us">("kz");
  const [priceMin, setPriceMin] = useState(900);
  const [priceMax, setPriceMax] = useState(2600);
  const [ratingMin, setRatingMin] = useState<number | null>(4.0);

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (isMainPage) setIsCollapsed(false);
  }, [isMainPage]);

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

    navSectionIds.forEach((id) => {
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

  const onBurgerClick = () => {
    if (isMobileViewport) {
      setIsSidebarOpen((prev) => !prev);
      return;
    }
    setIsCollapsed((prev) => !prev);
  };

  const isNavOpen = isMobileViewport ? isSidebarOpen : !isCollapsed;

  const goToSection = (id: string) => {
    if (!isMainPage) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setIsSidebarOpen(false);
  };

  const onTypeClick = (id: string) => {
    setActiveTypeNav(id);
    goToSection("catalog");
  };

  const onCountryChange = (value: "kz" | "ru" | "us") => {
    if (value === "us") {
      const query = new URLSearchParams(searchParams.toString());
      query.set("origin", "USA");
      if (!query.get("sort")) query.set("sort", "popular");
      if (!query.get("page")) query.set("page", "1");
      router.push(`/catalog/usa?${query.toString()}`);
      return;
    }

    setCountry(value);

    if (isUsaContext) {
      const query = new URLSearchParams(searchParams.toString());
      query.delete("origin");
      query.delete("cat");
      query.delete("sub");
      query.delete("brand");
      router.push(`/sandbox/sportpit${query.toString() ? `?${query}` : ""}`);
    }
  };

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#sportpit-main">К содержанию</a>

      <header className={styles.header}>
        <div
          className={`${styles.headerLeft} ${
            !isMobileViewport && isCollapsed ? styles.headerLeftCollapsed : ""
          }`}
        >
          <div className={styles.burgerWrap}>
            <button
              type="button"
              className={`${styles.burger} ${isNavOpen ? styles.burgerOpen : ""}`}
              onClick={onBurgerClick}
              aria-label={isNavOpen ? "Свернуть меню" : "Развернуть меню"}
              aria-controls="sportpit-sidebar"
              aria-expanded={isNavOpen}
            >
              <span className={styles.burgerGlyph} />
            </button>
          </div>

          <button type="button" className={styles.logo} onClick={() => goToSection("top")}>
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
        <Sidebar
          isCollapsed={isCollapsed}
          isSidebarOpen={isSidebarOpen}
          isMainPage={isMainPage}
          activeSection={activeSection}
          activeTypeNav={activeTypeNav}
          country={isUsaContext ? "us" : country}
          priceMin={priceMin}
          priceMax={priceMax}
          ratingMin={ratingMin}
          onClose={() => setIsSidebarOpen(false)}
          onGoToSection={goToSection}
          onTypeClick={onTypeClick}
          onCountryChange={(value) => onCountryChange(value as "kz" | "ru" | "us")}
          onPriceMinChange={(value) => setPriceMin(Math.max(0, Math.min(value, priceMax)))}
          onPriceMaxChange={(value) => setPriceMax(Math.max(priceMin, value))}
          onRatingChange={setRatingMin}
          onShowFilters={() => setFilterToast(true)}
          isMobileViewport={isMobileViewport}
          isNavOpen={isNavOpen}
          onToggleNav={onBurgerClick}
        />

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
