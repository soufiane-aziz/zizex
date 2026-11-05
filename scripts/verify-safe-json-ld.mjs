/**
 * Verify and fix safeJsonLd imports across all page files.
 * Checks for corrupted \n in import lines and fixes them.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = 'C:/Users/soufi/OneDrive/Desktop/zizex/zizex';

const TARGET_FILES = [
  'app/[locale]/movie/[slug]/page.js',
  'app/[locale]/tv/[slug]/[seasonId]/[episodeId]/page.js',
  'app/[locale]/genre/[slug]/page.js',
  'app/[locale]/about/page.js',
  'app/[locale]/contact/page.js',
  'app/[locale]/dmca/page.js',
  'app/[locale]/privacy/page.js',
  'app/[locale]/trending/page.js',
  'app/[locale]/layout.js',
  'app/layout.js',
];

for (const rel of TARGET_FILES) {
  const fp = join(ROOT, rel).replace(/\//g, '\\');
  let content;
  try {
    content = readFileSync(fp, 'utf8');
  } catch {
    console.log(`SKIP (not found): ${rel}`);
    continue;
  }

  // Check for corrupted \n (literal backslash-n) in import line
  const hasCorruption = content.includes("from './lib/security';\\nimport") ||
    content.includes("from '../../lib/security';\\nimport") ||
    content.includes("from '../../../lib/security';\\nimport") ||
    content.includes('/security\';\\nimport');

  if (hasCorruption) {
    // Fix: replace literal \n with real newline
    const fixed = content.replace(/';\\n(import)/g, "';\n$1");
    writeFileSync(fp, fixed, 'utf8');
    console.log(`FIXED corruption: ${rel}`);
    continue;
  }

  // Check it has the import
  const hasImport = content.includes('safeJsonLd') && content.match(/import\s*\{[^}]*safeJsonLd/);
  const hasCall = content.includes('safeJsonLd(');
  const hasOld = content.includes('JSON.stringify(') && content.includes('__html');

  console.log(`${rel}: import=${!!hasImport} call=${hasCall} old=${hasOld}`);
}

console.log('\nVerification complete.');

