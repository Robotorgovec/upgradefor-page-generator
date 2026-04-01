(function () {
  "use strict";

  const HOMEPAGE_PATH = "/";
  const DESKTOP_BREAKPOINT = 1200;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setText(node, text) {
    if (node) node.textContent = text;
  }

  function localizeHeader() {
    setText(qs('header .auth-actions a[href="/account/login"]'), "Войти");
    setText(qs('header .auth-actions a[href="/account/register"]'), "Создать аккаунт");
    setText(qs('header .auth-actions a[href="/account"]'), "Аккаунт");
    setText(qs('header .auth-actions a[href="/account/profile"]'), "Профиль");

    const burger = qs("header .burger");
    if (burger) burger.setAttribute("aria-label", "Открыть меню");

    const overlay = qs(".sidebar-overlay");
    if (overlay) overlay.setAttribute("aria-label", "Закрыть меню");
  }

  function localizeSidebar() {
    const titleMap = ["Навигация", "Сервисы", "WikiMarket"];
    qsa(".sidebar .sidebar-section-title").forEach((title, index) => {
      if (titleMap[index]) title.textContent = titleMap[index];
    });

    const linkMap = new Map([
      ["/", "Главная"],
      ["/catalog", "Каталог"],
      ["/account", "Аккаунт"],
      ["/messages", "Сообщения"],
      ["/assistant", "ИИ-ассистент"],
      ["/wikimarket/categories", "Категории"],
      ["/wikimarket/domains/fio-rus", "Домены"],
    ]);

    qsa(".sidebar a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (linkMap.has(href)) {
        link.textContent = linkMap.get(href);
      }
    });

    setText(qs(".sidebar button.sidebar-link"), "Свернуть меню");
  }

  function syncMenuClass() {
    const appShell = qs(".app-shell");
    if (!appShell) return;

    const isOpen = appShell.getAttribute("data-sidebar-open") === "true";
    document.body.classList.toggle("menu-open", isOpen);
  }

  function closeHomepageDesktopSidebar() {
    if (window.location.pathname !== HOMEPAGE_PATH) return;
    if (window.innerWidth < DESKTOP_BREAKPOINT) return;

    const appShell = qs(".app-shell");
    const burger = qs("header .burger");
    if (!appShell || !burger) return;

    if (appShell.getAttribute("data-sidebar-open") === "true") {
      burger.click();
      return;
    }

    document.body.classList.remove("menu-open");
  }

  function observeShell() {
    const appShell = qs(".app-shell");
    if (!appShell) return;

    syncMenuClass();

    const observer = new MutationObserver(syncMenuClass);
    observer.observe(appShell, { attributes: true, attributeFilter: ["data-sidebar-open"] });
  }

  function init() {
    localizeHeader();
    localizeSidebar();
    observeShell();
    closeHomepageDesktopSidebar();

    let lastDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;

    window.addEventListener("resize", () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      if (isDesktop && !lastDesktop) {
        closeHomepageDesktopSidebar();
      }
      lastDesktop = isDesktop;
      syncMenuClass();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const burger = qs("header .burger");
      const appShell = qs(".app-shell");
      if (!burger || !appShell) return;

      if (appShell.getAttribute("data-sidebar-open") === "true") {
        burger.click();
      } else {
        document.body.classList.remove("menu-open");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
