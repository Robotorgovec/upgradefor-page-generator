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
      // Continue scanning agent-browser status lines.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

const clickScadaTabScript = `
(() => {
  const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((item) =>
    (item.textContent || "").includes("SCADA-теги")
  );
  tab?.click();
  return tab ? "clicked" : "missing";
})()
`;

const inspectScript = `
(() => {
  const table = document.querySelector('[data-testid="dispatch-passport-scada-tags"]');
  const rows = Array.from(document.querySelectorAll('[data-testid="dispatch-passport-scada-tag-row"]')).map((row) => ({
    text: row.textContent || "",
    isDataError: row.classList.contains("isDataError"),
  }));
  const bodyText = document.body.innerText || "";

  return JSON.stringify({
    hasTable: Boolean(table),
    tableText: table?.textContent || "",
    rowCount: rows.length,
    rows,
    hasNoRealControlCopy: bodyText.includes("no write commands") || bodyText.includes("No real equipment control"),
  });
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const tabClickResult = runAgentBrowser(["eval", clickScadaTabScript]).trim();
  assert(tabClickResult.includes("clicked"), `Could not open SCADA tags tab: ${tabClickResult}`);

  const overview = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(overview.hasTable, "SCADA tag table is missing");
  assert(overview.rowCount >= 3, `Expected at least 3 SCADA tag rows, got ${overview.rowCount}`);
  assert(overview.tableText.includes("Type"), "SCADA tag table is missing Type column");
  assert(overview.tableText.includes("Register"), "SCADA tag table is missing Register column");
  assert(overview.tableText.includes("Scaling"), "SCADA tag table is missing Scaling column");
  assert(overview.tableText.includes("Unit"), "SCADA tag table is missing Unit column");
  assert(overview.tableText.includes("Quality"), "SCADA tag table is missing Quality column");
  assert(overview.hasNoRealControlCopy, "SCADA tag tab is missing read-only/no-write safety copy");

  runAgentBrowser(["eval", `document.querySelector('[data-testid="dispatch-data-error-alarm"]')?.click(); "clicked"`]);
  const alarmTabClickResult = runAgentBrowser(["eval", clickScadaTabScript]).trim();
  assert(alarmTabClickResult.includes("clicked"), `Could not reopen SCADA tags tab after alarm context: ${alarmTabClickResult}`);

  const alarmContext = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(
    alarmContext.rows.some((row) => row.text.includes("SCADA.CHW.DP_01.PV")),
    "DP SCADA tag is missing in data-error alarm context",
  );
  assert(
    alarmContext.rows.some((row) => row.text.includes("DATA_ERROR") && row.isDataError),
    "DATA_ERROR SCADA tag row is not highlighted",
  );
  assert(
    alarmContext.rows.some((row) => row.text.includes("0–16 bar")),
    "DP SCADA tag does not expose 0-16 bar scaling",
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
      checked: "dispatch-passport-scada-tags",
      ok: true,
    },
    null,
    2,
  ),
);
