import type { MetadataRoute } from "next";

import { getLearningGameSitemapPaths } from "../lib/learning-game/sitemap";
import { getSiteOrigin } from "../lib/wikimarket/site";

const STATIC_PATHS = [
  "/",
  "/heat-exchangers",
  "/wikimarket/hvac/heat-exchangers",
  "/wikimarket/hvac/copper-aluminum-heat-exchangers",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteOrigin();
  const now = new Date();

  const allPaths = Array.from(new Set([...STATIC_PATHS, ...getLearningGameSitemapPaths()]));

  return allPaths.map((pathname) => ({
    url: new URL(pathname, baseUrl).toString(),
    lastModified: now,
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : 0.7,
  }));
}
