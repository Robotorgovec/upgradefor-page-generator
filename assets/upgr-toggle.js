(function(){
  const btn = document.getElementById('upgrMenuBtn');
  const side = document.getElementById('upgrSide');
  const backdrop = document.querySelector('.upgr-backdrop');
  let lastFocused;

  function openMenu() {
    btn.setAttribute('aria-expanded','true');
    if (side) {
      side.setAttribute('aria-hidden','false');
      side.inert = false;
    }
    document.body.classList.add('upgr-menu-open');
    lastFocused = document.activeElement;
    if (side) {
      const focusable = side.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if(focusable.length) {
        focusable[0].focus();
      }
    }
  }

  function closeMenu() {
    btn.setAttribute('aria-expanded','false');
    if (side) {
      side.setAttribute('aria-hidden','true');
      side.inert = true;
    }
    document.body.classList.remove('upgr-menu-open');
    if (lastFocused) {
      lastFocused.focus();
    }
  }

  if(!btn) return;
  if (side) {
    side.setAttribute('aria-hidden','true');
    side.inert = true;
  }

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
      if(btn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    }
  });

  if (side) {
    side.addEventListener('keydown', (e) => {
      if(e.key === 'Tab') {
        const focusable = side.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if(focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if(e.shiftKey) {
          if(document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if(document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

})();
