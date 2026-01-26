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

    const title = createEl("div", "sidebar-footer-title");
    title.innerHTML =
      '<span class="material-symbols-outlined menu-icon" aria-hidden="true">account_circle</span>' +
      "<span>Аккаунт</span>";
    footer.appendChild(title);

    const actions = createEl("div", "sidebar-footer-actions");

    if (!session) {
      const login = createEl("a", "menu-item sidebar-footer-item", { href: "/account/login" });
      login.innerHTML =
        '<span class="material-symbols-outlined menu-icon" aria-hidden="true">login</span>' +
        '<span class="menu-label">Войти</span>';

      const register = createEl("a", "menu-item sidebar-footer-item", { href: "/account/register" });
      register.innerHTML =
        '<span class="material-symbols-outlined menu-icon" aria-hidden="true">person_add</span>' +
        '<span class="menu-label">Регистрация</span>';

      actions.appendChild(login);
      actions.appendChild(register);
    } else {
      const account = createEl("a", "menu-item sidebar-footer-item", { href: "/account" });
      account.innerHTML =
        '<span class="material-symbols-outlined menu-icon" aria-hidden="true">person</span>' +
        '<span class="menu-label">Мой аккаунт</span>';

      const logout = createEl("button", "menu-item sidebar-footer-item sidebar-footer-logout", { type: "button" });
      logout.innerHTML =
        '<span class="material-symbols-outlined menu-icon" aria-hidden="true">logout</span>' +
        '<span class="menu-label">Выйти</span>';

      logout.addEventListener("click", () => {
        window.location.href = "/api/auth/signout?callbackUrl=/";
      });

      actions.appendChild(account);
      actions.appendChild(logout);
    }

    footer.appendChild(actions);
  }

  function initStickyFooter() {
    if (window.innerWidth >= 769) return;
    const sidebar = qs(".sidebar");
    if (!sidebar) return;

    let footerObserver = null;
    const mountFooter = () => {
      // У вас скролл уже на .sidebar-inner. Footer должен быть соседом, не внутри inner.
      const inner = qs(".sidebar-inner", sidebar);
      if (!inner) return false;

      const footer = ensureSidebarFooter(sidebar);
      renderFooter(footer, null);

      getSessionSafe().then((session) => {
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

      const icon = createEl("span", "material-symbols-outlined mobile-bottom-nav-icon", { "aria-hidden": "true" });
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

  try {
    // КРИТИЧНО: эти 2 строки возвращают header и menu
    await fetchAndInsert("/includes/header.html", "header");
    console.log("[layout] header loaded");
    await fetchAndInsert("/includes/menu.html", ".sidebar");
    console.log("[layout] sidebar loaded");

    // --- burger toggling и высота header (ваша логика) ---
    const body = document.body;
    const burger = document.getElementById("burgerBtn");
    const root = document.documentElement;
    const headerEl = document.querySelector("header");
    const authButtonsEl = headerEl?.querySelector(".auth-buttons") ?? null;

    async function updateAuthButtons() {
      if (!authButtonsEl) return;

      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) return;

        const session = await res.json();
        const isAuthenticated = Boolean(session?.user);
        if (!isAuthenticated) return;

        let hasProfileRoute = false;
        try {
          const profileRes = await fetch("/account/profile", { method: "HEAD", credentials: "include" });
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
      if (!headerEl) return;
      const h = headerEl.offsetHeight;
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

    // Footer — строго после вставки menu.html
    initStickyFooter();
    initMobileBottomNav();
  } catch (e) {
    console.error("[UPGR] load-layout.js fatal error:", e);
  }
})();
