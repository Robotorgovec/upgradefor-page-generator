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
  "/dispatch?layer=3d",
  ["3D fallback view", "Simulated layout", "No real equipment control"],
  "workspace 3D layer deep link",
);

await assertDump(
  "/dispatch?layer=random",
  ["Object summary", "Center canvas", "visible assets"],
  "invalid layer fallback",
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
  await assertVisibleAssetsRegression(`${baseUrl}/dispatch?zone=zone-retail-a&layer=hvac&status=all`);
  await assertLayer3dRegression(`${baseUrl}/dispatch?equipment=fc-021&layer=hvac`);
  await assertInvalidLayerFallback(`${baseUrl}/dispatch?layer=random`);
  await assertLayerInspectorSync(
    `${baseUrl}/dispatch?object=asia-park&floor=floor-12600&zone=zone-service&system=cooling&equipment=pump-shu2&layer=ventilation&tab=3d`,
  );
  await assertEquipment3dCatalog(baseUrl);
  await assertAlarmClickSelectsEquipmentAndWorkflow(`${baseUrl}/dispatch`);
  await assertScenarioInvestorDemo(`${baseUrl}/dispatch?demo=investor`);
} else {
  console.warn("Interactive dispatch smoke assertions skipped: global WebSocket is unavailable in this Node runtime.");
}

console.log("Dispatch smoke tests passed");
cleanup();
process.exit(0);

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
  await waitForEval(cdp, "Boolean(document.querySelector('.bottomItem'))", 10_000);
  await delay(600);

  await clickBottomItemWithText(cdp, "DP 6553.x bar на ШУ-2");
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

async function assertVisibleAssetsRegression(url) {
  const { cdp } = await openCdpPage(url, "visible assets regression");

  await waitForEval(
    cdp,
    "document.body.innerText.includes('Фанкойл FC-021') && Boolean(document.querySelector('[data-testid=\"dispatch-equipment-marker-fc-021\"]'))",
    15_000,
  );

  const result = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const visibleText = document.querySelector('[data-testid="dispatch-visible-assets-count"]')?.textContent?.trim() ?? '';
      const scopeText = document.querySelector('[data-testid="dispatch-zone-assets-count"]')?.textContent?.trim() ?? '';
      const marker = document.querySelector('[data-testid="dispatch-equipment-marker-fc-021"]');
      return { visibleText, scopeText, markerVisible: Boolean(marker), href: window.location.href };
    })()`,
    returnByValue: true,
  });

  const value = result.result.value;
  assert.match(value.scopeText, /^1 assets? in scope/, "zone scope should include FC-021");
  assert.doesNotMatch(value.visibleText, /^0 visible assets/, "visible assets should not be zero for FC-021 zone");
  assert.equal(value.markerVisible, true, "FC-021 marker should render on the canvas");
  assert.match(value.href, /zone=zone-retail-a/, "zone deep link should remain synced");

  await cdp.close();
}

async function assertLayer3dRegression(url) {
  const { cdp } = await openCdpPage(url, "3D layer regression");

  await waitForEval(cdp, "Boolean(document.querySelector('[data-testid=\"dispatch-equipment-marker-fc-021\"]'))", 15_000);
  await clickSelector(cdp, "[data-testid='dispatch-layer-3d']");
  await waitForEval(
    cdp,
    "window.location.href.includes('layer=3d') && Boolean(document.querySelector('[data-testid=\"dispatch-canvas-3d\"]')) && document.body.innerText.includes('3D fallback view')",
    10_000,
  );

  const after3d = await cdp.send("Runtime.evaluate", {
    expression: `(() => ({
      href: window.location.href,
      markerVisible: Boolean(document.querySelector('[data-testid="dispatch-equipment-marker-fc-021"]')),
      activeTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
      text: document.body.innerText,
    }))()`,
    returnByValue: true,
  });

  assert.match(after3d.result.value.href, /layer=3d/, "3D layer click should sync layer=3d");
  assert.equal(after3d.result.value.markerVisible, true, "FC-021 marker should render in 3D fallback layer");
  assert.notEqual(after3d.result.value.activeTab, "3D Model", "workspace layer=3d must not force inspector tab=3d");
  assert.match(after3d.result.value.text, /Simulated layout · No real equipment control/);

  await clickSelector(cdp, "[data-testid='dispatch-equipment-marker-fc-021']");
  await waitForEval(cdp, "window.location.href.includes('equipment=fc-021') && document.body.innerText.includes('Фанкойл FC-021')", 10_000);

  await cdp.close();
}

async function assertInvalidLayerFallback(url) {
  const { cdp } = await openCdpPage(url, "invalid layer fallback");

  await waitForEval(
    cdp,
    "!window.location.href.includes('layer=random') && Boolean(document.querySelector('[data-testid=\"dispatch-visible-assets-count\"]'))",
    15_000,
  );

  const fallback = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const activeLayer = Array.from(document.querySelectorAll('.layerSwitch button'))
        .find((button) => button.classList.contains('isActive'))?.textContent?.trim();
      const visibleText = document.querySelector('[data-testid="dispatch-visible-assets-count"]')?.textContent?.trim() ?? '';
      return { href: window.location.href, activeLayer, visibleText };
    })()`,
    returnByValue: true,
  });

  assert.doesNotMatch(fallback.result.value.href, /layer=random/, "invalid layer should be removed from URL");
  assert.match(fallback.result.value.activeLayer, /Plan|HVAC/, "invalid layer should fall back to a safe layer");
  assert.doesNotMatch(fallback.result.value.visibleText, /^0 visible assets/, "invalid layer fallback should keep canvas data usable");

  await cdp.close();
}

