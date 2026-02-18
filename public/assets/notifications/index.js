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

export function initNotificationsModule() {
  const trigger = qs('[data-notifications-trigger="true"]');
  if (!trigger) return;
  const appContent = qs('.app-content');
  if (!appContent) return;

  const topNoticeStorageKey = 'upgr_home_notice_dismissed';
  const storageKey = 'ui.dismissedNotifications';
  const notifications = [];

  const badge = trigger.querySelector('[data-notification-badge]');
  let panel = document.querySelector('[data-notifications-panel]');
  if (!panel) {
    panel = createEl('section', 'notifications-overlay', {
      'data-notifications-panel': 'true',
      'aria-label': 'Уведомления',
      hidden: 'true',
    });
    panel.innerHTML = '<div class="notifications-sheet"><div class="notifications-panel wrap"><div data-top-notice-slot="true"></div><div data-notifications-list></div></div></div>';
    appContent.insertBefore(panel, appContent.firstChild);
  }
  panel.style.pointerEvents = 'none';

  const listEl = panel.querySelector('[data-notifications-list]');
  let dismissedIds = [];

  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
    dismissedIds = Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    dismissedIds = [];
  }

  const isTopNoticeVisible = () => localStorage.getItem(topNoticeStorageKey) !== '1';

  const getActive = () => {
    const topNoticePresent = isTopNoticePresent();

    return notifications.filter((item) => {
      if (dismissedIds.includes(item.id)) return false;
      if (topNoticePresent && item.id === 'beta-2026-02') return false;
      return true;
    });
  };

  const persistDismissed = () => {
    localStorage.setItem(storageKey, JSON.stringify(dismissedIds));
  };

  const closePanel = () => {
    panel.setAttribute('hidden', 'true');
    panel.style.pointerEvents = 'none';
    trigger.setAttribute('aria-expanded', 'false');
  };

  const render = () => {
    const active = getActive();
    const hasTopNotice = isTopNoticeVisible() && isTopNoticePresent();

    const topNoticeCount = hasTopNotice ? 1 : 0;
    const activeCount = active.length + topNoticeCount;
    const showEmpty = activeCount === 0;

    if (badge) {
      if (activeCount > 0) {
        badge.hidden = false;
        badge.textContent = String(activeCount);
      } else {
        badge.hidden = true;
        badge.textContent = '';
      }
    }

    if (!listEl) return;
    if (!active.length) {
      if (showEmpty) {
        listEl.hidden = false;
        listEl.innerHTML = '<div class="notification-empty">Нет новых уведомлений</div>';
      } else {
        listEl.hidden = true;
        listEl.innerHTML = '';
      }
      return;
    }

    listEl.hidden = false;

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
  };

  window.addEventListener('storage', (event) => {
    if (event.key === topNoticeStorageKey || event.key === storageKey) {
      render();
    }
  });

  window.addEventListener('upgr:topnotice-dismissed', render);

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) {
      panel.removeAttribute('hidden');
      panel.style.pointerEvents = 'auto';
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      closePanel();
    }
  });

  panel.addEventListener('click', (event) => {
    const dismissBtn = event.target.closest('[data-dismiss-id]');
    if (dismissBtn) {
      const id = dismissBtn.getAttribute('data-dismiss-id');
      if (id && !dismissedIds.includes(id)) {
        dismissedIds.push(id);
        persistDismissed();
        render();
        if (!getActive().length) closePanel();
      }
      return;
    }
    if (!event.target.closest('.notifications-panel')) closePanel();
  });

  document.addEventListener('click', (event) => {
    const clickedInside = panel.contains(event.target);
    const clickedTrigger = trigger.contains(event.target);
    if (!panel.hasAttribute('hidden') && !clickedInside && !clickedTrigger) closePanel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hasAttribute('hidden')) closePanel();
  });

  render();
}
