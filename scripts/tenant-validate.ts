import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BusinessConfigSchema, type BusinessConfig } from './schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const tenantsDir = path.join(rootDir, 'tenants');

export function validateTenant(slug: string): { success: boolean; config?: BusinessConfig; errors: string[] } {
  const errors: string[] = [];
  const tenantDir = path.join(tenantsDir, slug);
  const configFile = path.join(tenantDir, 'business.json');

  if (!fs.existsSync(configFile)) {
    return { success: false, errors: [`business.json not found in ${tenantDir}`] };
  }

  let rawData: unknown;
  try {
    rawData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  } catch (err) {
    return { success: false, errors: [`JSON parse error in ${configFile}: ${(err as Error).message}`] };
  }

  const parseResult = BusinessConfigSchema.safeParse(rawData);
  if (!parseResult.success) {
    const formatted = parseResult.error.issues.map(
      (issue) => `[${issue.path.join('.')}] ${issue.message}`
    );
    return { success: false, errors: formatted };
  }

  const config = parseResult.data;

  // Semantic Cross-checks
  const categoryIds = new Set(config.categories.map((c) => c.id));
  const serviceIds = new Set(config.services.map((s) => s.id));

  for (const s of config.services) {
    if (!categoryIds.has(s.categoryId)) {
      errors.push(`Service "${s.name}" (${s.id}) references unknown categoryId "${s.categoryId}"`);
    }
  }

  for (const opt of config.options) {
    if (opt.serviceId && !serviceIds.has(opt.serviceId)) {
      errors.push(`Option "${opt.name}" (${opt.id}) references unknown serviceId "${opt.serviceId}"`);
    }
  }

  for (const m of config.masters) {
    for (const sId of m.serviceIds) {
      if (!serviceIds.has(sId)) {
        errors.push(`Master "${m.name}" references non-existent serviceId "${sId}"`);
      }
    }
    const daysCovered = new Set(m.schedule.map((sch) => sch.dayOfWeek));
    if (daysCovered.size < 7) {
      errors.push(`Master "${m.name}" schedule must define all 7 days of the week (missing days)`);
    }
  }

  const studioDays = new Set(config.businessHours.map((bh) => bh.dayOfWeek));
  if (studioDays.size < 7) {
    errors.push('Studio businessHours must define all 7 days of the week (0 to 6)');
  }

  return {
    success: errors.length === 0,
    config,
    errors,
  };
}

export function runValidation() {
  const args = process.argv.slice(2);
  const targetSlug = args[0];

  if (!fs.existsSync(tenantsDir)) {
    console.error(`Tenants directory does not exist: ${tenantsDir}`);
    process.exit(1);
  }

  const tenantDirs = targetSlug
    ? [targetSlug]
    : fs.readdirSync(tenantsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((d) => d.name);

  if (tenantDirs.length === 0) {
    console.log('No tenants found in tenants/ directory.');
    return;
  }

  console.log(`\n🔍 Validating ${tenantDirs.length} tenant(s)...\n`);
  let hasFailure = false;

  for (const slug of tenantDirs) {
    const res = validateTenant(slug);
    if (res.success && res.config) {
      console.log(`✅ [VALID] "${res.config.name}" (slug: ${res.config.slug})`);
      console.log(`   - Theme accent: ${res.config.theme.accentColor} | BG: ${res.config.theme.bgColor}`);
      console.log(`   - Services: ${res.config.services.length} across ${res.config.categories.length} categories`);
      console.log(`   - Masters: ${res.config.masters.length}, Workplaces: ${res.config.workplaces.length}\n`);
    } else {
      hasFailure = true;
      console.error(`❌ [INVALID] Tenant: ${slug}`);
      for (const err of res.errors) {
        console.error(`   - ${err}`);
      }
      console.log('');
    }
  }

  if (hasFailure) {
    console.error('Validation failed with errors.');
    process.exit(1);
  } else {
    console.log('✨ All tenants successfully validated!');
  }
}

if (process.argv[1] && process.argv[1].endsWith('tenant-validate.ts')) {
  runValidation();
}
