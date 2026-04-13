import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  LEGACY_PATHS,
  LEARN_CANONICAL_PATHS,
  PUBLISHED_GLOSSARY_CARD_PATHS,
  getLearningGameSitemapPaths,
} from '../../lib/learning-game/sitemap';
import sitemap from '../../app/sitemap';

function toXml(urls: string[]): string {
  const xmlNodes = urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>${xmlNodes}\n</urlset>`;
}

test('runtime sitemap entrypoint includes legacy and learn canonical URLs', () => {
  const paths = getLearningGameSitemapPaths();
  const entries = sitemap();
  const xml = toXml(entries.map((entry) => entry.url));

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));

  for (const legacy of LEGACY_PATHS) {
    assert.ok(paths.includes(legacy), `missing legacy URL: ${legacy}`);
    assert.ok(xml.includes(`https://upgradefor.com${legacy}`), `missing legacy sitemap URL: ${legacy}`);
  }

  for (const canonical of LEARN_CANONICAL_PATHS) {
    assert.ok(paths.includes(canonical), `missing canonical URL: ${canonical}`);
    assert.ok(xml.includes(`https://upgradefor.com${canonical}`), `missing canonical sitemap URL: ${canonical}`);
  }

  assert.ok(
    paths.includes('/learn/glossary/foundation-brush'),
    'missing published glossary card URL: /learn/glossary/foundation-brush',
  );
  assert.ok(
    xml.includes('https://upgradefor.com/learn/glossary/foundation-brush'),
    'missing published glossary card URL: /learn/glossary/foundation-brush',
  );
  assert.ok(PUBLISHED_GLOSSARY_CARD_PATHS.length > 0, 'no published glossary URLs found');
});

test('runtime sitemap entrypoint excludes query/hash/state/debug URLs', () => {
  const paths = getLearningGameSitemapPaths();
  const entries = sitemap();

  const forbiddenTokens = ['?', '#', '/step/', '/score/', '/challenge/', '/review/', '/session/', '/debug/'];

  for (const path of paths) {
    for (const token of forbiddenTokens) {
      assert.equal(
        path.includes(token),
        false,
        `forbidden token "${token}" found in path: ${path}`,
      );
    }
  }

  for (const entry of entries) {
    for (const token of forbiddenTokens) {
      assert.equal(
        entry.url.includes(token),
        false,
        `forbidden token "${token}" found in runtime url: ${entry.url}`,
      );
    }
  }
});
