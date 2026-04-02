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
      aria-label="РћСЃРЅРѕРІРЅР°СЏ РЅР°РІРёРіР°С†РёСЏ"
      data-shell-home={isHomepage ? "true" : "false"}
    >
      <div className={`sidebar-inner ${styles.sidebarInner}`}>
        <SectionLabel>РќР°РІРёРіР°С†РёСЏ</SectionLabel>

        <MenuEntry
          label="Р“Р»Р°РІРЅР°СЏ"
          icon="space_dashboard"
          href="/"
          path="/"
          title="Р“Р»Р°РІРЅР°СЏ СЃС‚СЂР°РЅРёС†Р° (РґР°С€Р±РѕСЂРґ, РѕР±Р·РѕСЂ)"
          active={isPathActive(currentPath, "/")}
        />
        <MenuEntry
          label="Р›РµРЅС‚Р°"
          icon="dynamic_feed"
          path="/feed"
          title="РџСѓР±Р»РёРєР°С†РёРё РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№, РР-СЂРµРєРѕРјРµРЅРґР°С†РёРё"
          active={isPathActive(currentPath, "/feed")}
        />
        <MenuEntry
          label="РџРѕРїСѓР»СЏСЂРЅРѕРµ"
          icon="auto_graph"
          path="/feed/trending"
          title="РўРѕРї Р·Р°РїРёСЃРё РІСЃРµС… РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№"
          active={isPathActive(currentPath, "/feed/trending")}
        />
        <MenuEntry
          label="РџРѕРґРїРёСЃРєРё"
          icon="subscriptions"
          path="/feed/subscribed"
          title="РџРѕСЃС‚С‹ РѕС‚СЃР»РµР¶РёРІР°РµРјС‹С… РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№"
          active={isPathActive(currentPath, "/feed/subscribed")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>РљРѕРјРјСѓРЅРёРєР°С†РёРё</SectionLabel>

        <MenuEntry
          label="РР-Р°СЃСЃРёСЃС‚РµРЅС‚"
          icon="neurology"
          path="/assistant"
          title="РЈРјРЅС‹Р№ РР-РїРѕРјРѕС‰РЅРёРє, РјРѕР·Рі РїР»Р°С‚С„РѕСЂРјС‹"
          active={isPathActive(currentPath, "/assistant")}
        />
        <MenuEntry
          label="РЎРѕРѕР±С‰РµРЅРёСЏ"
          icon="mark_unread_chat_alt"
          path="/messages"
          title="РћР±С‰Р°СЏ РІС…РѕРґСЏС‰Р°СЏ РїРѕ СЃРѕРѕР±С‰РµРЅРёСЏРј Рё РґРёР°Р»РѕРіР°Рј"
          active={isPathActive(currentPath, "/messages")}
        />
        <MenuEntry
          label="Р§Р°С‚С‹"
          icon="forum"
          path="/messages/chats"
          title="Р›РёС‡РЅС‹Рµ Рё РіСЂСѓРїРїРѕРІС‹Рµ РїРµСЂРµРїРёСЃРєРё"
          active={isPathActive(currentPath, "/messages/chats")}
        />
        <MenuEntry
          label="Р—РІРѕРЅРєРё"
          icon="phone_in_talk"
          path="/messages/calls"
          title="РђСѓРґРёРѕ Рё РІРёРґРµРѕСЃРІСЏР·СЊ"
          active={isPathActive(currentPath, "/messages/calls")}
        />

        <div className="menu-separator"></div>

        <SectionLabel dataAuth="private">РџСЂРѕС„РёР»СЊ</SectionLabel>

        <MenuEntry
          label="РџСЂРѕС„РёР»СЊ"
          icon="person"
          path="/profile"
          title="Р›РёС‡РЅР°СЏ СЃС‚СЂР°РЅРёС†Р° Рё РЅР°СЃС‚СЂРѕР№РєРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ"
          dataAuth="private"
          active={isPathActive(currentPath, "/profile")}
        />
        <MenuEntry
          label="Р”РѕСЃС‚РёР¶РµРЅРёСЏ"
          icon="emoji_events"
          path="/profile/achievements"
          title="РќР°РіСЂР°РґС‹, СѓСЂРѕРІРЅРё Рё Р±РµР№РґР¶Рё"
          dataAuth="private"
          active={isPathActive(currentPath, "/profile/achievements")}
        />
        <MenuEntry
          label="РўРѕРєРµРЅС‹"
          icon="token"
          path="/profile/tokens"
          title="Р’РЅСѓС‚СЂРµРЅРЅСЏСЏ РІР°Р»СЋС‚Р° Рё Р±Р°Р»Р»С‹"
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
              label="РљР°С‚РµРіРѕСЂРёРё"
              icon="category"
              href="/wikimarket/categories"
              path="/wikimarket/categories"
              title="Р Р°Р·РґРµР»С‹ РєР°С‚Р°Р»РѕРіР° С‚РѕРІР°СЂРѕРІ"
              active={isPathActive(currentPath, "/wikimarket/categories")}
            />
            <details className={`menu-group ${styles.menuGroup}`} open={isDomainsOpen}>
              <summary className={`menu-item ${styles.menuItem}`} aria-label="Р”РѕРјРµРЅС‹">
                <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>domain</span>
                <span className={`menu-label ${styles.menuLabel}`}>Р”РѕРјРµРЅС‹</span>
              </summary>
              <div className={styles.menuSubmenu}>
                <MenuEntry
                  label="РРјРµРЅРЅРѕР№ РґРѕРјРµРЅ .Р РЈРЎ (Р¤РРћ)"
                  icon="badge"
                  href="/wikimarket/domains/fio-rus"
                  path="/wikimarket/domains/fio-rus"
                  title="РРјРµРЅРЅРѕР№ РґРѕРјРµРЅ .Р РЈРЎ (Р¤РРћ)"
                  active={isPathActive(currentPath, "/wikimarket/domains/fio-rus")}
                />
              </div>
            </details>
            <details className={`menu-group ${styles.menuGroup}`} open={isBeautyOpen}>
              <summary
                className={`menu-item ${styles.menuItem}`}
                aria-label="РљСЂР°СЃРѕС‚Р°"
                data-path="/wikimarket/beauty"
                title="Beauty-СѓСЃР»СѓРіРё Рё РїРѕРґР±РѕСЂ РёСЃРїРѕР»РЅРёС‚РµР»РµР№ РІ WikiMarket"
              >
                <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>
                  face_retouching_natural
                </span>
                <span className={`menu-label ${styles.menuLabel}`}>РљСЂР°СЃРѕС‚Р°</span>
              </summary>
              <div className={styles.menuSubmenu}>
                <MenuEntry
                  label="РЎРІР°РґРµР±РЅС‹Рµ РїСЂРёС‡РµСЃРєРё"
                  icon="content_cut"
                  href="/wikimarket/beauty/wedding-hairstyles"
                  path="/wikimarket/beauty/wedding-hairstyles"
                  title="РЎРІР°РґРµР±РЅС‹Рµ РїСЂРёС‡РµСЃРєРё: РІС‹Р±РѕСЂ СЃС‚РёР»СЏ, РїРѕРґР±РѕСЂ РјР°СЃС‚РµСЂР° Рё Р°РЅРєРµС‚С‹ РёСЃРїРѕР»РЅРёС‚РµР»РµР№"
                  active={isPathActive(currentPath, "/wikimarket/beauty/wedding-hairstyles")}
                />
                <MenuEntry
                  label="РЎРІР°РґРµР±РЅС‹Р№ РјР°РєРёСЏР¶"
                  icon="face"
                  href="/wikimarket/beauty/bridal-makeup"
                  path="/wikimarket/beauty/bridal-makeup"
                  title="РЎРІР°РґРµР±РЅС‹Р№ РјР°РєРёСЏР¶: РїРѕРґР±РѕСЂ РѕР±СЂР°Р·Р°, РІРёР·Р°Р¶РёСЃС‚Р° Рё С„РѕСЂРјР°С‚Р° СѓСЃР»СѓРіРё"
                  active={isPathActive(currentPath, "/wikimarket/beauty/bridal-makeup")}
                />
              </div>
            </details>
          </div>
        </details>

        <div className="menu-separator" data-auth="private"></div>

        <SectionLabel>РљР»РёРјР°С‚РёС‡РµСЃРєРёРµ СЃРёСЃС‚РµРјС‹ (РћР’Рљ)</SectionLabel>

        <MenuEntry
          label="РџСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµ"
          icon="architecture"
          path="/wikimarket/hvac/design"
          title="РџСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµ РєР»РёРјР°С‚РёС‡РµСЃРєРёС… СЃРёСЃС‚РµРј Рё РћР’Рљ"
          active={isPathActive(currentPath, "/wikimarket/hvac/design")}
        />
        <MenuEntry
          label="РњРѕРЅС‚Р°Р¶"
          icon="build"
          path="/wikimarket/hvac/installation"
          title="РњРѕРЅС‚Р°Р¶ РєР»РёРјР°С‚РёС‡РµСЃРєРёС… СЃРёСЃС‚РµРј Рё РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ"
          active={isPathActive(currentPath, "/wikimarket/hvac/installation")}
        />
        <MenuEntry
          label="РћР±СЃР»СѓР¶РёРІР°РЅРёРµ"
          icon="settings_suggest"
          path="/wikimarket/hvac/maintenance"
          title="РЎРµСЂРІРёСЃРЅРѕРµ РѕР±СЃР»СѓР¶РёРІР°РЅРёРµ Рё РїРѕРґРґРµСЂР¶РєР° РћР’Рљ"
          active={isPathActive(currentPath, "/wikimarket/hvac/maintenance")}
        />
        <MenuEntry
          label="Р”РёР°РіРЅРѕСЃС‚РёРєР°"
          icon="analytics"
          path="/wikimarket/hvac/diagnostics"
          title="Р”РёР°РіРЅРѕСЃС‚РёРєР°, Р°СѓРґРёС‚ Рё РїСЂРѕРІРµСЂРєР° РћР’Рљ-СЃРёСЃС‚РµРј"
          active={isPathActive(currentPath, "/wikimarket/hvac/diagnostics")}
        />
        <MenuEntry
          label="Р РµРјРѕРЅС‚"
          icon="handyman"
          path="/wikimarket/hvac/repair"
          title="Р РµРјРѕРЅС‚ Рё РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ СЃРёСЃС‚РµРј РћР’Рљ"
          active={isPathActive(currentPath, "/wikimarket/hvac/repair")}
        />

        <details className={`menu-group ${styles.menuGroup}`} open={isHeatExchangersOpen}>
          <summary
            className={`menu-item ${styles.menuItem}`}
            aria-label="РљР°С‚Р°Р»РѕРі С‚РµРїР»РѕРѕР±РјРµРЅРЅРёРєРѕРІ"
            data-path="/wikimarket/hvac/heat-exchangers"
            title="РљР°С‚Р°Р»РѕРі С‚РµРїР»РѕРѕР±РјРµРЅРЅРёРєРѕРІ РґР»СЏ СЂР°Р·РЅС‹С… С‚РёРїРѕРІ СЃРёСЃС‚РµРј"
          >
            <span className={`menu-icon material-symbols-outlined ${styles.menuIcon}`}>heat_pump</span>
            <span className={`menu-label ${styles.menuLabel}`}>РљР°С‚Р°Р»РѕРі С‚РµРїР»РѕРѕР±РјРµРЅРЅРёРєРѕРІ</span>
          </summary>
          <div className={`menu-submenu ${styles.menuSubmenu}`}>
            <MenuEntry
              label="РњРµРґРЅРѕ-Р°Р»СЋРјРёРЅРёРµРІС‹Рµ С‚РµРїР»РѕРѕР±РјРµРЅРЅРёРєРё (Cu-Al)"
              href="/wikimarket/hvac/copper-aluminum-heat-exchangers"
              path="/wikimarket/hvac/copper-aluminum-heat-exchangers"
              title="РџСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµ, РїСЂРѕРёР·РІРѕРґСЃС‚РІРѕ Рё РїРѕСЃС‚Р°РІРєР° РјРµРґРЅРѕ-Р°Р»СЋРјРёРЅРёРµРІС‹С… С‚РµРїР»РѕРѕР±РјРµРЅРЅРёРєРѕРІ"
              iconClassName="menu-icon menu-icon--cu-al"
              active={isPathActive(currentPath, "/wikimarket/hvac/copper-aluminum-heat-exchangers")}
            />
          </div>
        </details>

        <MenuEntry
          label="Р РµРјРѕРЅС‚ С‚РµРїР»РѕРѕР±РјРµРЅРЅРёРєРѕРІ"
          icon="plumbing"
          href="/wikimarket/hvac/heat-exchanger-repair"
          path="/wikimarket/hvac/heat-exchanger-repair"
          title="Р РµРјРѕРЅС‚ С‚РµРїР»РѕРѕР±РјРµРЅРЅРёРєРѕРІ РїРѕ С‚РёРїР°Рј Рё Р·Р°РґР°С‡Р°Рј"
          active={isPathActive(currentPath, "/wikimarket/hvac/heat-exchanger-repair")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Р РµС€РµРЅРёСЏ РґР»СЏ РЅРµРґРІРёР¶РёРјРѕСЃС‚Рё</SectionLabel>

        <MenuEntry
          label="Р РµС€РµРЅРёСЏ РґР»СЏ РЅРµРґРІРёР¶РёРјРѕСЃС‚Рё"
          icon="maps_home_work"
          path="/wikimarket/real-estate"
          title="Р’РёС‚СЂРёРЅР° СЂРµС€РµРЅРёР№ РґР»СЏ СЂС‹РЅРєР° РЅРµРґРІРёР¶РёРјРѕСЃС‚Рё"
          active={isPathActive(currentPath, "/wikimarket/real-estate")}
        />
        <MenuEntry
          label="PropTech"
          icon="hub"
          path="/wikimarket/real-estate/proptech"
          title="PropTech Рё С‚РµС…РЅРѕР»РѕРіРёРё РґР»СЏ РЅРµРґРІРёР¶РёРјРѕСЃС‚Рё"
          active={isPathActive(currentPath, "/wikimarket/real-estate/proptech")}
        />
        <MenuEntry
          label="РљРѕРјРјРµСЂС‡РµСЃРєР°СЏ РЅРµРґРІРёР¶РёРјРѕСЃС‚СЊ"
          icon="apartment"
          path="/wikimarket/real-estate/commercial"
          title="РљРѕРјРјРµСЂС‡РµСЃРєР°СЏ РЅРµРґРІРёР¶РёРјРѕСЃС‚СЊ Рё РїСЂРµРјРёР°Р»СЊРЅС‹Рµ РѕР±СЉРµРєС‚С‹"
          active={isPathActive(currentPath, "/wikimarket/real-estate/commercial")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>РРіСЂС‹ Рё РѕР±СѓС‡РµРЅРёРµ</SectionLabel>

        <MenuEntry
          label="РРіСЂС‹ РѕР±СѓС‡Р°СЋС‰РёРµ"
          icon="sports_esports"
          path="/wikimarket/education-games"
          title="РРіСЂС‹ РѕР±СѓС‡Р°СЋС‰РёРµ Рё СЃРёРјСѓР»СЏС‚РѕСЂС‹ (EdTech)"
          active={isPathActive(currentPath, "/wikimarket/education-games")}
        />

        <div className="menu-separator"></div>

        <SectionLabel dataAuth="private">РљРѕС€РµР»С‘Рє</SectionLabel>

        <MenuEntry
          label="РљРѕС€РµР»С‘Рє"
          icon="account_balance_wallet"
          path="/wallet"
          title="Р¤РёРЅР°РЅСЃС‹ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ (СЃС‡РµС‚Р° Рё РїР»Р°С‚РµР¶Рё)"
          dataAuth="private"
          active={isPathActive(currentPath, "/wallet")}
        />
        <MenuEntry
          label="Р‘Р°Р»Р°РЅСЃ"
          icon="savings"
          path="/wallet/balance"
          title="РўРµРєСѓС‰РёР№ Р±Р°Р»Р°РЅСЃ СЃСЂРµРґСЃС‚РІ Рё С‚РѕРєРµРЅРѕРІ"
          dataAuth="private"
          active={isPathActive(currentPath, "/wallet/balance")}
        />
        <MenuEntry
          label="РСЃС‚РѕСЂРёСЏ"
          icon="receipt_long"
          path="/wallet/history"
          title="РЎРїРёСЃРѕРє С‚СЂР°РЅР·Р°РєС†РёР№ Рё РїРѕРєСѓРїРѕРє"
          dataAuth="private"
          active={isPathActive(currentPath, "/wallet/history")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>РћСЂРіР°РЅР°Р№Р·РµСЂ</SectionLabel>

        <MenuEntry
          label="РћСЂРіР°РЅР°Р№Р·РµСЂ"
          icon="view_kanban"
          path="/organizer"
          title="РџР»Р°РЅРёСЂРѕРІР°РЅРёРµ, РїСЂРѕРµРєС‚С‹, CRM-РёРЅСЃС‚СЂСѓРјРµРЅС‚С‹"
          active={isPathActive(currentPath, "/organizer")}
        />
        <MenuEntry
          label="РљР°Р»РµРЅРґР°СЂСЊ"
          icon="event"
          path="/organizer/calendar"
          title="Р Р°СЃРїРёСЃР°РЅРёРµ СЃРѕР±С‹С‚РёР№ Рё РІСЃС‚СЂРµС‡"
          active={isPathActive(currentPath, "/organizer/calendar")}
        />
        <MenuEntry
          label="Р—Р°РґР°С‡Рё"
          icon="task_alt"
          path="/organizer/tasks"
          title="РЈРїСЂР°РІР»РµРЅРёРµ СЃРїРёСЃРєРѕРј Р·Р°РґР°С‡"
          active={isPathActive(currentPath, "/organizer/tasks")}
        />
        <MenuEntry
          label="CRM-РјРѕРґСѓР»Рё"
          icon="stacked_bar_chart"
          path="/organizer/crm"
          title="РЈРїСЂР°РІР»РµРЅРёРµ РєР»РёРµРЅС‚Р°РјРё Рё РїСЂРѕРґР°Р¶Р°РјРё"
          active={isPathActive(currentPath, "/organizer/crm")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>Р‘РёР·РЅРµСЃ</SectionLabel>

        <MenuEntry
          label="Р‘РёР·РЅРµСЃ"
          icon="business_center"
          path="/business"
          title="РљРѕРјРїР°РЅРёРё Рё B2B-РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё"
          active={isPathActive(currentPath, "/business")}
        />
        <MenuEntry
          label="РљРѕРјРїР°РЅРёРё"
          icon="apartment"
          path="/business/companies"
          title="РџСЂРѕС„РёР»Рё Рё СЃС‚СЂР°РЅРёС†С‹ РєРѕРјРїР°РЅРёР№"
          active={isPathActive(currentPath, "/business/companies")}
        />
        <MenuEntry
          label="B2B-РїРѕСЂС‚Р°Р»"
          icon="diversity_3"
          path="/business/b2b"
          title="РРЅСЃС‚СЂСѓРјРµРЅС‚С‹ РґР»СЏ РєРѕСЂРїРѕСЂР°С‚РёРІРЅС‹С… РєР»РёРµРЅС‚РѕРІ"
          active={isPathActive(currentPath, "/business/b2b")}
        />

        <div className="menu-separator"></div>

        <SectionLabel>РЎРµСЂРІРёСЃС‹ Рё СЂР°Р·РІРёС‚РёРµ</SectionLabel>

        <MenuEntry
          label="Р—РґРѕСЂРѕРІСЊРµ"
          icon="monitor_heart"
          path="/health"
          title="Р—РґРѕСЂРѕРІСЊРµ Рё С„РёС‚РЅРµСЃ (РјРµРґРёС†РёРЅСЃРєРёРµ СЃРµСЂРІРёСЃС‹)"
          active={isPathActive(currentPath, "/health")}
        />
        <MenuEntry
          label="Р›РѕРіРёСЃС‚РёРєР°"
          icon="local_shipping"
          path="/logistics"
          title="Р”РѕСЃС‚Р°РІРєРё Рё С‚СЂР°РЅСЃРїРѕСЂС‚РЅС‹Рµ СЃРµСЂРІРёСЃС‹"
          active={isPathActive(currentPath, "/logistics")}
        />
        <MenuEntry
          label="РћР±СЂР°Р·РѕРІР°РЅРёРµ"
          icon="menu_book"
          path="/education"
          title="РћР±СѓС‡РµРЅРёРµ Рё РїСЂРѕС„РµСЃСЃРёРѕРЅР°Р»СЊРЅРѕРµ СЂР°Р·РІРёС‚РёРµ"
          active={isPathActive(currentPath, "/education")}
        />
        <MenuEntry
          label="РљСѓСЂСЃС‹"
          icon="school"
          path="/education/courses"
          title="РћРЅР»Р°Р№РЅ-РѕР±СѓС‡РµРЅРёРµ Рё С‚СЂРµРЅРёРЅРіРё"
          active={isPathActive(currentPath, "/education/courses")}
        />
        <MenuEntry
          label="РџСЂРѕС„РµСЃСЃРёРё"
          icon="work_outline"
          path="/education/careers"
          title="Р’Р°РєР°РЅСЃРёРё Рё РєР°СЂСЊРµСЂРЅС‹Рµ РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё"
          active={isPathActive(currentPath, "/education/careers")}
        />
        <MenuEntry
          label="Р Р°Р·РІР»РµС‡РµРЅРёСЏ"
          icon="theater_comedy"
          path="/entertainment"
          title="РРіСЂС‹, РєРѕРЅС‚РµРЅС‚, СЃРѕР±С‹С‚РёСЏ"
          active={isPathActive(currentPath, "/entertainment")}
        />
        <MenuEntry
          label="РРіСЂС‹"
          icon="sports_esports"
          path="/entertainment/games"
          title="РРіСЂРѕРІС‹Рµ СЃРµСЂРІРёСЃС‹, РјРёРЅРё-РёРіСЂС‹"
          active={isPathActive(currentPath, "/entertainment/games")}
        />
        <MenuEntry
          label="РўРІРѕСЂС‡РµСЃС‚РІРѕ"
          icon="brush"
          path="/entertainment/creative"
          title="РџСЂРѕРµРєС‚С‹ РґР»СЏ СЃР°РјРѕСЂРµР°Р»РёР·Р°С†РёРё Рё С‚РІРѕСЂС‡РµСЃС‚РІР°"
          active={isPathActive(currentPath, "/entertainment/creative")}
        />
      </div>
    </aside>
  );
}
