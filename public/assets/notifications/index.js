import { STORAGE_KEYS, SELECTORS, TEXT } from './constants.js';
import { createNotificationsStore } from './store.js';
import { createOverlay } from './overlay.js';
import { render } from './renderer.js';
import { bindNotificationEvents } from './events.js';
import { setBadgeElement, updateBadge } from './badge.js';

function isTopNoticePresent() {
  const selectors = SELECTORS.topNoticeCandidates.split(',').map((item) => item.trim());

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && !el.closest(SELECTORS.panel)) return true;
  }

  const textCandidates = document.querySelectorAll('p, div, span, article, section');
  for (const candidate of textCandidates) {
    const text = candidate.textContent || '';
    if (!text.includes(TEXT.topNoticeMarker)) continue;

    const isNotificationsBanner = candidate.closest(SELECTORS.topNoticeExclude);
    if (isNotificationsBanner) continue;

    const cardContainer = candidate.closest(SELECTORS.topNoticeCandidates);
    if (cardContainer) return true;
  }

  return false;
}

function isTopNoticeVisible() {
  return localStorage.getItem(STORAGE_KEYS.topNoticeDismissed) !== '1';
}

function loadDismissedIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.dismissedNotifications) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function initNotifications() {
  const trigger = document.querySelector(SELECTORS.trigger);
  if (!trigger) return;

  const appContent = document.querySelector('.app-content');
  if (!appContent) return;

  const overlay = createOverlay(appContent);
  const badge = trigger.querySelector(SELECTORS.badge);
  setBadgeElement(badge);

  const store = createNotificationsStore({
    jsNotifications: [],
    dismissedIds: loadDismissedIds(),
    topNoticeVisible: isTopNoticeVisible(),
    topNoticePresent: isTopNoticePresent(),
    isOpen: false,
  });

  const persistDismissed = () => {
    localStorage.setItem(
      STORAGE_KEYS.dismissedNotifications,
      JSON.stringify(store.state.dismissedIds)
    );
  };

  const refreshTopNotice = () => {
    store.state.topNoticeVisible = isTopNoticeVisible();
    store.state.topNoticePresent = isTopNoticePresent();
  };

  const renderState = () => {
    const { activeJs, activeCount, showEmpty } = store.computeDerived();
    render(overlay.listEl, activeJs, showEmpty);
    updateBadge(activeCount);
  };

  bindNotificationEvents({
    trigger,
    overlay,
    store,
    persistDismissed,
    refreshTopNotice,
    onChange: renderState,
  });

  renderState();
}
