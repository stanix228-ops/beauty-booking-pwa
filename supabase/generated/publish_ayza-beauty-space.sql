-- ========================================================
-- PUBLISH TENANT: AYZA BEAUTY SPACE (ayza-beauty-space)
-- Generated automatically at: 2026-10-10T13:35:37.109Z
-- Preserves existing bookings, clients, and history!
-- ========================================================

DO $$
DECLARE
    v_tenant_id UUID := '33333333-3333-4333-8333-333333333333';
BEGIN
    -- 1. Upsert Tenant
    INSERT INTO tenants (
        id, slug, name, tagline, phone, address, city, timezone, currency,
        min_booking_notice_min, max_booking_horizon_days, cancellation_deadline_hours,
        theme_accent_color, theme_bg_color, instructions, updated_at
    ) VALUES (
        v_tenant_id, 'ayza-beauty-space', 'AYZA BEAUTY SPACE', 
        'Премиальное пространство красоты в Шымкенте · Макияж, волосы, ногти, ресницы и брови', 
        '+7 (702) 386-71-76', 'проспект Нурсултана Назарбаева, 55/1', 'Шымкент', 
        'Asia/Almaty', 'KZT', 
        45, 30, 3, 
        '#8E283E', '#080608', 
        'Салон расположен по адресу пр. Нурсултана Назарбаева, 55/1 (район Нурсат). Гостевая парковка, Wi-Fi, комплиментарный кофе и авторский чай. Запись также в Instagram: @ayza.beauty.space.', now()
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
    VALUES (v_tenant_id, 0, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 1, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 2, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 3, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 4, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 5, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 6, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;

    -- 3. Upsert Workplaces
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('30000000-0000-4000-8000-000000000001', v_tenant_id, 'Студия визажа и укладок', 'UNIVERSAL', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('30000000-0000-4000-8000-000000000002', v_tenant_id, 'Маникюрная станция Ayza', 'MANICURE_DESK', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('30000000-0000-4000-8000-000000000003', v_tenant_id, 'Smart СПА-кресло педикюра', 'PEDICURE_CHAIR', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('30000000-0000-4000-8000-000000000004', v_tenant_id, 'Lash & Brow зона', 'UNIVERSAL', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('30000000-0000-4000-8000-000000000005', v_tenant_id, 'Кабинет шугаринга и депиляции', 'UNIVERSAL', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;

    -- 4. Upsert Categories
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('30000000-0000-4000-8000-000000000010', v_tenant_id, 'Make-Up & Hair', 1, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('30000000-0000-4000-8000-000000000020', v_tenant_id, 'Nail (Маникюр)', 2, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('30000000-0000-4000-8000-000000000030', v_tenant_id, 'Pedicure (Педикюр)', 3, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('30000000-0000-4000-8000-000000000040', v_tenant_id, 'Lashes (Ресницы)', 4, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('30000000-0000-4000-8000-000000000050', v_tenant_id, 'Brows (Брови)', 5, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('30000000-0000-4000-8000-000000000060', v_tenant_id, 'Sugaring (Шугаринг)', 6, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 5. Upsert Services
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '30000000-0000-4000-8000-000000000101', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Образ от Top Master Ayza Ertaeva', 
        'Эксклюзивный полный образ от основательницы студии: авторский макияж и вечерняя прическа/укладка.', 
        20000, 90, 15, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-makeup-bridal.jpg', 1, true, now()
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
        '30000000-0000-4000-8000-000000000102', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Дневной макияж', 
        'Естественный сияющий макияж, деликатно подчеркивающий природную красоту.', 
        9000, 60, 15, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-makeup-day.jpg', 2, true, now()
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
        '30000000-0000-4000-8000-000000000103', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Вечерний макияж', 
        'Стойкий выразительный макияж для праздников, торжеств и фотосессий.', 
        10000, 60, 15, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-makeup-evening.jpg', 3, true, now()
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
        '30000000-0000-4000-8000-000000000104', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Свадебный макияж', 
        'Безупречный стойкий свадебный макияж, водостойкие премиальные текстуры.', 
        12000, 90, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', 4, true, now()
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
        '30000000-0000-4000-8000-000000000105', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Женская стрижка', 
        'Стрижка по форме лица с мытьем головы и легкой укладкой.', 
        6000, 45, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80', 5, true, now()
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
        '30000000-0000-4000-8000-000000000106', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Коррекция челки', 
        'Быстрое обновление и придание формы челке.', 
        3000, 20, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80', 6, true, now()
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
        '30000000-0000-4000-8000-000000000107', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Укладка волос', 
        'Брашинг, струящиеся локоны или гладкий глянец.', 
        6000, 45, 15, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-hair-styling.jpg', 7, true, now()
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
        '30000000-0000-4000-8000-000000000108', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Прическа', 
        'Торжественная собранная прическа, текстурный пучок или хвост.', 
        8000, 60, 15, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-hair-evening.jpg', 8, true, now()
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
        '30000000-0000-4000-8000-000000000109', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Свадебная прическа', 
        'Королевская прическа невесты с надежной фиксацией фаты и аксессуаров.', 
        15000, 90, 15, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-hair-bridal.jpg', 9, true, now()
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
        '30000000-0000-4000-8000-000000000110', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Окрашивание корней волос', 
        'Качественное обновление цвета и закрашивание седины.', 
        10000, 90, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=600&q=80', 10, true, now()
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
        '30000000-0000-4000-8000-000000000111', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Окрашивание тон в тон', 
        'Глубокий сияющий цвет по всей длине с сохранением шелковистости волос.', 
        15000, 120, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1522337094346-297c5553e4c4?auto=format&fit=crop&w=600&q=80', 11, true, now()
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
        '30000000-0000-4000-8000-000000000112', v_tenant_id, '30000000-0000-4000-8000-000000000010', 'Сложное окрашивание', 
        'Airtouch, Balayage, Шатуш — плавные переливы и премиальный блонд.', 
        30000, 180, 20, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80', 12, true, now()
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
        '30000000-0000-4000-8000-000000000201', v_tenant_id, '30000000-0000-4000-8000-000000000020', 'Маникюр', 
        'Аппаратная или комбинированная обработка кутикулы и формы ногтей.', 
        5000, 45, 15, 'MANICURE_DESK', 
        '/tenants/ayza-beauty-space/images/service-manicure-classic.jpg', 1, true, now()
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
        '30000000-0000-4000-8000-000000000202', v_tenant_id, '30000000-0000-4000-8000-000000000020', 'Маникюр + лак покрытие', 
        'Чистый гигиенический маникюр со стойким глянцевым лаковым покрытием.', 
        8000, 60, 15, 'MANICURE_DESK', 
        '/tenants/ayza-beauty-space/images/service-manicure-polish.jpg', 2, true, now()
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
        '30000000-0000-4000-8000-000000000203', v_tenant_id, '30000000-0000-4000-8000-000000000020', 'Наращивание ногтей на верхних формах', 
        'Современное моделирование: идеальная форма и тонкий натуральный торец.', 
        10000, 120, 15, 'MANICURE_DESK', 
        '/tenants/ayza-beauty-space/images/service-manicure-extension.jpg', 3, true, now()
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
        '30000000-0000-4000-8000-000000000204', v_tenant_id, '30000000-0000-4000-8000-000000000020', 'Наращивание ногтей на нижних формах', 
        'Классическое наращивание любой длины под кутикулу.', 
        11000, 120, 15, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?auto=format&fit=crop&w=600&q=80', 4, true, now()
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
        '30000000-0000-4000-8000-000000000205', v_tenant_id, '30000000-0000-4000-8000-000000000020', 'Японский маникюр', 
        'Эко-глянцевание минеральной пастой и жемчужной пудрой Masura.', 
        10000, 60, 15, 'MANICURE_DESK', 
        'https://images.unsplash.com/photo-1566113519662-7807a42cc50d?auto=format&fit=crop&w=600&q=80', 5, true, now()
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
        '30000000-0000-4000-8000-000000000301', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Педикюр', 
        'Классическая гигиеническая обработка стоп и аккуратная форма пальчиков.', 
        8000, 60, 15, 'PEDICURE_CHAIR', 
        '/tenants/ayza-beauty-space/images/service-pedicure-classic.jpg', 1, true, now()
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
        '30000000-0000-4000-8000-000000000302', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Педикюр с гелевым покрытием', 
        'Гигиенический педикюр с нанесением стойкого цветного гель-лака.', 
        10000, 75, 15, 'PEDICURE_CHAIR', 
        '/tenants/ayza-beauty-space/images/service-pedicure-gel.jpg', 2, true, now()
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
        '30000000-0000-4000-8000-000000000303', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Smart педикюр без покрытия', 
        'Аппаратная шлифовка стоп smart-дисками до зеркальной мягкости.', 
        9000, 60, 15, 'PEDICURE_CHAIR', 
        'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80', 3, true, now()
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
        '30000000-0000-4000-8000-000000000304', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Smart педикюр с гель лак покрытием', 
        'Smart-обработка стоп молекулярным маслом + покрытие гель-лаком.', 
        10000, 75, 15, 'PEDICURE_CHAIR', 
        'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80', 4, true, now()
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
        '30000000-0000-4000-8000-000000000305', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Комбинированный педикюр', 
        'Аппаратный и препаратный уход для нежной кожи стоп.', 
        9000, 60, 15, 'PEDICURE_CHAIR', 
        'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&w=600&q=80', 5, true, now()
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
        '30000000-0000-4000-8000-000000000306', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Комбинированный педикюр с гель лак покрытием', 
        'Комбинированная эстетика стоп и стойкое стойкое покрытие.', 
        10000, 75, 15, 'PEDICURE_CHAIR', 
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 6, true, now()
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
        '30000000-0000-4000-8000-000000000307', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Японский педикюр', 
        'Премиальное эко-восстановление ногтевой пластины и стоп.', 
        12000, 75, 15, 'PEDICURE_CHAIR', 
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 7, true, now()
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
        '30000000-0000-4000-8000-000000000308', v_tenant_id, '30000000-0000-4000-8000-000000000030', 'Спа процедура скрабирование + парафин + питательный крем', 
        'Роскошный СПА-ритуал для мягкости и шелковистости ваших ножек.', 
        2000, 30, 10, 'PEDICURE_CHAIR', 
        '/tenants/ayza-beauty-space/images/service-pedicure-spa.jpg', 8, true, now()
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
        '30000000-0000-4000-8000-000000000401', v_tenant_id, '30000000-0000-4000-8000-000000000040', 'Классика', 
        'Наращивание одной искусственной ресницы на каждую свою (1D).', 
        8000, 90, 15, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-lashes-classic.jpg', 1, true, now()
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
        '30000000-0000-4000-8000-000000000402', v_tenant_id, '30000000-0000-4000-8000-000000000040', 'Объем 2D-3D', 
        'Пышный бархатный объем, подчеркивающий глубину взгляда.', 
        9000, 120, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=600&q=80', 2, true, now()
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
        '30000000-0000-4000-8000-000000000403', v_tenant_id, '30000000-0000-4000-8000-000000000040', 'Объем 4D-5D', 
        'Роскошный мега-объем ультратонкими невесомыми ресничками.', 
        10000, 120, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', 3, true, now()
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
        '30000000-0000-4000-8000-000000000404', v_tenant_id, '30000000-0000-4000-8000-000000000040', 'Ламинирование ресниц', 
        'Удлинение, изгиб, глубокий черный цвет и питание витаминами.', 
        8000, 60, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80', 4, true, now()
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
        '30000000-0000-4000-8000-000000000501', v_tenant_id, '30000000-0000-4000-8000-000000000050', 'Коррекция бровей', 
        'Создание идеальной гармоничной формы пинцетом и воском.', 
        3000, 30, 10, 'UNIVERSAL', 
        '/tenants/ayza-beauty-space/images/service-brows.png', 1, true, now()
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
        '30000000-0000-4000-8000-000000000502', v_tenant_id, '30000000-0000-4000-8000-000000000050', 'Коррекция бровей + окрашивание', 
        'Архитектура формы и стойкое окрашивание премиум-хной или краской.', 
        4500, 45, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80', 2, true, now()
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
        '30000000-0000-4000-8000-000000000503', v_tenant_id, '30000000-0000-4000-8000-000000000050', 'Ламинирование бровей', 
        'Долговременная фиксация формы и кератиновое наполнение.', 
        8000, 60, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=600&q=80', 3, true, now()
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
        '30000000-0000-4000-8000-000000000504', v_tenant_id, '30000000-0000-4000-8000-000000000050', 'Ламинирование бровей + окрашивание', 
        'Полный комплекс: ламинирование, коррекция формы и окрашивание.', 
        9000, 60, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1588510849445-4795b277a454?auto=format&fit=crop&w=600&q=80', 4, true, now()
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
        '30000000-0000-4000-8000-000000000505', v_tenant_id, '30000000-0000-4000-8000-000000000050', 'Халал коррекция', 
        'Деликатное прореживание и оформление бровей строго по канонам Халал.', 
        4000, 30, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 5, true, now()
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
        '30000000-0000-4000-8000-000000000601', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Лицо', 
        'Деликатное удаление пушковых волос на лице сахарной пастой.', 
        4000, 20, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 1, true, now()
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
        '30000000-0000-4000-8000-000000000602', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Усики', 
        'Быстрое и безболезненное удаление волосков над верхней губой.', 
        1500, 15, 5, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80', 2, true, now()
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
        '30000000-0000-4000-8000-000000000603', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Баки', 
        'Аккуратное оформление височной зоны.', 
        2000, 15, 5, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80', 3, true, now()
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
        '30000000-0000-4000-8000-000000000604', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Подмышечные впадины', 
        'Чистая гладкая кожа без раздражения и вросших волос.', 
        2500, 20, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80', 4, true, now()
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
        '30000000-0000-4000-8000-000000000605', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Глубокое бикини', 
        'Бережная процедура с использованием мягких антистресс-паст.', 
        5000, 30, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80', 5, true, now()
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
        '30000000-0000-4000-8000-000000000606', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Руки до локтя', 
        'Шугаринг предплечий с успокаивающим лосьоном.', 
        3000, 20, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80', 6, true, now()
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
        '30000000-0000-4000-8000-000000000607', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Руки полностью', 
        'Полная депиляция рук сахарной пастой премиум-класса.', 
        5000, 30, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', 7, true, now()
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
        '30000000-0000-4000-8000-000000000608', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Ноги до колен', 
        'Гладкость голеней и коленей до 4 недель.', 
        3500, 25, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=600&q=80', 8, true, now()
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
        '30000000-0000-4000-8000-000000000609', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Ноги полностью', 
        'Шугаринг ножек по всей длине с увлажняющим уходом.', 
        6000, 40, 15, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1498842812179-c81beecf902c?auto=format&fit=crop&w=600&q=80', 9, true, now()
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
        '30000000-0000-4000-8000-000000000610', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Живот', 
        'Деликатное удаление волосков в области живота.', 
        2000, 20, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=600&q=80', 10, true, now()
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
        '30000000-0000-4000-8000-000000000611', v_tenant_id, '30000000-0000-4000-8000-000000000060', 'Спина', 
        'Шугаринг зоны спины гипоаллергенной пастой.', 
        4000, 30, 10, 'UNIVERSAL', 
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80', 11, true, now()
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
        '30000000-0000-4000-8000-000000000701', v_tenant_id, NULL, 
        'Дизайн ногтей', 'Стильный авторский арт, френч или градиент', 
        1000, 15, 0, 1, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000702', v_tenant_id, NULL, 
        'Снятие гель-лака', 'Бережное аппаратное снятие старого покрытия', 
        1000, 15, 0, 2, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000703', v_tenant_id, NULL, 
        'Снятие наращенных ногтей', 'Атравматичное спиливание искусственного материала', 
        1000, 20, 0, 3, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000704', v_tenant_id, NULL, 
        'Воском (доплата)', 'Использование горячего полимерного воска вместо сахарной пасты', 
        1000, 10, 0, 4, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000705', v_tenant_id, NULL, 
        'Коричневые ресницы (Шоколад)', 'Мягкий благородный шоколадный оттенок для натурального взгляда', 
        1000, 0, 0, 5, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000706', v_tenant_id, NULL, 
        'Снятие ресниц', 'Безопасное снятие ресниц мягким кремовым ремувером', 
        1000, 15, 0, 6, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000707', v_tenant_id, NULL, 
        'Мокрый эффект (Wet Look)', 'Трендовый эффект нераскрытых ресничек', 
        1000, 0, 0, 7, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000708', v_tenant_id, NULL, 
        'Kylie эффект (Лучики)', 'Длинные акцентные лучи для дерзкого и выразительного взгляда', 
        1000, 0, 0, 8, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000709', v_tenant_id, NULL, 
        'Изгибы M, L, D, C', 'Выбор индивидуального изгиба ресниц', 
        1000, 0, 0, 9, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000710', v_tenant_id, NULL, 
        'Коррекция ресниц', 'Восстановление ресничного ряда до идеального состояния', 
        5000, 60, 10, 10, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 7. Upsert Masters
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000801', v_tenant_id, 'Ayza Ertaeva', 'Основательница & Top Master', 
        'Создательница пространства Ayza Beauty Space. Эксперт по свадебным и вечерним образам, сложным прическам и премиальному визажу.', 
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 
        5, 164, 1, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000101') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000102') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000103') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000104') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000105') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000106') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000107') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000108') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000109') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000110') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000111') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000112') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', 0, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', 1, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', 2, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', 3, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', 4, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', 5, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000801', 6, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000802', v_tenant_id, 'Диана', 'Ведущий мастер ногтевого сервиса', 
        'Опыт более 5 лет. Эксперт по Smart-педикюру, японскому уходу Masura и безупречному наращиванию ногтей.', 
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 
        4.98, 98, 2, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000201') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000202') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000203') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000204') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000205') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000301') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000302') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000303') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000304') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000305') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000306') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000307') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', '30000000-0000-4000-8000-000000000308') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', 0, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', 1, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', 2, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', 3, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', 4, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', 5, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000802', 6, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000803', v_tenant_id, 'Алина', 'Lash & Brow стилист', 
        'Специалист по естественному наращиванию ресниц (Kylie, мокрый эффект), ламинированию и халал-коррекции бровей.', 
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 
        4.96, 85, 3, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000401') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000402') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000403') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000404') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000501') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000502') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000503') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000504') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000505') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', 0, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', 1, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', 2, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', 3, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', 4, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', 5, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000803', 6, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '30000000-0000-4000-8000-000000000804', v_tenant_id, 'Камила', 'Мастер депиляции и шугаринга', 
        'Деликатная и безболезненная техника шугаринга и восковой депиляции. Профессиональный спа-уход за кожей.', 
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', 
        4.97, 72, 4, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000601') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000602') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000603') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000604') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000605') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000606') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000607') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000608') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000609') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000610') ON CONFLICT DO NOTHING;
    INSERT INTO master_services (tenant_id, master_id, service_id)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', '30000000-0000-4000-8000-000000000611') ON CONFLICT DO NOTHING;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', 0, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', 1, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', 2, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', 3, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', 4, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', 5, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '30000000-0000-4000-8000-000000000804', 6, '09:00', '20:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;

    RAISE NOTICE 'Tenant "%" published successfully.', 'ayza-beauty-space';
END $$;