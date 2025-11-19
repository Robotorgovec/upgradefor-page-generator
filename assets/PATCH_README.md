
# Patch — подключение upgr-menu-toggle (кнопка 30% меньше)

## 1) Скопируйте файлы
Положите **оба** файла в репозиторий по пути:
```
docs/assets/upgr-toggle.css
docs/assets/upgr-toggle.js
```
> Важно: сайт на GitHub Pages собирается из папки `docs`, поэтому `assets` должны лежать внутри `docs/`.

## 2) Подключите файлы в <head> (обе страницы)
Перед `</head>` вставьте:
```html
<link rel="stylesheet" href="assets/upgr-toggle.css">
<style>.menu-toggle{display:none!important}</style>
<script defer src="assets/upgr-toggle.js"></script>
```

## 3) Добавьте кнопку сразу после <body> (обе страницы)
```html
<button id="upgrMenuBtn" class="upgr-menu-toggle" type="button"
        aria-label="Открыть меню" aria-controls="upgrSide" aria-expanded="false">
  <span class="upgr-icon-burger" aria-hidden="true">
    <span class="hlines"><i></i><i></i><i></i></span>
    <span class="divider"></span>
  </span>
  <span class="upgr-icon-close" aria-hidden="true"></span>
</button>
```

## 4) Привяжите левое меню и фон
Найдите блок левого меню:
```html
<aside class="left-menu">
  ...
</aside>
```
Замените на:
```html
<aside id="upgrSide" class="left-menu" role="navigation"
       aria-label="Главное меню" aria-hidden="true">
  ...
</aside>
<div class="upgr-backdrop"></div>
```

После этого кнопка будет работать, а вся геометрия уменьшена на ~30%.
