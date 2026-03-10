(async function () {
  "use strict";

  async function fetchAndInsert(url, selector) {
    const container = document.querySelector(selector);
    if (!container) {
      console.warn("[UPGR] container not found for", selector);
      return;
    }

    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        console.error("[UPGR] failed to load", url, res.status);
        return;
      }
      const html = await res.text();
      if (!html || !html.trim()) {
        console.warn("[UPGR] empty layout response for", url);
        return;
      }
      container.innerHTML = html;
    } catch (err) {
      console.error("[UPGR] Error loading", url, err);
    }
  }

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function createEl(tag, className, attrs) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined) continue;
        el.setAttribute(k, String(v));
      }
    }
    return el;
  }

  function getThemeSystem() {
    return window.UPGR_THEME_SYSTEM || null;
  }

  function formatThemeSwitchTitle(state) {
    const suffix = state.source === "debug-date" ? " (тест)" : "";
    return `Тема дня • ${state.dateStamp}${suffix}`;
  }

  function formatAutoThemeLabel(state) {
    return `Авто (${state.theme.label} сегодня)`;
  }

  function renderThemeSwitchItems(switcher, themeSystem, state) {
    const optionsRoot = switcher.querySelector("[data-theme-switch-options]");
    if (!optionsRoot) return;

    const itemsMarkup = themeSystem
      .getSelectableModes()
      .map((mode) => {
        const label = mode.key === "auto" ? formatAutoThemeLabel(state) : mode.label;
        return `<button type="button" class="theme-switch-item" role="menuitemradio" data-theme="${mode.key}" aria-checked="false">${label}</button>`;
      })
      .join("");

    optionsRoot.innerHTML = itemsMarkup;
  }

  function syncThemeSwitchers(themeSystem, switchers) {
    const state = themeSystem.getState();
    const themeLabels = themeSystem.getThemeOptions().reduce((acc, theme) => {
      acc[theme.key] = theme.label;
      return acc;
    }, {});

    switchers.forEach((switcher) => {
      const title = switcher.querySelector(".theme-switch-title");
      if (title) title.textContent = formatThemeSwitchTitle(state);

      const dot = switcher.querySelector(".theme-dot");
      if (dot) {
        dot.style.background = state.theme.primary;
        dot.style.boxShadow = `0 0 0 2px ${state.tokens["--theme-focus-ring"]}`;
      }

      switcher.querySelectorAll(".theme-switch-item").forEach((item) => {
        const itemTheme = item.dataset.theme || "auto";
        item.textContent = itemTheme === "auto" ? formatAutoThemeLabel(state) : themeLabels[itemTheme] || itemTheme;

        const isActive = state.mode === "auto" ? itemTheme === "auto" : itemTheme === state.themeKey;
        item.setAttribute("aria-checked", isActive ? "true" : "false");
      });
    });
  }

  function initThemeSwitcher() {
    const themeSystem = getThemeSystem();
    if (!themeSystem) return;

    themeSystem.reapply();

    const switchers = Array.from(document.querySelectorAll("[data-theme-switch]"));
    if (!switchers.length) return;

    const renderAllItems = () => {
      const state = themeSystem.getState();
      switchers.forEach((switcher) => renderThemeSwitchItems(switcher, themeSystem, state));
    };

    const syncUi = () => {
      syncThemeSwitchers(themeSystem, switchers);
    };

    renderAllItems();
    syncUi();

    const closeMenus = () => {
      switchers.forEach((switcher) => {
        switcher.classList.remove("is-open");
        const trigger = switcher.querySelector(".theme-switch-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    };

    switchers.forEach((switcher) => {
      const trigger = switcher.querySelector(".theme-switch-trigger");
      if (!trigger) return;

      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = switcher.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
      });

      switcher.querySelectorAll(".theme-switch-item").forEach((item) => {
        item.addEventListener("click", () => {
          themeSystem.setThemeMode(item.dataset.theme || "auto");
          syncUi();
          closeMenus();
        });
      });
    });

    document.addEventListener("click", (event) => {
      if (!switchers.some((switcher) => switcher.contains(event.target))) closeMenus();
    });

    window.addEventListener("upgr:theme-change", syncUi);
  }

  let upgradeLogoRendered = false;

  async function renderUpgradeLogo() {
    const slot = document.getElementById("upgr-logo-slot");
    if (!slot || upgradeLogoRendered) return;

    try {
      slot.innerHTML = `
        <span class="upgr-logo" aria-label="UPGRADE Innovations">
          <img
            class="upgr-logo__base"
            src="/assets/logo/logo-black-only.png"

            alt="UPGRADE Innovations"
            loading="lazy"
            decoding="async"
          />
          <span class="upgr-logo__accent" aria-hidden="true"></span>
        </span>
      `;
      upgradeLogoRendered = true;
    } catch (err) {
      console.error("[UPGR] logo render error", err);
    }
  }

  function runChameleonIntro(opts = {}) {
    const key = "upgr_chameleon_last";
    const cooldownHours = opts.cooldownHours ?? 12;
    const probability = opts.probability ?? 0.35;

    try {
      const last = Number(localStorage.getItem(key) || "0");
      const now = Date.now();
      const cooldownMs = cooldownHours * 3600 * 1000;

      if (now - last < cooldownMs) return;
      if (Math.random() > probability) return;

      localStorage.setItem(key, String(now));
      document.body.classList.add("chameleon-intro");
      setTimeout(() => document.body.classList.remove("chameleon-intro"), 950);
    } catch (e) {
      console.warn("[UPGR] chameleon intro error", e);
    }
  }

  function enableChameleonOnNavigation() {
    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest("a");
        if (!link || !link.href) return;
        if (link.origin !== location.origin) return;
        if (link.target && link.target !== "_self") return;
        if (link.hasAttribute("download")) return;
        if (link.getAttribute("href")?.startsWith("#")) return;

        document.body.classList.add("chameleon-intro");
        event.preventDefault();
        setTimeout(() => {
          location.href = link.href;
        }, 180);
      },
      true
    );
  }

  function sanitizePhaseBlocks() {
    document.querySelectorAll(".phase").forEach((phase) => {
      if (phase.closest("header, nav, aside")) return;

      const textEl = phase.querySelector(".text");
      const tagEl = phase.querySelector(".tag");

      const text = textEl?.textContent.trim() ?? "";
      const tag = tagEl?.textContent.trim() ?? "";

      if (!text && !tag) {
        phase.remove();
        return;
      }
      if (!text && textEl) textEl.remove();
      if (!tag && tagEl) tagEl.remove();
    });
  }


  async function getSessionSafe() {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return data && data.user ? data : null;
    } catch {
      return null;
    }
  }

  function applyAuthVisibility(session) {
    const isAuthenticated = Boolean(session?.user);
    const privateNodes = document.querySelectorAll("[data-auth=\"private\"]");
    privateNodes.forEach((node) => {
      if (isAuthenticated) node.removeAttribute("hidden");
      else node.setAttribute("hidden", "true");
    });
  }

  function ensureSidebarFooter(sidebar) {
    let footer = sidebar.querySelector(":scope > .sidebar-footer");
    if (!footer) {
      footer = createEl("div", "sidebar-footer");
      sidebar.appendChild(footer);
    }
    return footer;
  }

  function renderFooter(footer, session) {
    footer.innerHTML = "";
    if (!session) {
      footer.setAttribute("hidden", "true");
      return false;
    }
    footer.removeAttribute("hidden");

    const title = createEl("div", "sidebar-footer-title");
    title.innerHTML =
      '<span class="material-symbols-outlined menu-icon" aria-hidden="true">account_circle</span>' +
      "<span>РђРєРєР°СѓРЅС‚</span>";
    footer.appendChild(title);

    const actions = createEl("div", "sidebar-footer-actions");

    const account = createEl("a", "menu-item sidebar-footer-item", { href: "/account" });
    account.innerHTML =
      '<span class="material-symbols-outlined menu-icon" aria-hidden="true">person</span>' +
      '<span class="menu-label">РњРѕР№ Р°РєРєР°СѓРЅС‚</span>';

    const logout = createEl("button", "menu-item sidebar-footer-item sidebar-footer-logout", {
      type: "button",
    });
    logout.innerHTML =
      '<span class="material-symbols-outlined menu-icon" aria-hidden="true">logout</span>' +
      '<span class="menu-label">Р’С‹Р№С‚Рё</span>';

    logout.addEventListener("click", () => {
      window.location.href = "/api/auth/signout?callbackUrl=/";
    });

    actions.appendChild(account);
    actions.appendChild(logout);

    footer.appendChild(actions);
    return true;
  }

  function initStickyFooter() {
    if (window.innerWidth >= 769) return;
    const sidebar = qs(".sidebar");
    if (!sidebar) return;

    let footerObserver = null;

    const mountFooter = () => {
      const inner = qs(".sidebar-inner", sidebar);
      if (!inner) return false;

      const footer = ensureSidebarFooter(sidebar);
      renderFooter(footer, null);

      getSessionSafe().then((session) => {
        applyAuthVisibility(session);
        const sidebar2 = qs(".sidebar");
        const inner2 = sidebar2 ? qs(".sidebar-inner", sidebar2) : null;
        if (!sidebar2 || !inner2) return;
        const footer2 = ensureSidebarFooter(sidebar2);
        renderFooter(footer2, session);
      });

      console.log("[layout] footer initialized");
      return true;
    };

    const ensureMobileFooter = () => {
      const isMobile = window.innerWidth < 769;
      const existingFooter = sidebar.querySelector(":scope > .sidebar-footer");

      if (!isMobile) {
        if (existingFooter) existingFooter.remove();
        if (footerObserver) {
          footerObserver.disconnect();
          footerObserver = null;
        }
        return;
      }

      if (mountFooter()) {
        if (footerObserver) {
          footerObserver.disconnect();
          footerObserver = null;
        }
        return;
      }

      if (!footerObserver) {
        footerObserver = new MutationObserver(() => {
          if (mountFooter()) {
            footerObserver.disconnect();
            footerObserver = null;
          }
        });
        footerObserver.observe(sidebar, { childList: true, subtree: true });
      }
    };

    ensureMobileFooter();
    window.addEventListener("resize", ensureMobileFooter);
  }

  function ensureBottomNavContainer() {
    let nav = qs(".mobile-bottom-nav");
    if (!nav) {
      nav = createEl("nav", "mobile-bottom-nav", { "aria-label": "РќРёР¶РЅСЏСЏ РЅР°РІРёРіР°С†РёСЏ" });
      document.body.appendChild(nav);
    }
    return nav;
  }

  function renderBottomNav(nav) {
    nav.innerHTML = "";
    const items = [
      { label: "Home", icon: "home", href: "/" },
      { label: "Feed", icon: "dynamic_feed", href: "/feed" },
      { label: "Messages", icon: "mark_unread_chat_alt", href: "/messages" },
      { label: "Account", icon: "account_circle", href: "/account" },
    ];

    const currentPath = window.location.pathname;

    items.forEach((item) => {
      const link = createEl("a", "mobile-bottom-nav-item", { href: item.href });

      if (
        (item.href !== "/" && currentPath.startsWith(item.href)) ||
        (item.href === "/" && currentPath === "/")
      ) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }

      const icon = createEl("span", "material-symbols-outlined mobile-bottom-nav-icon", {
        "aria-hidden": "true",
      });
      icon.textContent = item.icon;

      const label = createEl("span", "mobile-bottom-nav-label");
      label.textContent = item.label;

      link.appendChild(icon);
      link.appendChild(label);
      nav.appendChild(link);
    });
  }

  function initMobileBottomNav() {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateNav = () => {
      const isMobile = mediaQuery.matches;
      document.body.classList.toggle("has-mobile-bottom-nav", isMobile);

      const existing = qs(".mobile-bottom-nav");
      if (!isMobile) {
        if (existing) existing.remove();
        return;
      }

      const nav = existing || ensureBottomNavContainer();
      renderBottomNav(nav);
    };

    updateNav();
    mediaQuery.addEventListener("change", updateNav);
  }


  function initNotifications() {
    const STORAGE_KEY = 'upgr.notifications.v1';
    const trigger = qs('[data-notifications-trigger="true"]');
    if (!trigger) return;

    const appContent = qs('.app-content');
    if (!appContent) return;

    const badge = trigger.querySelector('[data-notification-badge]');

    const getSeedNotifications = () => [
      {
        id: 'beta-announce',
        title: 'BETA',
        text: 'РќРѕРІС‹Р№ СЃРµСЂРІРёСЃ. РџСѓР±Р»РёРєСѓРµРј СЃС‚Р°С‚СѓСЃ СЂР°Р·РґРµР»РѕРІ, РїР»Р°РЅ СЂР°Р·РІРёС‚РёСЏ Рё Р¶СѓСЂРЅР°Р» РёР·РјРµРЅРµРЅРёР№ вЂ” РІР°С€Рё РёРґРµРё РїРѕРјРѕРіР°СЋС‚ СЂР°СЃСЃС‚Р°РІР»СЏС‚СЊ РїСЂРёРѕСЂРёС‚РµС‚С‹.',
        dismissed: false,
        createdAtIso: new Date().toISOString(),
      },
    ];

    const loadNotifications = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((item) => item && typeof item.id === 'string');
        }
      } catch {
        // ignore invalid storage payload
      }

      const seed = getSeedNotifications();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    };

    let notifications = loadNotifications();

    const persistNotifications = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    };

    let panel = document.querySelector('[data-notifications-panel]');
    if (!panel) {
      panel = createEl('section', 'notifications-overlay', {
        'data-notifications-panel': 'true',
        'aria-label': 'РЈРІРµРґРѕРјР»РµРЅРёСЏ',
        hidden: 'true',
      });
      panel.innerHTML = '<div class="notifications-sheet"><div class="notifications-panel wrap"><div class="notifications-popover-head"><strong>РЈРІРµРґРѕРјР»РµРЅРёСЏ</strong><button class="notifications-close" type="button" aria-label="Р—Р°РєСЂС‹С‚СЊ СѓРІРµРґРѕРјР»РµРЅРёСЏ">Г—</button></div><div data-notifications-list></div></div></div>';
      appContent.insertBefore(panel, appContent.firstChild);
    }

    panel.style.pointerEvents = 'none';

    const listEl = panel.querySelector('[data-notifications-list]');

    const getVisible = () => notifications.filter((item) => !item.dismissed);
    const getActiveCount = () => getVisible().length;

    const closePanel = () => {
      panel.setAttribute('hidden', 'true');
      panel.style.pointerEvents = 'none';
      trigger.setAttribute('aria-expanded', 'false');
    };

        const dismissNotification = (id) => {
      notifications = notifications.map((item) =>
        item.id === id ? { ...item, dismissed: true } : item
      );
      persistNotifications();
    };

    const render = () => {
      const visible = getVisible();
      const activeCount = getActiveCount();

      if (badge) {
        badge.hidden = activeCount === 0;
        badge.textContent = '';
      }

      trigger.setAttribute(
        'aria-label',
        activeCount > 0 ? `РЈРІРµРґРѕРјР»РµРЅРёСЏ: ${activeCount}` : 'РЈРІРµРґРѕРјР»РµРЅРёСЏ'
      );

      if (!listEl) return;

      if (visible.length === 0) {
        listEl.innerHTML = '<div class="notification-empty">РќРµС‚ РЅРѕРІС‹С… СѓРІРµРґРѕРјР»РµРЅРёР№</div>';
        return;
      }

      listEl.innerHTML = visible
        .map(
          (item) =>
            `<article class="notice notice--beta" data-notification-id="${item.id}">
              <div class="notice__content">
                <div class="notice__head">
                  <span class="notice__icon material-symbols-outlined" aria-hidden="true">notifications_active</span>
                  <span class="notice__tag">${item.title}</span>
                </div>
                <p class="notice__text">${item.text}</p>
              </div>
              <button class="notice__close" type="button" aria-label="РЎРєСЂС‹С‚СЊ СѓРІРµРґРѕРјР»РµРЅРёРµ" data-dismiss-id="${item.id}">Г—</button>
            </article>`
        )
        .join('');
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isHidden = panel.hasAttribute('hidden');
      if (isHidden) {
        panel.removeAttribute('hidden');
        panel.style.pointerEvents = 'auto';
        trigger.setAttribute('aria-expanded', 'true');
        render();
        return;
      }

      closePanel();
    });

    panel.addEventListener('click', (event) => {
      const dismissBtn = event.target.closest('[data-dismiss-id]');
      if (dismissBtn) {
        const id = dismissBtn.getAttribute('data-dismiss-id');
        if (id) {
          dismissNotification(id);
          render();
        }
        return;
      }

      if (event.target.closest('.notifications-close')) {
        closePanel();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hasAttribute('hidden')) closePanel();
    });

    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      notifications = loadNotifications();
      render();
    });

    render();
  }


  async function initNotificationsRuntime() {
    try {
      const notificationsModule = await import('/assets/notifications/index.js');
      const initNotificationsModule = notificationsModule?.initNotificationsModule;

      if (typeof initNotificationsModule === 'function') {
        initNotificationsModule();
        return;
      }

      console.warn('[UPGR] notifications module loaded without initNotificationsModule export');
      return;
    } catch (error) {
      console.error('[UPGR] notifications module import failed, using fallback', error);
      if (typeof initNotifications === 'function') {
        initNotifications();
      }
    }
  }

  document.addEventListener("layout:ready", renderUpgradeLogo);

  document.addEventListener("layout:ready", async () => {
    sanitizePhaseBlocks();
    await renderUpgradeLogo();
    applyAuthVisibility(null);
    getSessionSafe().then(applyAuthVisibility);
  });

  async function loadLayout() {
    try {
      // РљР РРўРР§РќРћ: СЌС‚Рё 2 СЃС‚СЂРѕРєРё РІСЃС‚Р°РІР»СЏСЋС‚ header Рё menu
      await fetchAndInsert("/includes/header.html", "header");
      console.log("[layout] header loaded");
      await fetchAndInsert("/includes/menu.html", ".sidebar");
      console.log("[layout] sidebar loaded");

      // Theme switcher вЂ” СЃС‚СЂРѕРіРѕ РїРѕСЃР»Рµ РІСЃС‚Р°РІРєРё header.html
      await initThemeSwitcher();
      await initNotificationsRuntime();

      document.dispatchEvent(new Event("layout:ready"));

      const startChameleon = () => runChameleonIntro({ cooldownHours: 12, probability: 0.35 });
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startChameleon, { once: true });
      } else {
        startChameleon();
      }
      enableChameleonOnNavigation();

      // --- burger toggling Рё РІС‹СЃРѕС‚Р° header ---
      const body = document.body;
      const root = document.documentElement;
      const headerNode = qs('[data-site-header="true"]') || qs("header.site-header") || qs("body > header") || qs("header");

      const authButtonsEl = headerNode?.querySelector(".auth-buttons") ?? null;

      // Р’РђР–РќРћ: Сѓ С‚РµР±СЏ РІ header СЃРµР№С‡Р°СЃ РєРЅРѕРїРєР° РЅРµ РѕР±СЏР·Р°РЅР° РёРјРµС‚СЊ id="burgerBtn"
      // РїРѕСЌС‚РѕРјСѓ Р±РµСЂС‘Рј РїРѕ data-burger РёР»Рё .burger, Р° id РѕСЃС‚Р°РІР»СЏРµРј РєР°Рє fallback.
      const burger =
        document.querySelector("[data-burger]") ||
        document.querySelector(".burger") ||
        document.getElementById("burgerBtn");

      async function updateAuthButtons() {
        if (!authButtonsEl) return;

        try {
          const session = await getSessionSafe();
          const isAuthenticated = Boolean(session?.user);
          if (!isAuthenticated) return;

          let hasProfileRoute = false;
          try {
            const profileRes = await fetch("/account/profile", {
              method: "HEAD",
              credentials: "include",
            });
            hasProfileRoute = profileRes.ok;
          } catch {
            hasProfileRoute = false;
          }

          authButtonsEl.innerHTML = `
            <a class="btn btn--ghost" href="/account" rel="nofollow">Account</a>
            ${hasProfileRoute ? '<a class="btn" href="/account/profile" rel="nofollow">Profile</a>' : ""}
          `;
        } catch (err) {
          console.error("[UPGR] Error loading auth session", err);
        }
      }

      function updateHeaderHeight() {
        if (!headerNode) return;
        const h = headerNode.offsetHeight;
        root.style.setProperty("--header-height", h + "px");
      }

      const desktopBreakpoint = 1200;
      const collapsedStorageKey = "upgr-sidebar-collapsed";
      let isDesktop = window.innerWidth >= desktopBreakpoint;

      function getCollapsedPreference() {
        return localStorage.getItem(collapsedStorageKey) === "true";
      }
      function setCollapsedPreference(isCollapsed) {
        localStorage.setItem(collapsedStorageKey, String(isCollapsed));
      }

      function syncMenuState() {
        const nowDesktop = window.innerWidth >= desktopBreakpoint;
        if (nowDesktop !== isDesktop) {
          isDesktop = nowDesktop;
          if (isDesktop) {
            const preferCollapsed = getCollapsedPreference();
            body.classList.toggle("menu-open", !preferCollapsed);
          } else {
            body.classList.remove("menu-open");
          }
        }
      }

      if (burger) {
        burger.addEventListener("click", function () {
          const nowDesktop = window.innerWidth >= desktopBreakpoint;
          if (nowDesktop) {
            body.classList.toggle("menu-open");
            setCollapsedPreference(!body.classList.contains("menu-open"));
            return;
          }
          body.classList.toggle("menu-open");
        });
      } else {
        console.warn("[layout] burger button not found (check header.html)");
      }

      if (isDesktop) {
        const preferCollapsed = getCollapsedPreference();
        body.classList.toggle("menu-open", !preferCollapsed);
      } else {
        body.classList.remove("menu-open");
      }

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && body.classList.contains("menu-open")) {
          body.classList.remove("menu-open");
        }
      });

      window.addEventListener("load", updateHeaderHeight);
      window.addEventListener("resize", updateHeaderHeight);
      window.addEventListener("resize", syncMenuState);
      updateHeaderHeight();
      syncMenuState();

      await updateAuthButtons();

      // Footer вЂ” СЃС‚СЂРѕРіРѕ РїРѕСЃР»Рµ РІСЃС‚Р°РІРєРё menu.html
      initStickyFooter();
      initMobileBottomNav();
    } catch (e) {
      console.error("[UPGR] load-layout.js fatal error:", e);
    }
  }

  await loadLayout();
})();
