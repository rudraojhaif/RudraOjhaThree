/**
 * Build = copy the static site into dist/.
 * There is no bundler here on purpose: index.html is self-contained.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// Files that make up the deployed site.
const FILES = ['index.html', 'favicon.ico', 'RudraPublic.pdf'];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const file of FILES) {
  const src = path.join(ROOT, file);
  if (!fs.existsSync(src)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(DIST, file));
  console.log(`  + ${file}`);
}

// Stop GitHub Pages from running the site through Jekyll.
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log('  + .nojekyll');

console.log(`\nBuilt ${FILES.length + 1} files into dist/`);
