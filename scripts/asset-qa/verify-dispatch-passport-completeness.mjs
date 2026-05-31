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
      // agent-browser can print status lines before eval JSON.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

const inspectScript = `
(() => {
  const score = document.querySelector('[data-testid="dispatch-passport-completeness-score"]');
  const filter = document.querySelector('[data-testid="dispatch-passport-incomplete-filter"]');
  const list = document.querySelector('[data-testid="dispatch-passport-list"]');
  const rows = Array.from(document.querySelectorAll('[data-testid^="dispatch-passport-field-"]'))
    .map((row) => ({
      id: row.getAttribute('data-testid'),
      status: row.getAttribute('data-passport-field-status'),
      text: row.textContent || '',
    }));

  return JSON.stringify({
    hasScore: Boolean(score),
    scoreText: score?.textContent || '',
    hasFilter: Boolean(filter),
    filterText: filter?.textContent || '',
    filterPressed: filter?.getAttribute('aria-pressed'),
    hasList: Boolean(list),
    rowCount: rows.length,
    incompleteRowCount: rows.filter((row) => row.status === 'needs-verification').length,
    verifiedRowCount: rows.filter((row) => row.status === 'verified').length,
    rowStatuses: rows.map((row) => row.status),
    listHasRawToVerify: /TO VERIFY/i.test(list?.innerText || ''),
  });
})()
`;

const clickIncompleteFilterScript = `
(() => {
  const filter = document.querySelector('[data-testid="dispatch-passport-incomplete-filter"]');
  if (!filter) return JSON.stringify({ clicked: false });
  filter.click();
  return JSON.stringify({ clicked: true });
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const initial = parseEvalJson(runAgentBrowser(["eval", inspectScript]));

  assert(initial.hasScore, "Passport completeness score is missing");
  assert(/Паспорт заполнен на \d+%/.test(initial.scoreText), `Completeness percent is missing: ${initial.scoreText}`);
  assert(/обязательных полей/.test(initial.scoreText), `Required-field summary is missing: ${initial.scoreText}`);
  assert(initial.hasFilter, "Incomplete passport field filter is missing");
  assert(initial.hasList, "Passport field list is missing");
  assert(initial.rowCount >= 10, `Expected at least 10 passport fields, got ${initial.rowCount}`);
  assert(initial.incompleteRowCount >= 4, `Expected incomplete passport fields, got ${initial.incompleteRowCount}`);
  assert(!initial.listHasRawToVerify, "Raw TO VERIFY is still visible in the passport list");

  const clickResult = parseEvalJson(runAgentBrowser(["eval", clickIncompleteFilterScript]));
  assert(clickResult.clicked, "Could not click incomplete passport field filter");
  runAgentBrowser(["wait", "250"]);

  const filtered = parseEvalJson(runAgentBrowser(["eval", inspectScript]));

  assert(filtered.filterPressed === "true", `Incomplete filter did not become active: ${filtered.filterPressed}`);
  assert(filtered.rowCount > 0, "Filtered passport field list is empty");
  assert(
    filtered.rowStatuses.every((status) => status === "needs-verification"),
    `Filtered list contains verified rows: ${JSON.stringify(filtered.rowStatuses)}`,
  );
  assert(
    filtered.rowCount === initial.incompleteRowCount,
    `Filtered row count ${filtered.rowCount} does not match initial incomplete count ${initial.incompleteRowCount}`,
  );
  assert(!filtered.listHasRawToVerify, "Raw TO VERIFY appears after filtering incomplete fields");
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
      checked: "dispatch-passport-completeness",
      ok: true,
    },
    null,
    2,
  ),
);
