/**
 * Fix missing safeJsonLd imports in page files that don't start with an import statement.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';

const ROOT = 'C:/Users/soufi/OneDrive/Desktop/zizex/zizex';

const MISSING_IMPORT_FILES = [
  'app/[locale]/about/page.js',
  'app/[locale]/contact/page.js',
  'app/[locale]/dmca/page.js',
  'app/[locale]/privacy/page.js',
];

for (const rel of MISSING_IMPORT_FILES) {
  const fp = join(ROOT, rel).replace(/\//g, '\\');
  const content = readFileSync(fp, 'utf8');

  if (content.match(/import\s*\{[^}]*safeJsonLd/)) {
    console.log(`Already has import: ${rel}`);
    continue;
  }

  // Calculate relative path from file dir to lib/security
  const fileDir = dirname(fp);
  const securityPath = join(ROOT, 'lib', 'security').replace(/\//g, '\\');
  let relImport = relative(fileDir, securityPath).replace(/\\/g, '/');
  if (!relImport.startsWith('.')) relImport = './' + relImport;

  // Prepend the import at the very top
  const newContent = `import { safeJsonLd } from '${relImport}';\n` + content;
  writeFileSync(fp, newContent, 'utf8');
  console.log(`Added import to: ${rel} (path: ${relImport})`);
}

console.log('Done!');

