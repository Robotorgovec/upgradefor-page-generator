(async function () {
  "use strict";

const layoutVersion = "2026-01-29-02";
console.info("[UPGR] layout init v" + layoutVersion, new Date().toISOString());


  async function fetchAndInsert(url, selector) {
    const container = document.querySelector(selector);
    if (!container) {
      console.warn("[UPGR] container not found for", selector);
      return false;
    }

    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        console.error("[UPGR] failed to load", url, res.status);
        return false;
      }
      const html = await res.text();
      if (!html || !html.trim()) {
        console.warn("[UPGR] empty layout response for", url);
        return false;
    }
    container.innerHTML = html;
    return true;
  } catch (err) {
    console.error("[UPGR] Error loading", url, err);
    return false;
  }
}

async function fetchAndInsertInto(url, container) {
  if (!container) return false;
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      console.error("[UPGR] failed to load", url, res.status);
      return false;
    }
    const html = await res.text();
    if (!html || !html.trim()) {
      console.warn("[UPGR] empty layout response for", url);
      return false;
    }
    container.innerHTML = html;
    return true;
  } catch (err) {
    console.error("[UPGR] Error loading", url, err);
    return false;
  }
}

      }
      container.innerHTML = html;
      return true;
    } catch (err) {
      console.error("[UPGR] Error loading", url, err);
      return false;
    }
  }

  async function fetchAndInsertInto(url, container) {
    if (!container) return false;
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        console.error("[UPGR] failed to load", url, res.status);
        return false;
      }
      const html = await res.text();
      if (!html || !html.trim()) {
        console.warn("[UPGR] empty layout response for", url);
        return false;
      }
      container.innerHTML = html;
      return true;
    } catch (err) {
      console.error("[UPGR] Error loading", url, err);
      return false;
    }

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

  function ensureHeaderSlot() {
    let slot =
      document.querySelector('[data-slot="header"]') ||
      document.getElementById("site-header-slot") ||
      document.querySelector("header");
    if (!slot) {
      slot = document.createElement("header");
      slot.id = "site-header-slot";
      document.body.prepend(slot);
    } else if (!slot.id) {
      slot.id = "site-header-slot";
    }
    return slot;
  }

  function ensureSidebarSlot(afterNode) {
    let slot = document.querySelector(".sidebar");
    if (!slot) {
      slot = document.createElement("aside");
      slot.className = "sidebar";
      if (afterNode && afterNode.parentNode) {
        afterNode.parentNode.insertBefore(slot, afterNode.nextSibling);
      } else {
        document.body.appendChild(slot);
      }
    }
    return slot;
  }

  function renderFallbackHeader(slot) {
    if (!slot) return false;
    slot.innerHTML = `
      <div class="wrap nav">
        <button class="burger" id="burgerBtn" aria-label="Открыть меню" type="button">
          <span class="burger-icon">
            <span class="burger-line"></span>
            <span class="burger-line"></span>
            <span class="burger-line"></span>
          </span>
        </button>
        <a class="brand" href="/" aria-label="UPGRADE INNOVATIONS">
          <div id="upgr-logo-slot"></div>
        </a>
        <div class="grow"></div>
        <div class="auth-buttons">
          <a class="btn btn--ghost" href="/account/login" rel="nofollow">Sign in</a>
          <a class="btn" href="/account/register" rel="nofollow">Sign up</a>
        </div>
      </div>
    `;
    return true;
  }

  function renderFallbackMenu(slot) {
    if (!slot) return false;
    slot.innerHTML = `
      <div class="sidebar-inner">
        <div class="sidebar-section">
          <a class="menu-item" href="/"><span class="menu-label">Главная</span></a>
          <a class="menu-item" href="/catalog"><span class="menu-label">Каталог</span></a>
          <a class="menu-item" href="/account/login"><span class="menu-label">Вход</span></a>
          <a class="menu-item" href="/account/register"><span class="menu-label">Регистрация</span></a>
        </div>
      </div>
    `;
    return true;
  }

  const themeStorageKey = "userTheme";
  const themeConfigUrl = "/assets/theme/theme-colors.json";
  let cachedThemeConfig = null;

  async function loadThemeConfig() {
    if (cachedThemeConfig) return cachedThemeConfig;
    try {
      const res = await fetch(themeConfigUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Theme config not available");
      cachedThemeConfig = await res.json();
      return cachedThemeConfig;
    } catch (err) {
      console.error("[UPGR] theme config error", err);
      return null;
    }
  }

  // Sunday=0 ... Saturday=6
  function getAutoThemeName(config) {
    if (!config) return "cyan";

    if (config.weekCycle) {
      const dayIndex = new Date().getDay();
      return config.weekCycle[String(dayIndex)] || "cyan";
    }

    if (Array.isArray(config.cycle)) {
      const dayIndex = new Date().getDay();
      return config.cycle[dayIndex] || "cyan";
    }

    return "cyan";
  }

  function applyThemeName(name) {
    if (!name) return;
    document.documentElement.setAttribute("data-theme", name);
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

  async function applyTheme(mode, config, elements) {
    const autoTheme = getAutoThemeName(config);

    // mode может быть "auto" или именем темы ("red", "cyan", ...)
    const themeName = mode === "auto" ? autoTheme : mode;
    const themeColors = config?.colors?.[themeName];

    const resolvedTheme = themeColors ? themeName : "cyan";
    applyThemeName(resolvedTheme);

    if (elements?.items) {
      elements.items.forEach((item) => {
        const itemTheme = item.dataset.theme || "";
        const isActive = mode === "auto" ? itemTheme === "auto" : itemTheme === themeName;
        item.setAttribute("aria-checked", isActive ? "true" : "false");
      });
    }
  }

  async function initThemeSwitcher() {
    const config = await loadThemeConfig();
    if (!config) return;

    // Поддержка нескольких переключателей (например: header + sidebar mobile)
    const switchers = Array.from(document.querySelectorAll("[data-theme-switch]"));
    const allItems = switchers.flatMap((switcher) =>
      Array.from(switcher.querySelectorAll(".theme-switch-item"))
    );

    const storedTheme = localStorage.getItem(themeStorageKey);
    const initialMode =
      storedTheme && config.colors && config.colors[storedTheme] ? storedTheme : "auto";

    await applyTheme(initialMode, config, { items: allItems });

    if (!switchers.length) return;

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
    });

    document.addEventListener("click", (event) => {
      if (!switchers.some((switcher) => switcher.contains(event.target))) closeMenus();
    });

    allItems.forEach((item) => {
      item.addEventListener("click", async () => {
        const selected = item.dataset.theme || "auto";
        if (selected === "auto") localStorage.removeItem(themeStorageKey);
        else localStorage.setItem(themeStorageKey, selected);

        await applyTheme(selected, config, { items: allItems });
        closeMenus();
      });
    });
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
      "<span>Аккаунт</span>";
    footer.appendChild(title);

    const actions = createEl("div", "sidebar-footer-actions");

    const account = createEl("a", "menu-item sidebar-footer-item", { href: "/account" });
    account.innerHTML =
      '<span class="material-symbols-outlined menu-icon" aria-hidden="true">person</span>' +
      '<span class="menu-label">Мой аккаунт</span>';

    const logout = createEl("button", "menu-item sidebar-footer-item sidebar-footer-logout", {
      type: "button",
    });
    logout.innerHTML =
      '<span class="material-symbols-outlined menu-icon" aria-hidden="true">logout</span>' +
      '<span class="menu-label">Выйти</span>';

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
      nav = createEl("nav", "mobile-bottom-nav", { "aria-label": "Нижняя навигация" });
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

  document.addEventListener("layout:ready", renderUpgradeLogo);

  document.addEventListener("layout:ready", async () => {
    sanitizePhaseBlocks();
    await renderUpgradeLogo();
    applyAuthVisibility(null);
    getSessionSafe().then(applyAuthVisibility);
  });

  async function loadLayout() {
    try {
      const waitForSlot = async (attempts = 5, delayMs = 200) => {
        for (let i = 0; i < attempts; i++) {
          const slot = ensureHeaderSlot();
          if (slot) return slot;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        return ensureHeaderSlot();
      };

      // КРИТИЧНО: эти 2 строки вставляют header и menu
      const headerSlot = await waitForSlot();
      const headerOk = await fetchAndInsertInto("/includes/header.html", headerSlot);
      if (!headerOk) {
        renderFallbackHeader(headerSlot);
      }
      console.log("[layout] header loaded");

      const sidebarSlot = ensureSidebarSlot(headerSlot);
      const menuOk = await fetchAndInsertInto("/includes/menu.html", sidebarSlot);
      if (!menuOk) {
        renderFallbackMenu(sidebarSlot);
      }
      console.log("[layout] sidebar loaded");

      window.__UPGR_LAYOUT_OK__ = Boolean(headerSlot?.innerHTML?.trim());

      // Theme switcher — строго после вставки header.html
      await initThemeSwitcher();

      document.dispatchEvent(new Event("layout:ready"));

      const startChameleon = () => runChameleonIntro({ cooldownHours: 12, probability: 0.35 });
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startChameleon, { once: true });
      } else {
        startChameleon();
      }
      enableChameleonOnNavigation();

      // --- burger toggling и высота header ---
      const body = document.body;
      const root = document.documentElement;
      const headerNode = qs("header");
      const sidebar = qs(".sidebar");
      let overlay = qs(".mobile-overlay");
      if (!overlay) {
        overlay = createEl("div", "mobile-overlay", { "aria-hidden": "true" });
        document.body.appendChild(overlay);
      }

      const authButtonsEl = headerNode?.querySelector(".auth-buttons") ?? null;

      // ВАЖНО: у тебя в header сейчас кнопка не обязана иметь id="burgerBtn"
      // поэтому берём по data-burger или .burger, а id оставляем как fallback.
      const burger =
        document.querySelector("[data-burger]") ||
        document.querySelector(".burger") ||
        document.getElementById("burgerBtn");

      if (burger && sidebar) {
        if (!sidebar.id) sidebar.id = "mobile-menu";
        burger.setAttribute("aria-controls", sidebar.id);
        burger.setAttribute("aria-expanded", "false");
      }

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
      let lastFocused = null;

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
            setMenuOpen(!preferCollapsed, { focus: false });
          } else {
            setMenuOpen(false, { focus: false });
          }
        }
      }

      function setMenuOpen(shouldOpen, opts = {}) {
        const { focus = true } = opts;
        body.classList.toggle("menu-open", shouldOpen);
        if (burger) burger.setAttribute("aria-expanded", String(shouldOpen));
        if (shouldOpen && focus && sidebar) {
          lastFocused = document.activeElement;
          const focusable = sidebar.querySelector(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) focusable.focus();
        }
        if (!shouldOpen && lastFocused instanceof HTMLElement) {
          lastFocused.focus();
          lastFocused = null;
        }
      }

      function closeMenu() {
        setMenuOpen(false);
      }

      if (burger) {
        burger.addEventListener("click", function () {
          const nowDesktop = window.innerWidth >= desktopBreakpoint;
          if (nowDesktop) {
            const nextOpen = !body.classList.contains("menu-open");
            setMenuOpen(nextOpen, { focus: false });
            setCollapsedPreference(!nextOpen);
            return;
          }
          setMenuOpen(!body.classList.contains("menu-open"));
        });
      } else {
        console.warn("[layout] burger button not found (check header.html)");
      }

      if (overlay) {
        overlay.addEventListener("click", closeMenu);
      }

      if (sidebar) {
        sidebar.addEventListener("click", (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          const link = target.closest("a");
          if (!link) return;
          if (window.innerWidth < 769) closeMenu();
        });
      }

      if (isDesktop) {
        const preferCollapsed = getCollapsedPreference();
        setMenuOpen(!preferCollapsed, { focus: false });
      } else {
        setMenuOpen(false, { focus: false });
      }

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && body.classList.contains("menu-open")) {
          closeMenu();
          return;
        }
        if (e.key !== "Tab" || !body.classList.contains("menu-open") || !sidebar) return;
        if (window.innerWidth >= 769) return;
        const focusable = Array.from(
          sidebar.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])'
          )
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });

      window.addEventListener("load", updateHeaderHeight);
      window.addEventListener("resize", updateHeaderHeight);
      window.addEventListener("resize", syncMenuState);
      updateHeaderHeight();
      syncMenuState();

      await updateAuthButtons();

      // Footer — строго после вставки menu.html
      initStickyFooter();
      initMobileBottomNav();
    } catch (e) {
      console.error("[UPGR] load-layout.js fatal error:", e);
      const headerSlot = ensureHeaderSlot();
      renderFallbackHeader(headerSlot);
      const sidebarSlot = ensureSidebarSlot(headerSlot);
      renderFallbackMenu(sidebarSlot);
      window.__UPGR_LAYOUT_OK__ = Boolean(headerSlot?.innerHTML?.trim());
      renderUpgradeLogo();
    }
  }

  const startLayout = () => {
try {
  loadLayout();
} catch (e) {
  console.error("[UPGR] initLayout failed", e);
  const headerSlot = ensureHeaderSlot();
  renderFallbackHeader(headerSlot);
  const sidebarSlot = ensureSidebarSlot(headerSlot);
  renderFallbackMenu(sidebarSlot);
  window.__UPGR_LAYOUT_OK__ = Boolean(headerSlot?.innerHTML?.trim());
  renderUpgradeLogo();
}

  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLayout, { once: true });
  } else {
    startLayout();
  }
})();
