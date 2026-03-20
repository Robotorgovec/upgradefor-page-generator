import fs from "node:fs";
import path from "node:path";

import {
  type ResolvedWeddingHairstyleRecord,
  getWeddingHairstyleBySlug,
  weddingHairstylesTop100ExpectedPngFiles,
  weddingHairstylesTop100Registry,
} from "./weddingHairstylesTop100Data";

const TOP_100_ASSET_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "assets",
  "media",
  "wikimarket",
  "beauty",
  "wedding-hairstyles",
  "top-100",
);

const PUBLIC_ASSET_BASE = "/assets/media/wikimarket/beauty/wedding-hairstyles/top-100";
const LIVE_EXTENSION_ORDER = [".png", ".webp", ".jpg", ".jpeg", ".avif"];

type WeddingHairstyleAssetAudit = {
  liveAssetCount: number;
  liveAssetFilenames: string[];
  expectedPngFilenames: string[];
  missingPngFilenames: string[];
};

function resolveLiveImageSource(slug: string) {
  for (const extension of LIVE_EXTENSION_ORDER) {
    const filename = `${slug}${extension}`;
    const absolutePath = path.join(TOP_100_ASSET_DIRECTORY, filename);

    if (fs.existsSync(absolutePath)) {
      return {
        hasLiveImage: true,
        liveImageSrc: `${PUBLIC_ASSET_BASE}/${filename}`,
        liveImageExtension: extension,
      };
    }
  }

  return {
    hasLiveImage: false,
    liveImageSrc: null,
    liveImageExtension: null,
  };
}

export function getResolvedWeddingHairstylesTop100Registry(): ResolvedWeddingHairstyleRecord[] {
  return weddingHairstylesTop100Registry.map((item) => ({
    ...item,
    ...resolveLiveImageSource(item.slug),
  }));
}

export function getResolvedWeddingHairstyleBySlug(slug: string): ResolvedWeddingHairstyleRecord | null {
  const baseRecord = getWeddingHairstyleBySlug(slug);

  if (!baseRecord) {
    return null;
  }

  return {
    ...baseRecord,
    ...resolveLiveImageSource(slug),
  };
}

export function getWeddingHairstyleAssetAudit(): WeddingHairstyleAssetAudit {
  const resolvedRegistry = getResolvedWeddingHairstylesTop100Registry();

  return {
    liveAssetCount: resolvedRegistry.filter((item) => item.hasLiveImage).length,
    liveAssetFilenames: resolvedRegistry
      .filter((item) => item.hasLiveImage && item.liveImageExtension)
      .map((item) => `${item.slug}${item.liveImageExtension}`),
    expectedPngFilenames: [...weddingHairstylesTop100ExpectedPngFiles],
    missingPngFilenames: weddingHairstylesTop100ExpectedPngFiles.filter(
      (filename) => !fs.existsSync(path.join(TOP_100_ASSET_DIRECTORY, filename)),
    ),
  };
}
