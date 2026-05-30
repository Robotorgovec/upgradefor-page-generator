#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

const baseUrl = normalizeBaseUrl(
  process.argv[2] ?? process.env.DISPATCH_BASE_URL ?? DEFAULT_BASE_URL,
);

const expectedCards = [
  "ahu-pv1",
  "chiller",
  "cooling-tower-small",
  "fancoil-fc92",
  "multi-split-system",
];

const requiredSafetyCopy = [
  "Read-only",
  "control locked",
  "BMS/SCADA",
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
      // Keep scanning. The CLI can print status lines before the eval result.
    }
  }

  throw new Error(`Could not parse agent-browser eval output:\n${output}`);
}

function inspectCardScript(cardId) {
  return `
(() => {
  const id = ${JSON.stringify(cardId)};
  const card = document.querySelector(\`[data-testid="equipment-twin-card-\${id}"]\`);
  const activeCards = Array.from(document.querySelectorAll('[data-selection-state="active"]'))
    .map((item) => item.getAttribute("data-equipment-twin-id"));
  const relatedCards = Array.from(document.querySelectorAll('[data-selection-state="related"]'))
    .map((item) => item.getAttribute("data-equipment-twin-id"));
  const bodyText = document.body.innerText || "";
  const activeButton = card?.querySelector("button");

  return JSON.stringify({
    id,
    exists: Boolean(card),
    selectedState: card?.getAttribute("data-selection-state") ?? null,
    ariaCurrent: activeButton?.getAttribute("aria-current") ?? null,
    activeCards,
    relatedCards,
    canvasCount: document.querySelectorAll("canvas").length,
    fallbackVisible: /fallback/i.test(bodyText),
    safetyCopy: {
      readOnly: bodyText.includes("Read-only"),
      controlLocked: bodyText.includes("control locked"),
      bmsScada: bodyText.includes("BMS/SCADA"),
    },
  });
})()
`;
}

function clickCardScript(cardId) {
  return `
(() => {
  const card = document.querySelector('[data-testid="equipment-twin-card-${cardId}"]');
  const button = card?.querySelector("button");
  if (!button) {
    return "missing";
  }
  button.click();
  return "clicked";
})()
`;
}

const dispatchUrl = `${baseUrl}/dispatch?cb=${Date.now()}`;
const results = [];

try {
  runAgentBrowser(["open", dispatchUrl]);
  runAgentBrowser(["wait", "--load", "networkidle"]);

  for (const cardId of expectedCards) {
    runAgentBrowser(["eval", clickCardScript(cardId)]);
    const result = parseEvalJson(runAgentBrowser(["eval", inspectCardScript(cardId)]));

    assert(result.exists, `Missing equipment twin card ${cardId}`);
    assert(
      result.selectedState === "active",
      `${cardId} has selection state ${result.selectedState}; expected active`,
    );
    assert(
      result.ariaCurrent === "true",
      `${cardId} does not expose aria-current=true after selection`,
    );
    assert(
      result.activeCards.length === 1 && result.activeCards[0] === cardId,
      `${cardId} selection is not exclusive: ${result.activeCards.join(", ")}`,
    );
    assert(
      result.canvasCount >= 1,
      `${cardId} did not keep the 3D canvas mounted`,
    );
    assert(!result.fallbackVisible, `${cardId} shows a fallback state`);

    for (const copy of requiredSafetyCopy) {
      const key = copy === "Read-only" ? "readOnly" : copy === "control locked" ? "controlLocked" : "bmsScada";
      assert(result.safetyCopy[key], `${cardId} is missing safety copy: ${copy}`);
    }

    results.push(result);
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
      checked: results.length,
      cards: results.map((result) => ({
        id: result.id,
        activeCards: result.activeCards,
        relatedCards: result.relatedCards,
        canvasCount: result.canvasCount,
        fallbackVisible: result.fallbackVisible,
      })),
      ok: true,
    },
    null,
    2,
  ),
);
