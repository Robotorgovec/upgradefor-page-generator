(async function() {
  async function fetchAndInsert(url, selector) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const html = await res.text();
        const container = document.querySelector(selector);
        if (container) {
          container.innerHTML = html;
        }
      }
    } catch (err) {
      console.error('Error loading', url, err);
    }
  }

  await fetchAndInsert('/includes/header.html', 'header');
  await fetchAndInsert('/includes/menu.html', '.sidebar');

  // Set up burger toggling and header height after insertion
  const body = document.body;
  const burger = document.getElementById('burgerBtn');
  const root = document.documentElement;
  const headerEl = document.querySelector('header');

  function updateHeaderHeight() {
    if (!headerEl) return;
    const h = headerEl.offsetHeight;
    root.style.setProperty('--header-height', h + 'px');
  }

  if (burger) {
    burger.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      body.classList.remove('menu-open');
    }
  });

  window.addEventListener('load', updateHeaderHeight);
  window.addEventListener('resize', updateHeaderHeight);
  updateHeaderHeight();
})();
