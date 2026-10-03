# 💅 Beauty Booking PWA — Multi-Tenant Онлайн-Запись для Студий Маникюра

Высоконагруженное, масштабируемое multi-tenant PWA-приложение для онлайн-записи клиентов в nail-студии и салоны маникюра.
Поддерживает мгновенный ребрендинг под любого клиента через один файл `business.json` и набор медиа-ассетов при сохранении полной независимости всех ранее созданных студий.

---

## ⚡ Особенности и Архитектура

- **Multi-Tenant в одном бандле:** Все таблицы изолированы по `tenant_id` со составными внешними ключами `(tenant_id, id)`.
- **Защита от овербукинга (No Overbooking):** Таблица `resource_occupancies` использует PostgreSQL `EXCLUDE USING gist (tenant_id WITH =, resource_id WITH =, time_range WITH &&)` для одновременного бронирования мастера и рабочего места.
- **Атомарные транзакции (PL/pgSQL):** Создание, перенос и отмена записи выполняются через хранимые процедуры (`create_booking_atomic`, `reschedule_booking_atomic`, `cancel_booking_atomic`).
- **Беспарольный клиентский доступ:** Клиент записывается без регистрации и пароля, получая защищённый крипто-токен (`/s/{slug}/b/{token}`), в БД сохраняется только SHA-256 хэш.
- **Кабинет владельца:** Мобильный дашборд управления (`/s/{slug}/owner/`) с авторизацией через Supabase Auth и membership-проверкой: расписание, статусы, блокировка времени мастеров, SQL-аналитика выручки.
- **Tenant Pipeline за 6 минут:** Скрипты `tenant:new`, `tenant:validate`, `tenant:publish`, `tenant:verify`.
- **AI-ассистент:** Edge Function с безопасным Tool Loop (whitelist инструментов без доступа модели к SQL и чужим данным) и автоматическим fallback.
- **Web Push & ICS:** Outbox-очередь `notification_jobs` с lease/retry, экспорт события в календарь `.ics`.

---

## 📱 Демонстрационные студии

Приложение включает два преднастроенных независимых тенанта:

1. **LUMI NAIL STUDIO** (`/s/lumi-nail-studio/`)
   - Премиальный бутик маникюра в Москве (Большая Никитская)
   - Тёплое розовое золото `#E0A96D`, глубокий графит `#0D0D11`
   - 3 мастера, каталог комплексного маникюра, Smart-педикюра и моделирования

2. **AURA NAIL BAR** (`/s/aura-nail-bar/`)
   - Скоростной нейл-бар и подология в Санкт-Петербурге (Невский проспект)
   - Мятный изумруд `#2DD4BF`, полночный синий `#0F172A`
   - 2 мастера, экспресс-маникюр за 40 минут, Flash Disco покрытие, кислотный педикюр

---

## 🚀 Быстрый старт

### Установка и запуск локально:
```bash
npm install
npm run tenant:validate
npm run tenant:publish
npm run dev
```

Откройте в браузере:
- Главный каталог: `http://localhost:5173/`
- Запись Lumi: `http://localhost:5173/s/lumi-nail-studio/`
- Запись Aura: `http://localhost:5173/s/aura-nail-bar/`
- Кабинет владельца: `http://localhost:5173/s/lumi-nail-studio/owner/`

### Тесты:
```bash
npm run test         # Unit & Integration тесты (8/8 passed)
npm run test:e2e     # Playwright E2E тесты (2/2 passed)
npm run build        # Production build
```

---

## 🛠️ Стек технологий

- **Frontend:** React 19, TypeScript strict, Vite, React Router v7, TanStack Query, Tailwind CSS v4, Astryx (`@astryxdesign/core`, `@astryxdesign/theme-neutral`, `@stylexjs/stylex`), shadcn/ui
- **PWA:** `vite-plugin-pwa` (автономный режим, кэширование статики, индивидуальные манифесты)
- **Backend:** Supabase PostgreSQL, Row Level Security (RLS), Edge Functions (Deno), Supabase Auth
- **Тестирование:** Vitest, Playwright
- **Деплой:** Cloudflare Pages (Frontend) + Supabase (Database & Functions)

---

## 📖 Документация

- [SETUP.md](SETUP.md) — Полная инструкция по развертыванию, миграциям и Cloudflare Pages
- [CLONE-IN-6-MINUTES.md](CLONE-IN-6-MINUTES.md) — Пошаговое руководство добавления новой студии через `business.json`
- [ACCEPTANCE.md](ACCEPTANCE.md) — Отчёт о приёмке, тесты и проверка инвариантов
- [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) — Подробный архитектурный план этапов
