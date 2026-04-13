import type { MetadataRoute } from 'next';

import { getLearningGameSitemapPaths } from '../lib/learning-game/sitemap';

const BASE_URL = 'https://upgradefor.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return getLearningGameSitemapPaths().map((path) => ({
    url: `${BASE_URL}${path}`,
  }));
}
