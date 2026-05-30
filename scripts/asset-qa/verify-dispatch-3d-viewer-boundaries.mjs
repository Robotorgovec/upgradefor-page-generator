#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

const baseUrl = normalizeBaseUrl(
  process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL,
);

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runAgentBrowser(args) {
  return execFileSync("npx", ["-y", "agent-browser", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function parseEvalJson(output) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index].replace(/^✓\s*/, "").trim();
    try {
      const parsed = JSON.parse(line);
      return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    } catch {
      // Keep scanning status lines until the eval JSON is found.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

const clickMultiSplitScript = `
(() => {
  const multiSplitButton = document.querySelector('[data-testid="equipment-twin-card-multi-split-system"] button');
  multiSplitButton?.click();
  document.querySelector('[data-testid="dispatch-equipment-twin-selector"]')?.scrollIntoView({ block: "start" });
  return multiSplitButton ? "clicked" : "missing";
})()
`;

const inspectScript = `
(() => {
  const primary = document.querySelector('[data-testid="dispatch-primary-pv1-viewer"]');
  const twins = document.querySelector('[data-testid="dispatch-equipment-twin-selector"]');

  return JSON.stringify({
    primaryExists: Boolean(primary),
    primaryScope: primary?.getAttribute("data-viewer-scope") ?? null,
    primaryHeading: primary?.querySelector("h2")?.textContent ?? "",
    primaryPassportTitle: primary?.querySelector(".passportTop h3")?.textContent ?? "",
    primaryCanvasCount: primary?.querySelectorAll("canvas").length ?? 0,
    twinsExists: Boolean(twins),
    twinsScope: twins?.getAttribute("data-viewer-scope") ?? null,
    twinsHeading: twins?.querySelector(".equipmentTwinHeader h3")?.textContent ?? "",
    twinsActiveAttribute: twins?.getAttribute("data-active-twin-id") ?? null,
    activeCard: document.querySelector('[data-selection-state="active"]')?.getAttribute("data-equipment-twin-id") ?? null,
    activeCardText: document.querySelector('[data-selection-state="active"]')?.textContent ?? "",
    twinsCanvasCount: twins?.querySelectorAll("canvas").length ?? 0,
    twinsFallback: /fallback/i.test(twins?.textContent ?? ""),
  });
})()
`;

const dispatchUrl = `${baseUrl}/dispatch?cb=${Date.now()}`;
let result;

try {
  runAgentBrowser(["open", dispatchUrl]);
  runAgentBrowser(["wait", "--load", "networkidle"]);
  runAgentBrowser(["eval", clickMultiSplitScript]);
  runAgentBrowser(["wait", "--load", "networkidle"]);
  result = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
} finally {
  try {
    runAgentBrowser(["close"]);
  } catch {
    // The browser may already be closed after a failed run.
  }
}

assert(result.primaryExists, "Primary PV-1 viewer is missing");
assert(result.primaryScope === "primary-pv1-passport", `Unexpected primary viewer scope: ${result.primaryScope}`);
assert(result.primaryHeading.includes("ПВ-1"), `Primary viewer heading is not PV-1: ${result.primaryHeading}`);
assert(
  result.primaryPassportTitle.includes("ПВ-1"),
  `Primary passport title is not PV-1: ${result.primaryPassportTitle}`,
);
assert(result.primaryCanvasCount >= 1, "Primary PV-1 viewer has no canvas");

assert(result.twinsExists, "Equipment twin selector is missing");
assert(result.twinsScope === "equipment-twin-selector", `Unexpected twin selector scope: ${result.twinsScope}`);
assert(
  result.twinsHeading.includes("Мультисплит"),
  `Lower equipment twin heading did not switch to multi-split: ${result.twinsHeading}`,
);
assert(
  result.activeCard === "multi-split-system",
  `Active equipment twin card is ${result.activeCard}; expected multi-split-system`,
);
assert(result.twinsCanvasCount >= 1, "Lower equipment twin selector has no canvas");
assert(!result.twinsFallback, "Lower equipment twin selector shows fallback text");

console.log(
  JSON.stringify(
    {
      baseUrl,
      primary: {
        scope: result.primaryScope,
        heading: result.primaryHeading,
        passportTitle: result.primaryPassportTitle,
        canvasCount: result.primaryCanvasCount,
      },
      lowerTwinSelector: {
        scope: result.twinsScope,
        heading: result.twinsHeading,
        activeCard: result.activeCard,
        activeCardText: result.activeCardText,
        canvasCount: result.twinsCanvasCount,
        fallbackVisible: result.twinsFallback,
      },
      ok: true,
    },
    null,
    2,
  ),
);
