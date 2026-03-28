# Архитектура `upgradefor-page-generator`

## Общее устройство проекта

`upgradefor-page-generator` - это Next.js-приложение на App Router (`app/`) с двумя типами страниц:

1. Нативные React/TypeScript-страницы, собранные из компонентов и локальных данных.
2. Страницы на основе готовых HTML-шаблонов из `public/`, которые подмешиваются в Next.js через `loadHtmlTemplate()`.

Дополнительно в репозитории есть отдельный сценарий публикации страниц в WordPress через `create-pages.js` и файл `pages.json`.

Ключевые каталоги:

- `app/` - маршруты Next.js, layout'ы, API routes, metadata.
- `components/` - переиспользуемые UI-компоненты и page-level компоненты.
- `public/` - статические HTML-шаблоны, ассеты, CSS, JS, изображения.
- `lib/` - серверные утилиты (`html-template`, auth, Prisma, mail и т.д.).
- `pages/` - набор локальных HTML-файлов и черновиков; в текущей структуре это не каталог маршрутов Next.js.
- `docs/` - проектная документация и файлы для публикации через GitHub Pages.
- `scripts/` - вспомогательные скрипты и тесты.
- `prisma/` - схема и генерация Prisma-клиента.

## Папка `app`

`app/` является главным слоем маршрутизации. Здесь каждая вложенная директория задает URL, а `page.tsx` формирует содержимое страницы.

Что лежит внутри:

- `app/layout.tsx` - корневой layout приложения: общий `<html>`, `<head>`, подключение `layout.css`, шапки, сайдбара и мобильной навигации.
- `app/page.tsx` - главная страница. Она загружает HTML из `public/index.html` через `lib/html-template.ts`.
- `app/account/**` - страницы аккаунта: вход, регистрация, восстановление, профиль.
- `app/api/**` - API routes Next.js (`route.ts`) для auth, профиля, аватаров, FIO share.
- `app/legal/**` - юридические страницы.
- `app/fio/[token]/page.tsx` - динамический маршрут с параметром `token`.
- `app/wikimarket/**` - основные продуктовые и контентные страницы WikiMarket.
- `app/heat-exchangers/page.tsx` и часть страниц в `app/wikimarket/**` используют HTML-шаблоны из `public/`.

Практический паттерн такой:

- если страница простая или исторически уже существует как HTML, `page.tsx` вызывает `loadHtmlTemplate(...)`;
- если страница развивается как продуктовый экран, `page.tsx` импортирует готовый React-компонент из `components/...` и задает `metadata`.

## Папка `components`

`components/` хранит всю визуальную композицию, вынесенную из маршрутов.

Основные зоны:

- `components/layout/` - глобальные элементы каркаса: `Header`, `Sidebar`, `MobileBottomNav`, служебные layout-компоненты.
- `components/wikimarket/` - тематические page-level компоненты для WikiMarket.
- `components/wikimarket/beauty/...` - страницы и секции для beauty-направления.
- `components/wikimarket/hvac/...` - страницы и блоки для HVAC-направления.

Типовой поток такой:

1. В `app/.../page.tsx` описывается маршрут и SEO-метаданные.
2. Страница импортирует один крупный page component из `components/...`.
3. Этот page component собирает экран из более мелких секций, CSS modules и data-файлов.

Пример:

- `app/wikimarket/beauty/bridal-makeup/page.tsx` отвечает за маршрут и JSON-LD.
- `components/wikimarket/beauty/bridal-makeup/BridalMakeupPage.tsx` собирает страницу.
- рядом лежат `data.ts`, CSS module и отдельные секции (`Hero`, `Faq`, `Cta`, `Toc` и т.д.).

## Папка `pages`

Каталог `pages/` в текущем проекте не используется как классический Pages Router Next.js. Внутри находятся отдельные HTML-файлы и локальные заготовки, например:

- `test-upgr.html`
- `upgradefor-mobile-header-menu-latest (1) (1).html`
- `UPGR_heat_exchangers_hub_all_types_v2 (1).html`

По структуре репозитория и проверенным импортам этот каталог выглядит как место для исходных HTML-черновиков, прототипов или экспортов, а не как активный слой маршрутизации. Реальные URL приложения формируются через `app/`.

## Как работает генерация страниц

В проекте есть несколько связанных механизмов генерации.

### 1. Генерация страницы внутри Next.js из HTML-шаблона

Файл `lib/html-template.ts` читает HTML из `public/...` и разбирает его на части:

- `mainHtml`
- встроенные `<style>`
- JSON-LD скрипты
- inline-скрипты
- `class` у `<body>`

Дальше маршрут из `app/` использует этот результат. Примеры:

- `app/page.tsx` рендерит `public/index.html`
- `app/wikimarket/hvac/heat-exchangers/page.tsx` рендерит `public/wikimarket/hvac/heat-exchangers/index.html`
- `app/wikimarket/domains/fio-rus/page.tsx` рендерит `public/wikimarket/domains/fio-rus/index.html`

Это позволяет хранить готовую HTML-верстку в `public/`, но отдавать ее через единый Next.js layout и маршрутизацию.

### 2. Генерация страницы из React-компонентов

Для более новых страниц используется обычная сборка Next.js:

1. создается маршрут в `app/.../page.tsx`;
2. маршрут подключает page component из `components/...`;
3. контент собирается из TypeScript-данных, секций и CSS modules;
4. на этапе `next build` страница попадает в итоговую сборку.

Так сделаны, например:

- `app/wikimarket/beauty/bridal-makeup/page.tsx`
- `app/wikimarket/beauty/wedding-hairstyles/page.tsx`
- `app/wikimarket/hvac/copper-aluminum-heat-exchangers/page.tsx`

### 3. Гибридная генерация

Некоторые маршруты берут HTML-шаблон и затем модифицируют его уже в React-коде. Самый показательный пример - `app/wikimarket/hvac/heat-exchanger-repair/page.tsx`:

- загружает HTML из `public/...`;
- заменяет отдельные фрагменты через `replace(...)`;
- вставляет React-компонент `ContactsCountryBlock`;
- затем добавляет inline-скрипты.

Это промежуточный режим между "чистый HTML-шаблон" и "полностью нативная React-страница".

### 4. Генерация страниц для WordPress

Отдельно от Next.js существует `create-pages.js`:

- читает `pages.json`;
- берет `slug`, `title`, `template`, `seo`;
- по REST API создает страницы в WordPress;
- указывает шаблон `page-upgr-generic.php`;
- записывает имя HTML-файла в meta `_upgr_html_file`.

То есть репозиторий умеет не только рендерить страницы внутри Next.js, но и выступать источником данных для публикации страниц во внешнем WordPress.

## Итоговая схема

- `app/` определяет URL и серверную точку входа.
- `components/` содержит визуальные блоки и page-level композицию.
- `public/` хранит готовые HTML-шаблоны и ассеты.
- `lib/html-template.ts` связывает HTML-шаблоны с App Router.
- `pages/` сейчас выступает как вспомогательное хранилище HTML-файлов, а не слой Next.js routing.
- `create-pages.js` + `pages.json` обеспечивают отдельный внешний контур генерации страниц для WordPress.
