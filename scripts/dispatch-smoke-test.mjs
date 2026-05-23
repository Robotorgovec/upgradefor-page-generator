import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const chromePath = findChrome();
const startedProcesses = [];
const nextEnvPath = path.join(root, "next-env.d.ts");
const nextEnvBefore = fs.existsSync(nextEnvPath) ? fs.readFileSync(nextEnvPath, "utf8") : null;
let serverLogs = "";

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

if (!chromePath) {
  console.warn("Dispatch smoke tests skipped: headless Chrome was not found.");
  process.exit(0);
}

const externalBaseUrl = normalizeBaseUrl(process.env.DISPATCH_BASE_URL);
const baseUrl = externalBaseUrl ?? await startLocalDispatchServer();

await waitForHttp(`${baseUrl}/dispatch`, 30_000);
await assertDemoApiEndpoints(baseUrl);

await assertDump(
  "/dispatch",
  [
    "Object summary",
    "Center canvas",
    "Active Alarms",
    "Asia Park Astana",
    "Simulated telemetry · No real equipment control",
    "Demo Scenario",
  ],
  "default workspace",
);

await assertDump(
  "/dispatch?demo=investor",
  [
    "Investor Demo Mode",
    "Executive value cards",
    "Object control workspace",
    "Start cooling incident",
    "Simulated presentation",
    "No real equipment control",
  ],
  "investor presentation launch",
);

await assertDump(
  "/dispatch?equipment=fc-021&tab=telemetry",
  ["Фанкойл FC-021", "Live telemetry simulation", "Selected equipment polling only", "Supply temperature", "Room temperature"],
  "fan coil telemetry deep link",
);

await assertDump(
  "/dispatch?equipment=ch-001&tab=3d",
  ["Чиллер CH-1", "3D Model", "Разобрать"],
  "chiller 3D deep link",
);

await assertDump(
  "/dispatch?equipment=unknown-id&tab=telemetry",
  ["Object summary", "Priority alarms", "Active Alarms"],
  "unknown equipment fallback",
);

const randomTabDom = await dumpDom(`${baseUrl}/dispatch?equipment=fc-021&tab=random`);
assert.match(randomTabDom, /Фанкойл FC-021/, "random tab should still select known equipment");
assert.match(
  randomTabDom,
  /role="tab" aria-selected="true"[^>]*>Overview/,
  "random tab should fall back to Overview",
);

if (typeof WebSocket === "function") {
  await assertAlarmClickSelectsEquipmentAndWorkflow(`${baseUrl}/dispatch`);
  await assertScenarioInvestorDemo(`${baseUrl}/dispatch?demo=investor`);
} else {
  console.warn("Interactive dispatch smoke assertions skipped: global WebSocket is unavailable in this Node runtime.");
}

console.log("Dispatch smoke tests passed");
cleanup();

async function startLocalDispatchServer() {
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", "--port", String(port)], {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  startedProcesses.push(server);

  server.stdout.on("data", (chunk) => {
    serverLogs += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverLogs += chunk.toString();
  });

  return url;
}

function normalizeBaseUrl(value) {
  if (!value) return undefined;
  return value.replace(/\/+$/, "");
}

async function assertDump(pathname, expectedTexts, label) {
  const dom = await dumpDom(`${baseUrl}${pathname}`);
  for (const text of expectedTexts) {
    assert.match(dom, new RegExp(escapeRegExp(text)), `${label}: expected ${text}`);
  }
}

