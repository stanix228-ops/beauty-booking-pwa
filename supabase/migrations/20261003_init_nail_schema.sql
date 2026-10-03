-- Migration: 20261003_init_nail_schema.sql
-- Multi-tenant Nail & Beauty Studio Booking Engine with EXCLUDE Overlap Prevention

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- 1. TENANTS & MEMBERSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Москва',
    timezone TEXT NOT NULL DEFAULT 'Europe/Moscow',
    currency TEXT NOT NULL DEFAULT 'RUB',
    min_booking_notice_min INT NOT NULL DEFAULT 60,
    max_booking_horizon_days INT NOT NULL DEFAULT 30,
    cancellation_deadline_hours INT NOT NULL DEFAULT 4,
    theme_accent_color TEXT NOT NULL DEFAULT '#E89CAE',
    theme_bg_color TEXT NOT NULL DEFAULT '#0D0D11',
    instructions TEXT,
    logo_url TEXT,
    hero_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id)
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- ============================================================================
-- 2. WORKPLACES & CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS workplaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'MANICURE_DESK' CHECK (type IN ('MANICURE_DESK', 'PEDICURE_CHAIR', 'UNIVERSAL')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);

CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);

-- ============================================================================
-- 3. SERVICES & SERVICE OPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    duration_min INT NOT NULL CHECK (duration_min > 0),
    buffer_after_min INT NOT NULL DEFAULT 15 CHECK (buffer_after_min >= 0),
    required_workplace_type TEXT NOT NULL DEFAULT 'MANICURE_DESK' CHECK (required_workplace_type IN ('MANICURE_DESK', 'PEDICURE_CHAIR', 'UNIVERSAL')),
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    FOREIGN KEY (tenant_id, category_id) REFERENCES service_categories(tenant_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID, -- NULL means applicable to all nail services
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    duration_min INT NOT NULL DEFAULT 0 CHECK (duration_min >= 0),
    buffer_after_min INT NOT NULL DEFAULT 0 CHECK (buffer_after_min >= 0),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    FOREIGN KEY (tenant_id, service_id) REFERENCES services(tenant_id, id) ON DELETE CASCADE
);

-- ============================================================================
-- 4. MASTERS & SCHEDULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'Мастер ногтевого сервиса',
    bio TEXT,
    avatar_url TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    reviews_count INT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);

