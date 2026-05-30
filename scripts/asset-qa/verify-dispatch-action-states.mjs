#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const baseUrl = normalizeBaseUrl(process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL);

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
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

function evalJson(script) {
  return parseEvalJson(runAgentBrowser(["eval", script]));
}

function wait(ms = 350) {
  runAgentBrowser(["wait", String(ms)]);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function clickSelector(selector, label = selector) {
  const result = evalJson(`
(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  if (!element) return JSON.stringify({ ok: false, reason: "missing", label: ${JSON.stringify(label)} });
  element.scrollIntoView({ block: "center", inline: "nearest" });
  element.click();
  return JSON.stringify({
    ok: true,
    label: ${JSON.stringify(label)},
    text: (element.textContent || element.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim(),
  });
})()
`);
  assert(result.ok, `Could not click ${label}: ${result.reason ?? "unknown"}`);
  wait();
  return result;
}

function actionInventory() {
  return evalJson(`
(() => {
  const normalize = (value) => (value || "").replace(/\\s+/g, " ").trim();
  const selectorFor = (element) => {
    if (element.id) return "#" + element.id;
    const testId = element.getAttribute("data-testid");
    if (testId) return '[data-testid="' + testId + '"]';
    const action = element.getAttribute("data-action-state");
    if (action) return element.tagName.toLowerCase() + '[data-action-state="' + action + '"]';
    const className = typeof element.className === "string"
      ? element.className.trim().split(/\\s+/).filter(Boolean).slice(0, 3).join(".")
      : "";
    return element.tagName.toLowerCase() + (className ? "." + className : "");
  };
  const inferredRules = [
    [".sectionItem", "navigates-section"],
    [".dispatchBottomNav button", "navigates-section"],
    [".eventItem", "opens-alarm-context"],
    [".aiInsight", "opens-ai-context"],
    [".equipmentNode", "opens-equipment-passport"],
    [".relatedNodesRow button", "selects-related-equipment"],
    [".sectionAlarmSummary button", "opens-alarm-context"],
    [".sectionActions button", "opens-section-action"],
    [".notificationsPanel button", "opens-notification-context"],
    [".passportTabs button", "switches-passport-tab"],
    [".documentList button", "opens-passport-document-action"],
    [".relatedBlock button", "opens-related-alarm"],
    [".drawerActions button", "opens-drawer-action"],
    [".dispatchTrendsPanel__periods button", "switches-trend-period"],
    [".dispatchTrendsPanel__tabs button", "switches-trend-metric"],
    [".equipmentTwinHeader button", "toggles-equipment-twin-state"],
    [".equipmentTwinCardBody", "selects-equipment-twin"],
    [".equipmentTwinCardFooter > button", "toggles-equipment-twin-state"],
    [".equipmentTwinFallback", "opens-passport-fallback"],
  ];
  const inferActionState = (element) => {
    if (element.getAttribute("data-action-state")) return element.getAttribute("data-action-state");
    if (element.disabled || element.getAttribute("aria-disabled") === "true") return "disabled-or-readonly";
    if (element.getAttribute("href")) return "navigates-link";
    if (element.getAttribute("role") === "tab") return "switches-tab";
    if (element.getAttribute("type") === "submit") return "submits-form";
    if (/закрыть|close/i.test(element.getAttribute("aria-label") || normalize(element.textContent))) return "closes-panel";
    for (const [selector, state] of inferredRules) {
      if (element.matches(selector)) return state;
      if (!selector.includes(">")) {
        const closestSelector = selector.replace(/ button$/, "");
        if (element.closest(closestSelector)) return state;
      }
    }
    return "";
  };
  const controls = Array.from(document.querySelectorAll("button, a[href], [role='button']"))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    })
    .map((element) => {
      const text = normalize(element.textContent || element.getAttribute("aria-label"));
      const actionState = inferActionState(element);
      return {
        selector: selectorFor(element),
        text: text.slice(0, 120),
        tag: element.tagName.toLowerCase(),
        actionState,
        explicitActionState: element.getAttribute("data-action-state") || "",
        disabled: Boolean(element.disabled) || element.getAttribute("aria-disabled") === "true",
      };
    });
  const missingActionState = controls.filter((control) => !control.actionState);

  return JSON.stringify({
    url: window.location.href,
    totalControls: controls.length,
    explicitActionStates: controls.filter((control) => control.explicitActionState).length,
    missingActionState,
    actionStates: Array.from(new Set(controls.map((control) => control.actionState).filter(Boolean))).sort(),
    safetyCopy: {
      readOnly: document.body.innerText.includes("Read-only"),
      demoMode: document.body.innerText.includes("DEMO MODE"),
      noRealControl: /No real equipment control|без реальных команд|без команд в BMS\\/SCADA/i.test(document.body.innerText),
    },
  });
})()
`);
}

function readonlyAttemptText() {
  return evalJson(`
(() => JSON.stringify({
  text: (document.querySelector(".readonlyAttempt")?.textContent || "").replace(/\\s+/g, " ").trim(),
  audit: (document.querySelector('[data-testid="dispatch-readonly-audit-log"]')?.textContent || "").replace(/\\s+/g, " ").trim(),
}))()
`);
}

try {
  runAgentBrowser(["close"]);
} catch {
  // No active browser is fine.
}

try {
  runAgentBrowser(["set", "viewport", "1440", "1300"]);
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);
  wait(900);

  const initial = actionInventory();
  assert(initial.safetyCopy.readOnly, "Read-only copy is missing");
  assert(initial.safetyCopy.demoMode, "DEMO MODE copy is missing");
  assert(initial.safetyCopy.noRealControl, "No-real-control safety copy is missing");
  assert(
    initial.missingActionState.length === 0,
    `Found controls without action state: ${JSON.stringify(initial.missingActionState.slice(0, 10), null, 2)}`,
  );

  clickSelector('.chipBlock button[data-action-state="opens-passport-context"]', "primary PV-1 passport chip");
  let attempt = readonlyAttemptText();
  assert(
    attempt.text.includes("read-only паспорте") && attempt.text.includes("No real equipment control"),
    `Primary PV-1 passport chip did not record a visible read-only action: ${attempt.text}`,
  );

  clickSelector('.chipBlock button[data-action-state="opens-trends-context"]', "primary PV-1 trends chip");
  attempt = readonlyAttemptText();
  assert(
    attempt.text.includes("demo-контекст трендов") && attempt.text.includes("No real equipment control"),
    `Primary PV-1 trends chip did not record a visible read-only action: ${attempt.text}`,
  );

  clickSelector('.chipBlock button[data-action-state="opens-demo-ticket"]', "primary PV-1 ticket chip");
  attempt = readonlyAttemptText();
  assert(
    attempt.text.includes("Demo-заявка подготовлена локально") && attempt.text.includes("No real equipment control"),
    `Primary PV-1 ticket chip did not record a visible read-only action: ${attempt.text}`,
  );

  const finalInventory = actionInventory();
  console.log(
    JSON.stringify(
      {
        baseUrl,
        checked: "dispatch-action-states",
        totalControls: finalInventory.totalControls,
        explicitActionStates: finalInventory.explicitActionStates,
        actionStates: finalInventory.actionStates,
        ok: true,
      },
      null,
      2,
    ),
  );
} finally {
  try {
    runAgentBrowser(["close"]);
  } catch {
    // The browser may already be closed after a failed run.
  }
}
