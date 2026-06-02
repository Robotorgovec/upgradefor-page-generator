import fs from "node:fs";
import path from "node:path";

import {
  type ResolvedWeddingHairstyleRecord,
  getWeddingHairstyleBySlug,
  weddingHairstylesTop100ApprovedAssetFilenames,
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
const LIVE_EXTENSION_ORDER = [".png", ".webp", ".jpg", ".jpeg", ".avif"] as const;

type WeddingHairstyleAssetAudit = {
  approvedAssetCount: number;
  mappingCoverageCount: number;
  liveAssetCount: number;
  liveAssetFilenames: string[];
  expectedPngFilenames: string[];
  missingPngFilenames: string[];
};

function resolveLiveImageSource(record: { slug: string; assetFilename: string }) {
  const parsedAsset = path.parse(record.assetFilename);
  const candidateFilenames = [
    record.assetFilename,
    ...LIVE_EXTENSION_ORDER.filter((extension) => extension !== parsedAsset.ext).map(
      (extension) => `${parsedAsset.name}${extension}`,
    ),
    ...LIVE_EXTENSION_ORDER.map((extension) => `${record.slug}${extension}`),
  ];

  for (const filename of candidateFilenames) {
    const absolutePath = path.join(TOP_100_ASSET_DIRECTORY, filename);

    if (fs.existsSync(absolutePath)) {
      return {
        hasLiveImage: true,
        liveImageSrc: `${PUBLIC_ASSET_BASE}/${filename}`,
        liveImageExtension: path.extname(filename),
      };
    }
  }

  // Vercel serverless functions do not expose every public asset through fs.
  // The approved mapping is the production source of truth; fs is only a local audit aid.
  return {
    hasLiveImage: true,
    liveImageSrc: `${PUBLIC_ASSET_BASE}/${record.assetFilename}`,
    liveImageExtension: path.extname(record.assetFilename),
  };
}

export function getResolvedWeddingHairstylesTop100Registry(): ResolvedWeddingHairstyleRecord[] {
  return weddingHairstylesTop100Registry.map((item) => ({
    ...item,
    ...resolveLiveImageSource(item),
  }));
}

export function getResolvedWeddingHairstyleBySlug(slug: string): ResolvedWeddingHairstyleRecord | null {
  const baseRecord = getWeddingHairstyleBySlug(slug);

  if (!baseRecord) {
    return null;
  }

  return {
    ...baseRecord,
    ...resolveLiveImageSource(baseRecord),
  };
}

export function getWeddingHairstyleAssetAudit(): WeddingHairstyleAssetAudit {
  const resolvedRegistry = getResolvedWeddingHairstylesTop100Registry();

  return {
    approvedAssetCount: weddingHairstylesTop100ApprovedAssetFilenames.length,
    mappingCoverageCount: weddingHairstylesTop100Registry.length,
    liveAssetCount: resolvedRegistry.filter((item) => item.hasLiveImage).length,
    liveAssetFilenames: resolvedRegistry
      .filter((item) => item.hasLiveImage && item.liveImageExtension)
      .map((item) => item.assetFilename),
    expectedPngFilenames: [...weddingHairstylesTop100ApprovedAssetFilenames],
    missingPngFilenames: weddingHairstylesTop100ApprovedAssetFilenames.filter(
      (filename) => !fs.existsSync(path.join(TOP_100_ASSET_DIRECTORY, filename)),
    ),
  };
}
