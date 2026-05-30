#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const MIN_GLB_BYTES = 50 * 1024;

const baseUrl = normalizeBaseUrl(
  process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL,
);

const expectedCards = [
  "ahu-pv1",
  "chiller",
  "cooling-tower-small",
  "fancoil-fc92",
  "multi-split-system",
];

const expectedAssets = [
  "/models/equipment/supply-vent-unit-01-assembled.glb",
  "/models/equipment/supply-vent-unit-01-exploded.glb",
  "/models/dispatch/chiller.glb",
  "/models/dispatch/fancoil-fc92.glb",
  "/models/dispatch/cooling-tower-small.glb",
  "/models/dispatch/multi-split-system.glb",
];

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function withCacheBust(path) {
  const separator = path.includes("?") ? "&" : "?";
  return `${baseUrl}${path}${separator}cb=${Date.now()}`;
}

async function fetchBytes(path) {
  const response = await fetch(withCacheBust(path));
  const bytes = await response.arrayBuffer();
  return {
    bytes: bytes.byteLength,
    status: response.status,
    type: response.headers.get("content-type") ?? "",
  };
}

const dispatchResponse = await fetch(withCacheBust("/dispatch"));
const dispatchHtml = await dispatchResponse.text();

assert(dispatchResponse.status === 200, `/dispatch returned ${dispatchResponse.status}`);
assert(
  dispatchHtml.includes("UPGRADE Dispatch / Asia Park Astana"),
  "/dispatch does not include the dispatch title",
);
assert(
  dispatchHtml.includes('data-selection-state="active"'),
  "/dispatch does not expose an active equipment twin selection state",
);
assert(
  dispatchHtml.includes('aria-current="true"'),
  "/dispatch does not expose aria-current on the active equipment twin",
);

for (const cardId of expectedCards) {
  assert(
    dispatchHtml.includes(`data-testid="equipment-twin-card-${cardId}"`),
    `/dispatch is missing equipment twin card ${cardId}`,
  );
}

const assets = [];
for (const path of expectedAssets) {
  const result = await fetchBytes(path);
  assert(result.status === 200, `${path} returned ${result.status}`);
  assert(
    result.type.includes("model/gltf-binary") || result.type.includes("application/octet-stream"),
    `${path} returned unexpected content type ${result.type || "(empty)"}`,
  );
  assert(
    result.bytes >= MIN_GLB_BYTES,
    `${path} looks too small (${result.bytes} bytes); expected at least ${MIN_GLB_BYTES}`,
  );
  assets.push({ path, ...result });
}

console.log(
  JSON.stringify(
    {
      baseUrl,
      dispatch: {
        bytes: dispatchHtml.length,
        status: dispatchResponse.status,
      },
      equipmentCards: expectedCards.length,
      assets,
      ok: true,
    },
    null,
    2,
  ),
);
