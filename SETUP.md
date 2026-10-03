# SETUP.md — Руководство по развертыванию и запуску

Это руководство описывает процесс локального запуска, применения миграций Supabase, настройки Edge Functions, сборки PWA и деплоя на Cloudflare Pages.

---

## 1. Системные требования
- **Node.js:** v20.x или v22.x LTS
- **npm:** v10.x+
- **Supabase CLI:** (опционально, для локальной разработки Supabase)

---

## 2. Локальная установка и запуск

1. Клонируйте проект и перейдите в рабочую директорию:
   ```bash
   cd "запись бьюти"
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите валидацию тенантов и генерацию данных:
   ```bash
   npm run tenant:validate
   npm run tenant:publish
   npm run tenant:verify
   ```

4. Запустите локальный сервер разработки:
   ```bash
   npm run dev
   ```
   Приложение откроется по адресу: `http://localhost:5173/`

---

## 3. Настройка базы данных Supabase

Если вы используете облачный проект Supabase или локальный `supabase start`:

1. Перейдите в SQL Editor вашего проекта Supabase.
2. Выполните базовые миграции в следующем порядке:
   - `supabase/migrations/20261003_init_nail_schema.sql` (схема, таблицы, EXCLUDE-констрейнты, RLS, базовые RPC)
   - `supabase/migrations/20261003_available_slots_rpc.sql` (функция расчета слотов с буферами и графиком мастеров)
3. Опубликуйте данные демонстрационных студий:
   - `supabase/generated/publish_lumi-nail-studio.sql`
   - `supabase/generated/publish_aura-nail-bar.sql`

*Примечание:* Публикация использует идемпотентные `ON CONFLICT DO UPDATE` и **никогда не удаляет** существующие клиентские бронирования или данные пользователей.

---

## 4. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

Заполните переменные:
- `VITE_SUPABASE_URL` — URL вашего проекта Supabase (`https://<id>.supabase.co`).
- `VITE_SUPABASE_ANON_KEY` — Публичный anon-ключ проекта.
- `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` — Ключи доступа к LLM-модели (OpenAI, DeepSeek, Groq).

---

## 5. Развертывание Edge Functions

1. Авторизуйтесь в Supabase CLI:
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   ```

2. Задеплойте функцию AI-ассистента:
   ```bash
   supabase functions deploy ai-chat --no-verify-jwt
   supabase secrets set LLM_API_KEY=your_key LLM_BASE_URL=https://api.openai.com/v1 LLM_MODEL=gpt-4o-mini
   ```

3. Задеплойте фоновый обработчик очереди уведомлений:
   ```bash
   supabase functions deploy process-notifications
   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:admin@beauty.app
   ```

4. Настройте Supabase Cron (pg_cron) для регулярной обработки очереди:
   ```sql
   SELECT cron.schedule(
     'process-notifications-every-minute',
     '* * * * *',
     $$
     SELECT net.http_post(
       url:='https://your-project.supabase.co/functions/v1/process-notifications',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
     ) as request_id;
     $$
   );
   ```

---

## 6. Сборка и деплой на Cloudflare Pages

1. Запустите финальную production-сборку:
   ```bash
   npm run build
   ```
   В директории `dist/` будет сгенерирован готовый статический бандл с PWA Service Worker (`dist/sw.js`) и манифестами.

2. Настройте проект в Cloudflare Pages:
   - **Framework Preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** добавьте переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.

3. Все маршруты `/s/:slug/`, `/s/:slug/b/:token`, `/s/:slug/owner/` будут работать корректно через клиентский роутер благодаря SPA rewrite правилу `/* -> /index.html` (включено по умолчанию в Cloudflare Pages).