CREATE TABLE IF NOT EXISTS master_services (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    master_id UUID NOT NULL,
    service_id UUID NOT NULL,
    PRIMARY KEY (tenant_id, master_id, service_id),
    FOREIGN KEY (tenant_id, master_id) REFERENCES masters(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, service_id) REFERENCES services(tenant_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS studio_business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS master_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    master_id UUID NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_day_off BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, master_id, day_of_week),
    FOREIGN KEY (tenant_id, master_id) REFERENCES masters(tenant_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    master_id UUID, -- NULL = studio wide
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_working BOOLEAN NOT NULL DEFAULT false,
    open_time TIME,
    close_time TIME,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (tenant_id, master_id) REFERENCES masters(tenant_id, id) ON DELETE CASCADE
);

-- ============================================================================
-- 5. CLIENTS & BOOKINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, phone)
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_number TEXT NOT NULL,
    client_id UUID NOT NULL,
    master_id UUID NOT NULL,
    workplace_id UUID,
    status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    token_hash TEXT NOT NULL, -- SHA-256 of the secret client access token
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    FOREIGN KEY (tenant_id, client_id) REFERENCES clients(tenant_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (tenant_id, master_id) REFERENCES masters(tenant_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (tenant_id, workplace_id) REFERENCES workplaces(tenant_id, id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS booking_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL,
    service_id UUID NOT NULL,
    price_at_booking NUMERIC(10, 2) NOT NULL,
    duration_min_at_booking INT NOT NULL,
    UNIQUE(tenant_id, id),
    FOREIGN KEY (tenant_id, booking_id) REFERENCES bookings(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, service_id) REFERENCES services(tenant_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS booking_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL,
    option_id UUID NOT NULL,
    price_at_booking NUMERIC(10, 2) NOT NULL,
    duration_min_at_booking INT NOT NULL,
    UNIQUE(tenant_id, id),
    FOREIGN KEY (tenant_id, booking_id) REFERENCES bookings(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, option_id) REFERENCES service_options(tenant_id, id) ON DELETE RESTRICT
);

-- ============================================================================
-- 6. RESOURCE OCCUPANCIES (EXCLUDE Overlap Prevention)
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_occupancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('MASTER', 'WORKPLACE')),
    resource_id UUID NOT NULL,
    booking_id UUID,
    reason TEXT NOT NULL DEFAULT 'BOOKING' CHECK (reason IN ('BOOKING', 'BREAK', 'VACATION', 'MAINTENANCE')),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    time_range TSTZRANGE GENERATED ALWAYS AS (tstzrange(start_at, end_at, '[)')) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_valid_time_interval CHECK (end_at > start_at),
    CONSTRAINT no_overlapping_occupancy EXCLUDE USING gist (
        tenant_id WITH =,
        resource_id WITH =,
        time_range WITH &&
    ),
    FOREIGN KEY (tenant_id, booking_id) REFERENCES bookings(tenant_id, id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. PAYMENTS, NOTIFICATIONS & AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PENDING', 'PAID', 'REFUNDED')),
    payment_method TEXT NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'CARD', 'ONLINE', 'SBP')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (tenant_id, booking_id) REFERENCES bookings(tenant_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED', 'REMINDER_24H', 'REMINDER_2H')),
    idempotency_key TEXT UNIQUE NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
    retry_count INT NOT NULL DEFAULT 0,
    leased_until TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (tenant_id, booking_id) REFERENCES bookings(tenant_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booking_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL,
    action TEXT NOT NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('CLIENT', 'OWNER', 'SYSTEM')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limit_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, key)
);

-- ============================================================================
-- 8. INDEXES FOR HIGH-THROUGHPUT LOOKUPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_services_tenant_category ON services(tenant_id, category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_masters_tenant_active ON masters(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_status ON bookings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_start ON bookings(tenant_id, start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_token_hash ON bookings(token_hash);
CREATE INDEX IF NOT EXISTS idx_occupancies_tenant_res ON resource_occupancies(tenant_id, resource_id);
CREATE INDEX IF NOT EXISTS idx_occupancies_time_range ON resource_occupancies USING gist (time_range);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_lease ON notification_jobs(status, leased_until) WHERE status IN ('PENDING', 'FAILED');

-- ============================================================================
-- 9. ATOMIC BOOKING PROCEDURES & RPC
-- ============================================================================

-- Function: create_booking_atomic
CREATE OR REPLACE FUNCTION create_booking_atomic(
    p_tenant_slug TEXT,
    p_service_id UUID,
    p_option_ids UUID[],
    p_master_id UUID, -- If NULL, system auto-picks an available master
    p_start_at TIMESTAMPTZ,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_token_hash TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant tenants%ROWTYPE;
    v_service services%ROWTYPE;
    v_master masters%ROWTYPE;
    v_workplace workplaces%ROWTYPE;
    v_client clients%ROWTYPE;
    v_booking bookings%ROWTYPE;
    v_total_duration_min INT;
    v_total_price NUMERIC(10, 2);
    v_end_at TIMESTAMPTZ;
    v_booking_number TEXT;
    v_opt RECORD;
    v_chosen_master_id UUID := p_master_id;
    v_chosen_workplace_id UUID;
    v_opt_id UUID;
BEGIN
    -- 1. Find tenant
    SELECT * INTO v_tenant FROM tenants WHERE slug = p_tenant_slug AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tenant "%" not found or inactive', p_tenant_slug;
    END IF;

    -- 2. Validate Service
    SELECT * INTO v_service FROM services WHERE tenant_id = v_tenant.id AND id = p_service_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service "%" not found or inactive', p_service_id;
    END IF;

    v_total_duration_min := v_service.duration_min + v_service.buffer_after_min;
    v_total_price := v_service.price;

    -- 3. Calculate additional options price and duration
    IF p_option_ids IS NOT NULL AND array_length(p_option_ids, 1) > 0 THEN
        FOREACH v_opt_id IN ARRAY p_option_ids LOOP
            SELECT * INTO v_opt FROM service_options WHERE tenant_id = v_tenant.id AND id = v_opt_id AND is_active = true;
            IF FOUND THEN
                v_total_duration_min := v_total_duration_min + v_opt.duration_min + v_opt.buffer_after_min;
                v_total_price := v_total_price + v_opt.price;
            END IF;
        END LOOP;
    END IF;

    v_end_at := p_start_at + (v_total_duration_min || ' minutes')::interval;

    -- 4. Auto-pick master if not specified ("Any master")
    IF v_chosen_master_id IS NULL THEN
        SELECT m.id INTO v_chosen_master_id
        FROM masters m
        JOIN master_services ms ON ms.master_id = m.id AND ms.tenant_id = v_tenant.id
        WHERE m.tenant_id = v_tenant.id
          AND ms.service_id = v_service.id
          AND m.is_active = true
          AND NOT EXISTS (
              SELECT 1 FROM resource_occupancies ro
              WHERE ro.tenant_id = v_tenant.id
                AND ro.resource_id = m.id
                AND ro.time_range && tstzrange(p_start_at, v_end_at, '[)')
          )
        ORDER BY m.rating DESC, random()
        LIMIT 1;

        IF v_chosen_master_id IS NULL THEN
            RAISE EXCEPTION 'No available master for the selected time range [%, %]', p_start_at, v_end_at;
        END IF;
    ELSE
        -- Validate chosen master
        SELECT * INTO v_master FROM masters WHERE tenant_id = v_tenant.id AND id = v_chosen_master_id AND is_active = true;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Master not found or inactive';
        END IF;
    END IF;

    -- 5. Auto-pick available workplace matching requirement
    SELECT w.id INTO v_chosen_workplace_id
    FROM workplaces w
    WHERE w.tenant_id = v_tenant.id
      AND w.is_active = true
      AND (w.type = v_service.required_workplace_type OR w.type = 'UNIVERSAL')
      AND NOT EXISTS (
          SELECT 1 FROM resource_occupancies ro
          WHERE ro.tenant_id = v_tenant.id
            AND ro.resource_id = w.id
            AND ro.time_range && tstzrange(p_start_at, v_end_at, '[)')
      )
    ORDER BY w.name ASC
    LIMIT 1;

    -- 6. Upsert client
    INSERT INTO clients (tenant_id, name, phone)
    VALUES (v_tenant.id, trim(p_client_name), trim(p_client_phone))
    ON CONFLICT (tenant_id, phone) DO UPDATE
    SET name = EXCLUDED.name, updated_at = now()
    RETURNING * INTO v_client;

    -- 7. Generate booking number (e.g. LUMI-7821)
    v_booking_number := upper(substring(v_tenant.slug from 1 for 4)) || '-' || to_char(now(), 'DDMM') || '-' || floor(random() * 8999 + 1000)::text;

    -- 8. Insert Booking
    INSERT INTO bookings (
        tenant_id, booking_number, client_id, master_id, workplace_id,
        status, start_at, end_at, total_price, token_hash, notes
    )
    VALUES (
        v_tenant.id, v_booking_number, v_client.id, v_chosen_master_id, v_chosen_workplace_id,
        'CREATED', p_start_at, v_end_at, v_total_price, p_token_hash, p_notes
    )
    RETURNING * INTO v_booking;

    -- 9. Insert Primary Booking Service
    INSERT INTO booking_services (tenant_id, booking_id, service_id, price_at_booking, duration_min_at_booking)
    VALUES (v_tenant.id, v_booking.id, v_service.id, v_service.price, v_service.duration_min);

    -- 10. Insert Selected Options
    IF p_option_ids IS NOT NULL AND array_length(p_option_ids, 1) > 0 THEN
        FOREACH v_opt_id IN ARRAY p_option_ids LOOP
            SELECT * INTO v_opt FROM service_options WHERE tenant_id = v_tenant.id AND id = v_opt_id AND is_active = true;
            IF FOUND THEN
                INSERT INTO booking_options (tenant_id, booking_id, option_id, price_at_booking, duration_min_at_booking)
                VALUES (v_tenant.id, v_booking.id, v_opt.id, v_opt.price, v_opt.duration_min);
            END IF;
        END LOOP;
    END IF;

    -- 11. Lock Master in resource_occupancies (Triggers EXCLUDE constraint if conflict!)
    INSERT INTO resource_occupancies (
        tenant_id, resource_type, resource_id, booking_id, reason, start_at, end_at
    )
    VALUES (
        v_tenant.id, 'MASTER', v_chosen_master_id, v_booking.id, 'BOOKING', p_start_at, v_end_at
    );

    -- 12. Lock Workplace in resource_occupancies if assigned
    IF v_chosen_workplace_id IS NOT NULL THEN
        INSERT INTO resource_occupancies (
            tenant_id, resource_type, resource_id, booking_id, reason, start_at, end_at
        )
        VALUES (
            v_tenant.id, 'WORKPLACE', v_chosen_workplace_id, v_booking.id, 'BOOKING', p_start_at, v_end_at
        );
    END IF;

    -- 13. Audit log
    INSERT INTO booking_audit_logs (tenant_id, booking_id, action, actor_type, details)
    VALUES (
        v_tenant.id, v_booking.id, 'CREATED', 'CLIENT',
        jsonb_build_object(
            'service_id', v_service.id,
            'master_id', v_chosen_master_id,
            'workplace_id', v_chosen_workplace_id,
            'total_price', v_total_price,
            'start_at', p_start_at,
            'end_at', v_end_at
        )
    );

    -- 14. Push to Notification Outbox
    INSERT INTO notification_jobs (
        tenant_id, booking_id, type, idempotency_key, payload
    )
    VALUES (
        v_tenant.id, v_booking.id, 'BOOKING_CREATED',
        'create_' || v_booking.id || '_' || extract(epoch from now())::text,
        jsonb_build_object(
            'booking_number', v_booking_number,
            'client_name', v_client.name,
            'client_phone', v_client.phone,
            'service_name', v_service.name,
            'start_at', p_start_at,
            'total_price', v_total_price
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking.id,
        'booking_number', v_booking_number,
        'master_id', v_chosen_master_id,
        'workplace_id', v_chosen_workplace_id,
        'start_at', p_start_at,
        'end_at', v_end_at,
        'total_price', v_total_price,
        'status', v_booking.status
    );
END;
$$;

-- Function: reschedule_booking_atomic
CREATE OR REPLACE FUNCTION reschedule_booking_atomic(
    p_booking_id UUID,
    p_token_hash TEXT,
    p_new_start_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking bookings%ROWTYPE;
    v_total_duration_interval INTERVAL;
    v_new_end_at TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id AND token_hash = p_token_hash;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or invalid token';
    END IF;

    IF v_booking.status IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') THEN
        RAISE EXCEPTION 'Cannot reschedule booking with status %', v_booking.status;
    END IF;

    v_total_duration_interval := v_booking.end_at - v_booking.start_at;
    v_new_end_at := p_new_start_at + v_total_duration_interval;

    -- Delete existing occupancies for this booking
    DELETE FROM resource_occupancies WHERE booking_id = v_booking.id;

    -- Attempt to insert new occupancies for Master
    INSERT INTO resource_occupancies (
        tenant_id, resource_type, resource_id, booking_id, reason, start_at, end_at
    )
    VALUES (
        v_booking.tenant_id, 'MASTER', v_booking.master_id, v_booking.id, 'BOOKING', p_new_start_at, v_new_end_at
    );

    -- Attempt to insert new occupancies for Workplace if assigned
    IF v_booking.workplace_id IS NOT NULL THEN
        INSERT INTO resource_occupancies (
            tenant_id, resource_type, resource_id, booking_id, reason, start_at, end_at
        )
        VALUES (
            v_booking.tenant_id, 'WORKPLACE', v_booking.workplace_id, v_booking.id, 'BOOKING', p_new_start_at, v_new_end_at
        );
    END IF;

    -- Update booking
    UPDATE bookings
    SET start_at = p_new_start_at,
        end_at = v_new_end_at,
        status = 'CONFIRMED',
        updated_at = now()
    WHERE id = v_booking.id;

    -- Outbox job
    INSERT INTO notification_jobs (
        tenant_id, booking_id, type, idempotency_key, payload
    )
    VALUES (
        v_booking.tenant_id, v_booking.id, 'BOOKING_RESCHEDULED',
        'resched_' || v_booking.id || '_' || extract(epoch from now())::text,
        jsonb_build_object(
            'booking_number', v_booking.booking_number,
            'old_start_at', v_booking.start_at,
            'new_start_at', p_new_start_at
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking.id,
        'new_start_at', p_new_start_at,
        'new_end_at', v_new_end_at
    );
END;
$$;

-- Function: cancel_booking_atomic
CREATE OR REPLACE FUNCTION cancel_booking_atomic(
    p_booking_id UUID,
    p_token_hash TEXT,
    p_reason TEXT DEFAULT 'Cancelled by client'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking bookings%ROWTYPE;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id AND token_hash = p_token_hash;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or invalid token';
    END IF;

    IF v_booking.status = 'CANCELLED' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already cancelled');
    END IF;

    -- Free resources
    DELETE FROM resource_occupancies WHERE booking_id = v_booking.id;

    -- Update status
    UPDATE bookings
    SET status = 'CANCELLED',
        cancellation_reason = p_reason,
        updated_at = now()
    WHERE id = v_booking.id;

    -- Outbox job
    INSERT INTO notification_jobs (
        tenant_id, booking_id, type, idempotency_key, payload
    )
    VALUES (
        v_booking.tenant_id, v_booking.id, 'BOOKING_CANCELLED',
        'cancel_' || v_booking.id || '_' || extract(epoch from now())::text,
        jsonb_build_object(
            'booking_number', v_booking.booking_number,
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking.id,
        'status', 'CANCELLED'
    );
END;
$$;

-- Function: block_master_time_atomic
CREATE OR REPLACE FUNCTION block_master_time_atomic(
    p_tenant_id UUID,
    p_master_id UUID,
    p_start_at TIMESTAMPTZ,
    p_end_at TIMESTAMPTZ,
    p_reason TEXT DEFAULT 'BREAK'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_occupancy_id UUID;
BEGIN
    INSERT INTO resource_occupancies (
        tenant_id, resource_type, resource_id, booking_id, reason, start_at, end_at
    )
    VALUES (
        p_tenant_id, 'MASTER', p_master_id, NULL, p_reason, p_start_at, p_end_at
    )
    RETURNING id INTO v_occupancy_id;

    RETURN jsonb_build_object(
        'success', true,
        'occupancy_id', v_occupancy_id,
        'start_at', p_start_at,
        'end_at', p_end_at
    );
END;
$$;

-- Function: lookup_booking_by_token
CREATE OR REPLACE FUNCTION lookup_booking_by_token(
    p_tenant_slug TEXT,
    p_token_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant tenants%ROWTYPE;
    v_res JSONB;
BEGIN
    SELECT * INTO v_tenant FROM tenants WHERE slug = p_tenant_slug AND is_active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Tenant not found');
    END IF;

    SELECT jsonb_build_object(
        'id', b.id,
        'booking_number', b.booking_number,
        'status', b.status,
        'start_at', b.start_at,
        'end_at', b.end_at,
        'total_price', b.total_price,
        'notes', b.notes,
        'client', jsonb_build_object('name', c.name, 'phone', c.phone),
        'master', jsonb_build_object('id', m.id, 'name', m.name, 'title', m.title, 'avatar_url', m.avatar_url),
        'workplace', CASE WHEN w.id IS NOT NULL THEN jsonb_build_object('id', w.id, 'name', w.name) ELSE NULL END,
        'services', (
            SELECT coalesce(jsonb_agg(jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'price', bs.price_at_booking,
                'duration_min', bs.duration_min_at_booking
            )), '[]'::jsonb)
            FROM booking_services bs
            JOIN services s ON s.id = bs.service_id
            WHERE bs.booking_id = b.id
        ),
        'options', (
            SELECT coalesce(jsonb_agg(jsonb_build_object(
                'id', so.id,
                'name', so.name,
                'price', bo.price_at_booking,
                'duration_min', bo.duration_min_at_booking
            )), '[]'::jsonb)
            FROM booking_options bo
            JOIN service_options so ON so.id = bo.option_id
            WHERE bo.booking_id = b.id
        ),
        'studio', jsonb_build_object(
            'name', v_tenant.name,
            'address', v_tenant.address,
            'phone', v_tenant.phone,
            'instructions', v_tenant.instructions
        )
    ) INTO v_res
    FROM bookings b
    JOIN clients c ON c.id = b.client_id
    JOIN masters m ON m.id = b.master_id
    LEFT JOIN workplaces w ON w.id = b.workplace_id
    WHERE b.tenant_id = v_tenant.id AND b.token_hash = p_token_hash;

    IF v_res IS NULL THEN
        RETURN jsonb_build_object('error', 'Booking not found');
    END IF;

    RETURN v_res;
END;
$$;

-- Function: get_studio_stats
CREATE OR REPLACE FUNCTION get_studio_stats(
    p_tenant_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_created_count INT := 0;
    v_confirmed_count INT := 0;
    v_completed_count INT := 0;
    v_cancelled_count INT := 0;
    v_noshow_count INT := 0;
    v_actual_revenue NUMERIC(10, 2) := 0;
    v_projected_revenue NUMERIC(10, 2) := 0;
BEGIN
    SELECT
        count(*) FILTER (WHERE status = 'CREATED'),
        count(*) FILTER (WHERE status = 'CONFIRMED'),
        count(*) FILTER (WHERE status = 'COMPLETED'),
        count(*) FILTER (WHERE status = 'CANCELLED'),
        count(*) FILTER (WHERE status = 'NO_SHOW'),
        coalesce(sum(total_price) FILTER (WHERE status = 'COMPLETED'), 0),
        coalesce(sum(total_price) FILTER (WHERE status IN ('CREATED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED')), 0)
    INTO
        v_created_count,
        v_confirmed_count,
        v_completed_count,
        v_cancelled_count,
        v_noshow_count,
        v_actual_revenue,
        v_projected_revenue
    FROM bookings
    WHERE tenant_id = p_tenant_id
      AND start_at >= p_start_date
      AND start_at <= p_end_date;

    RETURN jsonb_build_object(
        'created_count', v_created_count,
        'confirmed_count', v_confirmed_count,
        'completed_count', v_completed_count,
        'cancelled_count', v_cancelled_count,
        'noshow_count', v_noshow_count,
        'actual_revenue', v_actual_revenue,
        'projected_revenue', v_projected_revenue,
        'period_start', p_start_date,
        'period_end', p_end_date
    );
END;
$$;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) & GRANTS
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_occupancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_usage ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies
CREATE POLICY "Public tenants viewable" ON tenants FOR SELECT USING (is_active = true);
CREATE POLICY "Public categories viewable" ON service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public services viewable" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public options viewable" ON service_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public masters viewable" ON masters FOR SELECT USING (is_active = true);
CREATE POLICY "Public master_services viewable" ON master_services FOR SELECT USING (true);
CREATE POLICY "Public business hours viewable" ON studio_business_hours FOR SELECT USING (true);
CREATE POLICY "Public master schedules viewable" ON master_schedules FOR SELECT USING (true);

-- Authenticated owner / staff policies
CREATE POLICY "Owner manage tenants" ON tenants FOR ALL TO authenticated
    USING (id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

CREATE POLICY "Owner manage categories" ON service_categories FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

CREATE POLICY "Owner manage services" ON services FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

CREATE POLICY "Owner manage options" ON service_options FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

CREATE POLICY "Owner manage masters" ON masters FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

CREATE POLICY "Owner manage bookings" ON bookings FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

CREATE POLICY "Owner manage occupancies" ON resource_occupancies FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

CREATE POLICY "Owner manage clients" ON clients FOR ALL TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid()));

-- Grants
GRANT SELECT ON tenants, service_categories, services, service_options, masters, master_services, studio_business_hours, master_schedules TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_booking_atomic TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reschedule_booking_atomic TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cancel_booking_atomic TO anon, authenticated;
GRANT EXECUTE ON FUNCTION lookup_booking_by_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION block_master_time_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION get_studio_stats TO authenticated;
