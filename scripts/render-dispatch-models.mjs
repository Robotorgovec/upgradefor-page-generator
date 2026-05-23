import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "docs/dispatch/model-renders");
const chromePath = findChrome();

if (!chromePath) {
  throw new Error("Google Chrome or Chromium is required to render Dispatch model screenshots.");
}

const models = [
  {
    id: "ahu-pv1",
    title: "Supply ventilation unit PV-1",
    path: "/public/models/equipment/supply-vent-unit-01-assembled.glb",
    groups: ["damperGroup", "filterGroup", "coilGroup", "fanGroup", "removablePanelsGroup", "fastenersGroup"],
  },
  {
    id: "chiller",
    title: "Chiller CH-1",
    path: "/public/models/dispatch/chiller.glb",
    groups: [
      "chillerShellGroup",
      "compressorGroup",
      "heatExchangerGroup",
      "fanGroup",
      "pipeGroup",
      "removablePanelsGroup",
      "fastenersGroup",
    ],
  },
  {
    id: "fancoil-fc92",
    title: "Fan coil FC-92",
    path: "/public/models/dispatch/fancoil-fc92.glb",
    groups: [
      "fancoilShellGroup",
      "frontPanelGroup",
      "filterGroup",
      "fanGroup",
      "coilGroup",
      "drainTrayGroup",
      "pipeGroup",
    ],
  },
  {
    id: "cooling-tower-small",
    title: "Cooling tower CT-1",
    path: "/public/models/dispatch/cooling-tower-small.glb",
    groups: ["towerShellGroup", "fanGroup", "fillPackGroup", "basinGroup", "sprayPipeGroup", "removablePanelsGroup"],
  },
  {
    id: "multi-split-system",
    title: "Multi-split conditioner MS-1",
    path: "/public/models/dispatch/multi-split-system.glb",
    groups: [
      "multiSplitOutdoorUnitGroup",
      "multiSplitIndoorUnitsGroup",
      "compressorGroup",
      "fanGroup",
      "coilGroup",
      "pipeRoutesGroup",
      "removablePanelsGroup",
    ],
  },
];

fs.mkdirSync(outputDir, { recursive: true });

const port = await getFreePort();
const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

  if (requestUrl.pathname === "/dispatch-model-viewer.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(createViewerHtml(models));
    return;
  }

  const filePath = path.normalize(path.join(root, decodeURIComponent(requestUrl.pathname)));
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": getContentType(filePath) });
  fs.createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

const debugPort = await getFreePort();
const userDataDir = fs.mkdtempSync(path.join("/tmp", "dispatch-model-render-chrome-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--use-gl=swiftshader",
  "--enable-unsafe-swiftshader",
  "--no-first-run",
  "--no-default-browser-check",
  "--window-size=1400,1000",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  "about:blank",
]);

try {
  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, 15_000);
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!pageTarget) throw new Error("Chrome page target missing.");

  const cdp = await createCdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  cdp.onConsole((message) => console.log(`[render-console] ${message}`));
  cdp.onException((message) => console.error(`[render-exception] ${message}`));

  const rendered = [];
  for (const model of models) {
    for (const mode of ["assembled", "exploded"]) {
      const url = `http://127.0.0.1:${port}/dispatch-model-viewer.html?model=${model.id}&mode=${mode}`;
      await cdp.send("Page.navigate", { url });
      await waitForModelReady(cdp, 35_000);
      await delay(700);
      const screenshot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      const filePath = path.join(outputDir, `${model.id}-${mode}.png`);
      fs.writeFileSync(filePath, Buffer.from(screenshot.data, "base64"));
      rendered.push(filePath);
      console.log(filePath);
    }
  }

  await cdp.close();
} finally {
  chrome.kill("SIGTERM");
  await new Promise((resolve) => server.close(resolve));
}

