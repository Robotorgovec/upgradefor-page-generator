#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_OUTPUT_DIR = "runtime/dispatch-continuous/screenshots/fullpage-review";

const baseUrl = normalizeBaseUrl(
  process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL,
);
const outputDir = path.resolve(
  process.argv[3] ?? process.env.DISPATCH_REVIEW_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR,
);

const dispatchSections = [
  { id: "overview", label: "Обзор объекта" },
  { id: "cooling", label: "Холодоснабжение / чиллеры" },
  { id: "fan-coils", label: "Кондиционирование / фанкойлы" },
  { id: "ventilation", label: "Вентиляция" },
  { id: "itp", label: "Теплоснабжение / ИТП" },
  { id: "pumps", label: "Насосные группы" },
  { id: "heat-exchangers", label: "Теплообменники" },
  { id: "alarms", label: "Аварии" },
  { id: "trends", label: "Тренды" },
  { id: "equipment", label: "Паспорта оборудования" },
  { id: "tickets", label: "Заявки" },
  { id: "ai", label: "AI-диагностика" },
];

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

function screenshot(fileName) {
  const filePath = path.join(outputDir, fileName);
  runAgentBrowser(["screenshot", filePath, "--full"]);
  return filePath;
}

function inspectPageScript(sectionLabel = null) {
  return `
(() => {
  const currentSectionLabel = ${JSON.stringify(sectionLabel)};
  const elementSelector = (element) => {
    if (!element) return "";
    if (element.id) return "#" + element.id;
    const testId = element.getAttribute("data-testid");
    if (testId) return '[data-testid="' + testId + '"]';
    const className = typeof element.className === "string" ? element.className.trim().split(/\\s+/).slice(0, 3).join(".") : "";
    return element.tagName.toLowerCase() + (className ? "." + className : "");
  };
  const viewportWidth = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  const overflowSamples = Array.from(document.querySelectorAll("body *"))
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const text = (element.textContent || "").replace(/\\s+/g, " ").trim();
      const overflowX = Math.max(0, element.scrollWidth - element.clientWidth);
      return {
        selector: elementSelector(element),
        tag: element.tagName.toLowerCase(),
        text: text.slice(0, 100),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        overflowX,
      };
    })
    .filter((item) => item.width > 0 && (item.right > viewportWidth + 2 || item.left < -2 || item.overflowX > 4))
    .slice(0, 20);
  const controls = Array.from(document.querySelectorAll("button, a, [role='button']"))
    .map((element) => ({
      tag: element.tagName.toLowerCase(),
      selector: elementSelector(element),
      text: (element.textContent || element.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim().slice(0, 120),
      disabled: Boolean(element.disabled) || element.getAttribute("aria-disabled") === "true",
      href: element.getAttribute("href"),
      title: element.getAttribute("title"),
      role: element.getAttribute("role"),
      ariaLabel: element.getAttribute("aria-label"),
      active: element.classList.contains("isActive") || element.getAttribute("aria-current") === "true" || element.getAttribute("aria-selected") === "true",
    }));
  const visibleControlElements = Array.from(document.querySelectorAll("button, a[href], [role='button']"))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    });
  const controlTextFitIssues = visibleControlElements
    .map((element) => {
      const labelElement = element.matches(".dispatchBottomNav button")
        ? element.querySelector("span") ?? element
        : element;
      const rect = element.getBoundingClientRect();
      const labelRect = labelElement.getBoundingClientRect();
      const text = (element.textContent || element.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim();
      const widthOverflow = Math.max(0, labelElement.scrollWidth - labelElement.clientWidth);
      const heightOverflow = Math.max(0, labelElement.scrollHeight - labelElement.clientHeight);
      return {
        selector: elementSelector(element),
        text: text.slice(0, 120),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        labelWidth: Math.round(labelRect.width),
        labelHeight: Math.round(labelRect.height),
        widthOverflow,
        heightOverflow,
      };
    })
    .filter((item) => item.text && (item.widthOverflow > 3 || item.heightOverflow > 3))
    .slice(0, 20);
  const activeSection = Array.from(document.querySelectorAll(".sectionItem.isActive, .dispatchBottomNav button.isActive"))
    .map((element) => (element.textContent || "").replace(/\\s+/g, " ").trim());
  const visibleDialogs = Array.from(document.querySelectorAll("[role='dialog']"))
    .filter((element) => element.getBoundingClientRect().width > 0)
    .map((element) => (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 160));

  return JSON.stringify({
    sectionLabel: currentSectionLabel,
    title: document.title,
    url: window.location.href,
    viewportWidth,
    scrollWidth,
    horizontalOverflow: scrollWidth > viewportWidth + 2,
    overflowSamples,
    activeSection,
    controls: {
      total: controls.length,
      disabled: controls.filter((item) => item.disabled).length,
      links: controls.filter((item) => item.href).length,
      active: controls.filter((item) => item.active).length,
      readonlyLocked: controls.filter((item) => item.disabled || /read-only|demo|control locked|заблок/i.test([item.text, item.title, item.ariaLabel].filter(Boolean).join(" "))).length,
      textFitIssues: controlTextFitIssues,
    },
    visibleDialogs,
    safetyCopy: {
      readOnly: document.body.innerText.includes("Read-only"),
      demoMode: document.body.innerText.includes("DEMO MODE"),
      noRealControl: /No real equipment control|без команд в BMS\\/SCADA|не отправлена/i.test(document.body.innerText),
    },
  });
})()
`;
}

