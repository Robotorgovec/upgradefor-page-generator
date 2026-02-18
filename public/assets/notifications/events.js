import { SELECTORS, STORAGE_KEYS } from './constants.js';

export function bindNotificationEvents({
  trigger,
  overlay,
  store,
  persistDismissed,
  refreshTopNotice,
  onChange,
}) {
  const { panel, close, open } = overlay;

  const closePanel = () => {
    store.state.isOpen = false;
    close();
    trigger.setAttribute('aria-expanded', 'false');
  };

  const openPanel = () => {
    store.state.isOpen = true;
    open();
    trigger.setAttribute('aria-expanded', 'true');
  };

  window.addEventListener('storage', (event) => {
    if (
      event.key === STORAGE_KEYS.topNoticeDismissed ||
      event.key === STORAGE_KEYS.dismissedNotifications
    ) {
      refreshTopNotice();
      onChange();
    }
  });

  window.addEventListener('upgr:topnotice-dismissed', () => {
    refreshTopNotice();
    onChange();
  });

  trigger.addEventListener('click', (event) => {
    event.preventDefault();

    if (store.state.isOpen) {
      closePanel();
      return;
    }

    openPanel();
  });

  panel.addEventListener('click', (event) => {
    const dismissBtn = event.target.closest('[data-dismiss-id]');
    if (dismissBtn) {
      const id = dismissBtn.getAttribute('data-dismiss-id');
      if (id && !store.state.dismissedIds.includes(id)) {
        store.state.dismissedIds.push(id);
        persistDismissed();
        onChange();

        if (store.computeDerived().showEmpty) closePanel();
      }
      return;
    }

    if (!event.target.closest(SELECTORS.panelInner)) closePanel();
  });

  document.addEventListener('click', (event) => {
    const clickedInside = panel.contains(event.target);
    const clickedTrigger = trigger.contains(event.target);
    if (store.state.isOpen && !clickedInside && !clickedTrigger) closePanel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && store.state.isOpen) closePanel();
  });
}
