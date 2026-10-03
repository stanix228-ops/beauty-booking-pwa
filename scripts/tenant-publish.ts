import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTenant } from './tenant-validate';
import type { BusinessConfig } from './schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const tenantsDir = path.join(rootDir, 'tenants');
const generatedSqlDir = path.join(rootDir, 'supabase', 'generated');
const clientDataDir = path.join(rootDir, 'src', 'data');
const publicDir = path.join(rootDir, 'public');

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

function generateSqlSeed(config: BusinessConfig): string {
  const lines: string[] = [];

  lines.push(`-- ========================================================`);
  lines.push(`-- PUBLISH TENANT: ${config.name} (${config.slug})`);
  lines.push(`-- Generated automatically at: ${new Date().toISOString()}`);
  lines.push(`-- Preserves existing bookings, clients, and history!`);
  lines.push(`-- ========================================================\n`);

  lines.push(`DO $$`);
  lines.push(`DECLARE`);
  lines.push(`    v_tenant_id UUID := '${config.id}';`);
  lines.push(`BEGIN`);

  // 1. Tenant record
  lines.push(`    -- 1. Upsert Tenant`);
  lines.push(`    INSERT INTO tenants (`);
  lines.push(`        id, slug, name, tagline, phone, address, city, timezone, currency,`);
  lines.push(`        min_booking_notice_min, max_booking_horizon_days, cancellation_deadline_hours,`);
  lines.push(`        theme_accent_color, theme_bg_color, instructions, updated_at`);
  lines.push(`    ) VALUES (`);
  lines.push(`        v_tenant_id, '${escapeSql(config.slug)}', '${escapeSql(config.name)}', `);
  lines.push(`        ${config.tagline ? `'${escapeSql(config.tagline)}'` : 'NULL'}, `);
  lines.push(`        '${escapeSql(config.phone)}', '${escapeSql(config.address)}', '${escapeSql(config.city)}', `);
  lines.push(`        '${escapeSql(config.timezone)}', '${escapeSql(config.currency)}', `);
  lines.push(`        ${config.minBookingNoticeMin}, ${config.maxBookingHorizonDays}, ${config.cancellationDeadlineHours}, `);
  lines.push(`        '${escapeSql(config.theme.accentColor)}', '${escapeSql(config.theme.bgColor)}', `);
  lines.push(`        ${config.instructions ? `'${escapeSql(config.instructions)}'` : 'NULL'}, now()`);
  lines.push(`    )`);
  lines.push(`    ON CONFLICT (slug) DO UPDATE SET`);
  lines.push(`        name = EXCLUDED.name, tagline = EXCLUDED.tagline, phone = EXCLUDED.phone,`);
  lines.push(`        address = EXCLUDED.address, city = EXCLUDED.city, timezone = EXCLUDED.timezone,`);
  lines.push(`        min_booking_notice_min = EXCLUDED.min_booking_notice_min,`);
  lines.push(`        max_booking_horizon_days = EXCLUDED.max_booking_horizon_days,`);
  lines.push(`        cancellation_deadline_hours = EXCLUDED.cancellation_deadline_hours,`);
  lines.push(`        theme_accent_color = EXCLUDED.theme_accent_color,`);
  lines.push(`        theme_bg_color = EXCLUDED.theme_bg_color,`);
  lines.push(`        instructions = EXCLUDED.instructions,`);
  lines.push(`        updated_at = now();\n`);

  // 2. Business Hours
  lines.push(`    -- 2. Upsert Studio Business Hours`);
  for (const bh of config.businessHours) {
    lines.push(`    INSERT INTO studio_business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)`);
    lines.push(`    VALUES (v_tenant_id, ${bh.dayOfWeek}, '${bh.openTime}', '${bh.closeTime}', ${bh.isClosed})`);
    lines.push(`    ON CONFLICT (tenant_id, day_of_week) DO UPDATE SET`);
    lines.push(`        open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed;`);
  }
  lines.push('');

  // 3. Workplaces
  lines.push(`    -- 3. Upsert Workplaces`);
  for (const w of config.workplaces) {
    lines.push(`    INSERT INTO workplaces (id, tenant_id, name, type, is_active)`);
    lines.push(`    VALUES ('${w.id}', v_tenant_id, '${escapeSql(w.name)}', '${w.type}', ${w.isActive})`);
    lines.push(`    ON CONFLICT (tenant_id, id) DO UPDATE SET`);
    lines.push(`        name = EXCLUDED.name, type = EXCLUDED.type, is_active = EXCLUDED.is_active;`);
  }
  lines.push('');

  // 4. Categories
  lines.push(`    -- 4. Upsert Categories`);
  for (const c of config.categories) {
    lines.push(`    INSERT INTO service_categories (id, tenant_id, name, display_order, is_active)`);
    lines.push(`    VALUES ('${c.id}', v_tenant_id, '${escapeSql(c.name)}', ${c.displayOrder}, ${c.isActive})`);
    lines.push(`    ON CONFLICT (tenant_id, id) DO UPDATE SET`);
    lines.push(`        name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;`);
  }
  lines.push('');

  // 5. Services
  lines.push(`    -- 5. Upsert Services`);
  for (const s of config.services) {
    lines.push(`    INSERT INTO services (`);
    lines.push(`        id, tenant_id, category_id, name, description, price, duration_min,`);
    lines.push(`        buffer_after_min, required_workplace_type, image_url, display_order, is_active, updated_at`);
    lines.push(`    ) VALUES (`);
    lines.push(`        '${s.id}', v_tenant_id, '${s.categoryId}', '${escapeSql(s.name)}', `);
    lines.push(`        ${s.description ? `'${escapeSql(s.description)}'` : 'NULL'}, `);
    lines.push(`        ${s.price}, ${s.durationMin}, ${s.bufferAfterMin}, '${s.requiredWorkplaceType}', `);
    lines.push(`        ${s.imageUrl ? `'${escapeSql(s.imageUrl)}'` : 'NULL'}, ${s.displayOrder}, ${s.isActive}, now()`);
    lines.push(`    )`);
    lines.push(`    ON CONFLICT (tenant_id, id) DO UPDATE SET`);
    lines.push(`        category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description,`);
    lines.push(`        price = EXCLUDED.price, duration_min = EXCLUDED.duration_min,`);
    lines.push(`        buffer_after_min = EXCLUDED.buffer_after_min,`);
    lines.push(`        required_workplace_type = EXCLUDED.required_workplace_type,`);
    lines.push(`        image_url = EXCLUDED.image_url, display_order = EXCLUDED.display_order,`);
    lines.push(`        is_active = EXCLUDED.is_active, updated_at = now();`);
  }
  lines.push('');

  // 6. Service Options
  lines.push(`    -- 6. Upsert Service Options`);
  for (const opt of config.options) {
    lines.push(`    INSERT INTO service_options (`);
    lines.push(`        id, tenant_id, service_id, name, description, price, duration_min, buffer_after_min, display_order, is_active`);
    lines.push(`    ) VALUES (`);
    lines.push(`        '${opt.id}', v_tenant_id, ${opt.serviceId ? `'${opt.serviceId}'` : 'NULL'}, `);
    lines.push(`        '${escapeSql(opt.name)}', ${opt.description ? `'${escapeSql(opt.description)}'` : 'NULL'}, `);
    lines.push(`        ${opt.price}, ${opt.durationMin}, ${opt.bufferAfterMin}, ${opt.displayOrder}, ${opt.isActive}`);
    lines.push(`    )`);
    lines.push(`    ON CONFLICT (tenant_id, id) DO UPDATE SET`);
    lines.push(`        name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,`);
    lines.push(`        duration_min = EXCLUDED.duration_min, buffer_after_min = EXCLUDED.buffer_after_min,`);
    lines.push(`        display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;`);
  }
  lines.push('');

  // 7. Masters & Master Services & Master Schedules
  lines.push(`    -- 7. Upsert Masters`);
  for (const m of config.masters) {
    lines.push(`    INSERT INTO masters (`);
    lines.push(`        id, tenant_id, name, title, bio, avatar_url, rating, reviews_count, display_order, is_active`);
    lines.push(`    ) VALUES (`);
    lines.push(`        '${m.id}', v_tenant_id, '${escapeSql(m.name)}', '${escapeSql(m.title)}', `);
    lines.push(`        ${m.bio ? `'${escapeSql(m.bio)}'` : 'NULL'}, `);
    lines.push(`        ${m.avatarUrl ? `'${escapeSql(m.avatarUrl)}'` : 'NULL'}, `);
    lines.push(`        ${m.rating}, ${m.reviewsCount}, ${m.displayOrder}, ${m.isActive}`);
    lines.push(`    )`);
    lines.push(`    ON CONFLICT (tenant_id, id) DO UPDATE SET`);
    lines.push(`        name = EXCLUDED.name, title = EXCLUDED.title, bio = EXCLUDED.bio,`);
    lines.push(`        avatar_url = EXCLUDED.avatar_url, rating = EXCLUDED.rating,`);
    lines.push(`        reviews_count = EXCLUDED.reviews_count, display_order = EXCLUDED.display_order,`);
    lines.push(`        is_active = EXCLUDED.is_active;`);

    // Master services
    for (const sId of m.serviceIds) {
      lines.push(`    INSERT INTO master_services (tenant_id, master_id, service_id)`);
      lines.push(`    VALUES (v_tenant_id, '${m.id}', '${sId}') ON CONFLICT DO NOTHING;`);
    }

    // Master schedules
    for (const sch of m.schedule) {
      lines.push(`    INSERT INTO master_schedules (tenant_id, master_id, day_of_week, start_time, end_time, is_day_off)`);
      lines.push(`    VALUES (v_tenant_id, '${m.id}', ${sch.dayOfWeek}, '${sch.startTime}', '${sch.endTime}', ${sch.isDayOff})`);
      lines.push(`    ON CONFLICT (tenant_id, master_id, day_of_week) DO UPDATE SET`);
      lines.push(`        start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_day_off = EXCLUDED.is_day_off;`);
    }
  }

  lines.push(`\n    RAISE NOTICE 'Tenant "%" published successfully.', '${escapeSql(config.slug)}';`);
  lines.push(`END $$;`);

  return lines.join('\n');
}

