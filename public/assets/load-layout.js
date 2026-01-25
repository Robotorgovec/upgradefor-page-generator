// ===== Sticky Account Footer (mobile sidebar) =====
(function initStickyAccountFooter() {
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function createEl(tag, className, attrs) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        el.setAttribute(k, String(v));
      });
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

  function ensureFooter(sidebar) {
    // ВАЖНО: НЕ трогаем .sidebar-inner (он уже скролл-контейнер)
    let footer = qs(":scope > .sidebar-footer", sidebar);
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

  function setup() {
    const sidebar = qs(".sidebar");
    if (!sidebar) return false;

    // меню должно быть уже вставлено и содержать .sidebar-inner
    const inner = qs(".sidebar-inner", sidebar);
    if (!inner) return false;

    const footer = ensureFooter(sidebar);
    renderFooter(footer, null);

    getSessionSafe().then((session) => {
      const sidebar2 = qs(".sidebar");
      if (!sidebar2) return;
      const inner2 = qs(".sidebar-inner", sidebar2);
      if (!inner2) return;
      const footer2 = ensureFooter(sidebar2);
      renderFooter(footer2, session);
    });

    return true;
  }

  // В вашем файле меню вставляется до этого блока, но на всякий:
  if (setup()) return;

  const mo = new MutationObserver(() => {
    if (setup()) mo.disconnect();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
