(function () {
  "use strict";

  if (window.location.pathname !== "/") {
    return;
  }

  const STORAGE_KEY = "userTheme";
  const THEMES = [
    { key: "red", label: "Воскресенье", primary: "#F25F6B", soft: "#FEE2E2", bg: "#FFF5F5" },
    { key: "orange", label: "Понедельник", primary: "#F4A259", soft: "#FFEDD5", bg: "#FFF7ED" },
    { key: "yellow", label: "Вторник", primary: "#E6C95A", soft: "#FEF9C3", bg: "#FEFCE8" },
    { key: "green", label: "Среда", primary: "#63CA84", soft: "#DCFCE7", bg: "#F0FDF4" },
    { key: "brand-blue", label: "Четверг", primary: "#12AFF0", soft: "#E6F7FF", bg: "#F5FCFF" },
    { key: "indigo", label: "Пятница", primary: "#7187E8", soft: "#DBEAFE", bg: "#EFF6FF" },
    { key: "purple", label: "Суббота", primary: "#8C79E8", soft: "#EDE9FE", bg: "#F5F3FF" },
  ];
  const WEEK_CYCLE = ["red", "orange", "yellow", "green", "brand-blue", "indigo", "purple"];
  const themeByKey = new Map(THEMES.map((theme) => [theme.key, theme]));

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function applyTheme(themeKey, persist) {
    const theme = themeByKey.get(themeKey) || themeByKey.get("green");
    const root = document.documentElement;

    root.dataset.theme = theme.key;
    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-primary-hover", theme.primary);
    root.style.setProperty("--theme-primary-active", theme.primary);
    root.style.setProperty("--theme-secondary-accent", theme.primary);
    root.style.setProperty("--theme-soft-bg", theme.bg);
    root.style.setProperty("--theme-soft-bg-strong", theme.soft);
    root.style.setProperty("--theme-border", theme.soft);
    root.style.setProperty("--theme-border-strong", theme.soft);
    root.style.setProperty("--theme-chip-bg", theme.soft);
    root.style.setProperty("--theme-chip-border", theme.soft);
    root.style.setProperty("--theme-card-accent", theme.soft);
    root.style.setProperty("--theme-link", theme.primary);
    root.style.setProperty("--theme-link-hover", theme.primary);
    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--btn-primary-bg", theme.primary);
    root.style.setProperty("--btn-primary-bg-hover", theme.primary);
    root.style.setProperty("--btn-primary-bg-active", theme.primary);
    root.style.setProperty("--btn-primary-border", theme.primary);
    root.style.setProperty("--focus-ring", "rgba(18, 175, 240, 0.28)");

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, theme.key);
      } catch (error) {
        void error;
      }
    }

    qsa("[data-theme-switch]").forEach((switchNode) => {
      const trigger = qs(".theme-switch-trigger", switchNode);
      const dot = qs(".theme-dot", switchNode);

      if (trigger) {
        trigger.setAttribute("aria-label", "Тема дня. Сейчас " + theme.label);
      }

      if (dot) {
        dot.style.background = theme.primary;
        dot.style.boxShadow = "0 0 0 2px " + theme.primary + "47";
      }

      qsa("[data-theme]", switchNode).forEach((item) => {
        item.setAttribute("aria-checked", item.getAttribute("data-theme") === theme.key ? "true" : "false");
      });
    });
  }

  function renderThemeOptions() {
    qsa("[data-theme-switch-options]").forEach((container) => {
      if (container.childElementCount > 0) {
        return;
      }

      container.innerHTML = THEMES.map((theme) => {
        return (
          '<button type="button" class="theme-switch-item" role="menuitemradio" data-theme="' +
          theme.key +
          '" aria-checked="false" aria-label="' +
          theme.label +
          '">' +
          '<span class="theme-switch-item-content">' +
          '<span class="theme-switch-item-swatch" aria-hidden="true" style="--theme-switch-swatch: ' +
          theme.primary +
          ';"></span>' +
          '<span class="theme-switch-item-label">' +
          theme.label +
          "</span>" +
          "</span>" +
          "</button>"
        );
      }).join("");
    });
  }

  function closeThemeMenus() {
    qsa("[data-theme-switch]").forEach((switchNode) => {
      switchNode.classList.remove("is-open");
      const trigger = qs(".theme-switch-trigger", switchNode);
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupThemeSwitches() {
    qsa("[data-theme-switch]").forEach((switchNode) => {
      const trigger = qs(".theme-switch-trigger", switchNode);
      const options = qs("[data-theme-switch-options]", switchNode);

      if (trigger) {
        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          const isOpen = switchNode.classList.contains("is-open");
          closeThemeMenus();
          if (!isOpen) {
            switchNode.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
          }
        });
      }

      if (options) {
        options.addEventListener("click", function (event) {
          const target = event.target.closest("[data-theme]");
          if (!target) {
            return;
          }

          const themeKey = target.getAttribute("data-theme");
          if (!themeKey) {
            return;
          }

          applyTheme(themeKey, true);
          closeThemeMenus();
        });
      }
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-theme-switch]")) {
        return;
      }
      closeThemeMenus();
    });
  }

  function setupNotifications() {
    qsa("[data-notifications-trigger]").forEach((trigger) => {
      trigger.setAttribute("aria-label", "Уведомления: 1");
    });

    qsa("[data-notification-badge]").forEach((badge) => {
      badge.hidden = false;
      badge.textContent = "1";
    });
  }

  function getInitialTheme() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && themeByKey.has(stored)) {
        return stored;
      }
    } catch (error) {
      void error;
    }

    return WEEK_CYCLE[new Date().getDay()] || "green";
  }

  function init() {
    document.body.classList.add("is-home");
    renderThemeOptions();
    setupThemeSwitches();
    setupNotifications();
    applyTheme(getInitialTheme(), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
