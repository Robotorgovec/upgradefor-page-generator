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
      // Keep scanning agent-browser status lines.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

const inspectScript = `
(() => {
  const bodyText = document.body.innerText || "";
  const eventItems = Array.from(document.querySelectorAll(".eventItem"));
  const alarmData = eventItems.map((item) => ({
    severity: item.getAttribute("data-alarm-severity"),
    slaStatus: item.getAttribute("data-alarm-sla-status"),
    text: item.textContent || "",
  }));

  return JSON.stringify({
    hasCritical: bodyText.includes("Critical"),
    hasWarning: bodyText.includes("Warning"),
    hasInfo: bodyText.includes("Info"),
    hasSla: bodyText.includes("SLA"),
    hasCriticalSla: Boolean(document.querySelector('[data-testid="dispatch-alarm-sla-alarm-pump-pressure"]')),
    alarmData,
  });
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const overview = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(overview.hasCritical, "Critical severity label is missing");
  assert(overview.hasWarning, "Warning severity label is missing");
  assert(overview.hasInfo, "Info severity label is missing");
  assert(overview.hasSla, "SLA timer copy is missing");
  assert(overview.hasCriticalSla, "Critical alarm SLA timer is missing");
  assert(
    overview.alarmData.some((item) => item.severity === "critical" && item.slaStatus === "due_soon"),
    "Critical alarm is not marked with due_soon SLA status",
  );
  assert(
    overview.alarmData.some((item) => item.severity === "warning" && item.slaStatus === "on_track"),
    "Warning alarm is not marked with on_track SLA status",
  );

  runAgentBrowser(["eval", `document.querySelector('[data-testid="dispatch-data-error-alarm"]')?.click(); "clicked"`]);
  const selected = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(selected.hasCriticalSla, "SLA timer disappeared after selecting alarm");
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
      checked: "dispatch-alarm-severity-sla",
      ok: true,
    },
    null,
    2,
  ),
);
