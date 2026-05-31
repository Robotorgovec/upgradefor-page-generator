#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const baseUrl = normalizeBaseUrl(process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL);
const outputDir = process.env.DISPATCH_ACTION_FLOW_OUTPUT_DIR
  ? path.resolve(process.env.DISPATCH_ACTION_FLOW_OUTPUT_DIR)
  : null;

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

function screenshot(fileName) {
  if (!outputDir) return null;

  mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, fileName);
  runAgentBrowser(["screenshot", filePath, "--full"]);
  return filePath;
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
  if (!element) return JSON.stringify({ ok: false, label: ${JSON.stringify(label)}, reason: "missing" });
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

function clickSection(label) {
  const result = evalJson(`
(() => {
  const label = ${JSON.stringify(label)};
  const normalize = (value) => (value || "").replace(/\\s+/g, " ").trim();
  const buttons = Array.from(document.querySelectorAll(".sectionItem, .dispatchBottomNav button"));
  const element = buttons.find((button) => normalize(button.textContent).includes(label));
  if (!element) return JSON.stringify({ ok: false, label, reason: "section not found" });
  element.scrollIntoView({ block: "center", inline: "nearest" });
  element.click();
  return JSON.stringify({ ok: true, label, text: normalize(element.textContent) });
})()
`);
  assert(result.ok, `Could not click section ${label}: ${result.reason ?? "unknown"}`);
  wait();
  return result;
}

function clickTrendButton(containerSelector, text) {
  const result = evalJson(`
(() => {
  const container = document.querySelector(${JSON.stringify(containerSelector)});
  const text = ${JSON.stringify(text)};
  if (!container) return JSON.stringify({ ok: false, text, reason: "container missing" });
  const normalize = (value) => (value || "").replace(/\\s+/g, " ").trim();
  const element = Array.from(container.querySelectorAll("button")).find((button) => normalize(button.textContent).includes(text));
  if (!element) return JSON.stringify({ ok: false, text, reason: "button missing" });
  element.scrollIntoView({ block: "center", inline: "nearest" });
  element.click();
  return JSON.stringify({ ok: true, text, buttonText: normalize(element.textContent) });
})()
`);
  assert(result.ok, `Could not click trend button ${text}: ${result.reason ?? "unknown"}`);
  wait();
  return result;
}

function state() {
  return evalJson(`
(() => {
  const normalize = (value) => (value || "").replace(/\\s+/g, " ").trim();
  const activeSections = Array.from(document.querySelectorAll(".sectionItem.isActive, .dispatchBottomNav button.isActive"))
    .map((element) => normalize(element.textContent));
  const activePassportTab = normalize(document.querySelector(".passportTabs button.isActive")?.textContent);
  const activeTrendPeriod = normalize(document.querySelector(".dispatchTrendsPanel__periods button.isActive")?.textContent);
  const activeTrend = normalize(document.querySelector(".dispatchTrendsPanel__tabs button[aria-selected='true']")?.textContent);
  const trendSummaryText = normalize(document.querySelector('[data-testid="dispatch-trends-summary"]')?.textContent);
  const trendCurrentText = normalize(document.querySelector('[data-testid="dispatch-trends-current"]')?.textContent);
  const dialogText = normalize(document.querySelector('[data-testid="dispatch-demo-modal"], [role="dialog"]')?.textContent);
  const drawer = document.querySelector(".passportDrawer");
  const passportTitle = normalize(document.querySelector(".passportDrawer .passportHero strong")?.textContent);
  const passportKpiText = normalize(document.querySelector(".passportDrawer [data-testid='dispatch-passport-kpi-strip']")?.textContent);
  const selectedAlarmContextText = normalize(document.querySelector('[data-testid="dispatch-selected-alarm-context"]')?.textContent);
  const selectedAlarmSourceTagText = normalize(document.querySelector('[data-testid="dispatch-selected-alarm-source-tag"]')?.textContent);
  const ticketJournalText = normalize(document.querySelector('[data-testid="dispatch-demo-ticket-journal"]')?.textContent);
  const bodyText = document.body.innerText || "";

  return JSON.stringify({
    url: window.location.href,
    activeSections,
    drawerOpen: Boolean(drawer?.classList.contains("isOpen")),
    passportTitle,
    passportKpiText,
    selectedAlarmContextText,
    selectedAlarmSourceTagText,
    activePassportTab,
    activeTrendPeriod,
    activeTrend,
    trendSummaryText,
    trendCurrentText,
    dialogText,
    aiAnswer: normalize(document.querySelector('[data-testid="dispatch-ai-answer"]')?.textContent),
    auditText: normalize(document.querySelector('[data-testid="dispatch-readonly-audit-log"]')?.textContent),
    ticketJournalText,
    safetyCopy: {
      readOnly: bodyText.includes("Read-only"),
      demoMode: bodyText.includes("DEMO MODE"),
      noRealControl: /No real equipment control|без команд в BMS\\/SCADA|не отправлена/i.test(bodyText),
    },
  });
})()
`);
}