async function assertLayerInspectorSync(url) {
  const { cdp } = await openCdpPage(url, "layer and inspector sync regression");

  await waitForEval(
    cdp,
    "window.location.href.includes('layer=ventilation') && !window.location.href.includes('equipment=pump-shu2') && !window.location.href.includes('system=cooling') && !window.location.href.includes('tab=3d') && document.querySelector('.inspectorTitle span')?.textContent?.trim() !== 'Selected equipment'",
    15_000,
  );

  const ventilationState = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const activeLayer = Array.from(document.querySelectorAll('.layerSwitch button'))
        .find((button) => button.classList.contains('isActive'))?.textContent?.trim();
      const inspectorEyebrow = document.querySelector('.inspectorTitle span')?.textContent?.trim();
      const inspectorText = document.querySelector('[aria-label="Inspector panel"]')?.textContent ?? '';
      const bottomText = document.querySelector('[aria-label="Alarms and events"]')?.textContent ?? '';
      const visibleText = document.querySelector('[data-testid="dispatch-visible-assets-count"]')?.textContent?.trim() ?? '';
      const ahuMarkerVisible = Boolean(document.querySelector('[data-testid="dispatch-equipment-marker-ahu-vc13-03"]'));
      return { href: window.location.href, activeLayer, inspectorEyebrow, inspectorText, bottomText, visibleText, ahuMarkerVisible };
    })()`,
    returnByValue: true,
  });

  assert.match(ventilationState.result.value.href, /layer=ventilation/, "ventilation layer should stay in URL");
  assert.doesNotMatch(
    ventilationState.result.value.href,
    /equipment=pump-shu2/,
    "hidden pump selection should be removed from URL when ventilation layer is active",
  );
  assert.doesNotMatch(
    ventilationState.result.value.href,
    /system=cooling/,
    "incompatible cooling system should be removed from URL when ventilation layer is active",
  );
  assert.notEqual(
    ventilationState.result.value.inspectorEyebrow,
    "Selected equipment",
    "inspector should not keep stale pump equipment when the canvas layer hides it",
  );
  assert.match(
    ventilationState.result.value.inspectorText,
    /Equipment in current canvas layer|Inspector follows the active center canvas layer/,
    "inspector should explain the current canvas layer context",
  );
  assert.match(
    ventilationState.result.value.inspectorText,
    /Вентустановка VC-13-03/,
    "ventilation layer should surface ventilation equipment in the right inspector",
  );
  assert.equal(
    ventilationState.result.value.ahuMarkerVisible,
    true,
    "AHU marker should render when ventilation layer is active in the service zone",
  );
  assert.match(
    ventilationState.result.value.bottomText,
    /VC-13-03: заслонка/,
    "bottom alarms should include ventilation alarm for the current layer",
  );
  assert.doesNotMatch(
    ventilationState.result.value.bottomText,
    /DP 6553\.x bar/,
    "bottom alarms should not keep unrelated cooling pump alarm in ventilation layer",
  );

  await clickLayerButtonWithText(cdp, "Cooling");
  await waitForEval(
    cdp,
    "window.location.href.includes('layer=cooling') && Boolean(document.querySelector('[data-testid=\"dispatch-equipment-marker-pump-shu2\"]')) && Boolean(document.querySelector('[data-testid=\"dispatch-equipment-marker-sens-dp-01\"]'))",
    15_000,
  );

  const coolingState = await cdp.send("Runtime.evaluate", {
    expression: `(() => ({
      href: window.location.href,
      pumpVisible: Boolean(document.querySelector('[data-testid="dispatch-equipment-marker-pump-shu2"]')),
      sensorVisible: Boolean(document.querySelector('[data-testid="dispatch-equipment-marker-sens-dp-01"]')),
      inspectorText: document.querySelector('[aria-label="Inspector panel"]')?.textContent ?? '',
      bottomText: document.querySelector('[aria-label="Alarms and events"]')?.textContent ?? '',
    }))()`,
    returnByValue: true,
  });

  assert.match(coolingState.result.value.href, /layer=cooling/, "cooling layer should sync to URL");
  assert.equal(coolingState.result.value.pumpVisible, true, "pump should reappear in the cooling canvas layer");
  assert.equal(coolingState.result.value.sensorVisible, true, "DP sensor should reappear in the cooling canvas layer");
  assert.match(
    coolingState.result.value.inspectorText,
    /Насосная группа ШУ-2/,
    "right inspector should show pump after returning to the cooling layer",
  );
  assert.match(
    coolingState.result.value.inspectorText,
    /Equipment in current canvas layer/,
    "zone inspector should list equipment for the active cooling canvas layer",
  );
  assert.match(
    coolingState.result.value.bottomText,
    /DP 6553\.x bar/,
    "bottom alarms should show cooling pump alarm after returning to cooling layer",
  );

  await cdp.close();
}

async function assertEquipment3dCatalog(baseUrl) {
  const catalog = [
    {
      path: "/dispatch?equipment=ahu-vc13-03",
      name: "Вентустановка VC-13-03",
      label: "AHU GLB/fallback 3D preview",
      fallbackId: "dispatch-equipment-twin-fallback-ahu-pv1",
    },
    {
      path: "/dispatch?equipment=ch-001",
      name: "Чиллер CH-1",
      label: "chiller GLB/fallback 3D preview",
      fallbackId: "dispatch-equipment-twin-fallback-chiller",
    },
    {
      path: "/dispatch?equipment=fc-021",
      name: "Фанкойл FC-021",
      label: "fan coil GLB/fallback 3D preview",
      fallbackId: "dispatch-equipment-twin-fallback-fancoil-fc92",
    },
    {
      path: "/dispatch?equipment=ct-001",
      name: "Градирня CT-1",
      label: "cooling tower GLB/fallback 3D preview",
      fallbackId: "dispatch-equipment-twin-fallback-cooling-tower-small",
    },
    {
      path: "/dispatch?equipment=ac-ms-001",
      name: "Кондиционер MS-1",
      label: "conditioner GLB/fallback 3D preview",
      fallbackId: "dispatch-equipment-twin-fallback-multi-split-system",
    },
  ];

  for (const item of catalog) {
    const { cdp } = await openCdpPage(`${baseUrl}${item.path}`, item.label);

    await waitForEval(cdp, `document.body.innerText.includes(${JSON.stringify(item.name)})`, 15_000);
    await waitForEval(
      cdp,
      `Array.from(document.querySelectorAll('button[role="tab"]')).some((button) => button.textContent?.includes('3D Model'))`,
      10_000,
    );
    await clickTabWithText(cdp, "3D Model");
    await waitForEval(
      cdp,
      `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() === '3D Model' && document.body.innerText.includes(${JSON.stringify(item.name)})`,
      10_000,
    );
    await waitForEval(
      cdp,
      `Boolean(document.querySelector('.equipmentTwinViewport canvas')) || Boolean(document.querySelector('[data-testid="${item.fallbackId}"]'))`,
      15_000,
    );

    const state = await cdp.send("Runtime.evaluate", {
      expression: `(() => ({
        href: window.location.href,
        activeTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
        hasCanvas: Boolean(document.querySelector('.equipmentTwinViewport canvas')),
        hasFallback: ${item.fallbackId ? `Boolean(document.querySelector('[data-testid="${item.fallbackId}"]'))` : "false"},
        text: document.body.innerText,
      }))()`,
      returnByValue: true,
    });

    assert.equal(state.result.value.activeTab, "3D Model", `${item.label}: 3D Model tab should be active after click`);
    assert.match(state.result.value.href, /tab=3d/, `${item.label}: 3D tab click should sync tab=3d`);
    assert.match(state.result.value.text, new RegExp(escapeRegExp(item.name)), `${item.label}: selected equipment name should stay visible`);
    assert.equal(
      state.result.value.hasCanvas || state.result.value.hasFallback,
      true,
      `${item.label}: real GLB canvas or safe fallback should render`,
    );
    assert.match(state.result.value.text, /No real equipment control/, `${item.label}: safety copy should be visible`);

    await cdp.close();
  }
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

  await clickBottomTabWithText(cdp, "Commands");
  await waitForEval(
    cdp,
    "document.body.innerText.includes('confirmed by simulator') && document.body.innerText.includes('No backend, BMS, PLC, or field equipment was touched')",
    10_000,
  );

  await clickBottomTabWithText(cdp, "Scenario");
  await waitForEval(
    cdp,
    "document.querySelector('.bottomTabs [role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim() === 'Scenario' && Array.from(document.querySelectorAll('.scenarioStepItem')).some((item) => item.textContent?.includes('Demo mitigation recorded'))",
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

async function openCdpPage(url, label) {
  const chromeUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), `dispatch-${label.replace(/\W+/g, "-")}-`));
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
  assert.ok(pageTarget, `Chrome page target missing for ${label}`);

  const cdp = await createCdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.navigate", { url });
  await waitForEval(cdp, "document.body.innerText.toLowerCase().includes('center canvas')", 15_000);

  return { cdp };
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

async function clickBottomItemWithText(cdp, text) {
  const clicked = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const target = Array.from(document.querySelectorAll('.bottomItem'))
        .find((item) => item.textContent?.includes(${JSON.stringify(text)}));
      if (!target) return false;
      target.scrollIntoView({ block: 'center', inline: 'center' });
      target.click();
      return true;
    })()`,
    returnByValue: true,
  });

  assert.ok(clicked.result.value, `bottom item target missing: ${text}`);
}