function clickSectionScript(label) {
  return `
(() => {
  const label = ${JSON.stringify(label)};
  const normalize = (value) => (value || "").replace(/\\s+/g, " ").trim();
  const sectionButtons = Array.from(document.querySelectorAll(".sectionItem, .dispatchBottomNav button"));
  const button = sectionButtons.find((element) => normalize(element.textContent).includes(label));
  if (!button) {
    return JSON.stringify({ clicked: false, label, reason: "section button not found" });
  }
  button.scrollIntoView({ block: "center", inline: "nearest" });
  button.click();
  return JSON.stringify({
    clicked: true,
    label,
    text: normalize(button.textContent),
  });
})()
`;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

mkdirSync(outputDir, { recursive: true });

const dispatchUrl = `${baseUrl}/dispatch?cb=${Date.now()}`;
const screenshots = [];
const sectionResults = [];
let initialAudit;
let mobileAudit;

try {
  runAgentBrowser(["close"]);
} catch {
  // No active browser is fine.
}

try {
  runAgentBrowser(["set", "viewport", "1440", "1400"]);
  runAgentBrowser(["open", dispatchUrl]);
  runAgentBrowser(["wait", "--load", "networkidle"]);
  runAgentBrowser(["wait", "1200"]);

  screenshots.push({ id: "full-page", path: screenshot("00-full-page.png") });
  initialAudit = parseEvalJson(runAgentBrowser(["eval", inspectPageScript()]));

  assert(initialAudit.safetyCopy.readOnly, "Read-only safety copy is missing");
  assert(initialAudit.safetyCopy.demoMode, "DEMO MODE safety copy is missing");

  for (const [index, section] of dispatchSections.entries()) {
    const clickResult = parseEvalJson(runAgentBrowser(["eval", clickSectionScript(section.label)]));
    assert(clickResult.clicked, `Could not click section ${section.label}: ${clickResult.reason ?? "unknown"}`);
    runAgentBrowser(["wait", "350"]);

    const fileName = `section-${String(index + 1).padStart(2, "0")}-${section.id}.png`;
    screenshots.push({ id: section.id, path: screenshot(fileName) });
    const audit = parseEvalJson(runAgentBrowser(["eval", inspectPageScript(section.label)]));

    assert(
      audit.activeSection.some((activeLabel) => activeLabel.includes(section.label)),
      `Section ${section.label} did not become active`,
    );

    sectionResults.push({
      id: section.id,
      label: section.label,
      screenshot: path.join(outputDir, fileName),
      activeSection: audit.activeSection,
      horizontalOverflow: audit.horizontalOverflow,
      overflowSamples: audit.overflowSamples.slice(0, 5),
      controlTextFitIssues: audit.controls.textFitIssues.slice(0, 5),
      controls: audit.controls,
      visibleDialogs: audit.visibleDialogs,
      safetyCopy: audit.safetyCopy,
      checklist: {
        activeSection: audit.activeSection.some((activeLabel) => activeLabel.includes(section.label)) ? "checked" : "failed",
        horizontalOverflow: audit.horizontalOverflow ? "failed" : "checked",
        buttonTextFit: audit.controls.textFitIssues.length ? "failed" : "checked",
        safetyCopy:
          audit.safetyCopy.readOnly && audit.safetyCopy.demoMode && audit.safetyCopy.noRealControl
            ? "checked"
            : "failed",
      },
    });
  }

  runAgentBrowser(["set", "viewport", "390", "900"]);
  runAgentBrowser(["open", dispatchUrl]);
  runAgentBrowser(["wait", "--load", "networkidle"]);
  runAgentBrowser(["wait", "1200"]);
  screenshots.push({ id: "mobile", path: screenshot("99-mobile-full-page.png") });
  mobileAudit = parseEvalJson(runAgentBrowser(["eval", inspectPageScript("mobile")]));
} finally {
  try {
    runAgentBrowser(["close"]);
  } catch {
    // Browser may already be closed.
  }
}

const report = {
  baseUrl,
  dispatchUrl,
  outputDir,
  screenshots,
  initialAudit,
  sections: sectionResults,
  mobileAudit,
  summary: {
    sectionScreenshots: sectionResults.length,
    expectedSections: dispatchSections.length,
    desktopHorizontalOverflow: Boolean(initialAudit?.horizontalOverflow),
    mobileHorizontalOverflow: Boolean(mobileAudit?.horizontalOverflow),
    desktopOverflowSamples: initialAudit?.overflowSamples?.slice(0, 5) ?? [],
    mobileOverflowSamples: mobileAudit?.overflowSamples?.slice(0, 5) ?? [],
    desktopButtonTextFitIssues: initialAudit?.controls?.textFitIssues?.slice(0, 5) ?? [],
    mobileButtonTextFitIssues: mobileAudit?.controls?.textFitIssues?.slice(0, 5) ?? [],
    sectionButtonTextFitFailures: sectionResults
      .filter((section) => section.controlTextFitIssues.length)
      .map((section) => ({
        id: section.id,
        label: section.label,
        issues: section.controlTextFitIssues,
        screenshot: section.screenshot,
      })),
    checklist: [
      {
        item: "full-page screenshot captured",
        status: screenshots.some((item) => item.id === "full-page") ? "checked" : "failed",
        screenshot: screenshots.find((item) => item.id === "full-page")?.path ?? null,
      },
      {
        item: "all dispatch sections captured",
        status: sectionResults.length === dispatchSections.length ? "checked" : "failed",
        expected: dispatchSections.length,
        actual: sectionResults.length,
      },
      {
        item: "desktop horizontal overflow",
        status: initialAudit?.horizontalOverflow ? "failed" : "checked",
        screenshot: screenshots.find((item) => item.id === "full-page")?.path ?? null,
      },
      {
        item: "mobile horizontal overflow",
        status: mobileAudit?.horizontalOverflow ? "failed" : "checked",
        screenshot: screenshots.find((item) => item.id === "mobile")?.path ?? null,
      },
      {
        item: "button text fits in all captured states",
        status:
          (initialAudit?.controls?.textFitIssues?.length ?? 0) ||
          (mobileAudit?.controls?.textFitIssues?.length ?? 0) ||
          sectionResults.some((section) => section.controlTextFitIssues.length)
            ? "failed"
            : "checked",
        suggestedFix:
          "Use normal wrapping, overflow-wrap:anywhere, stable min-height, and responsive button/grid constraints.",
      },
      {
        item: "read-only/demo/no-real-control safety copy",
        status:
          initialAudit?.safetyCopy?.readOnly &&
          initialAudit?.safetyCopy?.demoMode &&
          initialAudit?.safetyCopy?.noRealControl
            ? "checked"
            : "failed",
      },
    ],
  },
  ok: true,
};

assert(
  sectionResults.length === dispatchSections.length,
  `Captured ${sectionResults.length} sections, expected ${dispatchSections.length}`,
);
assert(
  report.summary.checklist.every((item) => item.status === "checked"),
  `Full-page review checklist failed: ${JSON.stringify(report.summary.checklist.filter((item) => item.status !== "checked"), null, 2)}`,
);

writeFileSync(path.join(outputDir, "fullpage-review-report.json"), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