async function assertDemoApiEndpoints(baseUrl) {
  const snapshot = await fetchJson(`${baseUrl}/api/dispatch/snapshot`);
  assert.equal(snapshot.ok, true, "snapshot endpoint should return ok=true");
  assert.equal(snapshot.demo.label, "Simulated telemetry · No real equipment control");
  assert.equal(snapshot.data.object.id, "asia-park");
  assert.ok(Array.isArray(snapshot.data.equipment), "snapshot endpoint should include equipment");

  const telemetry = await fetchJson(`${baseUrl}/api/dispatch/telemetry/fc-021`);
  assert.equal(telemetry.ok, true, "telemetry endpoint should return ok=true");
  assert.equal(telemetry.data.equipmentId, "fc-021");
  assert.ok(telemetry.data.telemetry["Supply temperature"], "telemetry endpoint should include fan coil values");

  const unknownTelemetry = await fetch(`${baseUrl}/api/dispatch/telemetry/unknown-id`);
  assert.equal(unknownTelemetry.status, 404, "unknown telemetry endpoint should return 404");
  const unknownPayload = await unknownTelemetry.json();
  assert.equal(unknownPayload.ok, false, "unknown telemetry endpoint should return ok=false");
  assert.equal(unknownPayload.error.code, "not_found");

  const command = await fetchJson(`${baseUrl}/api/dispatch/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "dispatch-workspace",
      command: {
        id: "smoke-fc-021-target-temp",
        equipmentId: "fc-021",
        alarmId: "alm-return-temp",
        actionId: "act-fc-raise-setpoint",
        label: "Target temperature",
        value: "22 °C",
        reason: "Smoke test command against simulated Dispatch API.",
        risk: "medium",
      },
    }),
  });
  assert.equal(command.ok, true, "commands endpoint should return ok=true");
  assert.equal(command.result.status, "simulated_accepted");
  assert.equal(command.result.simulated, true);
  assert.match(command.result.message, /No real equipment control/);
}

async function assertAlarmClickSelectsEquipmentAndWorkflow(url) {
  const chromeUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "dispatch-smoke-chrome-"));
  const debugPort = await getFreePort();
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1000",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${chromeUserDataDir}`,
    "about:blank",
  ]);
  startedProcesses.push(chrome);

  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, 15_000);
  const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
  const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  assert.ok(pageTarget, "Chrome page target missing");

  const cdp = await createCdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.navigate", { url });
  await waitForEval(cdp, "document.body.innerText.includes('Active Alarms')", 15_000);

  await cdp.send("Runtime.evaluate", {
    expression: "document.querySelector('.bottomItem.statusCritical')?.click()",
    awaitPromise: true,
  });
  await waitForEval(cdp, "document.body.innerText.includes('Насосная группа ШУ-2')", 10_000);

  const result = await cdp.send("Runtime.evaluate", {
    expression: `({
      activeTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
      href: window.location.href,
      text: document.body.innerText
    })`,
    returnByValue: true,
  });
  const value = result.result.value;

  assert.equal(value.activeTab, "Alarms", "clicking an alarm should open the Alarms inspector tab");
  assert.match(value.href, /equipment=pump-shu2/, "alarm click should sync selected equipment to URL");
  assert.match(value.href, /tab=alarms/, "alarm click should sync Alarms tab to URL");
  assert.match(value.text, /DP 6553\.x bar/, "alarm details should remain visible");

  await clickSelector(cdp, ".alarmTriageList .recommendedActionList button");
  await waitForEval(
    cdp,
    "document.body.innerText.toLowerCase().includes('command confirmation') && document.body.innerText.includes('Frontend-only workflow')",
    10_000,
  );

  await clickButtonWithText(cdp, "Confirm via simulation");
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Prepare local service mode note confirmed by simulator') && document.body.innerText.includes('No backend, BMS, PLC, or field equipment was touched')",
    10_000,
  );

  await clickSelector(cdp, ".workflowJournalItem");
  await waitForEval(cdp, "document.querySelector('[role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim() === 'History'", 10_000);

  await cdp.close();
}

