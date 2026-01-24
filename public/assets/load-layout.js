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
