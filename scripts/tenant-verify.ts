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
const publicDir = path.join(rootDir, 'public');

export function verifyTenants() {
  console.log(`\n🛡️ Starting Tenant Verification & Multi-tenant Isolation Audit...\n`);

  const slugs = ['lumi-nail-studio', 'aura-nail-bar'];
  const loadedConfigs: BusinessConfig[] = [];

  // 1. Verify existence and validation of primary demo tenants
  for (const slug of slugs) {
    const tenantPath = path.join(tenantsDir, slug, 'business.json');
    if (!fs.existsSync(tenantPath)) {
      console.error(`❌ Verification Error: Required demo tenant "${slug}" does not exist at ${tenantPath}`);
      process.exit(1);
    }

    const val = validateTenant(slug);
    if (!val.success || !val.config) {
      console.error(`❌ Verification Error: Tenant "${slug}" failed validation:`, val.errors);
      process.exit(1);
    }
    loadedConfigs.push(val.config);
    console.log(`✅ Tenant "${val.config.name}" (${slug}) passed schema validation.`);
  }

  const [t1, t2] = loadedConfigs;

  // 2. Verify Strict Isolation: No Overlapping IDs
  console.log(`\n🔒 Checking cross-tenant entity ID isolation...`);
  const t1Ids = new Set<string>([
    t1.id,
    ...t1.categories.map((c) => c.id),
    ...t1.services.map((s) => s.id),
    ...t1.options.map((o) => o.id),
    ...t1.masters.map((m) => m.id),
    ...t1.workplaces.map((w) => w.id),
  ]);

  const t2Ids = [
    t2.id,
    ...t2.categories.map((c) => c.id),
    ...t2.services.map((s) => s.id),
    ...t2.options.map((o) => o.id),
    ...t2.masters.map((m) => m.id),
    ...t2.workplaces.map((w) => w.id),
  ];

  let idCollisions = 0;
  for (const id of t2Ids) {
    if (t1Ids.has(id)) {
      console.error(`❌ CRITICAL: ID collision detected between tenants: ${id}`);
      idCollisions++;
    }
  }

  if (idCollisions > 0) {
    console.error(`❌ Isolation failed with ${idCollisions} ID collisions!`);
    process.exit(1);
  }
  console.log(`✅ Entity ID isolation: 100% distinct (0 collisions across all categories, services, options, masters, workplaces).`);

  // 3. Verify Visual Identity & Business Distinctiveness
  console.log(`\n🎨 Checking visual identity & business differentiation...`);
  if (t1.theme.accentColor.toLowerCase() === t2.theme.accentColor.toLowerCase()) {
    console.error(`❌ Warning: Accent colors are identical (${t1.theme.accentColor}). Tenants must have distinct themes.`);
    process.exit(1);
  } else {
    console.log(`✅ Distinct themes: ${t1.name} (${t1.theme.accentColor}) vs ${t2.name} (${t2.theme.accentColor})`);
  }

  if (t1.phone === t2.phone || t1.address === t2.address) {
    console.error(`❌ Warning: Contact details should be distinct between demo studios.`);
    process.exit(1);
  } else {
    console.log(`✅ Distinct locations: "${t1.address}" vs "${t2.address}"`);
  }

  // 4. Verify Generated SQL files exist
  console.log(`\n💾 Checking SQL generated migration files...`);
  for (const slug of slugs) {
    const sqlPath = path.join(generatedSqlDir, `publish_${slug}.sql`);
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Missing generated SQL migration: ${sqlPath}. Run "npm run tenant:publish" first.`);
      process.exit(1);
    }
    const content = fs.readFileSync(sqlPath, 'utf-8');
    if (!content.includes('ON CONFLICT') || !content.includes(slug)) {
      console.error(`❌ SQL migration for ${slug} is incomplete or missing idempotency controls.`);
      process.exit(1);
    }
    console.log(`✅ Valid SQL migration present: publish_${slug}.sql`);
  }

  // 5. Verify PWA Manifests exist
  console.log(`\n📱 Checking PWA manifests...`);
  for (const slug of slugs) {
    const manifestPath = path.join(publicDir, 'tenants', slug, 'manifest.webmanifest');
    if (!fs.existsSync(manifestPath)) {
      console.error(`❌ Missing PWA manifest: ${manifestPath}`);
      process.exit(1);
    }
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    if (manifestData.start_url !== `/s/${slug}/` || manifestData.scope !== `/s/${slug}/`) {
      console.error(`❌ PWA manifest scope/start_url incorrect for ${slug}`);
      process.exit(1);
    }
    console.log(`✅ Valid PWA manifest present for /s/${slug}/`);
  }

  console.log(`\n🎉 ALL MULTI-TENANT VERIFICATION CHECKS PASSED!\n`);
}

verifyTenants();
