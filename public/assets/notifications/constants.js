export const STORAGE_KEYS = {
  dismissedNotifications: 'ui.dismissedNotifications',
  topNoticeDismissed: 'upgr_home_notice_dismissed',
};

export const IDS = {
  duplicateTopNoticeNotification: 'beta-2026-02',
};

export const TEXT = {
  empty: 'Нет новых уведомлений',
  topNoticeMarker: 'Новый сервис. Публикуем статус разделов',
};

export const SELECTORS = {
  trigger: '[data-notifications-trigger="true"]',
  badge: '[data-notification-badge]',
  panel: '[data-notifications-panel]',
  list: '[data-notifications-list]',
  panelInner: '.notifications-panel',
  topNoticeSlot: '[data-top-notice-slot="true"]',
  topNoticeCandidates:
    '[data-debug="TOPNOTICE"], [data-top-notice="true"], [data-topnotice="true"], .top-notice, [data-component="TopNotice"], [class*="TopNotice_notice"]',
  topNoticeExclude:
    '[data-notifications-panel], .notifications-overlay, .notice.notice--beta',
};
