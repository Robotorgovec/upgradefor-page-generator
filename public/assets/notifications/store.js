import { IDS } from './constants.js';

export function createNotificationsStore({
  jsNotifications = [],
  dismissedIds = [],
  topNoticeVisible = false,
  topNoticePresent = false,
  isOpen = false,
} = {}) {
  const state = {
    jsNotifications,
    dismissedIds,
    topNoticeVisible,
    topNoticePresent,
    isOpen,
  };

  const computeDerived = () => {
    const activeJs = state.jsNotifications.filter((item) => {
      if (state.dismissedIds.includes(item.id)) return false;
      if (state.topNoticePresent && item.id === IDS.duplicateTopNoticeNotification) return false;
      return true;
    });

    const hasTopNotice = state.topNoticePresent && state.topNoticeVisible;
    const activeCount = activeJs.length + (hasTopNotice ? 1 : 0);
    const showEmpty = !hasTopNotice && activeJs.length === 0;

    return { activeJs, hasTopNotice, activeCount, showEmpty };
  };

  return {
    state,
    computeDerived,
  };
}
