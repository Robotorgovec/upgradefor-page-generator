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
      // Continue scanning agent-browser output.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

const inspectScript = `
(() => {
  const bodyText = document.body.innerText || "";
  const metric = document.querySelector('[data-testid="dispatch-data-error-metric"]');
  const alarm = document.querySelector('[data-testid="dispatch-data-error-alarm"]');
  const trendQuality = Array.from(document.querySelectorAll(".dispatchTrendsPanel__quality"))
    .map((item) => item.textContent || "");

  return JSON.stringify({
    hasDataError: bodyText.includes("DATA_ERROR"),
    hasPressureRange: bodyText.includes("0–16 bar"),
    hasMetric: Boolean(metric),
    metricText: metric?.textContent || "",
    hasAlarm: Boolean(alarm),
    alarmText: alarm?.textContent || "",
    hasTrendQuality: trendQuality.some((text) => text.includes("DATA_ERROR")),
    forbiddenVisibleValues: [
      "6553.3 / 6553.5 бар anomaly",
      "DP 6553.3 / 6553.5 bar",
      "DP = 6553.5 bar",
      "Pressure spike 6553.5 bar",
      "DP 6553.x bar",
    ].filter((value) => bodyText.includes(value)),
  });
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const overview = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(overview.hasDataError, "DATA_ERROR is not visible in dispatch UI");
  assert(overview.hasPressureRange, "Pressure validation range 0–16 bar is not visible");
  assert(overview.hasMetric, "Missing DATA_ERROR live metric");
  assert(overview.metricText.includes("DATA_ERROR"), `Metric is not marked DATA_ERROR: ${overview.metricText}`);
  assert(overview.hasAlarm, "Missing DATA_ERROR alarm/event");
  assert(overview.alarmText.includes("DATA_ERROR"), `Alarm is not marked DATA_ERROR: ${overview.alarmText}`);
  assert(
    overview.forbiddenVisibleValues.length === 0,
    `Physically impossible DP values are still visible as telemetry: ${overview.forbiddenVisibleValues.join(", ")}`,
  );

  runAgentBrowser(["eval", `document.querySelector('[data-testid="dispatch-data-error-alarm"]')?.click(); "clicked"`]);
  const passport = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(passport.hasDataError, "DATA_ERROR disappeared after opening the related equipment");
  assert(passport.hasTrendQuality, "Pressure trend does not show DATA_ERROR exclusion after alarm click");
  assert(
    passport.forbiddenVisibleValues.length === 0,
    `Physically impossible DP values are visible after alarm click: ${passport.forbiddenVisibleValues.join(", ")}`,
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
      checked: "dispatch-data-quality",
      ok: true,
    },
    null,
    2,
  ),
);