async function clickTabWithText(cdp, text) {
  const point = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const target = Array.from(document.querySelectorAll('button[role="tab"]'))
        .filter((button) => (button.textContent?.trim() === ${JSON.stringify(text)} || button.textContent?.includes(${JSON.stringify(text)})) && !button.disabled)
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

async function clickLayerButtonWithText(cdp, text) {
  const clicked = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const target = Array.from(document.querySelectorAll('.layerSwitch button'))
        .find((button) => button.textContent?.trim() === ${JSON.stringify(text)} && !button.disabled);
      if (!target) return false;
      target.scrollIntoView({ block: 'center', inline: 'center' });
      target.click();
      return true;
    })()`,
    returnByValue: true,
  });

  assert.ok(clicked.result.value, `layer button target missing: ${text}`);
}

async function clickBottomTabWithText(cdp, text) {
  const clicked = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const target = Array.from(document.querySelectorAll('.bottomTabs button[role="tab"]'))
        .find((button) => button.textContent?.trim() === ${JSON.stringify(text)} && !button.disabled);
      if (!target) return false;
      target.scrollIntoView({ block: 'center', inline: 'center' });
      target.click();
      return true;
    })()`,
    returnByValue: true,
  });

  assert.ok(clicked.result.value, `bottom tab target missing: ${text}`);
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