function generatePwaManifest(config: BusinessConfig): string {
  const manifest = {
    id: `/s/${config.slug}/`,
    name: config.name,
    short_name: config.name.slice(0, 12),
    description: config.tagline || `${config.name} — Онлайн-запись на маникюр и педикюр`,
    start_url: `/s/${config.slug}/`,
    scope: `/s/${config.slug}/`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: config.theme.bgColor,
    theme_color: config.theme.accentColor,
    icons: [
      {
        src: `/tenants/${config.slug}/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/tenants/${config.slug}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
  };
  return JSON.stringify(manifest, null, 2);
}

export function publishAll() {
  if (!fs.existsSync(generatedSqlDir)) {
    fs.mkdirSync(generatedSqlDir, { recursive: true });
  }

  const tenantDirs = fs.readdirSync(tenantsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const configs: Record<string, BusinessConfig> = {};

  console.log(`\n🚀 Publishing ${tenantDirs.length} tenant(s)...\n`);

  for (const slug of tenantDirs) {
    const val = validateTenant(slug);
    if (!val.success || !val.config) {
      console.error(`❌ Validation failed for ${slug}:`);
      for (const err of val.errors) console.error(`   - ${err}`);
      process.exit(1);
    }

    const config = val.config;
    configs[config.slug] = config;

    // 1. Generate SQL migration
    const sqlContent = generateSqlSeed(config);
    const sqlFile = path.join(generatedSqlDir, `publish_${config.slug}.sql`);
    fs.writeFileSync(sqlFile, sqlContent, 'utf-8');
    console.log(`📜 Generated SQL: supabase/generated/publish_${config.slug}.sql`);

    // 2. Generate PWA manifest in public folder
    const tenantPublicDir = path.join(publicDir, 'tenants', config.slug);
    fs.mkdirSync(tenantPublicDir, { recursive: true });
    const manifestFile = path.join(tenantPublicDir, 'manifest.webmanifest');
    fs.writeFileSync(manifestFile, generatePwaManifest(config), 'utf-8');
    console.log(`📱 Generated PWA Manifest: public/tenants/${config.slug}/manifest.webmanifest`);
  }

  // 3. Export static bundle registry into src/data/tenants.ts
  if (!fs.existsSync(clientDataDir)) {
    fs.mkdirSync(clientDataDir, { recursive: true });
  }

  const tenantsTsContent = `// Auto-generated by tenant-publish.ts. DO NOT EDIT DIRECTLY.
import type { BusinessConfig } from '../../scripts/schema';

export const TENANTS_REGISTRY: Record<string, BusinessConfig> = ${JSON.stringify(configs, null, 2)};

export function getTenantBySlug(slug: string): BusinessConfig | undefined {
  return TENANTS_REGISTRY[slug];
}
`;

  fs.writeFileSync(path.join(clientDataDir, 'tenants.ts'), tenantsTsContent, 'utf-8');
  console.log(`📦 Bundled Tenant Registry: src/data/tenants.ts`);
  console.log(`\n✨ Publishing complete for all tenants!`);
}

publishAll();