async function assertScenarioInvestorDemo(url) {
  const chromeUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "dispatch-scenario-chrome-"));
  const debugPort = await getFreePort();
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1000",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${chromeUserDataDir}`,
    "about:blank",
  ]);
  startedProcesses.push(chrome);

  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, 15_000);
  const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
  const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  assert.ok(pageTarget, "Chrome page target missing for scenario smoke");

  const cdp = await createCdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.navigate", { url });
  await waitForEval(
    cdp,
    "document.body.innerText.toLowerCase().includes('investor demo mode') && document.body.innerText.toLowerCase().includes('executive value cards')",
    15_000,
  );

  await clickButtonWithText(cdp, "Start cooling incident");
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Cooling loop pressure drop') && document.body.innerText.toLowerCase().includes('guided incident')",
    10_000,
  );

  const started = await cdp.send("Runtime.evaluate", {
    expression: `({
      activeTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
      href: window.location.href,
      text: document.body.innerText
    })`,
    returnByValue: true,
  });
  assert.equal(started.result.value.activeTab, "Alarms", "scenario should open the Alarms inspector tab");
  assert.match(started.result.value.href, /equipment=pump-shu2/, "scenario should select affected pump");
  assert.match(started.result.value.href, /tab=alarms/, "scenario should sync alarms tab to URL");
  assert.match(started.result.value.href, /demo=investor/, "investor demo URL flag should stay synced");
  assert.match(started.result.value.text, /Probable cause: pump pressure instability/i);
  assert.match(started.result.value.text, /Recommended action: inspect pump status/i);

  await clickButtonWithText(cdp, "Prepare demo command");
  await waitForEval(
    cdp,
    "document.body.innerText.toLowerCase().includes('command confirmation') && document.body.innerText.toLowerCase().includes('demo api boundary')",
    10_000,
  );

  await clickButtonWithText(cdp, "Confirm via simulation");
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Demo mitigation recorded') && document.body.innerText.includes('No real equipment was controlled')",
    10_000,
  );
  await waitForEval(
    cdp,
    "document.body.innerText.toLowerCase().includes('business impact becomes visible') && document.body.innerText.toLowerCase().includes('downtime avoided')",
    10_000,
  );

  await clickTabWithText(cdp, "Commands");
  await waitForEval(
    cdp,
    "document.body.innerText.includes('confirmed by simulator') && document.body.innerText.includes('No backend, BMS, PLC, or field equipment was touched')",
    10_000,
  );

  await clickTabWithText(cdp, "Scenario");
  await waitForEval(
    cdp,
    "document.body.innerText.includes('✓ Demo mitigation recorded') && document.body.innerText.includes('Scenario advanced locally')",
    10_000,
  );

  await clickButtonWithText(cdp, "Next step");
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Audit trail and repeatability') && document.body.innerText.includes('command journal preserves operator intent')",
    10_000,
  );

  await clickButtonWithText(cdp, "Reset demo");
  await waitForEval(
    cdp,
    "document.body.innerText.toLowerCase().includes('normal operations') && document.body.innerText.toLowerCase().includes('status: idle') && document.body.innerText.toLowerCase().includes('object summary')",
    10_000,
  );

  await cdp.close();
}

async function clickSelector(cdp, selector) {
  const point = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return null;
      target.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      return { x, y };
    })()`,
    returnByValue: true,
  });

  assert.ok(point.result.value, `click target missing: ${selector}`);
  await clickPoint(cdp, point.result.value);
}

async function clickButtonWithText(cdp, text) {
  const point = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const target = Array.from(document.querySelectorAll('button'))
        .filter((button) => button.textContent?.trim() === ${JSON.stringify(text)} && !button.disabled)
        .reverse()[0];
      if (!target) return null;
      target.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
    returnByValue: true,
  });

  assert.ok(point.result.value, `button target missing: ${text}`);
  await clickPoint(cdp, point.result.value);
}

async function clickTabWithText(cdp, text) {
  const point = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const target = Array.from(document.querySelectorAll('button[role="tab"]'))
        .filter((button) => button.textContent?.trim() === ${JSON.stringify(text)} && !button.disabled)
        .reverse()[0];
      if (!target) return null;
      target.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
    returnByValue: true,
  });

  assert.ok(point.result.value, `tab target missing: ${text}`);
  await clickPoint(cdp, point.result.value);
}

async function clickPoint(cdp, { x, y }) {
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

async function dumpDom(url) {
  const { stdout, stderr, code } = await run(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--virtual-time-budget=5000",
    "--dump-dom",
    url,
  ]);

  if (code !== 0) {
    throw new Error(`Chrome dump-dom failed for ${url}\n${stderr}`);
  }

  return stdout;
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: root });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => resolve({ stdout, stderr, code }));
  });
}

async function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  let nextId = 1;

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (!payload.id) return;
    const deferred = pending.get(payload.id);
    if (!deferred) return;
    pending.delete(payload.id);
    if (payload.error) {
      deferred.reject(new Error(payload.error.message));
    } else {
      deferred.resolve(payload.result ?? {});
    }
  });

  return {
    send(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    close() {
      socket.close();
    },
  };
}

async function waitForEval(cdp, expression, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.result.value) return;
    await delay(200);
  }
  throw new Error(`Timed out waiting for expression: ${expression}`);
}

async function waitForHttp(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep waiting while Next or Chrome starts.
    }
    await delay(300);
  }

  throw new Error(`Timed out waiting for ${url}\n${serverLogs}`);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request failed: ${url}`);
  return response.json();
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
    server.on("error", reject);
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanup() {
  for (const child of startedProcesses.splice(0)) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  if (nextEnvBefore !== null && fs.existsSync(nextEnvPath)) {
    const nextEnvAfter = fs.readFileSync(nextEnvPath, "utf8");
    if (nextEnvAfter !== nextEnvBefore) {
      fs.writeFileSync(nextEnvPath, nextEnvBefore, "utf8");
    }
  }
}
