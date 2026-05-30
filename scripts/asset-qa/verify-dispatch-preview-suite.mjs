#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

const baseUrl = normalizeBaseUrl(
  process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL,
);

const checks = [
  {
    id: "static-preview",
    script: "scripts/asset-qa/verify-dispatch-preview.mjs",
    usesBrowser: false,
  },
  {
    id: "equipment-card-states",
    script: "scripts/asset-qa/verify-dispatch-equipment-card-states.mjs",
    usesBrowser: true,
  },
  {
    id: "viewer-boundaries",
    script: "scripts/asset-qa/verify-dispatch-3d-viewer-boundaries.mjs",
    usesBrowser: true,
  },
  {
    id: "readonly-controls",
    script: "scripts/asset-qa/verify-dispatch-readonly-controls.mjs",
    usesBrowser: true,
  },
  {
    id: "data-quality",
    script: "scripts/asset-qa/verify-dispatch-data-quality.mjs",
    usesBrowser: true,
  },
  {
    id: "alarm-severity-sla",
    script: "scripts/asset-qa/verify-dispatch-alarm-severity-sla.mjs",
    usesBrowser: true,
  },
  {
    id: "passport-kpis",
    script: "scripts/asset-qa/verify-dispatch-passport-kpis.mjs",
    usesBrowser: true,
  },
  {
    id: "passport-scada-tags",
    script: "scripts/asset-qa/verify-dispatch-passport-scada-tags.mjs",
    usesBrowser: true,
  },
  {
    id: "ai-categories",
    script: "scripts/asset-qa/verify-dispatch-ai-categories.mjs",
    usesBrowser: true,
  },
  {
    id: "action-flows",
    script: "scripts/asset-qa/verify-dispatch-action-flows.mjs",
    usesBrowser: true,
  },
  {
    id: "action-states",
    script: "scripts/asset-qa/verify-dispatch-action-states.mjs",
    usesBrowser: true,
  },
];

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function closeAgentBrowser() {
  try {
    execFileSync("npx", ["-y", "agent-browser", "close"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    // A clean browser is helpful, but an already-closed browser is not a suite failure.
  }
}

function runCheck(check) {
  if (check.usesBrowser) {
    closeAgentBrowser();
  }

  const startedAt = Date.now();
  const output = execFileSync("node", [check.script, baseUrl], {
    encoding: "utf8",
    env: {
      ...process.env,
      DISPATCH_BASE_URL: baseUrl,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (check.usesBrowser) {
    closeAgentBrowser();
  }

  return {
    id: check.id,
    durationMs: Date.now() - startedAt,
    output: output.trim(),
  };
}

const results = [];

try {
  for (const check of checks) {
    results.push(runCheck(check));
  }
} finally {
  closeAgentBrowser();
}

console.log(
  JSON.stringify(
    {
      baseUrl,
      checked: results.length,
      checks: results.map((result) => ({
        id: result.id,
        durationMs: result.durationMs,
        ok: true,
      })),
      ok: true,
    },
    null,
    2,
  ),
);
