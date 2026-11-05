/**
 * Security script: Replace JSON.stringify() with safeJsonLd() in all dangerouslySetInnerHTML __html props.
 * Also injects the import statement if not already present.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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

const PATTERN = /__html: JSON\.stringify\(/g;
const REPLACEMENT = '__html: safeJsonLd(';
const IMPORT_PATTERN = /import\s*\{[^}]*safeJsonLd[^}]*\}\s*from\s*['"][^'"]+['"]/;

for (const relFile of TARGET_FILES) {
  const filePath = join(ROOT, relFile);
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    console.log(`SKIP (not found): ${relFile}`);
    continue;
  }

  if (!PATTERN.test(content)) {
    console.log(`No change needed: ${relFile}`);
    continue;
  }

  let newContent = content.replace(PATTERN, REPLACEMENT);

  // Calculate the relative path from this file to lib/security
  const fileDir = dirname(filePath);
  const securityPath = join(ROOT, 'lib', 'security');
  let relImport = relative(fileDir, securityPath).replace(/\\/g, '/');
  if (!relImport.startsWith('.')) relImport = './' + relImport;

  // Add import if not already there
  if (!IMPORT_PATTERN.test(newContent)) {
    // Insert after the first import line
    newContent = newContent.replace(
      /^(import[^\n]+\n)/,
      `$1import { safeJsonLd } from '${relImport}';\n`
    );
  }

  writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated: ${relFile}`);
}

console.log('Done!');
