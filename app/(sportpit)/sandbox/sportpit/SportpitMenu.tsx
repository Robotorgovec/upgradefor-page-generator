import type { ComponentType, SVGProps } from "react";
import styles from "./SportpitShell.module.css";
import {
  AccessoriesIcon,
  AminoIcon,
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
  ChatIcon,
  VitIcon,
} from "./ui/icons";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;
type NavItem = { id: string; label: string; icon: IconComp };
type CategoryItem = { id: string; label: string; icon: IconComp };

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

type SportpitMenuProps = {
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  isMainPage: boolean;

  // Страна: уже существующий select (НЕ добавлять новый)
  country: "kz" | "ru" | "us";
  onCountryChange: (value: "kz" | "ru" | "us") => void;

  activeSection: string;
  activeTypeNav: string;

  priceMin: number;
  priceMax: number;
  priceRange: number;

  ratingMin: number | null;

  onCloseSidebar: () => void;
  goToSection: (id: string) => void;
  onTypeClick: (id: string) => void;

  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;

  onRatingChange: (value: number | null) => void;
  onShowFilters: () => void;
};

export function SportpitMenu({
  isCollapsed,
  isSidebarOpen,
  isMainPage,
  country,
  activeSection,
  activeTypeNav,
  priceMin,
  priceMax,
  priceRange,
  ratingMin,
  onCloseSidebar,
  goToSection,
  onTypeClick,
  onCountryChange,
  onPriceMinChange,
  onPriceMaxChange,
  onRatingChange,
  onShowFilters,
}: SportpitMenuProps) {
  return (
    <>
      <button
        type="button"
        className={`${styles.sidebarOverlay} ${
          isSidebarOpen ? styles.sidebarOverlayVisible : ""
        }`}
        aria-label="Закрыть меню"
        onClick={onCloseSidebar}
      />

      <aside
        id="sportpit-sidebar"
        className={`${styles.sidebar} ${
          isCollapsed ? styles.sidebarCollapsed : ""
        } ${isSidebarOpen ? styles.sidebarMobileOpen : ""}`}
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
                className={
                  activeSection === item.id && isMainPage
                    ? styles.menuItemActive
                    : ""
                }
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

            {/* ВАЖНО: USA-чекбокс УДАЛЁН. Только select. */}
            <select
              value={country}
              onChange={(e) =>
                onCountryChange(e.target.value as "kz" | "ru" | "us")
              }
            >
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
                onChange={(e) =>
                  onPriceMaxChange(Number(e.target.value || priceMin))
                }
                aria-label="Макс. цена"
              />
            </div>

            {/* Слайдер цены */}
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
              <LabIcon className={styles.smallIcon} /> Рейтинг
            </h4>

            <div className={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Рейтинг ${star}`}
                  className={`${styles.starBtn} ${
                    ratingMin !== null && star <= ratingMin
                      ? styles.starOn
                      : styles.starOff
                  }`}
                  onClick={() => onRatingChange(ratingMin === star ? null : star)}
                >
                  ★
                </button>
              ))}

              {/* Рейтинг-ползунок УДАЛЁН по требованию */}
              <span className={styles.ratingNote}>
                {ratingMin !== null ? ratingMin.toFixed(1) : "Любой"}
              </span>
            </div>
          </div>

          <button type="button" className={styles.showBtn} onClick={onShowFilters}>
            Показать
          </button>
        </div>
      </aside>
    </>
  );
}
