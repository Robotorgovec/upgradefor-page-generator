(async function() {
  async function fetchAndInsert(url, selector) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const html = await res.text();
        const container = document.querySelector(selector);
        if (container) {
          container.innerHTML = html;
        }
      }
    } catch (err) {
      console.error('Error loading', url, err);
    }
  }

  await fetchAndInsert('/includes/header.html', 'header');
  await fetchAndInsert('/includes/menu.html', '.sidebar');

  // Set up burger toggling and header height after insertion
  const body = document.body;
  const burger = document.getElementById('burgerBtn');
  const root = document.documentElement;
  const headerEl = document.querySelector('header');
  const authButtonsEl = headerEl?.querySelector('.auth-buttons') ?? null;

  async function updateAuthButtons() {
    if (!authButtonsEl) return;

    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (!res.ok) return;

      const session = await res.json();
      const isAuthenticated = Boolean(session?.user);

      if (!isAuthenticated) {
        return;
      }

      let hasProfileRoute = false;
      try {
        const profileRes = await fetch('/account/profile', { method: 'HEAD', credentials: 'include' });
        hasProfileRoute = profileRes.ok;
      } catch (error) {
        hasProfileRoute = false;
      }

      authButtonsEl.innerHTML = `
        <a class="btn btn--ghost" href="/account" rel="nofollow">Account</a>
        ${hasProfileRoute ? '<a class="btn" href="/account/profile" rel="nofollow">Profile</a>' : ''}
      `;
    } catch (err) {
      console.error('Error loading auth session', err);
    }
  }

  function updateHeaderHeight() {
    if (!headerEl) return;
    const h = headerEl.offsetHeight;
    root.style.setProperty('--header-height', h + 'px');
  }

  const desktopBreakpoint = 1200;
  const collapsedStorageKey = 'upgr-sidebar-collapsed';
  let isDesktop = window.innerWidth >= desktopBreakpoint;

  function getCollapsedPreference() {
    return localStorage.getItem(collapsedStorageKey) === 'true';
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
        body.classList.toggle('menu-open', !preferCollapsed);
      } else {
        body.classList.remove('menu-open');
      }
    }
  }

  if (isDesktop) {
    const preferCollapsed = getCollapsedPreference();
    body.classList.toggle('menu-open', !preferCollapsed);
  } else {
    body.classList.remove('menu-open');
  }

  if (burger) {
    burger.addEventListener('click', function () {
      const nowDesktop = window.innerWidth >= desktopBreakpoint;
      if (nowDesktop) {
        body.classList.toggle('menu-open');
        setCollapsedPreference(!body.classList.contains('menu-open'));
        return;
      }
      body.classList.toggle('menu-open');
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      body.classList.remove('menu-open');
    }
  });

  window.addEventListener('load', updateHeaderHeight);
  window.addEventListener('resize', updateHeaderHeight);
  window.addEventListener('resize', syncMenuState);
  updateHeaderHeight();
  syncMenuState();
  await updateAuthButtons();
})();

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

  function findSidebarRoot() {
    return qs('aside.sidebar') || qs('.sidebar');
  }

  function hasMenuContent(root) {
    return Boolean(root.querySelector('.sidebar-inner, .menu-item, .sidebar-section-label, .menu'));
  }

  function ensureSidebarStructure(root) {
    let scroll = qs('.sidebar-scroll', root);
    let footer = qs('.sidebar-footer', root);
    if (scroll && footer) return { scroll, footer };

    scroll = scroll || createEl('div', 'sidebar-scroll');
    footer = footer || createEl('div', 'sidebar-footer');

    const children = Array.from(root.children);
    for (const child of children) {
      if (child === scroll || child === footer) continue;
      if (child.classList && (child.classList.contains('sidebar-scroll') || child.classList.contains('sidebar-footer'))) {
        continue;
      }
      scroll.appendChild(child);
    }

    if (!scroll.parentElement) root.appendChild(scroll);
    if (!footer.parentElement) root.appendChild(footer);

    root.appendChild(footer);

    return { scroll, footer };
  }

  async function getSessionSafe() {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return data && data.user ? data : null;
    } catch {
      return null;
    }
  }

  function renderFooter(footer, session) {
    footer.innerHTML = '';

    const title = createEl('div', 'sidebar-footer-title');
    title.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">account_circle</span>' +
      '<span>Аккаунт</span>';
    footer.appendChild(title);

    const list = createEl('div', 'sidebar-footer-actions');

    if (!session) {
      const login = createEl('a', 'menu-item sidebar-footer-item', { href: '/account/login' });
      login.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">login</span>' +
        '<span>Войти</span>';

      const register = createEl('a', 'menu-item sidebar-footer-item', { href: '/account/register' });
      register.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">person_add</span>' +
        '<span>Регистрация</span>';

      list.appendChild(login);
      list.appendChild(register);
    } else {
      const account = createEl('a', 'menu-item sidebar-footer-item', { href: '/account' });
      account.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">person</span>' +
        '<span>Мой аккаунт</span>';

      const logout = createEl('button', 'menu-item sidebar-footer-item sidebar-footer-logout', { type: 'button' });
      logout.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">logout</span>' +
        '<span>Выйти</span>';

      logout.addEventListener('click', () => {
        window.location.href = '/api/auth/signout?callbackUrl=/';
      });

      list.appendChild(account);
      list.appendChild(logout);
    }

    footer.appendChild(list);
  }

  function setup() {
    const root = findSidebarRoot();
    if (!root) return false;
    if (!hasMenuContent(root)) return false;

    const { footer } = ensureSidebarStructure(root);

    renderFooter(footer, null);

    getSessionSafe().then((session) => {
      const root2 = findSidebarRoot();
      if (!root2) return;
      const { footer: footer2 } = ensureSidebarStructure(root2);
      renderFooter(footer2, session);
    });

    return true;
  }

  if (setup()) return;

  const mo = new MutationObserver(() => {
    if (setup()) mo.disconnect();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
