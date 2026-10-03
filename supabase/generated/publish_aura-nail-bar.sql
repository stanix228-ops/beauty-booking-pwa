-- ========================================================
-- PUBLISH TENANT: AURA NAIL BAR (aura-nail-bar)
-- Generated automatically at: 2026-10-03T11:12:59.354Z
-- Preserves existing bookings, clients, and history!
-- ========================================================

DO $$
DECLARE
    v_tenant_id UUID := '22222222-2222-4222-8222-222222222222';
BEGIN
    -- 1. Upsert Tenant
    INSERT INTO tenants (
        id, slug, name, tagline, phone, address, city, timezone, currency,
        min_booking_notice_min, max_booking_horizon_days, cancellation_deadline_hours,
        theme_accent_color, theme_bg_color, instructions, updated_at
    ) VALUES (
        v_tenant_id, 'aura-nail-bar', 'AURA NAIL BAR', 
        'Экспресс-студия маникюра и концептуальный нейл-бар', 
        '+7 (812) 330-99-44', 'Невский проспект, 78', 'Санкт-Петербург', 
        'Europe/Moscow', 'RUB', 
        45, 21, 3, 
        '#2DD4BF', '#0F172A', 
        'Студия расположена на 2 этаже арт-пространства. Быстрая запись, высокоскоростной Wi-Fi, напитки to-go.', now()
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
    VALUES (v_tenant_id, 0, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 1, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 2, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 3, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 4, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 5, '09:00', '23:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 6, '10:00', '22:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;

    -- 3. Upsert Workplaces
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('20000000-0000-4000-8000-000000000001', v_tenant_id, 'Барная стойка Aura 1', 'MANICURE_DESK', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('20000000-0000-4000-8000-000000000002', v_tenant_id, 'Барная стойка Aura 2', 'MANICURE_DESK', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('20000000-0000-4000-8000-000000000003', v_tenant_id, 'Педикюрная капсула Podology', 'PEDICURE_CHAIR', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;

    -- 4. Upsert Categories
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('20000000-0000-4000-8000-000000000010', v_tenant_id, 'Экспресс-маникюр', 1, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('20000000-0000-4000-8000-000000000020', v_tenant_id, 'Покрытие & Дизайн', 2, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('20000000-0000-4000-8000-000000000030', v_tenant_id, 'Подология & Педикюр', 3, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 5. Upsert Services
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '20000000-0000-4000-8000-000000000101', v_tenant_id, '20000000-0000-4000-8000-000000000010', 'Скоростной экспресс-маникюр', 
        'Чистая аппаратная обработка за 40 минут. Идеально для занятых девушек в обеденный перерыв.', 
        1800, 40, 10, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80', 1, true, now()
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
        '20000000-0000-4000-8000-000000000102', v_tenant_id, '20000000-0000-4000-8000-000000000020', 'Маникюр с сияющим покрытием Flash Gel', 
        'Комби-обработка, светоотражающие трендовые базы Flash Disco с глубоким переливом.', 
        2600, 70, 15, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', 2, true, now()
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
        '20000000-0000-4000-8000-000000000103', v_tenant_id, '20000000-0000-4000-8000-000000000030', 'Кислотный экспресс-педикюр KART', 
        'Фруктово-ферментативная обработка сложных стоп и натоптышей без лезвий и трещин.', 
        3500, 75, 15, 'PEDICURE_CHAIR', 
        'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80', 3, true, now()
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
        '20000000-0000-4000-8000-000000000201', v_tenant_id, NULL, 
        'Снятие гель-лака', 'Быстрое снятие твердосплавной фрезой', 
        350, 15, 0, 1, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '20000000-0000-4000-8000-000000000202', v_tenant_id, NULL, 
        'Глянцевый топ анти-царапины', 'Сверхстойкий финиш с зеркальным блеском до 5 недель', 
        300, 10, 0, 2, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 7. Upsert Masters
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '20000000-0000-4000-8000-000000000301', v_tenant_id, 'Диана Романова', 'Мастер-эксперт Aura Bar', 
        'Опыт 4 года. Специалист по скоростному комбо-маникюру и ультра-глянцевому покрытию.', 
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 
        4.96, 112, 1, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', '20000000-0000-4000-8000-000000000101') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', '20000000-0000-4000-8000-000000000102') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', 0, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', 1, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', 2, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', 3, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', 4, '09:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', 5, '09:00', '22:00', true)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000301', 6, '10:00', '22:00', true)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '20000000-0000-4000-8000-000000000302', v_tenant_id, 'Мария Лазарева', 'Подолог-эстетист', 
        'Опыт 8 лет. Сложный медицинский педикюр, обработка стопы KART, установка коррекционных систем.', 
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 
        4.99, 184, 2, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', '20000000-0000-4000-8000-000000000101') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', '20000000-0000-4000-8000-000000000103') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', 0, '11:00', '21:00', true)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', 1, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', 2, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', 3, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', 4, '10:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', 5, '09:00', '23:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '20000000-0000-4000-8000-000000000302', 6, '10:00', '22:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;

    RAISE NOTICE 'Tenant "%" published successfully.', 'aura-nail-bar';
END $$;