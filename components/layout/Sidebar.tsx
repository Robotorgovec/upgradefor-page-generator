"use client";

import Link from "next/link";

type SidebarProps = {
  onClose?: () => void;
  variant?: "default" | "homepage";
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
    <span className="menu-icon material-symbols-outlined">{icon}</span>
  );

  const className = active ? "menu-item active" : "menu-item";

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
        <span className="menu-label">{label}</span>
      </Link>
    );
  }

  return (
    <div className={className} data-auth={dataAuth} data-path={path} title={title}>
      {iconNode}
      <span className="menu-label">{label}</span>
    </div>
  );
}

function SectionLabel({ children, dataAuth }: { children: string; dataAuth?: "private" }) {
  return (
    <div className="sidebar-section-label" data-auth={dataAuth}>
      {children}
    </div>
  );
}

export default function Sidebar({ onClose = () => {}, variant = "default" }: SidebarProps) {
  if (variant === "homepage") {
    return (
      <aside className="sidebar">
        <div className="sidebar-inner">
          <SectionLabel>Навигация</SectionLabel>

          <MenuEntry
            label="Главная"
            icon="space_dashboard"
            href="/"
            path="/"
            title="Главная страница (дашборд, обзор)"
            active
          />
          <MenuEntry
            label="Лента"
            icon="dynamic_feed"
            path="/feed"
            title="Публикации пользователей, ИИ-рекомендации"
          />
          <MenuEntry
            label="Популярное"
            icon="auto_graph"
            path="/feed/trending"
            title="Топ записи всех пользователей"
          />
          <MenuEntry
            label="Подписки"
            icon="subscriptions"
            path="/feed/subscribed"
            title="Посты отслеживаемых пользователей"
          />

          <div className="menu-separator"></div>

          <SectionLabel>Коммуникации</SectionLabel>

          <MenuEntry
            label="ИИ-ассистент"
            icon="neurology"
            path="/assistant"
            title="Умный ИИ-помощник, мозг платформы"
          />
          <MenuEntry
            label="Сообщения"
            icon="mark_unread_chat_alt"
            path="/messages"
            title="Общая входящая по сообщениям и диалогам"
          />
          <MenuEntry
            label="Чаты"
            icon="forum"
            path="/messages/chats"
            title="Личные и групповые переписки"
          />
          <MenuEntry
            label="Звонки"
            icon="phone_in_talk"
            path="/messages/calls"
            title="Аудио и видеосвязь"
          />

          <div className="menu-separator"></div>

          <SectionLabel dataAuth="private">Профиль</SectionLabel>

          <MenuEntry
            label="Профиль"
            icon="person"
            path="/profile"
            title="Личная страница и настройки пользователя"
            dataAuth="private"
          />
          <MenuEntry
            label="Достижения"
            icon="emoji_events"
            path="/profile/achievements"
            title="Награды, уровни и бейджи"
            dataAuth="private"
          />
          <MenuEntry
            label="Токены"
            icon="token"
            path="/profile/tokens"
            title="Внутренняя валюта и баллы"
            dataAuth="private"
          />

          <div className="menu-separator" data-auth="private"></div>

          <SectionLabel>WikiMarket</SectionLabel>

          <details className="menu-group">
            <summary className="menu-item" aria-label="WikiMarket">
              <span className="menu-icon material-symbols-outlined">shopping_bag</span>
              <span className="menu-label">WikiMarket</span>
            </summary>
            <div style={{ marginLeft: 12 }}>
              <MenuEntry
                label="Категории"
                icon="category"
                href="/wikimarket/categories"
                path="/wikimarket/categories"
                title="Разделы каталога товаров"
              />
              <details className="menu-group">
                <summary className="menu-item" aria-label="Домены">
                  <span className="menu-icon material-symbols-outlined">domain</span>
                  <span className="menu-label">Домены</span>
                </summary>
                <div style={{ marginLeft: 12 }}>
                  <MenuEntry
                    label="Именной домен .РУС (ФИО)"
                    icon="badge"
                    href="/wikimarket/domains/fio-rus"
                    path="/wikimarket/domains/fio-rus"
                    title="Именной домен .РУС (ФИО)"
                  />
                </div>
              </details>
              <details className="menu-group">
                <summary
                  className="menu-item"
                  aria-label="Красота"
                  data-path="/wikimarket/beauty"
                  title="Beauty-услуги и подбор исполнителей в WikiMarket"
                >
                  <span className="menu-icon material-symbols-outlined">face_retouching_natural</span>
                  <span className="menu-label">Красота</span>
                </summary>
                <div style={{ marginLeft: 12 }}>
                  <MenuEntry
                    label="Свадебные прически"
                    icon="content_cut"
                    href="/wikimarket/beauty/wedding-hairstyles"
                    path="/wikimarket/beauty/wedding-hairstyles"
                    title="Свадебные прически: выбор стиля, подбор мастера и анкеты исполнителей"
                  />
                  <MenuEntry
                    label="Свадебный макияж"
                    icon="face"
                    href="/wikimarket/beauty/bridal-makeup"
                    path="/wikimarket/beauty/bridal-makeup"
                    title="Свадебный макияж: подбор образа, визажиста и формата услуги"
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
            title="Проектирование климатических систем и ОВК"
          />
          <MenuEntry
            label="Монтаж"
            icon="build"
            path="/wikimarket/hvac/installation"
            title="Монтаж климатических систем и оборудования"
          />
          <MenuEntry
            label="Обслуживание"
            icon="settings_suggest"
            path="/wikimarket/hvac/maintenance"
            title="Сервисное обслуживание и поддержка ОВК"
          />
          <MenuEntry
            label="Диагностика"
            icon="analytics"
            path="/wikimarket/hvac/diagnostics"
            title="Диагностика, аудит и проверка ОВК-систем"
          />
          <MenuEntry
            label="Ремонт"
            icon="handyman"
            path="/wikimarket/hvac/repair"
            title="Ремонт и восстановление систем ОВК"
          />

          <details className="menu-group">
            <summary
              className="menu-item"
              aria-label="Каталог теплообменников"
              data-path="/wikimarket/hvac/heat-exchangers"
              title="Каталог теплообменников для разных типов систем"
            >
              <span className="menu-icon material-symbols-outlined">heat_pump</span>
              <span className="menu-label">Каталог теплообменников</span>
            </summary>
            <div className="menu-submenu">
              <MenuEntry
                label="Медно-алюминиевые теплообменники (Cu-Al)"
                href="/wikimarket/hvac/copper-aluminum-heat-exchangers"
                path="/wikimarket/hvac/copper-aluminum-heat-exchangers"
                title="Проектирование, производство и поставка медно-алюминиевых теплообменников"
                iconClassName="menu-icon menu-icon--cu-al"
              />
            </div>
          </details>

          <MenuEntry
            label="Ремонт теплообменников"
            icon="plumbing"
            href="/wikimarket/hvac/heat-exchanger-repair"
            path="/wikimarket/hvac/heat-exchanger-repair"
            title="Ремонт теплообменников по типам и задачам"
          />

          <div className="menu-separator"></div>

          <SectionLabel>Решения для недвижимости</SectionLabel>

          <MenuEntry
            label="Решения для недвижимости"
            icon="maps_home_work"
            path="/wikimarket/real-estate"
            title="Витрина решений для рынка недвижимости"
          />
          <MenuEntry
            label="PropTech"
            icon="hub"
            path="/wikimarket/real-estate/proptech"
            title="PropTech и технологии для недвижимости"
          />
          <MenuEntry
            label="Коммерческая недвижимость"
            icon="apartment"
            path="/wikimarket/real-estate/commercial"
            title="Коммерческая недвижимость и премиальные объекты"
          />

          <div className="menu-separator"></div>

          <SectionLabel>Игры и обучение</SectionLabel>

          <MenuEntry
            label="Игры обучающие"
            icon="sports_esports"
            path="/wikimarket/education-games"
            title="Игры обучающие и симуляторы (EdTech)"
          />

          <div className="menu-separator"></div>

          <SectionLabel dataAuth="private">Кошелёк</SectionLabel>

          <MenuEntry
            label="Кошелёк"
            icon="account_balance_wallet"
            path="/wallet"
            title="Финансы пользователя (счета и платежи)"
            dataAuth="private"
          />
          <MenuEntry
            label="Баланс"
            icon="savings"
            path="/wallet/balance"
            title="Текущий баланс средств и токенов"
            dataAuth="private"
          />
          <MenuEntry
            label="История"
            icon="receipt_long"
            path="/wallet/history"
            title="Список транзакций и покупок"
            dataAuth="private"
          />

          <div className="menu-separator"></div>

          <SectionLabel>Органайзер</SectionLabel>

          <MenuEntry
            label="Органайзер"
            icon="view_kanban"
            path="/organizer"
            title="Планирование, проекты, CRM-инструменты"
          />
          <MenuEntry
            label="Календарь"
            icon="event"
            path="/organizer/calendar"
            title="Расписание событий и встреч"
          />
          <MenuEntry
            label="Задачи"
            icon="task_alt"
            path="/organizer/tasks"
            title="Управление списком задач"
          />
          <MenuEntry
            label="CRM-модули"
            icon="stacked_bar_chart"
            path="/organizer/crm"
            title="Управление клиентами и продажами"
          />

          <div className="menu-separator"></div>

          <SectionLabel>Бизнес</SectionLabel>

          <MenuEntry
            label="Бизнес"
            icon="business_center"
            path="/business"
            title="Компании и B2B-возможности"
          />
          <MenuEntry
            label="Компании"
            icon="apartment"
            path="/business/companies"
            title="Профили и страницы компаний"
          />
          <MenuEntry
            label="B2B-портал"
            icon="diversity_3"
            path="/business/b2b"
            title="Инструменты для корпоративных клиентов"
          />

          <div className="menu-separator"></div>

          <SectionLabel>Сервисы и развитие</SectionLabel>

          <MenuEntry
            label="Здоровье"
            icon="monitor_heart"
            path="/health"
            title="Здоровье и фитнес (медицинские сервисы)"
          />
          <MenuEntry
            label="Логистика"
            icon="local_shipping"
            path="/logistics"
            title="Доставки и транспортные сервисы"
          />
          <MenuEntry
            label="Образование"
            icon="menu_book"
            path="/education"
            title="Обучение и профессиональное развитие"
          />
          <MenuEntry
            label="Курсы"
            icon="school"
            path="/education/courses"
            title="Онлайн-обучение и тренинги"
          />
          <MenuEntry
            label="Профессии"
            icon="work_outline"
            path="/education/careers"
            title="Вакансии и карьерные возможности"
          />
          <MenuEntry
            label="Развлечения"
            icon="theater_comedy"
            path="/entertainment"
            title="Игры, контент, события"
          />
          <MenuEntry
            label="Игры"
            icon="sports_esports"
            path="/entertainment/games"
            title="Игровые сервисы, мини-игры"
          />
          <MenuEntry
            label="Творчество"
            icon="brush"
            path="/entertainment/creative"
            title="Проекты для самореализации и творчества"
          />
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar" aria-label="Основная навигация">
      <div className="sidebar-inner">
        <div className="sidebar-section">
          <p className="sidebar-section-title">Навигация</p>
          <Link className="sidebar-link" href="/">
            Главная
          </Link>
          <Link className="sidebar-link" href="/catalog">
            Каталог
          </Link>
          <Link className="sidebar-link" href="/account">
            Аккаунт
          </Link>
        </div>
        <div className="sidebar-section">
          <p className="sidebar-section-title">Сервисы</p>
          <Link className="sidebar-link" href="/messages">
            Сообщения
          </Link>
          <Link className="sidebar-link" href="/assistant">
            ИИ-ассистент
          </Link>
        </div>
        <div className="sidebar-section">
          <p className="sidebar-section-title">WikiMarket</p>
          <Link className="sidebar-link" href="/wikimarket/categories">
            Категории
          </Link>
          <Link className="sidebar-link" href="/wikimarket/domains/fio-rus">
            Домены
          </Link>
        </div>
        <button className="sidebar-link" type="button" onClick={onClose}>
          Свернуть меню
        </button>
      </div>
    </aside>
  );
}
