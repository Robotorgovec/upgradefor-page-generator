import { TEXT } from './constants.js';

export function render(listEl, activeJs, showEmpty) {
  if (!listEl) return;

  if (showEmpty) {
    listEl.innerHTML = `<div class="notification-empty">${TEXT.empty}</div>`;
    return;
  }

  listEl.innerHTML = activeJs
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
