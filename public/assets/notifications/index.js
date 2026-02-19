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

const STORAGE_KEY = 'upgr.notifications.v1';

function getSeedNotifications() {
  return [
    {
      id: 'beta-announce',
      title: 'BETA',
      text: 'Новый сервис. Публикуем статус разделов, план развития и журнал изменений — ваши идеи помогают расставлять приоритеты.',
      dismissed: false,
      createdAtIso: new Date().toISOString(),
    },
  ];
}

function loadNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((item) => item && typeof item.id === 'string');
    }
  } catch {
    // ignore broken storage
  }

  const seed = getSeedNotifications();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function persistNotifications(notifications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function initNotificationsModule() {
  const trigger = qs('[data-notifications-trigger="true"]');
  if (!trigger) return;

  const appContent = qs('.app-content');
  if (!appContent) return;

  const badge = trigger.querySelector('[data-notification-badge]');
  let notifications = loadNotifications();

  let panel = document.querySelector('[data-notifications-panel]');
  if (!panel) {
    panel = createEl('section', 'notifications-overlay', {
      'data-notifications-panel': 'true',
      'aria-label': 'Уведомления',
      hidden: 'true',
    });
    panel.innerHTML = '<div class="notifications-sheet"><div class="notifications-panel wrap"><div class="notifications-popover-head"><strong>Уведомления</strong><button class="notifications-close" type="button" aria-label="Закрыть уведомления">×</button></div><div data-notifications-list></div></div></div>';
    appContent.insertBefore(panel, appContent.firstChild);
  }

  panel.style.pointerEvents = 'none';

  const listEl = panel.querySelector('[data-notifications-list]');

  const getVisible = () => notifications.filter((item) => !item.dismissed);
  const getActiveCount = () => getVisible().length;

  const closePanel = () => {
    panel.setAttribute('hidden', 'true');
    panel.style.pointerEvents = 'none';
    trigger.setAttribute('aria-expanded', 'false');
  };

  const dismissNotification = (id) => {
    notifications = notifications.map((item) =>
      item.id === id ? { ...item, dismissed: true } : item
    );
    persistNotifications(notifications);
  };

  const render = () => {
    const visible = getVisible();
    const activeCount = getActiveCount();

    if (badge) {
      badge.hidden = activeCount === 0;
      badge.textContent = '';
    }

    trigger.setAttribute(
      'aria-label',
      activeCount > 0 ? `Уведомления: ${activeCount}` : 'Уведомления'
    );

    if (!listEl) return;

    if (visible.length === 0) {
      listEl.innerHTML = '<div class="notification-empty">Нет новых уведомлений</div>';
      return;
    }

    listEl.innerHTML = visible
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
              <button class="notice__close" type="button" aria-label="Скрыть уведомление" data-dismiss-id="${item.id}">×</button>
            </article>`
      )
      .join('');
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) {
      panel.removeAttribute('hidden');
      panel.style.pointerEvents = 'auto';
      trigger.setAttribute('aria-expanded', 'true');
      render();
      return;
    }

    closePanel();
  });

  panel.addEventListener('click', (event) => {
    const dismissBtn = event.target.closest('[data-dismiss-id]');
    if (dismissBtn) {
      const id = dismissBtn.getAttribute('data-dismiss-id');
      if (id) {
        dismissNotification(id);
        render();
      }
      return;
    }

    if (event.target.closest('.notifications-close')) {
      closePanel();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hasAttribute('hidden')) closePanel();
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    notifications = loadNotifications();
    render();
  });

  render();
}
