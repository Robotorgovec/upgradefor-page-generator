"use client";

import Link from "next/link";
import styles from "./Shell.module.css";

type SidebarProps = {
  currentPath?: string;
  isHomepage?: boolean;
};

type MenuEntryProps = {
  label: string;
  icon?: string;
  title?: string;
  path?: string;
  href?: string;
  dataAuth?: "private";
  active?: boolean;
  iconClassName?: string;
};

function isPathActive(currentPath: string, candidatePath?: string) {
  if (!candidatePath) return false;
  if (candidatePath === "/") return currentPath === "/";
  return currentPath === candidatePath || currentPath.startsWith(`${candidatePath}/`);
}

function MenuEntry({
  label,
  icon,
  title,
  path,
  href,
  dataAuth,
  active = false,
  iconClassName,
}: MenuEntryProps) {
  const iconNode = iconClassName ? (
    <span className={iconClassName} aria-hidden="true"></span>
  ) : (
    <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>{icon}</span>
  );

  const className = active
    ? `menu-item active ${styles.menuItem} ${styles.menuItemActive}`
    : `menu-item ${styles.menuItem}`;

  if (href) {
    return (
      <Link
        className={className}
        href={href}
        data-auth={dataAuth}
        data-path={path}
        title={title}
        aria-current={active ? "page" : undefined}
      >
        {iconNode}
        <span className={`menu-label ${styles.menuLabel}`}>{label}</span>
      </Link>
    );
  }

  return (
    <div className={className} data-auth={dataAuth} data-path={path} title={title}>
      {iconNode}
      <span className={`menu-label ${styles.menuLabel}`}>{label}</span>
    </div>
  );
}

function SectionLabel({ children, dataAuth }: { children: string; dataAuth?: "private" }) {
  return (
    <div className={`sidebar-section-label ${styles.sectionLabel}`} data-auth={dataAuth}>
      {children}
    </div>
  );
}

