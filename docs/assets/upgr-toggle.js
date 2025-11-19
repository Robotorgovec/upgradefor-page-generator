
/* UpgradeFor — universal menu toggle controller */
(function(){
  var btn = document.getElementById('upgrMenuBtn');
  if(!btn){ return; }
  var body = document.body;
  var side = document.getElementById('upgrSide');
  var backdrop = document.querySelector('.upgr-backdrop');

  function setOpen(open){
    btn.setAttribute('aria-expanded', String(open));
    body.classList.toggle('upgr-menu-open', open);
    if(side){ side.setAttribute('aria-hidden', String(!open)); }
  }

  btn.addEventListener('click', function(){
    var open = btn.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  });

  if(backdrop){
    backdrop.addEventListener('click', function(){ setOpen(false); });
  }

  // Закрытие по Esc
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ setOpen(false); }
  });
})();
