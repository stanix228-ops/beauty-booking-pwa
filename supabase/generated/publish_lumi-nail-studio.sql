-- ========================================================
-- PUBLISH TENANT: DEMO BEAUTY STUDIO (lumi-nail-studio)
-- Generated automatically at: 2026-10-04T10:27:21.230Z
-- Preserves existing bookings, clients, and history!
-- ========================================================

DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-4111-8111-111111111111';
BEGIN
    -- 1. Upsert Tenant
    INSERT INTO tenants (
        id, slug, name, tagline, phone, address, city, timezone, currency,
        min_booking_notice_min, max_booking_horizon_days, cancellation_deadline_hours,
        theme_accent_color, theme_bg_color, instructions, updated_at
    ) VALUES (
        v_tenant_id, 'lumi-nail-studio', 'DEMO BEAUTY STUDIO', 
        'Премиальная эстетика, безупречный маникюр и забота о деталях', 
        '+7 (495) 780-11-22', 'ул. Большая Никитская, 14/2', 'Москва', 
        'Europe/Moscow', 'RUB', 
        60, 30, 4, 
        '#FFFFFF', '#050507', 
        'В студии действует комплиментарный бар: specialty-кофе, матча и авторские лимонады. Пожалуйста, сообщите администратору о наличии аллергических реакций.', now()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, tagline = EXCLUDED.tagline, phone = EXCLUDED.phone,
        address = EXCLUDED.address, city = EXCLUDED.city, timezone = EXCLUDED.timezone,
        min_booking_notice_min = EXCLUDED.min_booking_notice_min,
        max_booking_horizon_days = EXCLUDED.max_booking_horizon_days,
        cancellation_deadline_hours = EXCLUDED.cancellation_deadline_hours,
        theme_accent_color = EXCLUDED.theme_accent_color,
        theme_bg_color = EXCLUDED.theme_bg_color,
        instructions = EXCLUDED.instructions,
        updated_at = now();

    -- 2. Upsert Studio Business Hours
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 0, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 1, '10:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 2, '10:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 3, '10:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 4, '10:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 5, '10:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 6, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;

    -- 3. Upsert Workplaces
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('10000000-0000-4000-8000-000000000001', v_tenant_id, 'Маникюрный стол Lumi Gold', 'MANICURE_DESK', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('10000000-0000-4000-8000-000000000002', v_tenant_id, 'Маникюрный стол Lumi Velvet', 'MANICURE_DESK', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('10000000-0000-4000-8000-000000000003', v_tenant_id, 'Педикюрный трон Lumi Spa', 'PEDICURE_CHAIR', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;

    -- 4. Upsert Categories
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000010', v_tenant_id, 'Маникюр', 1, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000020', v_tenant_id, 'Педикюр', 2, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000030', v_tenant_id, 'Укрепление & Наращивание', 3, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000040', v_tenant_id, 'Дизайн & Уход', 4, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 5. Upsert Services
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '10000000-0000-4000-8000-000000000101', v_tenant_id, '10000000-0000-4000-8000-000000000010', 'Комплекс «Маникюр + гель-лак + выравнивание»', 
        'Снятие старого покрытия, комбинированная обработка кутикулы, архитектурное выравнивание базой Luxio/Kodi, стойкое покрытие под кутикулу, увлажняющее масло.', 
        3200, 90, 15, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', 1, true, now()
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description,
        price = EXCLUDED.price, duration_min = EXCLUDED.duration_min,
        buffer_after_min = EXCLUDED.buffer_after_min,
        required_workplace_type = EXCLUDED.required_workplace_type,
        image_url = EXCLUDED.image_url, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active, updated_at = now();
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '10000000-0000-4000-8000-000000000102', v_tenant_id, '10000000-0000-4000-8000-000000000010', 'Атравматичный пилочный маникюр без покрытия', 
        'Мягкая безаппаратная техника с использованием индивидуальных одноразовых пилок. Идеальная бархатная кутикула без риска пропилов.', 
        2500, 60, 15, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80', 2, true, now()
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description,
        price = EXCLUDED.price, duration_min = EXCLUDED.duration_min,
        buffer_after_min = EXCLUDED.buffer_after_min,
        required_workplace_type = EXCLUDED.required_workplace_type,
        image_url = EXCLUDED.image_url, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active, updated_at = now();
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '10000000-0000-4000-8000-000000000103', v_tenant_id, '10000000-0000-4000-8000-000000000010', 'Японский эко-маникюр Masura', 
        'Оздоравливающая процедура для натуральных ногтей: полировка минеральной пастой с жемчужной крошкой и запечатывание пчелиным воском.', 
        2800, 60, 15, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80', 3, true, now()
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description,
        price = EXCLUDED.price, duration_min = EXCLUDED.duration_min,
        buffer_after_min = EXCLUDED.buffer_after_min,
        required_workplace_type = EXCLUDED.required_workplace_type,
        image_url = EXCLUDED.image_url, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active, updated_at = now();
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '10000000-0000-4000-8000-000000000104', v_tenant_id, '10000000-0000-4000-8000-000000000020', 'Эстетический Smart-педикюр с гель-лаком', 
        'Инновационная обработка стоп с молекулярным smart-маслом, идеальная гладкость пяток до 4 недель, обработка пальчиков и покрытие гель-лаком.', 
        4200, 100, 20, 'PEDICURE_CHAIR', 
        'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80', 4, true, now()
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description,
        price = EXCLUDED.price, duration_min = EXCLUDED.duration_min,
        buffer_after_min = EXCLUDED.buffer_after_min,
        required_workplace_type = EXCLUDED.required_workplace_type,
        image_url = EXCLUDED.image_url, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active, updated_at = now();
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '10000000-0000-4000-8000-000000000105', v_tenant_id, '10000000-0000-4000-8000-000000000030', 'Моделирование ногтей гелем / акригелем (длина 1-2)', 
        'Создание идеальной миндальной или квадратной формы на нижние/верхние формы с архитектурой натурального ногтя.', 
        4800, 120, 15, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 5, true, now()
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description,
        price = EXCLUDED.price, duration_min = EXCLUDED.duration_min,
        buffer_after_min = EXCLUDED.buffer_after_min,
        required_workplace_type = EXCLUDED.required_workplace_type,
        image_url = EXCLUDED.image_url, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active, updated_at = now();

    -- 6. Upsert Service Options
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000201', v_tenant_id, NULL, 
        'Снятие покрытия другого мастера', 'Бережное фрезерное снятие без повреждения дорсального слоя', 
        400, 15, 0, 1, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000202', v_tenant_id, NULL, 
        'Укрепление гелем / акриловой пудрой', 'Создание жесткого каркаса для предотвращения сколов и отслоек на мягких ногтях', 
        700, 20, 0, 2, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000203', v_tenant_id, NULL, 
        'Френч / Лунный дизайн (все пальцы)', 'Идеально выверенная улыбка французского покрытия', 
        900, 30, 0, 3, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000204', v_tenant_id, NULL, 
        'Авторский nail-дизайн (1 ноготь)', 'Градиент, стемпинг, инкрустация кристаллами Swarovski или ручная роспись', 
        250, 10, 0, 4, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000205', v_tenant_id, NULL, 
        'Ремонт / донаращивание треснувшего ногтя (1 шт)', 'Восстановление параллелей или угла шелком/полигелем', 
        300, 15, 0, 5, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 7. Upsert Masters
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000301', v_tenant_id, 'Алёна Смирнова', 'Топ-мастер, инструктор Lumi', 
        'Опыт 7 лет. Победитель чемпионата Nail Aesthetic Pro. Мастер тонких торцов и безукоризненной формы.', 
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 
        5, 214, 1, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000101') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000102') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000103') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000105') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', 0, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', 1, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', 2, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', 3, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', 4, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', 5, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000301', 6, '10:00', '21:00', true)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000302', v_tenant_id, 'Виктория Ким', 'Ведущий стилист ногтевого сервиса', 
        'Опыт 5 лет. Скоростной премиум-маникюр за 60 минут без потери качества. Эксперт по сложным дизайнам.', 
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 
        4.97, 168, 2, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000101') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000102') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000104') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 0, '11:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 1, '11:00', '22:00', true)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 2, '11:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 3, '11:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 4, '11:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 5, '11:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 6, '11:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000303', v_tenant_id, 'Екатерина Морозова', 'Мастер маникюра и эстетической подологии', 
        'Опыт 6 лет. Медицинское образование. Деликатное решение проблем онихолизиса, трещин и врастающих углов.', 
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 
        4.95, 139, 3, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000101') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000102') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000104') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', 0, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', 1, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', 2, '10:00', '20:00', true)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', 3, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', 4, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', 5, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000303', 6, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;

    RAISE NOTICE 'Tenant "%" published successfully.', 'lumi-nail-studio';
END $$;