export default function Sidebar({ currentPath = "/", isHomepage = false }: SidebarProps) {
  const isWikiMarketOpen = isPathActive(currentPath, "/wikimarket");
  const isDomainsOpen = isPathActive(currentPath, "/wikimarket/domains");
  const isBeautyOpen = isPathActive(currentPath, "/wikimarket/beauty");
  const isHeatExchangersOpen =
    isPathActive(currentPath, "/wikimarket/hvac/heat-exchangers") ||
    isPathActive(currentPath, "/wikimarket/hvac/copper-aluminum-heat-exchangers");

  return (
    <aside
      id="primary-sidebar"
      className={`sidebar ${styles.sidebar}`}
      aria-label="Основная навигация"
      data-shell-home={isHomepage ? "true" : "false"}
    >
      <div className={`sidebar-inner ${styles.sidebarInner}`}>
        <SectionLabel>Навигация</SectionLabel>

        <MenuEntry
          label="Главная"
          icon="space_dashboard"
          href="/"
          path="/"
          title="Главная"
          active={isPathActive(currentPath, "/")}
        />
        <MenuEntry
          label="Лента"
          icon="dynamic_feed"
          path="/feed"
          title="Лента"
          active={isPathActive(currentPath, "/feed")}
        />
        <MenuEntry
          label="Популярное"
          icon="auto_graph"
          path="/feed/trending"
          title="Популярное"
          active={isPathActive(currentPath, "/feed/trending")}
        />
        <MenuEntry
          label="Подписки"
          icon="subscriptions"
          path="/feed/subscribed"
          title="Подписки"
          active={isPathActive(currentPath, "/feed/subscribed")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Коммуникации</SectionLabel>

        <MenuEntry
          label="ИИ-ассистент"
          icon="neurology"
          path="/assistant"
          title="ИИ-ассистент"
          active={isPathActive(currentPath, "/assistant")}
        />
        <MenuEntry
          label="Сообщения"
          icon="mark_unread_chat_alt"
          path="/messages"
          title="Сообщения"
          active={isPathActive(currentPath, "/messages")}
        />
        <MenuEntry
          label="Чаты"
          icon="forum"
          path="/messages/chats"
          title="Чаты"
          active={isPathActive(currentPath, "/messages/chats")}
        />
        <MenuEntry
          label="Звонки"
          icon="phone_in_talk"
          path="/messages/calls"
          title="Звонки"
          active={isPathActive(currentPath, "/messages/calls")}
        />

        <div className="menu-separator"></div>

        <SectionLabel dataAuth="private">Профиль</SectionLabel>

        <MenuEntry
          label="Профиль"
          icon="person"
          path="/profile"
          title="Профиль"
          dataAuth="private"
          active={isPathActive(currentPath, "/profile")}
        />
        <MenuEntry
          label="Достижения"
          icon="emoji_events"
          path="/profile/achievements"
          title="Достижения"
          dataAuth="private"
          active={isPathActive(currentPath, "/profile/achievements")}
        />
        <MenuEntry
          label="Токены"
          icon="token"
          path="/profile/tokens"
          title="Токены"
          dataAuth="private"
          active={isPathActive(currentPath, "/profile/tokens")}
        />

        <div className="menu-separator" data-auth="private"></div>

        <SectionLabel>WikiMarket</SectionLabel>

        <details className={`menu-group ${styles.menuGroup}`} open={isWikiMarketOpen}>
          <summary className={`menu-item ${styles.menuItem}`} aria-label="WikiMarket">
            <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>shopping_bag</span>
            <span className={`menu-label ${styles.menuLabel}`}>WikiMarket</span>
          </summary>
          <div className={styles.menuSubmenu}>
            <MenuEntry
              label="Категории"
              icon="category"
              href="/wikimarket/categories"
              path="/wikimarket/categories"
              title="Категории"
              active={isPathActive(currentPath, "/wikimarket/categories")}
            />
            <details className={`menu-group ${styles.menuGroup}`} open={isDomainsOpen}>
              <summary className={`menu-item ${styles.menuItem}`} aria-label="Домены">
                <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>domain</span>
                <span className={`menu-label ${styles.menuLabel}`}>Домены</span>
              </summary>
              <div className={styles.menuSubmenu}>
                <MenuEntry
                  label="Именной домен .РУС (ФИО)"
                  icon="badge"
                  href="/wikimarket/domains/fio-rus"
                  path="/wikimarket/domains/fio-rus"
                  title="Именной домен .РУС (ФИО)"
                  active={isPathActive(currentPath, "/wikimarket/domains/fio-rus")}
                />
              </div>
            </details>
            <details className={`menu-group ${styles.menuGroup}`} open={isBeautyOpen}>
              <summary
                className={`menu-item ${styles.menuItem}`}
                aria-label="Красота"
                data-path="/wikimarket/beauty"
                title="Красота"
              >
                <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>
                  face_retouching_natural
                </span>
                <span className={`menu-label ${styles.menuLabel}`}>Красота</span>
              </summary>
              <div className={styles.menuSubmenu}>
                <MenuEntry
                  label="Свадебные прически"
                  icon="content_cut"
                  href="/wikimarket/beauty/wedding-hairstyles"
                  path="/wikimarket/beauty/wedding-hairstyles"
                  title="Свадебные прически"
                  active={isPathActive(currentPath, "/wikimarket/beauty/wedding-hairstyles")}
                />
                <MenuEntry
                  label="Свадебный макияж"
                  icon="face"
                  href="/wikimarket/beauty/bridal-makeup"
                  path="/wikimarket/beauty/bridal-makeup"
                  title="Свадебный макияж"
                  active={isPathActive(currentPath, "/wikimarket/beauty/bridal-makeup")}
                />
              </div>
            </details>
          </div>
        </details>

        <div className="menu-separator" data-auth="private"></div>

        <SectionLabel>Климатические системы (ОВК)</SectionLabel>

        <MenuEntry
          label="Проектирование"
          icon="architecture"
          path="/wikimarket/hvac/design"
          title="Проектирование"
          active={isPathActive(currentPath, "/wikimarket/hvac/design")}
        />
        <MenuEntry
          label="Монтаж"
          icon="build"
          path="/wikimarket/hvac/installation"
          title="Монтаж"
          active={isPathActive(currentPath, "/wikimarket/hvac/installation")}
        />
        <MenuEntry
          label="Обслуживание"
          icon="settings_suggest"
          path="/wikimarket/hvac/maintenance"
          title="Обслуживание"
          active={isPathActive(currentPath, "/wikimarket/hvac/maintenance")}
        />
        <MenuEntry
          label="Диагностика"
          icon="analytics"
          path="/wikimarket/hvac/diagnostics"
          title="Диагностика"
          active={isPathActive(currentPath, "/wikimarket/hvac/diagnostics")}
        />
        <MenuEntry
          label="Ремонт"
          icon="handyman"
          path="/wikimarket/hvac/repair"
          title="Ремонт"
          active={isPathActive(currentPath, "/wikimarket/hvac/repair")}
        />

        <details className={`menu-group ${styles.menuGroup}`} open={isHeatExchangersOpen}>
          <summary
            className={`menu-item ${styles.menuItem}`}
            aria-label="Каталог теплообменников"
            data-path="/wikimarket/hvac/heat-exchangers"
            title="Каталог теплообменников"
          >
            <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>heat_pump</span>
            <span className={`menu-label ${styles.menuLabel}`}>Каталог теплообменников</span>
          </summary>
          <div className={`menu-submenu ${styles.menuSubmenu}`}>
            <MenuEntry
              label="Медно-алюминиевые теплообменники (Cu-Al)"
              href="/wikimarket/hvac/copper-aluminum-heat-exchangers"
              path="/wikimarket/hvac/copper-aluminum-heat-exchangers"
              title="Медно-алюминиевые теплообменники (Cu-Al)"
              iconClassName="menu-icon menu-icon--cu-al"
              active={isPathActive(currentPath, "/wikimarket/hvac/copper-aluminum-heat-exchangers")}
            />
          </div>
        </details>

        <MenuEntry
          label="Ремонт теплообменников"
          icon="plumbing"
          href="/wikimarket/hvac/heat-exchanger-repair"
          path="/wikimarket/hvac/heat-exchanger-repair"
          title="Ремонт теплообменников"
          active={isPathActive(currentPath, "/wikimarket/hvac/heat-exchanger-repair")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Решения для недвижимости</SectionLabel>

        <MenuEntry
          label="Решения для недвижимости"
          icon="maps_home_work"
          path="/wikimarket/real-estate"
          title="Решения для недвижимости"
          active={isPathActive(currentPath, "/wikimarket/real-estate")}
        />
        <MenuEntry
          label="PropTech"
          icon="hub"
          path="/wikimarket/real-estate/proptech"
          title="PropTech"
          active={isPathActive(currentPath, "/wikimarket/real-estate/proptech")}
        />
        <MenuEntry
          label="Коммерческая недвижимость"
          icon="apartment"
          path="/wikimarket/real-estate/commercial"
          title="Коммерческая недвижимость"
          active={isPathActive(currentPath, "/wikimarket/real-estate/commercial")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Игры и обучение</SectionLabel>

        <MenuEntry
          label="Игры обучающие"
          icon="sports_esports"
          path="/wikimarket/education-games"
          title="Игры обучающие"
          active={isPathActive(currentPath, "/wikimarket/education-games")}
        />

        <div className="menu-separator"></div>

        <SectionLabel dataAuth="private">Кошелек</SectionLabel>

        <MenuEntry
          label="Кошелек"
          icon="account_balance_wallet"
          path="/wallet"
          title="Кошелек"
          dataAuth="private"
          active={isPathActive(currentPath, "/wallet")}
        />
        <MenuEntry
          label="Баланс"
          icon="savings"
          path="/wallet/balance"
          title="Баланс"
          dataAuth="private"
          active={isPathActive(currentPath, "/wallet/balance")}
        />
        <MenuEntry
          label="История"
          icon="receipt_long"
          path="/wallet/history"
          title="История"
          dataAuth="private"
          active={isPathActive(currentPath, "/wallet/history")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Органайзер</SectionLabel>

        <MenuEntry
          label="Органайзер"
          icon="view_kanban"
          path="/organizer"
          title="Органайзер"
          active={isPathActive(currentPath, "/organizer")}
        />
        <MenuEntry
          label="Календарь"
          icon="event"
          path="/organizer/calendar"
          title="Календарь"
          active={isPathActive(currentPath, "/organizer/calendar")}
        />
        <MenuEntry
          label="Задачи"
          icon="task_alt"
          path="/organizer/tasks"
          title="Задачи"
          active={isPathActive(currentPath, "/organizer/tasks")}
        />
        <MenuEntry
          label="CRM-модули"
          icon="stacked_bar_chart"
          path="/organizer/crm"
          title="CRM-модули"
          active={isPathActive(currentPath, "/organizer/crm")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Бизнес</SectionLabel>

        <MenuEntry
          label="Бизнес"
          icon="business_center"
          path="/business"
          title="Бизнес"
          active={isPathActive(currentPath, "/business")}
        />
        <MenuEntry
          label="Компании"
          icon="apartment"
          path="/business/companies"
          title="Компании"
          active={isPathActive(currentPath, "/business/companies")}
        />
        <MenuEntry
          label="B2B-портал"
          icon="diversity_3"
          path="/business/b2b"
          title="B2B-портал"
          active={isPathActive(currentPath, "/business/b2b")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Сервисы и развитие</SectionLabel>

        <MenuEntry
          label="Здоровье"
          icon="monitor_heart"
          path="/health"
          title="Здоровье"
          active={isPathActive(currentPath, "/health")}
        />
        <MenuEntry
          label="Логистика"
          icon="local_shipping"
          path="/logistics"
          title="Логистика"
          active={isPathActive(currentPath, "/logistics")}
        />
        <MenuEntry
          label="Образование"
          icon="menu_book"
          path="/education"
          title="Образование"
          active={isPathActive(currentPath, "/education")}
        />
        <MenuEntry
          label="Курсы"
          icon="school"
          path="/education/courses"
          title="Курсы"
          active={isPathActive(currentPath, "/education/courses")}
        />
        <MenuEntry
          label="Профессии"
          icon="work_outline"
          path="/education/careers"
          title="Профессии"
          active={isPathActive(currentPath, "/education/careers")}
        />
        <MenuEntry
          label="Развлечения"
          icon="theater_comedy"
          path="/entertainment"
          title="Развлечения"
          active={isPathActive(currentPath, "/entertainment")}
        />
        <MenuEntry
          label="Игры"
          icon="sports_esports"
          path="/entertainment/games"
          title="Игры"
          active={isPathActive(currentPath, "/entertainment/games")}
        />
        <MenuEntry
          label="Творчество"
          icon="brush"
          path="/entertainment/creative"
          title="Творчество"
          active={isPathActive(currentPath, "/entertainment/creative")}
        />
      </div>
    </aside>
  );
}