function createViewerHtml(modelList) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dispatch model render</title>
    <script type="importmap">
      {
        "imports": {
          "three": "/node_modules/three/build/three.module.js",
          "three/addons/": "/node_modules/three/examples/jsm/"
        }
      }
    </script>
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #06111f; overflow: hidden; font-family: Inter, system-ui, sans-serif; }
      #app { position: fixed; inset: 0; }
      .label { position: fixed; left: 28px; top: 24px; display: grid; gap: 8px; color: #e0f2fe; z-index: 2; }
      .label h1 { margin: 0; font-size: 32px; letter-spacing: 0; }
      .label span { width: fit-content; border: 1px solid rgba(125, 211, 252, .34); border-radius: 999px; background: rgba(15, 23, 42, .72); padding: 7px 11px; font-size: 13px; font-weight: 900; }
      .footer { position: fixed; right: 28px; bottom: 24px; color: #93c5fd; font-size: 12px; font-weight: 800; z-index: 2; }
    </style>
    <script>
      window.__dispatchModelReady = false;
      window.__dispatchModelError = null;
      window.addEventListener("error", (event) => {
        window.__dispatchModelError = event.message || String(event.error || "Unknown render error");
        window.__dispatchModelReady = true;
      });
      window.addEventListener("unhandledrejection", (event) => {
        window.__dispatchModelError = String(event.reason || "Unhandled render rejection");
        window.__dispatchModelReady = true;
      });
    </script>
  </head>
  <body>
    <div id="app"></div>
    <div class="label"><h1 id="title"></h1><span id="mode"></span></div>
    <div class="footer">Dispatch HVAC model registry · no real equipment control</div>
    <script type="module">
      import * as THREE from "three";
      import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
      import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
      import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

      const models = ${JSON.stringify(modelList)};
      const params = new URLSearchParams(window.location.search);
      const model = models.find((item) => item.id === params.get("model")) ?? models[0];
      const mode = params.get("mode") === "exploded" ? "exploded" : "assembled";
      document.getElementById("title").textContent = model.title;
      document.getElementById("mode").textContent = mode === "exploded" ? "Exploded service view" : "Assembled operational view";

      const app = document.getElementById("app");
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#06111f");

      const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.01, 1000);
      camera.position.set(4.8, 3.2, 5.4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1.5);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      app.appendChild(renderer.domElement);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      scene.add(new THREE.HemisphereLight("#dbeafe", "#0f172a", 1.15));
      const key = new THREE.DirectionalLight("#ffffff", 3.2);
      key.position.set(5, 7, 6);
      scene.add(key);
      const fill = new THREE.PointLight("#67e8f9", 90, 12);
      fill.position.set(-3, 3, 3);
      scene.add(fill);

      const grid = new THREE.GridHelper(8, 16, "#38bdf8", "#164e63");
      grid.position.y = -0.03;
      scene.add(grid);

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/node_modules/three/examples/jsm/libs/draco/gltf/");

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.load(model.path, (gltf) => {
        const root = gltf.scene;
        root.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        scene.add(root);

        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        root.position.sub(center);

        if (mode === "exploded") {
          explode(root, model.groups);
        }

        const fittedBox = new THREE.Box3().setFromObject(root);
        const fittedSize = fittedBox.getSize(new THREE.Vector3());
        const fittedCenter = fittedBox.getCenter(new THREE.Vector3());
        const maxDim = Math.max(fittedSize.x, fittedSize.y, fittedSize.z, 1);
        const distance = maxDim * 2.05;
        camera.position.set(distance * 0.9, distance * 0.62, distance * 1.05);
        camera.lookAt(fittedCenter);

        grid.position.y = fittedBox.min.y - 0.04;
        grid.scale.setScalar(Math.max(maxDim / 4, 0.8));

        renderFrames(22);
      }, undefined, (error) => {
        document.body.insertAdjacentHTML("beforeend", '<pre style="color:white;position:fixed;left:24px;bottom:24px">' + String(error) + "</pre>");
        window.__dispatchModelReady = true;
      });

      function explode(root, groupNames) {
        const named = [];
        root.traverse((object) => {
          if (groupNames.includes(object.name)) named.push(object);
        });
        const parts = named.length ? named : root.children.filter((child) => child.type !== "Camera" && child.type !== "Light");
        const count = Math.max(parts.length, 1);
        parts.forEach((part, index) => {
          const angle = (index / count) * Math.PI * 2;
          const radius = 0.75 + index * 0.04;
          part.position.x += Math.cos(angle) * radius;
          part.position.z += Math.sin(angle) * radius;
          part.position.y += index % 2 ? 0.22 : -0.08;
        });
      }

      function renderFrames(frames) {
        for (let frame = 0; frame < frames; frame += 1) {
          scene.rotation.y += 0.006;
          renderer.render(scene, camera);
        }
        window.setTimeout(() => {
          window.__dispatchModelReady = true;
        }, 80);
      }
    </script>
  </body>
</html>`;
}

function getContentType(filePath) {
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".glb")) return "model/gltf-binary";
  if (filePath.endsWith(".wasm")) return "application/wasm";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  return "application/octet-stream";
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
    if (payload.method === "Runtime.consoleAPICalled") {
      const text = payload.params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ");
      listeners.console.forEach((listener) => listener(text));
      return;
    }
    if (payload.method === "Runtime.exceptionThrown") {
      const details = payload.params.exceptionDetails;
      listeners.exception.forEach((listener) =>
        listener(details?.exception?.description ?? details?.text ?? "Unknown runtime exception"),
      );
      return;
    }
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

  const listeners = {
    console: [],
    exception: [],
  };

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
    onConsole(listener) {
      listeners.console.push(listener);
    },
    onException(listener) {
      listeners.exception.push(listener);
    },
  };
}

async function waitForModelReady(cdp, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: "({ ready: window.__dispatchModelReady === true, error: window.__dispatchModelError || null })",
      returnByValue: true,
    });
    const value = result.result.value;
    if (value?.ready) {
      if (value.error) throw new Error(`Model render failed: ${value.error}`);
      return;
    }
    await delay(250);
  }
  throw new Error("Timed out waiting for model render readiness.");
}

async function waitForEval(cdp, expression, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.result.value) return;
    await delay(250);
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
      // Wait for the local service to boot.
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
