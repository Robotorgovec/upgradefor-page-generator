import { SELECTORS } from './constants.js';

export function createOverlay(appContent) {
  let panel = document.querySelector(SELECTORS.panel);

  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'notifications-overlay';
    panel.setAttribute('data-notifications-panel', 'true');
    panel.setAttribute('aria-label', 'Уведомления');
    panel.setAttribute('hidden', 'true');
    panel.style.pointerEvents = 'none';
    panel.innerHTML =
      '<div class="notifications-sheet"><div class="notifications-panel wrap"><div data-top-notice-slot="true"></div><div data-notifications-list></div></div></div>';
    appContent.insertBefore(panel, appContent.firstChild);
  }

  const listEl = panel.querySelector(SELECTORS.list);

  const open = () => {
    panel.removeAttribute('hidden');
    panel.style.pointerEvents = 'auto';
  };

  const close = () => {
    panel.setAttribute('hidden', 'true');
    panel.style.pointerEvents = 'none';
  };

  return { panel, listEl, open, close };
}
