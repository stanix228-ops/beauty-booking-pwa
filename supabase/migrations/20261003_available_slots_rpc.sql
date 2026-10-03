-- Migration: 20261003_available_slots_rpc.sql
-- Function to calculate available booking slots with buffers, master schedules, and workplace availability

CREATE OR REPLACE FUNCTION get_available_slots(
    p_tenant_slug TEXT,
    p_service_id UUID,
    p_option_ids UUID[],
    p_master_id UUID, -- NULL = "Any master"
    p_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant tenants%ROWTYPE;
    v_service services%ROWTYPE;
    v_day_of_week INT;
    v_total_duration_min INT;
    v_opt_id UUID;
    v_opt RECORD;
    v_open_time TIME;
    v_close_time TIME;
    v_is_studio_closed BOOLEAN := false;
    v_slot_interval INTERVAL := '30 minutes'::interval;
    v_current_slot_start TIMESTAMPTZ;
    v_day_start TIMESTAMPTZ;
    v_day_end TIMESTAMPTZ;
    v_candidate_end TIMESTAMPTZ;
    v_min_start_time TIMESTAMPTZ;
    v_available_slots JSONB := '[]'::jsonb;
    v_master_candidates UUID[];
    v_available_masters UUID[];
    v_m_id UUID;
    v_master_sched master_schedules%ROWTYPE;
    v_is_master_free BOOLEAN;
    v_has_workplace_free BOOLEAN;
BEGIN
    -- 1. Fetch tenant
    SELECT * INTO v_tenant FROM tenants WHERE slug = p_tenant_slug AND is_active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Tenant not found');
    END IF;

    -- 2. Fetch service
    SELECT * INTO v_service FROM services WHERE tenant_id = v_tenant.id AND id = p_service_id AND is_active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Service not found');
    END IF;

    v_total_duration_min := v_service.duration_min + v_service.buffer_after_min;

    -- Add options duration
    IF p_option_ids IS NOT NULL AND array_length(p_option_ids, 1) > 0 THEN
        FOREACH v_opt_id IN ARRAY p_option_ids LOOP
            SELECT * INTO v_opt FROM service_options WHERE tenant_id = v_tenant.id AND id = v_opt_id AND is_active = true;
            IF FOUND THEN
                v_total_duration_min := v_total_duration_min + v_opt.duration_min + v_opt.buffer_after_min;
            END IF;
        END LOOP;
    END IF;

    -- Calculate day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
    v_day_of_week := EXTRACT(DOW FROM p_date);

    -- Check Studio Business Hours
    SELECT open_time, close_time, is_closed
    INTO v_open_time, v_close_time, v_is_studio_closed
    FROM studio_business_hours
    WHERE tenant_id = v_tenant.id AND day_of_week = v_day_of_week;

    IF v_is_studio_closed OR v_open_time IS NULL THEN
        RETURN '[]'::jsonb;
    END IF;

    -- Construct day start and end in tenant timezone
    v_day_start := (p_date || ' ' || v_open_time)::timestamp AT TIME ZONE v_tenant.timezone;
    v_day_end := (p_date || ' ' || v_close_time)::timestamp AT TIME ZONE v_tenant.timezone;

    -- Check studio schedule exception for this date
    SELECT is_working, open_time, close_time INTO v_opt
    FROM schedule_exceptions
    WHERE tenant_id = v_tenant.id AND master_id IS NULL
      AND p_date >= start_date AND p_date <= end_date
    LIMIT 1;

    IF FOUND THEN
        IF NOT v_opt.is_working THEN
            RETURN '[]'::jsonb;
        ELSIF v_opt.open_time IS NOT NULL AND v_opt.close_time IS NOT NULL THEN
            v_day_start := (p_date || ' ' || v_opt.open_time)::timestamp AT TIME ZONE v_tenant.timezone;
            v_day_end := (p_date || ' ' || v_opt.close_time)::timestamp AT TIME ZONE v_tenant.timezone;
        END IF;
    END IF;

    -- Min start time based on notice hours
    v_min_start_time := now() + (v_tenant.min_booking_notice_min || ' minutes')::interval;

    -- Determine candidate masters
    IF p_master_id IS NOT NULL THEN
        -- Check that this master is active and provides this service
        IF EXISTS (
            SELECT 1 FROM masters m
            JOIN master_services ms ON ms.master_id = m.id AND ms.tenant_id = v_tenant.id
            WHERE m.tenant_id = v_tenant.id AND m.id = p_master_id AND ms.service_id = v_service.id AND m.is_active = true
        ) THEN
            v_master_candidates := ARRAY[p_master_id];
        ELSE
            RETURN '[]'::jsonb;
        END IF;
    ELSE
        -- All active masters providing this service
        SELECT coalesce(array_agg(m.id), '{}') INTO v_master_candidates
        FROM masters m
        JOIN master_services ms ON ms.master_id = m.id AND ms.tenant_id = v_tenant.id
        WHERE m.tenant_id = v_tenant.id AND ms.service_id = v_service.id AND m.is_active = true;
    END IF;

    IF array_length(v_master_candidates, 1) IS NULL THEN
        RETURN '[]'::jsonb;
    END IF;

    -- Iterate through time slots from v_day_start to (v_day_end - v_total_duration_min)
    v_current_slot_start := v_day_start;

    WHILE v_current_slot_start + (v_total_duration_min || ' minutes')::interval <= v_day_end LOOP
        v_candidate_end := v_current_slot_start + (v_total_duration_min || ' minutes')::interval;

        -- Check notice time constraint
        IF v_current_slot_start >= v_min_start_time THEN
            v_available_masters := '{}';

            -- For each candidate master, check if available during this slot
            FOREACH v_m_id IN ARRAY v_master_candidates LOOP
                -- Check master working schedule for day of week
                SELECT * INTO v_master_sched
                FROM master_schedules
                WHERE tenant_id = v_tenant.id AND master_id = v_m_id AND day_of_week = v_day_of_week;

                -- If master has a schedule and not day off
                IF FOUND AND NOT v_master_sched.is_day_off THEN
                    -- Check if within master hours
                    IF (v_current_slot_start AT TIME ZONE v_tenant.timezone)::time >= v_master_sched.start_time
                       AND (v_candidate_end AT TIME ZONE v_tenant.timezone)::time <= v_master_sched.end_time THEN

                        -- Check master vacation or individual exception
                        IF NOT EXISTS (
                            SELECT 1 FROM schedule_exceptions
                            WHERE tenant_id = v_tenant.id AND master_id = v_m_id
                              AND p_date >= start_date AND p_date <= end_date AND NOT is_working
                        ) THEN
                            -- Check resource_occupancies for this master
                            IF NOT EXISTS (
                                SELECT 1 FROM resource_occupancies
                                WHERE tenant_id = v_tenant.id AND resource_id = v_m_id
                                  AND time_range && tstzrange(v_current_slot_start, v_candidate_end, '[)')
                            ) THEN
                                v_available_masters := array_append(v_available_masters, v_m_id);
                            END IF;
                        END IF;
                    END IF;
                END IF;
            END LOOP;

            -- Check if at least one workplace of required type is free during this slot
            v_has_workplace_free := EXISTS (
                SELECT 1 FROM workplaces w
                WHERE w.tenant_id = v_tenant.id
                  AND w.is_active = true
                  AND (w.type = v_service.required_workplace_type OR w.type = 'UNIVERSAL')
                  AND NOT EXISTS (
                      SELECT 1 FROM resource_occupancies ro
                      WHERE ro.tenant_id = v_tenant.id
                        AND ro.resource_id = w.id
                        AND ro.time_range && tstzrange(v_current_slot_start, v_candidate_end, '[)')
                  )
            );

            -- If at least one master and one workplace are free, slot is available!
            IF array_length(v_available_masters, 1) > 0 AND v_has_workplace_free THEN
                v_available_slots := v_available_slots || jsonb_build_object(
                    'time', to_char(v_current_slot_start AT TIME ZONE v_tenant.timezone, 'HH24:MI'),
                    'datetime', v_current_slot_start,
                    'available_master_ids', to_jsonb(v_available_masters)
                );
            END IF;
        END IF;

        v_current_slot_start := v_current_slot_start + v_slot_interval;
    END LOOP;

    RETURN v_available_slots;
END;
$$;

GRANT EXECUTE ON FUNCTION get_available_slots TO anon, authenticated;
