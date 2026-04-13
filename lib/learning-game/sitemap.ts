export const LEGACY_PATHS = [
  '/',
  '/heat-exchangers',
  '/wikimarket/hvac/heat-exchangers',
  '/wikimarket/hvac/heat-exchanger-repair',
  '/wikimarket/domains/fio-rus',
] as const;

export const LEARN_CANONICAL_PATHS = [
  '/learn/glossary',
  '/learn/beauty/bridal-makeup-tools-basics',
  '/learn/industrial/ventilation-components-basics',
] as const;

export const PUBLISHED_GLOSSARY_CARD_PATHS = [
  '/learn/glossary/foundation-brush',
] as const;

const FORBIDDEN_SITEMAP_SEGMENTS = [
  'step',
  'score',
  'challenge',
  'review',
  'session',
  'debug',
] as const;

function hasForbiddenSegment(path: string): boolean {
  const [pathname] = path.split('?');
  const normalizedPathname = pathname.split('#')[0] ?? '';
  const segments = normalizedPathname.split('/').filter(Boolean);

  return segments.some((segment) =>
    FORBIDDEN_SITEMAP_SEGMENTS.includes(segment as (typeof FORBIDDEN_SITEMAP_SEGMENTS)[number]),
  );
}

export function getLearningGameSitemapPaths(): string[] {
  const uniquePaths = new Set<string>([
    ...LEGACY_PATHS,
    ...LEARN_CANONICAL_PATHS,
    ...PUBLISHED_GLOSSARY_CARD_PATHS,
  ]);

  return [...uniquePaths].filter(
    (path) => !path.includes('?') && !path.includes('#') && !hasForbiddenSegment(path),
  );
}
