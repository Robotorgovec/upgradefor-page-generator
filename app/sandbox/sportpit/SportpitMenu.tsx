"use client";

import { ComponentType, SVGProps } from "react";
import styles from "./SportpitShell.module.css";
import { FilterIcon, GlobeIcon, PriceIcon, LabIcon } from "./ui/icons";

export type NavItem = { id: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> };
export type CategoryItem = { id: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

interface SportpitMenuProps {
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  navItems: NavItem[];
  categoryItems: CategoryItem[];
  activeSection: string;
  activeTypeNav: string;
  isMainPage: boolean;
  isUsaContext: boolean;
  country: string;
  priceMin: number;
  priceMax: number;
  ratingMin: number | null;
  onTypeClick: (id: string) => void;
  onCountryChange: (value: string) => void;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  goToSection: (id: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setRatingMin: (value: number | null) => void;
  setFilterToast: (value: boolean) => void;
}

export default function SportpitMenu({
  isCollapsed,
  isSidebarOpen,
  navItems,
  categoryItems,
  activeSection,
  activeTypeNav,
  isMainPage,
  isUsaContext,
  country,
  priceMin,
  priceMax,
  ratingMin,
  onTypeClick,
  onCountryChange,
  onPriceMinChange,
  onPriceMaxChange,
  goToSection,
  setIsSidebarOpen,
  setRatingMin,
  setFilterToast,
}: SportpitMenuProps) {
  return (
    <>
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
            return (
              <button
                key={item.id}
                type="button"
                className={activeSection === item.id && isMainPage ? styles.menuItemActive : ""}
                onClick={() => goToSection(item.id)}
                title={item.label}
              >
                <Icon className={styles.sidebarIcon} />
                <em>{item.label}</em>
              </button>
            );
          })}
        </div>
        <div className={styles.sidebarSectionLabel}>Каталог ( типы )</div>
        <div className={styles.sidebarNav}>
          {categoryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={activeTypeNav === item.id ? styles.menuItemActive : ""}
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
            <select value={isUsaContext ? "us" : country} onChange={(e) => onCountryChange(e.target.value)}>
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
                  className={`${styles.starBtn} ${ratingMin !== null && star <= ratingMin ? styles.starOn : styles.starOff}`}
                  onClick={() => setRatingMin(ratingMin === star ? null : star)}
                >
                  ★
                </button>
              ))}
              <span className={styles.ratingNote}>
                {ratingMin !== null ? ratingMin.toFixed(1) : "Любой"}
              </span>
            </div>
          </div>
          <button type="button" className={styles.showBtn} onClick={() => setFilterToast(true)}>
            Показать
          </button>
        </div>
      </aside>
    </>
  );
}
