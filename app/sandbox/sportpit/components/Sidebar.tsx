import type { ComponentType, SVGProps } from "react";
import styles from "../SportpitShell.module.css";
import {
  AccessoriesIcon,
  AminoIcon,
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
} from "../_components/icons";

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

type SidebarProps = {
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  isMainPage: boolean;
  activeSection: string;
  activeTypeNav: string;
  country: string;
  priceMin: number;
  priceMax: number;
  ratingMin: number | null;
  onClose: () => void;
  onGoToSection: (id: string) => void;
  onTypeClick: (id: string) => void;
  onCountryChange: (value: string) => void;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  onRatingChange: (value: number | null) => void;
  onShowFilters: () => void;
  isMobileViewport: boolean;
  isNavOpen: boolean;
  onToggleNav: () => void;
};

export function Sidebar({
  isCollapsed,
  isSidebarOpen,
  isMainPage,
  activeSection,
  activeTypeNav,
  country,
  priceMin,
  priceMax,
  ratingMin,
  onClose,
  onGoToSection,
  onTypeClick,
  onCountryChange,
  onPriceMinChange,
  onPriceMaxChange,
  onRatingChange,
  onShowFilters,
  isMobileViewport,
  isNavOpen,
  onToggleNav,
}: SidebarProps) {
  return (
    <>
      <button
        type="button"
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.sidebarOverlayVisible : ""}`}
        aria-label="Закрыть меню"
        onClick={onClose}
      />

      <aside
        id="sportpit-sidebar"
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${isSidebarOpen ? styles.sidebarMobileOpen : ""}`}
        aria-label="Основная навигация"
      >
        <div className={styles.sidebarTop}>
          {!isMobileViewport && isCollapsed && (
            <div className={styles.sidebarCollapsedToggle}>
              <button
                type="button"
                className={`${styles.burger} ${isNavOpen ? styles.burgerOpen : ""}`}
                onClick={onToggleNav}
                aria-label="Открыть меню"
                aria-controls="sportpit-sidebar"
                aria-expanded={isNavOpen}
              >
                <span className={styles.burgerGlyph} />
              </button>
            </div>
          )}
          <strong>Цели / продукты</strong>
        </div>

        <div className={styles.sidebarSectionLabel}>Навигация</div>
        <div className={styles.sidebarNav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" className={activeSection === item.id && isMainPage ? styles.menuItemActive : ""} onClick={() => onGoToSection(item.id)} title={item.label}>
                <span className={styles.navIconCol} data-sp-icon-wrap>
                  <Icon className={styles.sidebarIcon} />
                </span>
                <em className={styles.navLabel}>{item.label}</em>
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
                <span className={styles.navIconCol} data-sp-icon-wrap>
                  <Icon className={styles.sidebarIcon} />
                </span>
                <em className={styles.navLabel}>{item.label}</em>
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
            <select value={country} onChange={(e) => onCountryChange(e.target.value)}>
              <option value="kz">Казахстан</option>
              <option value="ru">Россия</option>
              <option value="us">США</option>
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
          </div>
          <div className={styles.filterBlock}>
            <h4>
              <LabIcon className={styles.smallIcon} /> Рейтинг
            </h4>
            <div className={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" aria-label={`Рейтинг ${star}`} className={`${styles.starBtn} ${ratingMin !== null && star <= ratingMin ? styles.starOn : styles.starOff}`} onClick={() => onRatingChange(ratingMin === star ? null : star)}>★</button>
              ))}
              <span className={styles.ratingNote}>{ratingMin !== null ? ratingMin.toFixed(1) : "Любой"}</span>
            </div>
          </div>
          <button type="button" className={styles.showBtn} onClick={onShowFilters}>Показать</button>
        </div>
      </aside>
    </>
  );
}