function assertActiveSection(label, currentState = state()) {
  assert(
    currentState.activeSections.some((activeLabel) => activeLabel.includes(label)),
    `Expected active section ${label}, got ${currentState.activeSections.join(" | ")}`,
  );
}

function closeModalIfOpen() {
  const current = state();
  if (current.dialogText) {
    clickSelector('[data-testid="dispatch-modal-close"]', "modal close");
  }
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

  const initial = state();
  assert(initial.safetyCopy.readOnly, "Read-only copy is missing");
  assert(initial.safetyCopy.demoMode, "DEMO MODE copy is missing");
  assert(initial.safetyCopy.noRealControl, "No-real-control safety copy is missing");

  clickSelector('[data-testid="dispatch-data-error-alarm"]', "DATA_ERROR alarm event");
  let current = state();
  assert(current.drawerOpen, "Alarm click did not open the passport drawer");
  assert(current.activePassportTab === "SCADA-теги", `Alarm click did not open SCADA tags tab: ${current.activePassportTab}`);
  assert(current.selectedAlarmContextText.includes("DP DATA_ERROR"), "Alarm click did not show the selected alarm context card");
  assert(current.selectedAlarmContextText.includes("SCADA.CHW.DP_01.PV"), "Alarm context is missing source tag");
  assert(current.selectedAlarmSourceTagText.includes("SCADA.CHW.DP_01.PV"), "Source SCADA tag row is not highlighted");
  assert(current.selectedAlarmSourceTagText.includes("SOURCE"), "Source SCADA tag row is missing SOURCE marker");
  assert(current.activeTrend.includes("Давление"), `Alarm click did not switch related trend to pressure: ${current.activeTrend}`);
  screenshot("action-00a-alarm-source-context.png");

  clickSelector('[data-testid="dispatch-drawer-action-ticket"]', "alarm context drawer Create ticket");
  current = state();
  assert(current.dialogText.includes("Demo-заявка подготовлена локально"), "Alarm-context ticket action did not open modal");
  assert(current.dialogText.includes("Selected alarm source"), "Alarm-context ticket modal is missing selected alarm source row");
  assert(current.dialogText.includes("DP DATA_ERROR"), "Alarm-context ticket modal is missing selected alarm title");
  assert(current.dialogText.includes("SCADA.CHW.DP_01.PV"), "Alarm-context ticket modal is missing source tag");
  assert(current.dialogText.includes("Raw DP tag"), "Alarm-context ticket modal is missing alarm recommendation/description");
  assert(current.ticketJournalText.includes("DP DATA_ERROR"), "Ticket journal did not retain selected alarm title");
  assert(current.ticketJournalText.includes("SCADA.CHW.DP_01.PV"), "Ticket journal did not retain selected alarm source tag");
  screenshot("action-00b-alarm-ticket-modal.png");
  closeModalIfOpen();
  current = state();
  assert(current.ticketJournalText.includes("DP DATA_ERROR"), "Alarm-context ticket journal disappeared after modal close");
  screenshot("action-00c-alarm-ticket-journal.png");

  clickSelector('[data-testid="dispatch-equipment-node-pump-shu2"]', "digital twin node pump-shu2");
  current = state();
  assert(current.drawerOpen, "Digital twin node click did not open the passport drawer");
  assert(
    current.passportTitle.includes("ШУ-1") || current.passportTitle.includes("ШУ-2"),
    `Digital twin node click opened the wrong passport: ${current.passportTitle}`,
  );
  assert(
    current.passportKpiText.includes("DATA_ERROR"),
    "Digital twin node click did not surface the linked DATA_ERROR passport context",
  );
  screenshot("action-00-node-passport.png");

  clickSection("Насосные группы");
  assertActiveSection("Насосные группы");

  clickSelector('[data-testid="dispatch-section-action-passport"]', "section Open passport");
  assert(state().drawerOpen, "Open passport action did not open the passport drawer");

  clickSelector('[data-testid="dispatch-section-action-ticket"]', "section Create demo ticket");
  current = state();
  assert(current.dialogText.includes("Demo-заявка подготовлена локально"), "Create demo ticket did not open the contextual ticket modal");
  assert(current.dialogText.includes("Asia Park Astana"), "Ticket modal is missing object context");
  assert(current.dialogText.includes("Раздел"), "Ticket modal is missing section context");
  assert(current.dialogText.includes("Оборудование"), "Ticket modal is missing equipment context");
  assert(current.dialogText.includes("Источник / tag"), "Ticket modal is missing source tag context");
  assert(current.dialogText.includes("Severity"), "Ticket modal is missing severity context");
  assert(current.dialogText.includes("AI recommendation"), "Ticket modal is missing AI recommendation context");
  assert(current.dialogText.includes("not sent"), "Ticket modal is missing not-sent copy");
  assert(current.dialogText.includes("No real equipment control"), "Ticket modal is missing no-real-control copy");
  assert(current.dialogText.includes("Запись добавлена в demo-журнал"), "Ticket modal did not confirm journal entry creation");
  assert(current.ticketJournalText.includes("Prepared locally"), "Ticket journal did not record prepared status");
  assert(current.ticketJournalText.includes("No real equipment control"), "Ticket journal is missing no-real-control copy");
  assert(current.ticketJournalText.includes("section action"), "Ticket journal did not record section action source");
  screenshot("action-01-ticket-modal.png");
  closeModalIfOpen();
  current = state();
  assert(current.ticketJournalText.includes("Prepared locally"), "Ticket journal entry disappeared after closing modal");
  screenshot("action-01b-ticket-journal.png");

  clickSection("Насосные группы");
  clickSelector('[data-testid="dispatch-section-action-trends"]', "section Show trends");
  current = state();
  assertActiveSection("Тренды", current);
  assert(current.drawerOpen, "Show trends should preserve the selected equipment passport drawer context");
  screenshot("action-02-trends-context.png");

  clickTrendButton(".dispatchTrendsPanel__periods", "7 дней");
  clickTrendButton(".dispatchTrendsPanel__tabs", "Давление");
  current = state();
  assert(current.activeTrendPeriod.includes("7 дней"), `Trend period did not change: ${current.activeTrendPeriod}`);
  assert(current.activeTrend.includes("Давление"), `Trend metric did not change: ${current.activeTrend}`);
  assert(current.trendSummaryText.includes("Текущее"), "Trend summary is missing current value card");
  assert(current.trendSummaryText.includes("Среднее"), "Trend summary is missing average value card");
  assert(current.trendSummaryText.includes("Data health"), "Trend summary is missing data health card");
  assert(current.trendSummaryText.includes("6/7 valid"), `Trend summary did not report quarantined pressure point: ${current.trendSummaryText}`);
  assert(current.trendSummaryText.includes("DATA_ERROR excluded"), "Trend summary did not explain DATA_ERROR exclusion");
  assert(current.trendCurrentText.includes("2.1 бар"), `Trend current value is not readable: ${current.trendCurrentText}`);
  screenshot("action-03-trend-pressure-7d.png");

  clickSelector('[data-testid="dispatch-drawer-action-ai"]', "drawer AI diagnostics");
  current = state();
  assertActiveSection("AI-диагностика", current);
  assert(current.aiAnswer.includes("AI-диагностика demo"), "AI diagnostics action did not write a contextual demo answer");
  screenshot("action-04-ai-diagnostics.png");

  clickSelector('[data-testid="dispatch-ai-submit"]', "AI submit");
  current = state();
  assert(current.aiAnswer.includes("AI анализирует mock-данные"), "AI submit did not show the mock historian answer");
  screenshot("action-05-ai-submit.png");

  clickSelector('[data-testid^="dispatch-ai-insight-"]', "AI insight");
  current = state();
  assert(current.drawerOpen, "AI insight click did not keep/open the passport drawer");

  const passportTabs = ["Паспорт", "Параметры", "SCADA-теги", "ТО", "Документы"];
  for (const tab of passportTabs) {
    clickTrendButton(".passportTabs", tab);
    current = state();
    assert(current.activePassportTab === tab, `Passport tab ${tab} did not become active`);
  }

  clickSelector('[data-testid="dispatch-drawer-action-ticket"]', "drawer Create ticket");
  current = state();
  assert(current.dialogText.includes("Demo-заявка подготовлена локально"), "Drawer ticket action did not open contextual ticket modal");
  assert(current.dialogText.includes("No real equipment control"), "Drawer ticket modal is missing no-real-control copy");
  assert(current.ticketJournalText.includes("passport drawer"), "Ticket journal did not record drawer ticket source");
  closeModalIfOpen();

  clickSelector('[data-testid="dispatch-drawer-action-readonly"]', "drawer Read-only controls");
  current = state();
  assert(current.dialogText.includes("Управление оборудованием отключено"), "Read-only drawer action did not open safety modal");
  screenshot("action-06-readonly-modal.png");
  closeModalIfOpen();

  clickSelector('[data-testid="dispatch-readonly-control"]', "read-only command wrapper");
  current = state();
  assert(current.dialogText.includes("Управление оборудованием отключено"), "Read-only control did not open safety modal");
  assert(current.auditText.includes("попытка"), "Read-only control did not write an audit entry");
  assert(current.auditText.includes("No real equipment control"), "Audit entry is missing no-real-control copy");
  screenshot("action-07-readonly-audit.png");
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
      checked: "dispatch-action-flows",
      ok: true,
    },
    null,
    2,
  ),
);
