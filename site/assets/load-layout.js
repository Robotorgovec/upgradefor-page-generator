(async function() {
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

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

  function initNotifications() {
    function isTopNoticePresent() {
      const topNoticeSelectors = [
        '[data-debug="TOPNOTICE"]',
        '[data-top-notice="true"]',
        '[data-topnotice="true"]',
        '.top-notice',
        '[data-component="TopNotice"]',
      ];

      for (const selector of topNoticeSelectors) {
        const el = qs(selector);
        if (el && !el.closest('[data-notifications-panel]')) return true;
      }

      const textMarker = 'Новый сервис. Публикуем статус разделов';
      const textCandidates = document.querySelectorAll('p, div, span, article, section');

      for (const candidate of textCandidates) {
        const text = candidate.textContent || '';
        if (!text.includes(textMarker)) continue;

        const isNotificationsBanner = candidate.closest(
          '[data-notifications-panel], .notifications-overlay, .notice.notice--beta'
        );
        if (isNotificationsBanner) continue;

        const cardContainer = candidate.closest(
          '[data-debug="TOPNOTICE"], [data-top-notice="true"], [data-topnotice="true"], [data-component="TopNotice"], .top-notice, [class*="TopNotice_notice"]'
        );
        if (cardContainer) return true;
      }

      return false;
    }

    const trigger = qs('[data-notifications-trigger="true"]');
    if (!trigger) return;
    const appContent = qs('.app-content');
    if (!appContent) return;

    const storageKey = 'ui.dismissedNotifications';
    const notifications = [
      {
        id: 'beta-2026-02',
        title: 'BETA',
        text: 'Новый сервис. Публикуем статус разделов, план развития и журнал изменений — ваши идеи помогают расставлять приоритеты.',
        type: 'info',
        createdAt: '2026-02-01',
      },
    ];

    const badge = trigger.querySelector('[data-notification-badge]');
    let panel = document.querySelector('[data-notifications-panel]');

    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'notifications-overlay';
      panel.setAttribute('data-notifications-panel', 'true');
      panel.setAttribute('aria-label', 'Уведомления');
      panel.setAttribute('hidden', 'true');
      panel.innerHTML = '<div class="notifications-sheet"><div class="notifications-panel wrap" data-notifications-list></div></div>';
      appContent.insertBefore(panel, appContent.firstChild);
    }

    const listEl = panel.querySelector('[data-notifications-list]');
    let dismissedIds = [];

    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      dismissedIds = Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch (err) {
      dismissedIds = [];
    }

    function getActiveNotifications() {
      const topNoticePresent = isTopNoticePresent();

      return notifications.filter((item) => {
        if (dismissedIds.includes(item.id)) return false;
        if (topNoticePresent && item.id === 'beta-2026-02') return false;
        return true;
      });
    }

    function persistDismissed() {
      localStorage.setItem(storageKey, JSON.stringify(dismissedIds));
    }

    function closePanel() {
      panel.setAttribute('hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function render() {
      const active = getActiveNotifications();

      if (badge) {
        if (active.length > 0) {
          badge.hidden = false;
          badge.textContent = String(active.length);
        } else {
          badge.hidden = true;
          badge.textContent = '';
        }
      }

      if (!listEl) return;

      if (!active.length) {
        listEl.innerHTML = '<div class="notification-empty">Нет новых уведомлений</div>';
        return;
      }

      listEl.innerHTML = active
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
              <button class="notice__close" type="button" aria-label="Закрыть уведомление" data-dismiss-id="${item.id}">×</button>
            </article>`
        )
        .join('');
    }

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      if (panel.hasAttribute('hidden')) {
        panel.removeAttribute('hidden');
        trigger.setAttribute('aria-expanded', 'true');
      } else {
        closePanel();
      }
    });

    panel.addEventListener('click', function (event) {
      const dismissBtn = event.target.closest('[data-dismiss-id]');
      if (dismissBtn) {
        const id = dismissBtn.getAttribute('data-dismiss-id');
        if (id && !dismissedIds.includes(id)) {
          dismissedIds.push(id);
          persistDismissed();
          render();
          if (!getActiveNotifications().length) {
            closePanel();
          }
        }
        return;
      }

      if (!event.target.closest('.notifications-panel')) {
        closePanel();
      }
    });

    document.addEventListener('click', function (event) {
      const clickedInside = panel.contains(event.target);
      const clickedTrigger = trigger.contains(event.target);
      if (!panel.hasAttribute('hidden') && !clickedInside && !clickedTrigger) {
        closePanel();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hasAttribute('hidden')) {
        closePanel();
      }
    });

    render();
  }

  await fetchAndInsert('/includes/header.html', 'header');
  await fetchAndInsert('/includes/menu.html', '.sidebar');

  // Set up burger toggling and header height after insertion
  const body = document.body;
  const burger = document.getElementById('burgerBtn');
  const root = document.documentElement;
  const headerEl = document.querySelector('header');
  const authButtonsEl = headerEl?.querySelector('.auth-buttons') ?? null;

  initNotifications();

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
