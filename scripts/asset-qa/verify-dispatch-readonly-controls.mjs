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
  const wrappers = Array.from(document.querySelectorAll('[data-testid="dispatch-readonly-control"]'));
  const buttons = wrappers.map((wrapper) => wrapper.querySelector("button"));
  const bodyText = document.body.innerText || "";

  return JSON.stringify({
    wrappers: wrappers.length,
    disabledButtons: buttons.filter((button) => button?.disabled).length,
    notAllowedButtons: buttons.filter((button) => getComputedStyle(button).cursor === "not-allowed").length,
    tooltipMatches: buttons.filter((button) => (button?.getAttribute("title") || "").includes("Управление заблокировано (Demo mode)")).length,
    hasRole: bodyText.includes("Роль: Operator"),
    hasDemoReadOnly: bodyText.includes("Read-only / Demo mode"),
    hasAuditLog: Boolean(document.querySelector('[data-testid="dispatch-readonly-audit-log"]')),
    auditText: document.querySelector('[data-testid="dispatch-readonly-audit-log"]')?.innerText || "",
    forbiddenClaims: [
      "real command executed",
      "equipment fixed",
      "production control complete",
      "live production control",
    ].filter((claim) => bodyText.toLowerCase().includes(claim)),
  });
})()
`;

const clickFirstReadonlyControlScript = `
(() => {
  const control = document.querySelector('[data-testid="dispatch-readonly-control"]');
  if (!control) return "missing";
  control.click();
  return "clicked";
})()
`;

try {
  runAgentBrowser(["open", `${baseUrl}/dispatch?cb=${Date.now()}`]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  const before = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(before.wrappers >= 5, `Expected at least 5 read-only controls, got ${before.wrappers}`);
  assert(
    before.disabledButtons === before.wrappers,
    `Expected every control button to be disabled (${before.disabledButtons}/${before.wrappers})`,
  );
  assert(
    before.notAllowedButtons === before.wrappers,
    `Expected every control button to use cursor:not-allowed (${before.notAllowedButtons}/${before.wrappers})`,
  );
  assert(
    before.tooltipMatches === before.wrappers,
    `Expected every control button to expose the Demo mode tooltip (${before.tooltipMatches}/${before.wrappers})`,
  );
  assert(before.hasRole, "Missing operator role label");
  assert(before.hasDemoReadOnly, "Missing read-only demo mode label");
  assert(before.hasAuditLog, "Missing read-only audit log");
  assert(
    before.forbiddenClaims.length === 0,
    `Forbidden safety claims found: ${before.forbiddenClaims.join(", ")}`,
  );

  const clickResult = runAgentBrowser(["eval", clickFirstReadonlyControlScript]).trim();
  assert(clickResult.includes("clicked"), `Could not click read-only wrapper: ${clickResult}`);

  const after = parseEvalJson(runAgentBrowser(["eval", inspectScript]));
  assert(
    after.auditText.includes("попытка") && after.auditText.includes("No real equipment control"),
    `Read-only attempt was not logged safely: ${after.auditText}`,
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
      checked: "readonly-controls",
      ok: true,
    },
    null,
    2,
  ),
);
