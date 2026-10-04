-- ========================================================
-- PUBLISH TENANT: LUMI NAIL ATELIER (lumi-nail-studio)
-- Generated automatically at: 2026-10-04T21:09:16.039Z
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
        v_tenant_id, 'lumi-nail-studio', 'LUMI NAIL ATELIER', 
        'Beverly Hills Haute Nail Atelier & Bespoke Care', 
        '+1 (310) 843-9820', '9520 Wilshire Blvd', 'Beverly Hills, CA', 
        'America/Los_Angeles', 'USD', 
        60, 30, 4, 
        '#FFFFFF', '#050507', 
        'Complimentary organic matcha, artisanal espresso, and sparkling rosé bar. Please inform your artist of any allergies or sensitivities upon arrival.', now()
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
    VALUES (v_tenant_id, 1, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 2, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 3, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 4, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 5, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;
    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
    VALUES (v_tenant_id, 6, '10:00', '21:00', false)
    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;

    -- 3. Upsert Workplaces
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('10000000-0000-4000-8000-000000000001', v_tenant_id, 'Manicure Suite Lumi Gold', 'MANICURE_DESK', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('10000000-0000-4000-8000-000000000002', v_tenant_id, 'Manicure Suite Lumi Velvet', 'MANICURE_DESK', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;
    INSERT INTO workplaces (id, tenant_id, name, type, is_active)
    VALUES ('10000000-0000-4000-8000-000000000003', v_tenant_id, 'Spa Pedicure Throne Lumi Private', 'PEDICURE_CHAIR', true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;

    -- 4. Upsert Categories
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000010', v_tenant_id, 'Manicure & Gel', 1, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000020', v_tenant_id, 'Pedicure & Foot Care', 2, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000030', v_tenant_id, 'Structure & Extensions', 3, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)
    VALUES ('10000000-0000-4000-8000-000000000040', v_tenant_id, 'Nail Art & Spa Care', 4, true)
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 5. Upsert Services
    INSERT INTO services (
        id, tenant_id, category_id, name, description, price, duration_min,
        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at
    ) VALUES (
        '10000000-0000-4000-8000-000000000101', v_tenant_id, '10000000-0000-4000-8000-000000000010', 'Signature Russian Gel Manicure', 
        'Meticulous e-file dry cuticle detailing, architectural builder base alignment with Japanese gels, long-wear high gloss finish under cuticle.', 
        95, 75, 15, 'MANICURE_DESK', 
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
        '10000000-0000-4000-8000-000000000102', v_tenant_id, '10000000-0000-4000-8000-000000000010', 'Clean Bare Nail E-File Manicure', 
        'Non-toxic bare nail rejuvenation, gentle e-file dry cuticle contouring, organic keratin strengthener, warm botanical oil massage.', 
        75, 50, 15, 'MANICURE_DESK', 
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
        '10000000-0000-4000-8000-000000000103', v_tenant_id, '10000000-0000-4000-8000-000000000010', 'Japanese Eco-Gloss Manicure (P.Shine)', 
        'Holistic organic detox ritual with sea pearl minerals, diatomaceous clay paste, and organic beeswax sealing for brilliant healthy shine.', 
        85, 60, 15, 'MANICURE_DESK', 
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
        '10000000-0000-4000-8000-000000000104', v_tenant_id, '10000000-0000-4000-8000-000000000020', 'Smart Wellness Spa Pedicure & Gel', 
        'Smart podological disc heel smoothing with molecular oils, exfoliating peel, warm hydration treatment, and long-wear gel color.', 
        115, 90, 15, 'PEDICURE_CHAIR', 
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
        '10000000-0000-4000-8000-000000000105', v_tenant_id, '10000000-0000-4000-8000-000000000030', 'Aprés Gel-X / Sculpted Hard Gel Extensions', 
        'Custom-sculpted lightweight length with premium durability, bespoke shape (almond, square, or coffin), and high-gloss gel finish.', 
        145, 105, 15, 'MANICURE_DESK', 
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
        'Foreign Gel Removal', 'Gentle e-file removal of gel or acrylic from another salon without damaging the nail bed', 
        15, 15, 0, 1, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000202', v_tenant_id, NULL, 
        'Hard Gel / Structure Reinforcement', 'Reinforced apex architecture for soft or brittle nails to prevent breaking', 
        25, 15, 0, 2, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000203', v_tenant_id, NULL, 
        'French / Glazed Donut Chrome Finish', 'Precision French smile line, pearl chrome glaze, or cat-eye magnetic velvet finish', 
        30, 25, 0, 3, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000204', v_tenant_id, NULL, 
        'Bespoke Accent Nail Art (per nail)', 'Hand-painted minimalist line art, 3D chrome accents, or Swarovski crystal placement', 
        10, 10, 0, 4, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;
    INSERT INTO service_options (
        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000205', v_tenant_id, NULL, 
        'Single Nail Repair / Rebuild', 'Seamless repair of a chipped edge or broken corner using polygel or silk', 
        12, 10, 0, 5, true
    )
    ON CONFLICT (tenant_id, id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,
        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

    -- 7. Upsert Masters
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000301', v_tenant_id, 'Alena Vance', 'Master Artist & Lead Educator', 
        '7+ years experience. International Nail Aesthetic Pro winner. Renowned for impeccable micro-cuticle precision and architectural builder gels.', 
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
        '10000000-0000-4000-8000-000000000302', v_tenant_id, 'Victoria Kim', 'Senior Editorial Nail Stylist', 
        '5+ years experience. Runway & editorial specialist. Flawless 60-min Russian manicure and intricate hand-painted nail art.', 
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
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 0, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 1, '11:00', '21:00', true)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 2, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 3, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 4, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 5, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)
    VALUES (v_tenant_id, '10000000-0000-4000-8000-000000000302', 6, '11:00', '21:00', false)
    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;
    INSERT INTO masters (
        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active
    ) VALUES (
        '10000000-0000-4000-8000-000000000303', v_tenant_id, 'Catherine Moreau', 'Aesthetic Podology Specialist', 
        '6+ years experience with medical podology certification. Expert in restorative foot care, onycholysis, and holistic rejuvenation.', 
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