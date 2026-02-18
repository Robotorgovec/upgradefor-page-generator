let badgeEl = null;

export function setBadgeElement(element) {
  badgeEl = element;
}

export function updateBadge(count) {
  if (!badgeEl) return;

  if (count > 0) {
    badgeEl.hidden = false;
    badgeEl.textContent = String(count);
    return;
  }

  badgeEl.hidden = true;
  badgeEl.textContent = '';
}
