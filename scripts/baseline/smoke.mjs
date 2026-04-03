import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baselineDocPath = path.join(root, 'docs', 'UPGR_BASELINE.md');
const baseUrl = normalizeBaseUrl(process.env.BASE_URL ?? 'https://upgradefor.com');

function normalizeBaseUrl(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

function parseAcceptedRoutes(markdown) {
  const startMarker = '<!-- ACCEPTED_ROUTES_START -->';
  const endMarker = '<!-- ACCEPTED_ROUTES_END -->';
  const startIndex = markdown.indexOf(startMarker);
  const endIndex = markdown.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error('Could not parse accepted routes from docs/UPGR_BASELINE.md');
  }

  const section = markdown.slice(startIndex + startMarker.length, endIndex);
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
}

async function fetchRouteStatus(route) {
  const targetUrl = new URL(route, baseUrl);
  const response = await fetch(targetUrl, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
    headers: {
      'user-agent': 'upgradefor-baseline-smoke/1.0'
    }
  });

  return {
    route,
    status: response.status,
    location: response.headers.get('location')
  };
}

async function main() {
  const markdown = await fs.readFile(baselineDocPath, 'utf8');
  const acceptedRoutes = parseAcceptedRoutes(markdown);
  const failures = [];

  console.log(`Baseline smoke`);
  console.log(`BASE_URL=${baseUrl}`);
  console.log(`Accepted routes under test: ${acceptedRoutes.length}`);

  for (const route of acceptedRoutes) {
    const result = await fetchRouteStatus(route);

    if (result.status !== 200) {
      const locationSuffix = result.location ? ` -> ${result.location}` : '';
      console.log(`FAIL ${route} [HTTP ${result.status}${locationSuffix}]`);
      failures.push(result);
      continue;
    }

    console.log(`PASS ${route} [HTTP 200]`);
  }

  if (failures.length > 0) {
    console.error(`Baseline smoke failed for ${failures.length} route(s).`);
    process.exitCode = 1;
    return;
  }

  console.log('Baseline smoke passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
