#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const baseUrl = normalizeBaseUrl(process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL);

const viewports = [
  { label: "desktop", width: 1440, height: 1400 },
  { label: "tablet", width: 768, height: 1100 },
  { label: "mobile", width: 390, height: 900 },
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
      // agent-browser can print status lines before eval JSON.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

const inspectScript = `
(() => {
  const selectorFor = (element) => {
    if (element.id) return "#" + element.id;
    const testId = element.getAttribute("data-testid");
    if (testId) return '[data-testid="' + testId + '"]';
    const className = typeof element.className === "string"
      ? element.className.trim().split(/\\s+/).filter(Boolean).slice(0, 3).join(".")
      : "";
    return element.tagName.toLowerCase() + (className ? "." + className : "");
  };
  const isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  };
  const dispatchRoot = document.querySelector(".dispatchShell") ?? document.querySelector(".dispatchPageStack") ?? document.body;
  const elements = Array.from(dispatchRoot.querySelectorAll("*")).filter(isVisible);
  const offenders = elements
    .map((element) => {
      const style = window.getComputedStyle(element);
      const overflowY = style.overflowY;
      const overflow = style.overflow;
      const hasScrollableOverflow = element.scrollHeight > element.clientHeight + 2;
      const createsVerticalScrollbar = hasScrollableOverflow && (overflowY === "auto" || overflowY === "scroll" || overflow === "auto" || overflow === "scroll");
      const usesForbiddenVerticalOverflow = overflowY === "auto" || overflowY === "scroll" || overflow === "auto" || overflow === "scroll";
      const usesMaxHeight = style.maxHeight !== "none";
      return {
        selector: selectorFor(element),
        text: (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 120),
        overflow,
        overflowY,
        maxHeight: style.maxHeight,
        clientHeight: Math.round(element.clientHeight),
        scrollHeight: Math.round(element.scrollHeight),
        createsVerticalScrollbar,
        usesForbiddenVerticalOverflow,
        usesMaxHeight,
      };
    })
    .filter((item) => item.createsVerticalScrollbar || item.usesForbiddenVerticalOverflow || item.usesMaxHeight);

  const pageCanScroll = document.documentElement.scrollHeight > document.documentElement.clientHeight;
  const bottomNav = document.querySelector(".dispatchBottomNav");
  const bottomNavSections = document.querySelector(".bottomNavSections");
  const dispatchShell = document.querySelector(".dispatchShell");
  const bottomNavHeight = bottomNav ? Math.ceil(bottomNav.getBoundingClientRect().height) : 0;
  const dispatchShellPaddingBottom = dispatchShell
    ? Number.parseFloat(window.getComputedStyle(dispatchShell).paddingBottom || "0")
    : 0;

  return JSON.stringify({
    pageCanScroll,
    offenderCount: offenders.length,
    offenders: offenders.slice(0, 20),
    bottomNavOverflowY: bottomNav ? window.getComputedStyle(bottomNav).overflowY : null,
    bottomNavSectionsOverflowY: bottomNavSections ? window.getComputedStyle(bottomNavSections).overflowY : null,
    bottomNavSectionsScrollGap: bottomNavSections ? bottomNavSections.scrollHeight - bottomNavSections.clientHeight : null,
    bottomNavHeight,
    dispatchShellPaddingBottom,
    bottomNavReserveOk: bottomNavHeight > 0 && dispatchShellPaddingBottom >= bottomNavHeight + 12,
  });
})()
`;

try {
  runAgentBrowser(["close"]);
} catch {
  // A previous browser session is not required.
}

try {
  for (const viewport of viewports) {
    runAgentBrowser(["set", "viewport", String(viewport.width), String(viewport.height)]);
    runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}-${viewport.label}`]);
    runAgentBrowser(["wait", "--load", "networkidle"]);

    const result = parseEvalJson(runAgentBrowser(["eval", inspectScript]));

    assert(result.pageCanScroll, `${viewport.label}: main page is not scrollable`);
    assert(
      result.offenderCount === 0,
      `${viewport.label}: found internal vertical scroll/max-height offenders: ${JSON.stringify(result.offenders, null, 2)}`,
    );
    assert(
      result.bottomNavSectionsOverflowY !== "auto" && result.bottomNavSectionsOverflowY !== "scroll",
      `${viewport.label}: bottom nav sections still use overflow-y ${result.bottomNavSectionsOverflowY}`,
    );
    assert(
      result.bottomNavReserveOk,
      `${viewport.label}: page bottom reserve ${result.dispatchShellPaddingBottom}px does not cover fixed nav ${result.bottomNavHeight}px`,
    );
  }
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
      checked: "dispatch-no-internal-vertical-scroll",
      viewports: viewports.map((viewport) => viewport.label),
      ok: true,
    },
    null,
    2,
  ),
);
