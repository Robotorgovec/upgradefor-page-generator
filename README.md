# upgradefor-page-generator

## База данных (Prisma, этап 1)

Этот этап подготавливает структуру базы данных для будущих аккаунтов и авторизации.

Используется PostgreSQL и Prisma.

---

## Авторизация (Auth.js, этап 2)

На этом этапе реализован вход и выход пользователей по email и паролю,
а также защищённая страница личного кабинета `/account`.

Что уже есть:
- вход через `/account/login`
- защищённая страница `/account`
- выход из аккаунта
- тестовый пользователь создаётся через скрипт
- используются существующие модели пользователя

Регистрация, подтверждение email и восстановление пароля добавлены на следующих этапах.

---

## Регистрация и подтверждение email (этап 3)

На этом этапе добавлена регистрация и подтверждение email через письмо.

### Переменные окружения для почты

Используется Resend API. Базовый URL для ссылок берётся из `NEXTAUTH_URL`.

Добавьте в `.env`:

```env
EMAIL_FROM="noreply@upgradefor.com"
EMAIL_PROVIDER="resend"
RESEND_API_KEY=""
```

---

## Восстановление пароля (этап 4)

На этом этапе добавлено восстановление пароля через email.

Что уже есть:
- запрос ссылки на восстановление через `/account/forgot`
- установка нового пароля через `/account/reset`
- письма на восстановление отправляются через Resend

### Переменные окружения для почты

Используется Resend API. Базовый URL для ссылок берётся из `NEXTAUTH_URL`.

Добавьте в `.env`:

```env
EMAIL_FROM="noreply@upgradefor.com"
EMAIL_PROVIDER="resend"
RESEND_API_KEY=""
```

---

## Как мержим PR без блокировок

Чтобы PR становился mergeable без ручного поиска причины блокировки:

1. **Review по умолчанию**
   - Используем `.github/CODEOWNERS` для автоматического определения владельца ревью на весь репозиторий.
   - Для авто-запроса ревьюеров настройте переменные репозитория:
     - `DEFAULT_REVIEWERS` = `user1,user2`
     - `DEFAULT_REVIEW_TEAMS` = `team-slug`

2. **Авто-отчёт о готовности к merge**
   - Workflow `.github/workflows/merge-readiness.yml` публикует и обновляет комментарий `Merge readiness report` в каждом PR.
   - В отчёте есть:
     - статус checks,
     - approvals (факт / требование),
     - unresolved conversations,
     - актуальность ветки относительно `main`,
     - список назначенных reviewer'ов.

3. **Если включено “branch must be up-to-date”**
   - Можно включить авто-обновление ветки: `AUTO_UPDATE_BRANCH=true` (Repo variables).
   - Либо нажимать `Update branch` вручную.

4. **Анти-регресс чеклист**
   - Используйте `.github/pull_request_template.md`: он содержит список типовых причин блокировки merge и шаги устранения.

### Быстрый разбор типовых блокировок

- **Review required** → назначить reviewer, дождаться нужного числа approve.
- **Conversations unresolved** → закрыть/resolve все треды в `Files changed`.
- **Required checks failed** → исправить и дождаться зелёного статуса.
- **Branch out-of-date** → выполнить `Update branch`.

### Что проверить в Branch protection (для `main`)

В `Settings → Branches → Branch protection rules`:
- `Require a pull request review before merging` (сколько approve)
- `Require conversation resolution before merging`
- `Require status checks to pass before merging` (какие checks обязательны)
- `Require branches to be up to date before merging`
- `Restrict who can push to matching branches`
- `Allow force pushes` / `Allow deletions`
- `Allow specified actors to bypass` (если используется)
