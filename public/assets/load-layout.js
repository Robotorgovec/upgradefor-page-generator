(async function () {
  "use strict";

  /* ================== helpers ================== */
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function createEl(tag, className, attrs) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v !== undefined && v !== null) el.setAttribute(k, String(v));
      });
    }
    return el;
  }

  async function fetchAndInsert(url, selector) {
    const container = document.querySelector(selector);
    if (!container) {
      console.warn("[UPGR] container not found:", selector);
      return;
    }
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        console.error("[UPGR] failed to load:", url, res.status);
        return;
      }
      container.innerHTML = await res.text();
    } catch (e) {
      console.error("[UPGR] load error:", url, e);
    }
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

  /* ================== sticky footer ================== */
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
      '<span class="material-symbols-outlined menu-icon">account_circle</span>' +
      "<span>Аккаунт</span>";
    footer.appendChild(title);

    const actions = createEl("div", "sidebar-footer-actions");

    if (!session) {
      const login = createEl("a", "menu-item sidebar-footer-item", { href: "/account/login" });
      login.innerHTML =
        '<span class="material-symbols-outlined menu-icon">login</span>' +
        '<span class="menu-label">Войти</span>';

      const register = createEl("a", "menu-item sidebar-footer-item", { href: "/account/register" });
      register.innerHTML =
        '<span class="material-symbols-outlined menu-icon">person_add</span>' +
        '<span class="menu-label">Регистрация</span>';

      actions.append(login, register);
    } else {
      const account = createEl("a", "menu-item sidebar-footer-item", { href: "/account" });
      account.innerHTML =
        '<span class="material-symbols-outlined menu-icon">person</span>' +
        '<span class="menu-label">Мой аккаунт</span>';

      const logout = createEl(
        "button",
        "menu-item sidebar-footer-item sidebar-footer-logout",
        { type: "button" }
      );
      logout.innerHTML =
        '<span class="material-symbols-outlined menu-icon">logout</span>' +
        '<span class="menu-label">Выйти</span>';

      logout.addEventListener("click", () => {
        window.location.href = "/api/auth/signout?callbackUrl=/";
      });

      actions.append(account, logout);
    }

    footer.appendChild(actions);
  }

  function initStickyFooter() {
    const sidebar = qs(".sidebar");
    if (!sidebar) return;

    const inner = qs(".sidebar-inner", sidebar);
    if (!inner) return; // меню ещё не загружено

    const footer = ensureSidebarFooter(sidebar);
    renderFooter(footer, null);

    getSessionSafe().then((session) => {
      const sidebar2 = qs(".sidebar");
      if (!sidebar2) return;
      const footer2 = ensureSidebarFooter(sidebar2);
      renderFooter(footer2, session);
    });
  }

  /* ================== main init ================== */
  try {
    // 1) КРИТИЧНО: сначала грузим layout
    await fetchAndInsert("/includes/header.html", "header");
    await fetchAndInsert("/includes/menu.html", ".sidebar");

    // 2) burger / menu-open / header-height — ВАША СТАРАЯ ЛОГИКА
    const body = document.body;
    const burger = document.getElementById("burgerBtn");
    const root = document.documentElement;
    const headerEl = qs("header");

    function updateHeaderHeight() {
      if (!headerEl) return;
      root.style.setProperty("--header-height", headerEl.offsetHeight + "px");
    }

    const desktopBreakpoint = 1200;
    const storageKey = "upgr-sidebar-collapsed";
    let isDesktop = window.innerWidth >= desktopBreakpoint;

    function syncMenuState() {
      const nowDesktop = window.innerWidth >= desktopBreakpoint;
      if (nowDesktop !== isDesktop) {
        isDesktop = nowDesktop;
        if (isDesktop) {
          body.classList.toggle("menu-open", localStorage.getItem(storageKey) !== "true");
        } else {
          body.classList.remove("menu-open");
        }
      }
    }

    if (isDesktop) {
      body.classList.toggle("menu-open", localStorage.getItem(storageKey) !== "true");
    }

    if (burger) {
      burger.addEventListener("click", () => {
        body.classList.toggle("menu-open");
        if (isDesktop) {
          localStorage.setItem(storageKey, String(!body.classList.contains("menu-open")));
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") body.classList.remove("menu-open");
    });

    window.addEventListener("resize", updateHeaderHeight);
    window.addEventListener("resize", syncMenuState);
    updateHeaderHeight();
    syncMenuState();

    // 3) ПОСЛЕ menu.html — footer
    initStickyFooter();
  } catch (e) {
    console.error("[UPGR] load-layout.js fatal error:", e);
  }
})();
