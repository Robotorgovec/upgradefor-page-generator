import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, 'app');
const pagesDir = path.join(root, 'pages');
const baseUrl = normalizeBaseUrl(process.env.BASE_URL ?? 'https://upgradefor.com');
const routeFilePattern = /\.(js|jsx|ts|tsx|mdx)$/i;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const filePaths = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      filePaths.push(...(await walk(fullPath)));
      continue;
    }

    filePaths.push(fullPath);
  }

  return filePaths;
}

function normalizeBaseUrl(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

function normalizeRoute(route) {
  if (!route || route === '') {
    return '/';
  }

  const cleaned = route.replace(/\\/g, '/');
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

function isDynamicRoute(route) {
  return route.includes('[');
}

function fileToAppRoute(filePath) {
  const relativeDir = path.relative(appDir, path.dirname(filePath));
  const segments = relativeDir
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !segment.startsWith('(') && !segment.startsWith('@'));

  return normalizeRoute(segments.join('/'));
}

function fileToPagesRoute(filePath) {
  const relativePath = path.relative(pagesDir, filePath);
  const withoutExt = relativePath.replace(routeFilePattern, '');
  const segments = withoutExt.split(path.sep).filter(Boolean);

  if (segments[0] === 'api') {
    return null;
  }

  const lastSegment = segments.at(-1);
  if (!lastSegment || lastSegment.startsWith('_')) {
    return null;
  }

  if (lastSegment === 'index') {
    segments.pop();
  }

  return normalizeRoute(segments.join('/'));
}

async function discoverRoutes() {
  const routes = new Set();

  if (await pathExists(appDir)) {
    const appFiles = await walk(appDir);

    for (const filePath of appFiles) {
      if (path.basename(filePath).match(/^page\.(js|jsx|ts|tsx|mdx)$/i)) {
        routes.add(fileToAppRoute(filePath));
      }
    }
  }

  if (await pathExists(pagesDir)) {
    const pageFiles = await walk(pagesDir);

    for (const filePath of pageFiles) {
      if (!routeFilePattern.test(filePath)) {
        continue;
      }

      const route = fileToPagesRoute(filePath);
      if (route) {
        routes.add(route);
      }
    }
  }

  return [...routes].sort((left, right) => left.localeCompare(right));
}

async function fetchRouteStatus(route) {
  const targetUrl = new URL(route, baseUrl);
  const response = await fetch(targetUrl, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
    headers: {
      'user-agent': 'upgradefor-baseline-routes/1.0'
    }
  });

  return {
    route,
    status: response.status,
    location: response.headers.get('location')
  };
}

async function main() {
  const discoveredRoutes = await discoverRoutes();
  const unresolvedDynamicRoutes = discoveredRoutes.filter(isDynamicRoute);
  const staticRoutes = discoveredRoutes.filter((route) => !isDynamicRoute(route));

  const results = [];
  for (const route of staticRoutes) {
    results.push(await fetchRouteStatus(route));
  }

  const acceptedRoutes = results
    .filter((result) => result.status === 200)
    .map((result) => result.route);

  const excludedRoutes = results
    .filter((result) => result.status !== 200)
    .map((result) => {
      const locationSuffix = result.location ? ` -> ${result.location}` : '';
      return `${result.route} [HTTP ${result.status}${locationSuffix}]`;
    });

  console.log(`Baseline route discovery`);
  console.log(`BASE_URL=${baseUrl}`);
  console.log(`Discovered routes: ${discoveredRoutes.length}`);
  console.log(`Accepted routes (${acceptedRoutes.length}):`);
  for (const route of acceptedRoutes) {
    console.log(`- ${route}`);
  }

  console.log(`Excluded / not-ready routes (${excludedRoutes.length + unresolvedDynamicRoutes.length}):`);
  for (const entry of excludedRoutes) {
    console.log(`- ${entry}`);
  }
  for (const route of unresolvedDynamicRoutes) {
    console.log(`- ${route} [unresolved dynamic pattern]`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
