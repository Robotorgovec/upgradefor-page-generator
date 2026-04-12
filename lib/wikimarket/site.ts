const DEFAULT_SITE_ORIGIN = "https://upgradefor.com";

function normalizeOrigin(value: string): string {
  if (!value) {
    return DEFAULT_SITE_ORIGIN;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/\/$/, "");
  }

  return `https://${value.replace(/\/$/, "")}`;
}

export function getSiteOrigin(): string {
  const explicitOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  if (explicitOrigin) {
    return normalizeOrigin(explicitOrigin);
  }

  const vercelOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelOrigin) {
    return normalizeOrigin(vercelOrigin);
  }

  return DEFAULT_SITE_ORIGIN;
}

export function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteOrigin()).toString();
}
