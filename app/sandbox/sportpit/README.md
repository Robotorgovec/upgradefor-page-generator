# SportPit sandbox (isolated zone)

- SportPit изолирован: не импортировать код из общего сайта (`/components`, `/styles`, `/templates`).
- Локальные компоненты: `app/sandbox/sportpit/components` и `app/sandbox/sportpit/_components`.
- Локальные стили/тема: `app/sandbox/sportpit/_styles/theme.module.css` + CSS Modules внутри папки.
- Статические ассеты SportPit: `public/sandbox/sportpit`.

## Проверка границ

```bash
npm run check:sportpit
```

Скрипт проверяет, что внутри `app/sandbox/sportpit` нет импортов из запрещённых общих путей.
