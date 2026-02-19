import fs from 'fs';
import path from 'path';

const root = process.cwd();
const cssPath = path.join(root, 'public', 'assets', 'layout.css');
const headerPath = path.join(root, 'components', 'layout', 'Header.tsx');

const css = fs.readFileSync(cssPath, 'utf8');
const header = fs.readFileSync(headerPath, 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(css.includes('.site-header{'), 'Expected .site-header selector in layout.css');
assert(css.includes('position:fixed;'), 'Expected fixed positioning in .site-header');
assert(
  css.includes('backdrop-filter: blur(12px);') || css.includes('-webkit-backdrop-filter: blur(12px);'),
  'Expected backdrop-filter blur in .site-header'
);
assert(
  header.includes('className="site-header"'),
  'Expected site-header class on root Header component'
);
assert(
  css.includes('.notifications-overlay{') && css.includes('position:sticky;') && css.includes('top:calc(var(--header-height) + env(safe-area-inset-top, 0px));'),
  'Expected notifications overlay to open below fixed header'
);

console.log('layout checks passed');
