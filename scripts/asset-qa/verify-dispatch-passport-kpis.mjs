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

const inspectScript = `
(() => {
  const strip = document.querySelector('[data-testid="dispatch-passport-kpi-strip"]');
  const cards = Array.from(strip?.querySelectorAll("article") ?? []).map((card) => ({
    testId: card.getAttribute("data-testid"),
    text: card.textContent || "",
    isDataError: card.classList.contains("isDataError"),
  }));

  return JSON.stringify({
    hasStrip: Boolean(strip),
    count: cards.length,
    cards,
  });
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const overview = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(overview.hasStrip, "Passport KPI strip is missing");
  assert(overview.count >= 5, `Passport KPI strip has ${overview.count} cards; expected at least 5`);
  assert(
    overview.cards.some((card) => card.testId === "dispatch-passport-kpi-status"),
    "Passport status KPI is missing",
  );
  assert(
    overview.cards.some((card) => card.testId === "dispatch-passport-kpi-last-alarm"),
    "Passport last-alarm KPI is missing",
  );

  runAgentBrowser(["eval", `document.querySelector('[data-testid="dispatch-data-error-alarm"]')?.click(); "clicked"`]);
  const alarmContext = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  const pressureCard = alarmContext.cards.find((card) => card.testId === "dispatch-passport-kpi-pressure");
  const statusCard = alarmContext.cards.find((card) => card.testId === "dispatch-passport-kpi-status");
  const alarmCard = alarmContext.cards.find((card) => card.testId === "dispatch-passport-kpi-last-alarm");

  assert(pressureCard, "Pressure KPI is missing after opening alarm context");
  assert(pressureCard.text.includes("DATA_ERROR"), `Pressure KPI is not marked DATA_ERROR: ${pressureCard.text}`);
  assert(pressureCard.isDataError, "Pressure KPI is not styled as a data-quality error");
  assert(statusCard?.text.includes("Авария"), `Status KPI does not show equipment alarm state: ${statusCard?.text ?? ""}`);
  assert(alarmCard?.text.includes("Critical"), `Last alarm KPI does not include severity: ${alarmCard?.text ?? ""}`);
  assert(alarmCard?.text.includes("SLA 18 мин"), `Last alarm KPI does not include SLA: ${alarmCard?.text ?? ""}`);
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
      checked: "dispatch-passport-kpis",
      ok: true,
    },
    null,
    2,
  ),
);
