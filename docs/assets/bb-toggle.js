// bb-toggle.js — логика плавающей кнопки бокового меню
(function () {
  const btn = document.querySelector('.bb-toggle-panel');
  const menu = document.getElementById('upgrSide');
  const backdrop = document.querySelector('.upgr-backdrop');
  if (!btn || !menu) return;

  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('upgr-menu-open');
  }

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('upgr-menu-open');
  }

  function toggleMenu(e) {
    e.preventDefault();
    if (btn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    } else {
      openMenu();
    }
  }

  btn.addEventListener('click', toggleMenu);

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
})();
