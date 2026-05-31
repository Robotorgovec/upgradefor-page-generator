#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const baseUrl = normalizeBaseUrl(
  process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL,
);

const requiredCategories = [
  { id: "data-quality", label: "Data quality" },
  { id: "predictive-maintenance", label: "Predictive maintenance" },
  { id: "energy-optimization", label: "Energy optimization" },
  { id: "operational-risk", label: "Operational risk" },
];

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
      // Continue scanning agent-browser status lines.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

const inspectScript = `
(() => {
  const root = document.querySelector('[data-testid="dispatch-ai-categories"]');
  const categories = Array.from(document.querySelectorAll('[data-testid^="dispatch-ai-category-"]')).map((category) => ({
    testId: category.getAttribute("data-testid"),
    text: category.textContent || "",
    insightCount: category.querySelectorAll('[data-testid^="dispatch-ai-insight-"]').length,
  }));
  const bodyText = document.body.innerText || "";

  return JSON.stringify({
    hasRoot: Boolean(root),
    categories,
    forbiddenClaims: [
      "guaranteed savings",
      "real command executed",
      "production control complete",
      "live production control",
    ].filter((claim) => bodyText.toLowerCase().includes(claim)),
  });
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const overview = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(overview.hasRoot, "AI categories root is missing");
  assert(overview.categories.length >= 4, `Expected at least 4 AI categories, got ${overview.categories.length}`);

  for (const category of requiredCategories) {
    const matched = overview.categories.find((item) => item.testId === `dispatch-ai-category-${category.id}`);
    assert(matched, `Missing AI category ${category.label}`);
    assert(matched.text.includes(category.label), `Category label is missing for ${category.label}`);
    assert(matched.insightCount >= 1, `Category ${category.label} has no insights`);
  }

  assert(
    overview.categories.some((item) => item.text.includes("DP DATA_ERROR") && item.text.includes("scaling")),
    "Data-quality AI insight does not explain DP DATA_ERROR/scaling context",
  );
  assert(
    overview.categories.some((item) => item.text.includes("not a guarantee")),
    "Energy AI insight does not contain demo/no-guarantee wording",
  );
  assert(
    overview.categories.some((item) => item.text.includes("do not execute equipment commands")),
    "Operational-risk AI insight does not contain no-command safety wording",
  );
  assert(
    overview.forbiddenClaims.length === 0,
    `Forbidden safety claims found: ${overview.forbiddenClaims.join(", ")}`,
  );
} finally {
  try {
    runAgentBrowser(["close"]);
  } catch {
    // The browser may already be closed after a failed run.
  }
}

console.log(
  JSON.stringify(
    {
      baseUrl,
      checked: "dispatch-ai-categories",
      ok: true,
    },
    null,
    2,
  ),
);
