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
})();
