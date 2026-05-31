#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const baseUrl = normalizeBaseUrl(process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL);

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
  const list = document.querySelector(".passportList");
  const badges = Array.from(document.querySelectorAll('[data-testid="dispatch-passport-verification-badge"]'));
  const listText = list?.innerText || "";

  return JSON.stringify({
    hasList: Boolean(list),
    listText,
    badgeCount: badges.length,
    badgeTexts: badges.map((badge) => badge.textContent || ""),
    hasRawToVerifyInPassportList: /TO VERIFY/i.test(listText),
  });
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const result = parseEvalJson(runAgentBrowser(["eval", inspectScript]));

  assert(result.hasList, "Passport list is missing");
  assert(result.badgeCount >= 4, `Expected at least 4 verification badges, got ${result.badgeCount}`);
  assert(!result.hasRawToVerifyInPassportList, `Passport list still exposes raw TO VERIFY: ${result.listText}`);
  assert(
    result.badgeTexts.some((text) => text.includes("Требует обхода")),
    `Exact missing values are not rendered as managed verification badges: ${JSON.stringify(result.badgeTexts)}`,
  );
  assert(
    result.badgeTexts.some((text) => text.includes("Частично не заполнено")),
    `Partial verification gaps are not rendered as managed badges: ${JSON.stringify(result.badgeTexts)}`,
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
      checked: "dispatch-passport-verification-badges",
      ok: true,
    },
    null,
    2,
  ),
);
